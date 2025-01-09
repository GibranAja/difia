<template>
  <div class="chat-container" v-if="!loading">
    <div class="chat-messages" ref="messagesContainer">
      <div v-if="messages.length === 0" class="no-messages">
        Start a conversation with our admin!
      </div>
      
      <template v-for="message in messages" :key="message.id">
        <div 
          class="message-bubble" 
          :class="{ 
            'sent': message.senderId === currentUser?.id,
            'received': message.senderId !== currentUser?.id 
          }"
        >
          <div class="message-content">{{ message.content }}</div>
          <div class="message-time">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
      </template>
    </div>

    <div class="chat-input">
      <input 
        v-model="newMessage" 
        @keyup.enter="sendMessage"
        placeholder="Type a message..."
        type="text"
      />
      <button @click="sendMessage">Send</button>
    </div>
  </div>
  <div v-else class="loading-container">
    Loading chat...
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useChatStore } from '@/stores/ChatStore'
import { useAuthStore } from '@/stores/AuthStore'
import { storeToRefs } from 'pinia'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/config/firebase'

const chatStore = useChatStore()
const authStore = useAuthStore()
const { messages } = storeToRefs(chatStore)
const { currentUser } = storeToRefs(authStore)

const newMessage = ref('')
const messagesContainer = ref(null)
const unsubscribe = ref(null)
const loading = ref(true)
const adminId = ref(null)

const initializeChat = async () => {
  try {
    // Cara 1: Mengambil admin ID dari collection users
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('isAdmin', '==', true))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      adminId.value = querySnapshot.docs[0].data().uid
      if (currentUser.value) {
        unsubscribe.value = await chatStore.listenToMessages(currentUser.value.id, adminId.value)
      }
    }

    /* 
    // Cara 2: Mengambil dari collection settings
    const settingsRef = collection(db, 'settings')
    const settingsQuery = query(settingsRef, where('key', '==', 'adminId'))
    const settingsSnapshot = await getDocs(settingsQuery)
    
    if (!settingsSnapshot.empty) {
      adminId.value = settingsSnapshot.docs[0].data().value
      if (currentUser.value) {
        unsubscribe.value = await chatStore.listenToMessages(currentUser.value.id, adminId.value)
      }
    }
    */

  } catch (error) {
    console.error('Error initializing chat:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initializeChat()
})

// Cleanup when component unmounts
onUnmounted(() => {
  if (unsubscribe.value) {
    unsubscribe.value()
  }
})

watch(messages, async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}, { deep: true })

const sendMessage = async () => {
  if (!newMessage.value.trim() || !adminId.value) return
  
  await chatStore.sendMessage(newMessage.value, adminId.value)
  newMessage.value = ''
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
</script>

<style>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 80vh;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 10px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message-bubble {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 15px;
  margin: 5px 0;
  word-wrap: break-word;
}

.sent {
  align-self: flex-end;
  background-color: #0084ff;
  color: white;
}

.received {
  align-self: flex-start;
  background-color: #e9ecef;
  color: black;
}

.message-content {
  margin-bottom: 5px;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
  text-align: right;
}

.chat-input {
  display: flex;
  gap: 10px;
  padding: 20px 0 0 0;
}

.chat-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
}

.chat-input button {
  padding: 10px 20px;
  background: #0084ff;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.chat-input button:hover {
  background: #0073e6;
}

.no-messages {
  text-align: center;
  color: #666;
  margin: 20px 0;
}
</style>