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
        <div 
          class="message-content"
          :class="{ 'form-link-message': msg.isFormLink }"
        >
          <template v-if="msg.isFormLink">
            <router-link :to="msg.formUrl" class="form-link">
              <i class="fas fa-file-alt"></i>
              Form Pemesanan
              <i class="fas fa-arrow-right"></i>
            </router-link>
          </template>
          <template v-else>
            {{ msg.text }}
          </template>
          <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
        </div>
      </div>
    </div>

    <!-- Add Quick Messages section above the message input -->
    <div class="quick-messages">
      <button 
        @click="sendFormLink" 
        class="form-order-btn"
      >
        <i class="fas fa-file-alt"></i> Form Pemesanan
      </button>
      <div class="quick-message-container">
        <button 
          v-for="(message, index) in quickMessages" 
          :key="index"
          @click="sendQuickMessage(message, index)"
          class="quick-message-btn"
          :disabled="cooldowns[index] > 0"
        >
          {{ message }}
          <span v-if="cooldowns[index] > 0" class="cooldown-text">{{ cooldowns[index] }}s</span>
        </button>
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
  cooldowns.value.forEach((_, index) => {
    if (cooldowns.value[index] > 0) {
      cooldowns.value[index] = 0
    }
  })
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

// Add these to your existing refs
const quickMessages = [
  "Baik, akan saya proses",
  "Mohon tunggu sebentar",
  "Terima kasih sudah menghubungi kami",
  "Apakah ada yang bisa kami bantu?",
  "Mohon maaf atas ketidaknyamanannya"
]

// Add cooldown state
const cooldowns = ref(quickMessages.map(() => 0))

const startCooldown = (index) => {
  cooldowns.value[index] = 5 // 5 second cooldown
  const timer = setInterval(() => {
    cooldowns.value[index]--
    if (cooldowns.value[index] <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const sendQuickMessage = async (message, index) => {
  if (cooldowns.value[index] > 0) return

  try {
    const messageData = {
      text: message,
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

    // Start cooldown after successful send
    startCooldown(index)
  } catch (error) {
    console.error('Error sending quick message:', error)
  }
}

// Add this function to your script
const sendFormLink = async () => {
  try {
    const messageData = {
      text: "Form Pemesanan", // Simplified text since we'll use icons
      senderId: currentUser.value.id,
      senderName: currentUser.value.name,
      timestamp: serverTimestamp(),
      isFormLink: true,
      formUrl: '/form-order'
    }

    const messagesRef = dbRef(rtdb, `messages/${route.params.id}`)
    await push(messagesRef, messageData)

    const threadRef = dbRef(rtdb, `chat_threads/${route.params.id}`)
    await update(threadRef, {
      lastMessage: "Mengirim form pemesanan",
      lastMessageTime: serverTimestamp()
    })
  } catch (error) {
    console.error('Error sending form link:', error)
  }
}
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

/* Update the quick-messages style */
.quick-messages {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background-color: #DEB887;
  border-top: 1px solid rgba(139, 69, 19, 0.1);
  align-items: center;
}

/* Update the form-order-btn style */
.form-order-btn {
  margin-right: 1rem; /* Add margin to separate from quick messages */
  white-space: nowrap;
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 1rem;
  background-color: #4A2511;
  color: white;
  cursor: pointer;
  font-family: 'Judson', serif;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  grid-column: 1;
  order: -1; /* Ensures it stays first */
}

/* Add a container for quick message buttons */
.quick-message-container {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  grid-column: 2;
  scrollbar-width: thin;
  scrollbar-color: #8B4513 #DEB887;
}

/* Style the scrollbar */
.quick-message-container::-webkit-scrollbar {
  height: 6px;
}

.quick-message-container::-webkit-scrollbar-track {
  background: #DEB887;
}

.quick-message-container::-webkit-scrollbar-thumb {
  background-color: #8B4513;
  border-radius: 4px;
}

.quick-message-btn {
  position: relative;
  white-space: nowrap;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 1rem;
  background-color: white;
  color: #8B4513;
  cursor: pointer;
  font-family: 'Judson', serif;
  transition: all 0.3s ease;
}

.quick-message-btn:hover:not(:disabled) {
  background-color: #8B4513;
  color: white;
}

.quick-message-btn:disabled {
  background-color: #D2B48C;
  color: rgba(139, 69, 19, 0.5);
  cursor: not-allowed;
  opacity: 0.8;
}

.cooldown-text {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #8B4513;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .quick-messages {
    padding: 0.8rem 1rem;
  }

  .quick-message-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
}

/* Add this new style */
.form-order-btn i {
  font-size: 1rem;
}

/* Add these new styles */
.message-content.form-link-message {
  background-color: #4A2511 !important;
  color: white !important;
  cursor: pointer;
  padding: 1.5rem 2rem !important;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.message-content.form-link-message:hover {
  background-color: #5c2e15 !important;
  transform: translateY(-2px);
}

.message-content.form-link-message i {
  font-size: 1.2rem;
}

.form-link {
  color: white;
  text-decoration: none;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-link i {
  transition: transform 0.3s ease;
}

.form-link:hover i {
  transform: translateX(4px);
}
</style>