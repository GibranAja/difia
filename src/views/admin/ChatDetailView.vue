<template>
  <div class="chat-detail-container">
    <div class="chat-header">
      <router-link to="/admin/chat" class="back-button">
        <i class="fas fa-arrow-left"></i>
      </router-link>
      <h3 v-if="chatThread">{{ chatThread.userName }}</h3>
    </div>

    <div class="messages-container" ref="messagesContainer">
      <div v-if="!messages.length" class="no-messages">
        Belum ada pesan
      </div>
      <div 
        v-else
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
        placeholder="Ketik pesan..."
      />
      <button @click="sendMessage" :disabled="!newMessage.trim()">
        <i class="fas fa-paper-plane"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import { rtdb } from '@/config/firebase'
import { ref as dbRef, onValue, push, update, serverTimestamp } from 'firebase/database'
import { format } from 'date-fns'

const route = useRoute()
const authStore = useAuthStore()
const currentUser = ref(authStore.currentUser)
const chatThread = ref(null)
const messages = ref([])
const newMessage = ref('')
const messagesContainer = ref(null)

let threadListener = null
let messagesListener = null

onMounted(() => {
  initializeChat()
})

onUnmounted(() => {
  if (threadListener) threadListener()
  if (messagesListener) messagesListener()
})

const initializeChat = () => {
  const threadId = route.params.id
  const threadRef = dbRef(rtdb, `chat_threads/${threadId}`)
  
  // Listen for thread details
  threadListener = onValue(threadRef, (snapshot) => {
    chatThread.value = {
      id: snapshot.key,
      ...snapshot.val()
    }
  })

  // Listen for messages
  const messagesRef = dbRef(rtdb, `messages/${threadId}`)
  messagesListener = onValue(messagesRef, (snapshot) => {
    const messagesList = []
    snapshot.forEach((childSnapshot) => {
      messagesList.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      })
    })
    messages.value = messagesList
    markThreadAsRead(threadId)
  })
}

const markThreadAsRead = async (threadId) => {
  const threadRef = dbRef(rtdb, `chat_threads/${threadId}`)
  await update(threadRef, {
    unreadCount: 0
  })
}

const sendMessage = async () => {
  if (!newMessage.value.trim()) return

  const messageData = {
    text: newMessage.value.trim(),
    senderId: currentUser.value.id,
    senderName: currentUser.value.name,
    timestamp: serverTimestamp()
  }

  const messagesRef = dbRef(rtdb, `messages/${route.params.id}`)
  await push(messagesRef, messageData)

  const threadRef = dbRef(rtdb, `chat_threads/${route.params.id}`)
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
.chat-detail-container {
  font-family: 'Judson', serif;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #DEB887;
  position: relative;
  overflow: hidden;
}

.chat-header {
  background-color: #8B4513;
  padding: 1.5rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-button {
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  padding: 0.5rem;
}

.back-button:hover {
  color: #DEB887;
}

.chat-header h3 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: normal;
}

.messages-container {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  scrollbar-width: thin;
  scrollbar-color: #8B4513 #DEB887;
}

.messages-container::-webkit-scrollbar {
  width: 8px;
}

.messages-container::-webkit-scrollbar-track {
  background: #DEB887;
}

.messages-container::-webkit-scrollbar-thumb {
  background-color: #8B4513;
  border-radius: 4px;
}

.message {
  display: flex;
  margin: 0.5rem 0;
}

.message.sent {
  justify-content: flex-end;
}

.message-content {
  max-width: 60%;
  padding: 1rem 1.5rem;
  border-radius: 1.5rem;
  position: relative;
  font-size: 1.1rem;
  line-height: 1.4;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message.sent .message-content {
  background-color: white;
  color: #8B4513;
}

.message:not(.sent) .message-content {
  background-color: #8B4513;
  color: white;
}

.message-time {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-left: 0.5rem;
  display: inline-block;
  vertical-align: bottom;
}

.message-input {
  padding: 1.5rem 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  background-color: #DEB887;
  border-top: 1px solid rgba(139, 69, 19, 0.1);
}

.message-input input {
  flex: 1;
  padding: 1.2rem 2rem;
  border: none;
  border-radius: 2rem;
  font-size: 1.1rem;
  background: white;
  color: #8B4513;
  font-family: 'Judson', serif;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message-input input:focus {
  outline: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.message-input input::placeholder {
  color: #8B4513;
  opacity: 0.7;
}

.message-input button {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background-color: #4A2511;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: background-color 0.3s, transform 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.message-input button:hover:not(:disabled) {
  background-color: #5c2e15;
  transform: scale(1.05);
}

.message-input button:active:not(:disabled) {
  transform: scale(0.95);
}

.message-input button:disabled {
  background-color: #D2B48C;
  cursor: not-allowed;
  box-shadow: none;
}

.no-messages {
  text-align: center;
  color: #8B4513;
  font-size: 1.2rem;
  margin: 2rem 0;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .chat-header {
    padding: 1rem;
  }

  .chat-header h3 {
    font-size: 1.4rem;
  }

  .message-content {
    max-width: 75%;
    padding: 0.8rem 1.2rem;
    font-size: 1rem;
  }

  .message-input {
    padding: 1rem;
  }

  .message-input input {
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }

  .message-input button {
    width: 3rem;
    height: 3rem;
    font-size: 1rem;
  }
}
</style>