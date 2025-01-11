<!-- src/components/CustomerChat.vue -->
<template>
  <div class="customer-chat" :class="{ 'chat-open': isChatOpen }">
    <!-- Chat Button -->
    <button class="chat-toggle" @click="toggleChat">
      <i class="fas" :class="isChatOpen ? 'fa-times' : 'fa-comments'"></i>
      <span v-if="unreadCount && !isChatOpen" class="unread-badge">{{ unreadCount }}</span>
    </button>

    <!-- Chat Window -->
    <div class="chat-window" v-if="isChatOpen">
      <div class="chat-header">
        <h3>Chat with Admin</h3>
      </div>

      <div class="messages-container" ref="messagesContainer">
        <div v-if="!messages.length" class="no-messages">
          Start a conversation with us!
        </div>
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

      <div class="message-input">
        <input 
          v-model="newMessage" 
          @keyup.enter="sendMessage"
          placeholder="Type your message..."
          :disabled="!isLoggedIn"
        />
        <button 
          @click="sendMessage" 
          :disabled="!newMessage.trim() || !isLoggedIn"
        >
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>

      <div v-if="!isLoggedIn" class="login-prompt">
        Please <router-link to="/login">login</router-link> to start chatting
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/AuthStore'
import { rtdb } from '@/config/firebase'
import { ref as dbRef, onValue, push, set, update, serverTimestamp, get, increment } from 'firebase/database'
import { format } from 'date-fns'

const authStore = useAuthStore()
const isLoggedIn = ref(authStore.isLoggedIn)
const currentUser = ref(authStore.currentUser)
const isChatOpen = ref(false)
const messages = ref([])
const newMessage = ref('')
const messagesContainer = ref(null)
const unreadCount = ref(0)
const threadId = ref(null)

let messagesListener = null

onMounted(() => {
  if (isLoggedIn.value) {
    initializeChat()
  }
})

onUnmounted(() => {
  if (messagesListener) messagesListener()
})

watch(() => authStore.isLoggedIn, (newValue) => {
  isLoggedIn.value = newValue
  currentUser.value = authStore.currentUser
  if (newValue) {
    initializeChat()
  }
})

const initializeChat = async () => {
  // Create or get existing thread
  threadId.value = `user_${currentUser.value.id}`
  const threadRef = dbRef(rtdb, `chat_threads/${threadId.value}`)
  
  // Initialize thread if it doesn't exist
  await set(threadRef, {
    userId: currentUser.value.id,
    userName: currentUser.value.name,
    lastMessage: '',
    lastMessageTime: serverTimestamp(),
    unreadCount: 0
  }, { merge: true })

  // Listen for messages
  const messagesRef = dbRef(rtdb, `messages/${threadId.value}`)
  messagesListener = onValue(messagesRef, (snapshot) => {
    const messagesList = []
    snapshot.forEach((childSnapshot) => {
      messagesList.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      })
    })
    messages.value = messagesList

    // Count unread messages (from admin)
    unreadCount.value = messagesList.filter(
      msg => msg.senderId !== currentUser.value.id && !msg.read
    ).length
  })
}

const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value
  if (isChatOpen.value && threadId.value) {
    markMessagesAsRead()
  }
}

const markMessagesAsRead = async () => {
  if (!threadId.value) return

  const messagesRef = dbRef(rtdb, `messages/${threadId.value}`)
  const snapshot = await get(messagesRef)
  
  const updates = {}
  snapshot.forEach((childSnapshot) => {
    const message = childSnapshot.val()
    if (message.senderId !== currentUser.value.id && !message.read) {
      updates[`${childSnapshot.key}/read`] = true
    }
  })

  if (Object.keys(updates).length > 0) {
    await update(messagesRef, updates)
    unreadCount.value = 0
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !isLoggedIn.value) return

  const messageData = {
    text: newMessage.value.trim(),
    senderId: currentUser.value.id,
    senderName: currentUser.value.name,
    timestamp: serverTimestamp(),
    read: false
  }

  // Add message
  const messagesRef = dbRef(rtdb, `messages/${threadId.value}`)
  await push(messagesRef, messageData)

  // Update thread
  const threadRef = dbRef(rtdb, `chat_threads/${threadId.value}`)
  await update(threadRef, {
    lastMessage: messageData.text,
    lastMessageTime: serverTimestamp(),
    unreadCount: increment(1)
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
.customer-chat {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.chat-toggle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #1976d2;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  position: relative;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.chat-window {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 15px;
  background-color: #1976d2;
  color: white;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
}

.messages-container {
  flex: 1;
  padding: 15px;
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
  padding: 8px 12px;
  border-radius: 15px;
  max-width: 80%;
  position: relative;
}

.message.sent .message-content {
  background-color: #1976d2;
  color: white;
}

.message-time {
  font-size: 0.7em;
  color: #999;
  margin-left: 8px;
}

.message.sent .message-time {
  color: #ccc;
}

.message-input {
  padding: 15px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 8px;
}

.message-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
}

.message-input button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #1976d2;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-input button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.unread-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #f44336;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.login-prompt {
  padding: 10px;
  text-align: center;
  background-color: #f8f9fa;
  border-top: 1px solid #eee;
  font-size: 14px;
}

.login-prompt a {
  color: #1976d2;
  text-decoration: none;
}

.no-messages {
  text-align: center;
  color: #666;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .chat-window {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
  }
}
</style>