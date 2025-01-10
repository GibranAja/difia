<template>
<<<<<<< HEAD
  <div class="chat-wrapper">
    <h2 class="chat-title">Customer Messages</h2>
    <div class="chat-container">
      <div class="chat-messages" ref="messagesContainer">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['message', message.senderId === currentUser?.id ? 'sent' : 'received']"
        >
          <template v-if="message.senderId !== currentUser?.id">
            <div class="message-avatar">
              <img :src="message.senderPhoto || defaultAvatar" alt="User avatar" />
            </div>
            <div class="message-content">
              <div class="message-sender">{{ message.senderName }}</div>
              <div class="message-text">{{ message.content }}</div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </template>
          <template v-else>
            <div class="message-avatar">
              <img :src="message.senderPhoto || defaultAvatar" alt="Admin avatar" />
            </div>
            <div class="message-content">
              <div class="message-sender">You</div>
              <div class="message-text">{{ message.content }}</div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </template>
        </div>
=======
  <div class="admin-chat-container">
    <div class="chat-header">
      <router-link to="/admin/chat" class="back-button">
        ← Back to Chat List
      </router-link>
      <div class="chat-user-info" v-if="currentUser">
        Chatting with: {{ currentUser.name }}
>>>>>>> e77bf041630297048a379a205f5d2aca0ebdea01
      </div>
    </div>

<<<<<<< HEAD
      <div class="chat-input">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="Type your reply here..."
          type="text"
        />
        <button @click="sendMessage">
          <i class="fas fa-paper-plane"></i>
        </button>
=======
    <div class="chat-messages" ref="messagesContainer">
      <div v-if="messages.length === 0" class="no-messages">
        No messages yet
>>>>>>> e77bf041630297048a379a205f5d2aca0ebdea01
      </div>
      
      <template v-for="message in messages" :key="message.id">
        <div 
          class="message-bubble" 
          :class="{ 
            'sent': message.senderId === authUser?.uid,
            'received': message.senderId !== authUser?.uid 
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
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '@/stores/ChatStore'
import { useAuthStore } from '@/stores/AuthStore'
import { storeToRefs } from 'pinia'

const route = useRoute()
const chatStore = useChatStore()
const authStore = useAuthStore()
const { messages } = storeToRefs(chatStore)
const authUser = ref(authStore.currentUser)

const currentUser = ref(null)
const newMessage = ref('')
const messagesContainer = ref(null)
const unsubscribe = ref(null)

onMounted(async () => {
  const userId = route.params.userId
  if (userId && authUser.value) {
    unsubscribe.value = await chatStore.listenToMessages(userId, authUser.value.uid)
    // Here you should also fetch user details for the currentUser
    // This is just a placeholder
    currentUser.value = {
      id: userId,
      name: 'User ' + userId
    }
  }
})

watch(messages, async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}, { deep: true })

const sendMessage = async () => {
  if (!newMessage.value.trim() || !currentUser.value) return
  
  await chatStore.sendMessage(newMessage.value, currentUser.value.id)
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
.admin-chat-container {
  display: flex;
  flex-direction: column;
  height: 90vh;
  max-width: 800px;
  margin: 0 auto;
  background: #f5f5f5;
  border-radius: 10px;
}

.chat-header {
  padding: 20px;
  background: white;
  border-radius: 10px 10px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
}

.back-button {
  text-decoration: none;
  color: #0084ff;
  font-weight: 500;
}

.chat-user-info {
  font-weight: bold;
}

/* Rest of the styles are the same as ChatView.vue */
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
  padding: 20px;
  background: white;
  border-radius: 0 0 10px 10px;
  border-top: 1px solid #eee;
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