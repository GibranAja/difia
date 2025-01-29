<template>
  <div id="app">
    <RouterView />
    <button 
      v-if="shouldShowChatButton"
      @click="navigateToChat" 
      class="floating-chat-btn"
      :title="isLoggedIn ? 'Chat dengan Admin' : 'Login untuk chat'"
    >
      <i class="fas fa-comments"></i>
    </button>
  </div>
</template>

<script setup>
import { RouterView, useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';
import { useAuthStore } from '@/stores/AuthStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isLoggedIn = computed(() => authStore.isLoggedIn);

// Hide chat button in specific pages
const shouldShowChatButton = computed(() => {
  const hiddenPaths = [
    '/login',
    '/register',
    '/reset-password',
    '/verify-code',
    '/forgot-password',
    '/admin',
    '/chat-customer'
  ];

  // Check if current path starts with any of the hidden paths
  return !hiddenPaths.some(path => route.path.startsWith(path));
});

const navigateToChat = () => {
  if (!isLoggedIn.value) {
    router.push('/login');
    return;
  }
  router.push('/chat-customer');
};
</script>

<style>
  body {
    margin: 0;
    padding: 0;
    font-family: 'Poppins', sans-serif;
    overflow-x: hidden;
    background-color: white ;
  }
  html {
    scroll-behavior: smooth;
  }
  html::-webkit-scrollbar {
    display: none;
  }

  /* Floating Chat Button Styles */
  .floating-chat-btn {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #02163b;
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    z-index: 1000;
  }

  .floating-chat-btn:hover {
    background-color: #e8ba38;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  .floating-chat-btn i {
    font-size: 24px;
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .floating-chat-btn {
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
    }

    .floating-chat-btn i {
      font-size: 20px;
    }
  }
</style>
