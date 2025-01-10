// views/ChatView.vue
<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/AuthStore'
import { useChatStore } from '@/stores/ChatStore'
import ChatList from '@/components/ChatList.vue'
import ChatWindow from '@/components/ChatWindow.vue'

const authStore = useAuthStore()
const chatStore = useChatStore()
const selectedUserId = ref(null)

const handleChatSelect = (userId) => {
  if (userId) {
    selectedUserId.value = userId
  }
}

onMounted(async () => {
  if (authStore.isLoggedIn) {
    await chatStore.loadChatList()
  }
})
</script>

<template>
  <div class="chat-container">
    <ChatList @select-chat="handleChatSelect" />
    <ChatWindow 
      v-if="selectedUserId" 
      :recipientId="selectedUserId" 
    />
    <div v-else class="no-chat-selected">
      Select a chat to start messaging
    </div>
  </div>
</template>

<style>
.chat-container {
  display: flex;
  height: calc(100vh - 64px);
  background-color: white;
}

.no-chat-selected {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 1.2em;
}
</style>