<!-- views/admin/admin/ChatListView.vue -->
<template>
  <div class="chat-list-container">
    <h2>DAFTAR PESAN</h2>
    <div v-if="!allUsers.length" class="no-chats">
      <div class="empty-state">
        <i class="fas fa-comments"></i>
        <p>Belum ada user yang terdaftar</p>
      </div>
    </div>

    <div v-else class="chat-threads">
      <router-link
        v-for="userThread in allUsers"
        :key="userThread.id"
        :to="`/admin/chat/${userThread.id}`"
        class="chat-thread"
        :class="{ unread: userThread.unreadCount > 0 }"
        @click="handleChatClick(userThread)"
      >
        <div class="avatar">
          <img
            :src="userThread.userPhoto || defaultAvatar"
            :alt="userThread.userName"
            class="profile-photo"
            @error="handleImageError"
          />
        </div>
        <div class="chat-info">
          <div class="user-name">{{ userThread.userName }}</div>
          <div class="last-message">
            {{ userThread.lastMessage || 'Belum ada percakapan' }}
          </div>
          <div v-if="userThread.lastMessageTime" class="message-time">
            {{ formatTime(userThread.lastMessageTime) }}
          </div>
        </div>
        <div v-if="userThread.unreadCount" class="unread-badge">
          {{ userThread.unreadCount }}
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { rtdb, db } from '@/config/firebase'
import { ref as dbRef, onValue, set, serverTimestamp } from 'firebase/database'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { format } from 'date-fns'
import defaultAvatar from '@/assets/default-avatar-wm14gXiP.png'

const chatThreads = ref([])
const allUsers = ref([])
let threadsListener = null

const handleImageError = (event) => {
  event.target.src = defaultAvatar
}

onMounted(() => {
  initializeChat()
  fetchAllUsers()
})

onUnmounted(() => {
  if (threadsListener) threadsListener()
})

const initializeChat = () => {
  const threadsRef = dbRef(rtdb, 'chat_threads')
  threadsListener = onValue(threadsRef, async (snapshot) => {
    const threads = []
    const promises = []

    snapshot.forEach((childSnapshot) => {
      const threadData = childSnapshot.val()
      // Tambahkan promise untuk mengambil data user dari Firestore
      const promise = getUserData(threadData.userId).then((userData) => {
        threads.push({
          id: childSnapshot.key,
          ...threadData,
          userPhoto: userData?.profilePhoto || defaultAvatar,
        })
      })
      promises.push(promise)
    })

    // Tunggu semua promise selesai
    await Promise.all(promises)

    // Sort threads setelah semua data lengkap
    chatThreads.value = threads.sort((a, b) => b.lastMessageTime - a.lastMessageTime)

    // Merge dengan semua user
    mergeUsersWithThreads()
  })
}

const fetchAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users')
    // Query untuk mengambil semua user yang bukan admin/staff
    const q = query(usersRef, where('isAdmin', '!=', true))
    const querySnapshot = await getDocs(q)

    const users = []
    querySnapshot.forEach((doc) => {
      const userData = doc.data()
      // Filter out admin dan staff
      if (!userData.isAdmin && !userData.isStaff) {
        users.push({
          id: `user_${userData.uid}`,
          userId: userData.uid,
          userName: userData.name,
          userPhoto: userData.profilePhoto || defaultAvatar,
          userEmail: userData.email,
          // Default values untuk thread yang belum ada
          lastMessage: '',
          lastMessageTime: null,
          unreadCount: 0,
        })
      }
    })

    // Merge dengan thread yang sudah ada
    mergeUsersWithThreads(users)
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

const mergeUsersWithThreads = (users = null) => {
  const userList = users || []

  // Jika users tidak diberikan, ambil dari allUsers yang sudah ada
  if (!users && allUsers.value.length > 0) {
    userList.push(...allUsers.value)
  }

  // Create a map of existing threads
  const threadMap = new Map()
  chatThreads.value.forEach((thread) => {
    threadMap.set(thread.id, thread)
  })

  // Merge users dengan threads
  const mergedList = userList.map((user) => {
    const existingThread = threadMap.get(user.id)
    if (existingThread) {
      // Jika thread sudah ada, gunakan data dari thread
      return existingThread
    } else {
      // Jika thread belum ada, gunakan data user dengan default values
      return user
    }
  })

  // Add any threads that don't have corresponding users (edge case)
  chatThreads.value.forEach((thread) => {
    const userExists = mergedList.some((user) => user.id === thread.id)
    if (!userExists) {
      mergedList.push(thread)
    }
  })

  // Sort: threads dengan pesan terbaru di atas, user tanpa pesan di bawah
  allUsers.value = mergedList.sort((a, b) => {
    // Jika keduanya punya lastMessageTime, sort berdasarkan waktu
    if (a.lastMessageTime && b.lastMessageTime) {
      return b.lastMessageTime - a.lastMessageTime
    }
    // Jika hanya a yang punya lastMessageTime, a di atas
    if (a.lastMessageTime && !b.lastMessageTime) {
      return -1
    }
    // Jika hanya b yang punya lastMessageTime, b di atas
    if (!a.lastMessageTime && b.lastMessageTime) {
      return 1
    }
    // Jika keduanya tidak punya lastMessageTime, sort berdasarkan nama
    return a.userName.localeCompare(b.userName)
  })
}

const handleChatClick = async (userThread) => {
  // Jika thread belum ada di database, buat thread baru
  if (!userThread.lastMessageTime && userThread.userId) {
    try {
      const threadRef = dbRef(rtdb, `chat_threads/${userThread.id}`)
      await set(threadRef, {
        userId: userThread.userId,
        userName: userThread.userName,
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        unreadCount: 0,
      })
    } catch (error) {
      console.error('Error creating thread:', error)
    }
  }
}

const getUserData = async (userId) => {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('uid', '==', userId))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data()
    }
    return null
  } catch (error) {
    console.error('Error fetching user data:', error)
    return null
  }
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return format(date, 'HH:mm')
}
</script>

<style scoped>
.chat-list-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.chat-threads {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-thread {
  display: flex;
  padding: 15px;
  border-bottom: 1px solid #e3e3e3;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  position: relative;
  transition: background-color 0.3s;
  align-items: center;
  gap: 15px;
}

.chat-thread:hover {
  background-color: #f5f5f5;
}

.chat-thread.unread {
  background-color: #e3f2fd;
}

.avatar {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
}

.profile-photo {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.chat-info {
  flex: 1;
}

.user-name {
  font-weight: 500;
  margin-bottom: 5px;
}

.last-message {
  color: #666;
  font-size: 0.9em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-time {
  font-size: 0.8em;
  color: #999;
  position: absolute;
  top: 15px;
  right: 15px;
}

.unread-badge {
  background-color: #1976d2;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  position: absolute;
  right: 15px;
  bottom: 15px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
}
</style>
