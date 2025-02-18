<!-- views/admin/admin/ChatListView.vue -->
<template>
  <div class="chat-list-container">
    <h2>DAFTAR PESAN</h2>
    <div v-if="!chatThreads.length" class="no-chats">
      <div class="empty-state">
        <i class="fas fa-comments"></i>
        <p>Belum ada pesan masuk</p>
      </div>
    </div>
    
    <div v-else class="chat-threads">
      <router-link
        v-for="thread in chatThreads" 
        :key="thread.id"
        :to="`/admin/chat/${thread.id}`"
        class="chat-thread"
        :class="{ 'unread': thread.unreadCount > 0 }"
      >
        <div class="avatar">
          <img 
            :src="thread.userPhoto || defaultAvatar"
            :alt="thread.userName"
            class="profile-photo"
            @error="handleImageError"
          />
        </div>
        <div class="chat-info">
          <div class="user-name">{{ thread.userName }}</div>
          <div class="last-message">{{ thread.lastMessage }}</div>
          <div class="message-time">{{ formatTime(thread.lastMessageTime) }}</div>
        </div>
        <div v-if="thread.unreadCount" class="unread-badge">
          {{ thread.unreadCount }}
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { rtdb, db } from '@/config/firebase'
import { ref as dbRef, onValue } from 'firebase/database'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { format } from 'date-fns'
import defaultAvatar from '@/assets/default-avatar-wm14gXiP.png'

const chatThreads = ref([])
let threadsListener = null

const handleImageError = (event) => {
  event.target.src = defaultAvatar
}

onMounted(() => {
  initializeChat()
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
      const promise = getUserData(threadData.userId).then(userData => {
        threads.push({
          id: childSnapshot.key,
          ...threadData,
          userPhoto: userData?.profilePhoto || defaultAvatar
        })
      })
      promises.push(promise)
    })

    // Tunggu semua promise selesai
    await Promise.all(promises)
    
    // Sort threads setelah semua data lengkap
    chatThreads.value = threads.sort((a, b) => b.lastMessageTime - a.lastMessageTime)
  })
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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