<template>
  <div class="chat-container">
    <!-- Chat Header -->
    <div class="chat-header">
      <div class="user-info">
        <div class="user-avatar"></div>
        <div class="user-details">
          <h1>Admin difia</h1>
        </div>
      </div>
    </div>

    <!-- Messages Area -->
    <div class="messages-area" ref="messagesContainer">
      <div v-if="!messages.length" class="no-messages">
        Start a conversation with us!
      </div>
      <div 
        v-for="msg in messages" 
        :key="msg.id" 
        class="message"
        :class="{ 'sent': msg.senderId === currentUser.id }"
      >
        <div class="message-bubble">
          {{ msg.text }}
          <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-area">
      <input 
        v-model="newMessage" 
        @keyup.enter="sendMessage"
        placeholder="Ketik Sesuatu....."
        :disabled="!isLoggedIn"
        class="message-input"
      />
      <button 
        @click="sendMessage" 
        :disabled="!newMessage.trim() || !isLoggedIn"
        class="send-button"
      >
        <i class="fas fa-paper-plane"></i>
      </button>
    </div>

    <div v-if="!isLoggedIn" class="login-prompt">
      Please <router-link to="/login">login</router-link> to start chatting
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
    threadId.value = `user_${currentUser.value.id}`
    const threadRef = dbRef(rtdb, `chat_threads/${threadId.value}`)
    
    await set(threadRef, {
      userId: currentUser.value.id,
      userName: currentUser.value.name,
      lastMessage: '',
      lastMessageTime: serverTimestamp(),
      unreadCount: 0
    }, { merge: true })
  
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
  
    const messagesRef = dbRef(rtdb, `messages/${threadId.value}`)
    await push(messagesRef, messageData)
  
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
  font-family: 'Judson';
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #DEB887;
  position: relative;
}

.chat-header {
  background-color: #8B4513;
  padding: 0.8rem;
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: white;
}

.user-details h1 {
  font-size: 1.5rem;
  margin: 0;
  font-weight: normal;
}

.user-details p {
  font-size: 1.2rem;
  margin: 0.5rem 0 0;
  opacity: 0.9;
}

.messages-area {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  margin: 0.5rem 0;
}

.message.sent {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 60%;
  padding: 1rem 1.5rem;
  border-radius: 1.5rem;
  position: relative;
  font-size: 1.1rem;
  line-height: 1.4;
}

.message.sent .message-bubble {
  background-color: white;
  color: #8B4513;
}

.message:not(.sent) .message-bubble {
  background-color: #8B4513;
  color: white;
}

.message-time {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-left: 0.5rem;
}

.input-area {
  padding: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  background-color: #DEB887;
}

.message-input {
  flex: 1;
  padding: 1.2rem 2rem;
  border: none;
  border-radius: 2rem;
  font-size: 1.1rem;
  background: white;
  color: #8B4513;
}

.message-input::placeholder {
  color: #8B4513;
  opacity: 0.7;
}

.send-button {
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
}

.send-button:disabled {
  background-color: #D2B48C;
  cursor: not-allowed;
}

.no-messages {
  text-align: center;
  color: #8B4513;
  font-size: 1.2rem;
  margin: 2rem 0;
}

.login-prompt {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background-color: #8B4513;
  color: white;
  text-align: center;
}

.login-prompt a {
  color: white;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .user-details h1 {
    font-size: 1.5rem;
  }

  .user-details p {
    font-size: 1rem;
  }

  .message-bubble {
    max-width: 75%;
  }
}
</style>