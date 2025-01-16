<template>
  <div class="chat-list-container">
    <h2>Daftar Pesan</h2>
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
import { rtdb } from '@/config/firebase'
import { ref as dbRef, onValue } from 'firebase/database'
import { format } from 'date-fns'

const chatThreads = ref([])
let threadsListener = null

onMounted(() => {
  initializeChat()
})

onUnmounted(() => {
  if (threadsListener) threadsListener()
})

const initializeChat = () => {
  const threadsRef = dbRef(rtdb, 'chat_threads')
  threadsListener = onValue(threadsRef, (snapshot) => {
    const threads = []
    snapshot.forEach((childSnapshot) => {
      threads.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      })
    })
    chatThreads.value = threads.sort((a, b) => b.lastMessageTime - a.lastMessageTime)
  })
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
}

.chat-thread:hover {
  background-color: #f5f5f5;
}

.chat-thread.unread {
  background-color: #e3f2fd;
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