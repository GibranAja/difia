<!-- views/admin/ChatView.vue -->

<template>
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
              <img :src="message.senderPhoto || '../../assets/default-avatar-wm14gXiP.png'" alt="User avatar" />
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
      </div>

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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useChatStore } from '@/stores/ChatStore'
import { useAuthStore } from '@/stores/AuthStore'
import { storeToRefs } from 'pinia'
import defaultAvatar from '@/assets/default-avatar-wm14gXiP.png'

const chatStore = useChatStore()
const authStore = useAuthStore()
const { currentUser } = storeToRefs(authStore)
const { messages } = storeToRefs(chatStore)

const newMessage = ref('')
const messagesContainer = ref(null)

let unsubscribe = null

onMounted(async () => {
  if (currentUser.value?.isAdmin) {
    unsubscribe = chatStore.subscribeToAllMessages()
  }
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})

watch(
  messages,
  async () => {
    await nextTick()
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  },
  { deep: true },
)

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const sendMessage = async () => {
  if (!newMessage.value.trim()) return

  try {
    await chatStore.sendMessage(newMessage.value)
    newMessage.value = ''
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}
</script>

<style scoped>
.chat-wrapper {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.chat-title {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-weight: 500;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 70vh;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 80%;
  align-items: flex-start;
}

.message.sent {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  background: #f0f2f5;
  padding: 12px 16px;
  border-radius: 16px;
  position: relative;
}

.message.sent .message-content {
  background: #e3f2fd;
}

.message-sender {
  font-size: 0.9em;
  font-weight: 500;
  margin-bottom: 4px;
  color: #666;
}

.message-text {
  color: #333;
  line-height: 1.4;
}

.message-time {
  font-size: 0.75em;
  color: #999;
  margin-top: 4px;
}

.chat-input {
  display: flex;
  padding: 16px;
  gap: 12px;
  border-top: 1px solid #eee;
  background: #fff;
}

.chat-input input {
  flex: 1;
  padding: 12px 20px;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  outline: none;
  font-size: 0.95em;
}

.chat-input input:focus {
  border-color: #2196f3;
}

.chat-input button {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #522808;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chat-input button i {
  font-size: 1.2em;
}

.chat-input button:hover {
  background: #1976d2;
  transform: translateY(-1px);
}
</style>
