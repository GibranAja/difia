<template>
    <div>
        <h1>Ini Home Public</h1>
    </div>
    <NavigationBar :showLogout="isLoggedIn" @logout="handleLogout"></NavigationBar>
    <button 
        v-if="isLoggedIn" 
        @click="handleLogout" 
        class="logout-btn"
    >
        <i class="fas fa-sign-out-alt"></i>
    </button>
</template>

<script setup>
import NavigationBar from '@/components/NavigationBar.vue';
import { useAuthStore } from '@/stores/AuthStore';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const isLoggedIn = computed(() => authStore.isLoggedIn);

const handleLogout = async () => {
  try {
    await authStore.logoutUser(router);
  } catch (error) {
    console.error('Logout error:', error);
  }
};
</script>

<style scoped>
.logout-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    color: #333;
    transition: color 0.3s ease;
}

.logout-btn:hover {
    color: #f44336;
}

.logout-btn i {
    font-size: 1.2rem;
}
</style>