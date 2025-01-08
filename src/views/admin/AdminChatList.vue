<!-- views/admin/ChatList.vue -->
<template>
    <div class="chat-wrapper">
      <h2 class="chat-title">Messages</h2>
      <div class="chat-list-container" v-if="chatGroups.length > 0">
        <router-link 
          v-for="chat in chatGroups" 
          :key="chat.userId"
          :to="`/admin/chat/${chat.userId}`"
          class="chat-item"
        >
          <div class="chat-avatar">
            <img :src="chat.userPhoto || defaultAvatar" alt="User avatar" />
          </div>
          <div class="chat-preview">
            <div class="chat-header">
              <h3 class="chat-name">{{ chat.userName }}</h3>
              <span class="chat-time">{{ formatTime(chat.lastMessage?.timestamp) }}</span>
            </div>
            <p class="chat-last-message">{{ chat.lastMessage?.content }}</p>
          </div>
        </router-link>
      </div>
      <div v-else class="no-chats">
        <p>No messages yet</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed, onMounted, onUnmounted } from 'vue'
  import { useChatStore } from '@/stores/ChatStore'
  import { useAuthStore } from '@/stores/AuthStore'
  import { storeToRefs } from 'pinia'
  import defaultAvatar from '@/assets/default-avatar-wm14gXiP.png'
  
  const chatStore = useChatStore()
  const authStore = useAuthStore()
  const { messages } = storeToRefs(chatStore)
  const { currentUser } = storeToRefs(authStore)
  
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
  
  const chatGroups = computed(() => {
    const groups = messages.value.reduce((acc, message) => {
      const userId = message.senderId
      if (!acc[userId]) {
        acc[userId] = {
          userId,
          userName: message.senderName,
          userPhoto: message.senderPhoto,
          messages: [],
          lastMessage: null
        }
      }
      acc[userId].messages.push(message)
      if (!acc[userId].lastMessage || message.timestamp > acc[userId].lastMessage.timestamp) {
        acc[userId].lastMessage = message
      }
      return acc
    }, {})
  
    return Object.values(groups).sort((a, b) => 
      b.lastMessage?.timestamp - a.lastMessage?.timestamp
    )
  })
  
  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit'
      })
    }
    
    return date.toLocaleDateString()
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
  
  .chat-list-container {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  
  .chat-item {
    display: flex;
    padding: 16px;
    gap: 16px;
    border-bottom: 1px solid #eee;
    text-decoration: none;
    color: inherit;
    transition: background-color 0.2s;
  }
  
  .chat-item:hover {
    background-color: #f8f9fa;
  }
  
  .chat-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
  }
  
  .chat-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .chat-preview {
    flex: 1;
    min-width: 0;
  }
  
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }
  
  .chat-name {
    font-size: 1rem;
    font-weight: 500;
    margin: 0;
    color: #333;
  }
  
  .chat-time {
    font-size: 0.75rem;
    color: #999;
  }
  
  .chat-last-message {
    color: #666;
    font-size: 0.9rem;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .no-chats {
    text-align: center;
    padding: 3rem;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    color: #666;
  }
  </style>