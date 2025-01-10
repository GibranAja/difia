<template>
  <div class="chat-list-container">
    <h2>Active Conversations</h2>
    
    <div class="chat-users">
      <div 
        v-for="user in chatUsers" 
        :key="user.id"
        class="chat-user"
        :class="{ 'active': currentChatUser?.id === user.id }"
        @click="openChat(user)"
      >
        <div class="user-avatar">
          {{ user.name.charAt(0).toUpperCase() }}
        </div>
        <div class="user-info">
          <div class="user-name">{{ user.name }}</div>
          <div class="last-message">Click to view conversation</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/ChatStore'
import { storeToRefs } from 'pinia'

const router = useRouter()
const chatStore = useChatStore()
const { chatUsers, currentChatUser } = storeToRefs(chatStore)

onMounted(async () => {
  await chatStore.fetchChatUsers()
})

const openChat = (user) => {
  router.push({ name: 'ChatView', params: { userId: user.id }})
}
</script>

<style>
.chat-list-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.chat-users {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.chat-user {
  display: flex;
  align-items: center;
  padding: 15px;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chat-user:hover {
  background: #f5f5f5;
}

.chat-user.active {
  background: #e3f2fd;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: #0084ff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 15px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.last-message {
  font-size: 0.9em;
  color: #666;
}
</style>