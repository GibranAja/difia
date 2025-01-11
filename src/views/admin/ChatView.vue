<template>
  <div class="chat-container">
    <!-- Chat list sidebar -->
    <div class="chat-list">
      <h2>Pesan</h2>
      <div v-if="!chatThreads.length" class="no-chats">
        No messages yet
      </div>
      <div 
        v-else 
        v-for="thread in chatThreads" 
        :key="thread.id"
        class="chat-thread"
        :class="{ active: selectedThread?.id === thread.id }"
        @click="selectThread(thread)"
      >
        <div class="chat-info">
          <div class="user-name">{{ thread.userName }}</div>
          <div class="last-message">{{ thread.lastMessage }}</div>
          <div class="message-time">{{ formatTime(thread.lastMessageTime) }}</div>
        </div>
        <div v-if="thread.unreadCount" class="unread-badge">
          {{ thread.unreadCount }}
        </div>
      </div>
    </div>

    <!-- Chat messages area -->
    <div class="chat-messages">
      <div v-if="!selectedThread" class="no-chat-selected">
        Select a conversation to start chatting
      </div>
      
      <template v-else>
        <!-- Chat header -->
        <div class="chat-header">
          <h3>{{ selectedThread.userName }}</h3>
        </div>

        <!-- Messages container -->
        <div class="messages-container" ref="messagesContainer">
          <div 
            v-for="msg in messages" 
            :key="msg.id" 
            class="message"
            :class="{ 'sent': msg.senderId === currentUser.id }"
          >
            <div class="message-content">
              {{ msg.text }}
              <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
            </div>
          </div>
        </div>

        <!-- Message input -->
        <div class="message-input">
          <input 
            v-model="newMessage" 
            @keyup.enter="sendMessage"
            placeholder="Type your message..."
          />
          <button @click="sendMessage" :disabled="!newMessage.trim()">
            Send
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/AuthStore'
import { rtdb } from '@/config/firebase'
import { ref as dbRef, onValue, push, update, serverTimestamp } from 'firebase/database'
import { format } from 'date-fns'

const authStore = useAuthStore()
const currentUser = ref(authStore.currentUser)
const chatThreads = ref([])
const selectedThread = ref(null)
const messages = ref([])
const newMessage = ref('')
const messagesContainer = ref(null)

let threadsListener = null
let messagesListener = null

onMounted(() => {
  initializeChat()
})

onUnmounted(() => {
  if (threadsListener) threadsListener()
  if (messagesListener) messagesListener()
})

const initializeChat = () => {
  // Listen for chat threads
  const threadsRef = dbRef(rtdb, 'chat_threads')
  threadsListener = onValue(threadsRef, (snapshot) => {
    const threads = []
    snapshot.forEach((childSnapshot) => {
      const thread = {
        id: childSnapshot.key,
        ...childSnapshot.val()
      }
      threads.push(thread)
    })
    chatThreads.value = threads.sort((a, b) => b.lastMessageTime - a.lastMessageTime)
  })
}

const selectThread = (thread) => {
  selectedThread.value = thread
  
  // Clear previous messages listener
  if (messagesListener) messagesListener()
  
  // Listen for messages in selected thread
  const messagesRef = dbRef(rtdb, `messages/${thread.id}`)
  messagesListener = onValue(messagesRef, (snapshot) => {
    const messagesList = []
    snapshot.forEach((childSnapshot) => {
      messagesList.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      })
    })
    messages.value = messagesList
    
    // Mark messages as read
    markThreadAsRead(thread.id)
  })
}

const markThreadAsRead = async (threadId) => {
  const threadRef = dbRef(rtdb, `chat_threads/${threadId}`)
  await update(threadRef, {
    unreadCount: 0
  })
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedThread.value) return

  const messageData = {
    text: newMessage.value.trim(),
    senderId: currentUser.value.id,
    senderName: currentUser.value.name,
    timestamp: serverTimestamp()
  }

  // Add message
  const messagesRef = dbRef(rtdb, `messages/${selectedThread.value.id}`)
  await push(messagesRef, messageData)

  // Update thread
  const threadRef = dbRef(rtdb, `chat_threads/${selectedThread.value.id}`)
  await update(threadRef, {
    lastMessage: messageData.text,
    lastMessageTime: serverTimestamp()
  })

  newMessage.value = ''
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return format(date, 'HH:mm')
}

// Auto scroll to bottom when new messages arrive
watch(messages, () => {
  setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }, 100)
})
</script>

<style scoped>
.chat-container {
  display: flex;
  height: calc(100vh - 100px);
  margin: 20px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.chat-list {
  width: 300px;
  border-right: 1px solid #eee;
  overflow-y: auto;
}

.chat-list h2 {
  padding: 20px;
  margin: 0;
  border-bottom: 1px solid #eee;
}

.chat-thread {
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.3s;
}

.chat-thread:hover {
  background-color: #f5f5f5;
}

.chat-thread.active {
  background-color: #e3f2fd;
}

.chat-info {
  position: relative;
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
  position: absolute;
  top: 0;
  right: 0;
  font-size: 0.8em;
  color: #999;
}

.unread-badge {
  background-color: #1976d2;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
}

.chat-messages {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.chat-header h3 {
  margin: 0;
}

.messages-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.message {
  margin-bottom: 10px;
  display: flex;
}

.message.sent {
  justify-content: flex-end;
}

.message-content {
  background-color: #f1f1f1;
  padding: 10px 15px;
  border-radius: 15px;
  max-width: 70%;
  position: relative;
}

.message.sent .message-content {
  background-color: #1976d2;
  color: white;
}

.message-time {
  font-size: 0.8em;
  color: #999;
  margin-left: 10px;
}

.message.sent .message-time {
  color: #ccc;
}

.message-input {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
}

.message-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}

.message-input button {
  padding: 10px 20px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.message-input button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.no-chat-selected,
.no-chats {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
}
</style>