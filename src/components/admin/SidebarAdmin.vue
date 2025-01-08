<template>
    <aside class="sidebar" :class="{ collapsed: !isOpen }">
      <!-- Logo Section -->
      <div class="logo">
        <div class="logo-content">
          <img src="@/assets/default-avatar-wm14gXiP.png" alt="DIFIA" class="logo-image" />
          <h2 :class="{ 'hide-text': !isOpen }">DIFIA</h2>
        </div>
      </div>
  
      <!-- Admin Label -->
      <div class="admin-label" :class="{ 'collapsed-label': !isOpen }">
        <span :class="{ 'hide-text': !isOpen }">ADMIN</span>
      </div>
  
      <!-- Navigation Items using ListSidebar -->
      <nav class="nav-links">
        <router-link
          v-for="item in items"
          :key="item.pathName"
          :to="{ name: item.pathName }"
          class="nav-item"
          :class="{ 
            'collapsed-item': !isOpen,
            'active': $route.name === item.pathName 
          }"
        >
          <i :class="item.icon"></i>
          <span :class="{ 'hide-text': !isOpen }">{{ item.text }}</span>
        </router-link>

        <!-- Add Logout Button -->
        <div 
          class="nav-item logout-btn" 
          :class="{ 'collapsed-item': !isOpen }"
          @click="showLogoutModal = true"
        >
          <i class="fas fa-sign-out-alt"></i>
          <span :class="{ 'hide-text': !isOpen }">Logout</span>
        </div>
      </nav>
  
      <!-- Logout Confirmation Modal -->
      <div v-if="showLogoutModal" class="modal-overlay">
        <div class="modal-content">
          <h3>Konfirmasi Logout</h3>
          <p>Apakah Anda yakin ingin keluar?</p>
          <div class="modal-actions">
            <button @click="showLogoutModal = false" class="cancel-btn">Tidak</button>
            <button @click="handleLogout" class="confirm-btn">Ya</button>
          </div>
        </div>
      </div>
    </aside>
  </template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'

defineProps({
  isOpen: {
    type: Boolean,
    default: true,
  },
  currentUser: {
    type: Object,
    default: () => ({ name: 'Admin User' }),
  },
})

const showLogoutModal = ref(false)
const router = useRouter()
const authStore = useAuthStore()

const items = ref([
  { text: 'Home', icon: 'fas fa-home', pathName: 'DashboardView' },
  { text: 'Katalog', icon: 'fas fa-th', pathName: 'KatalogView' },
  { text: 'Blog', icon: 'fas fa-newspaper', pathName: 'BlogView' },
  { text: 'Pesanan', icon: 'fas fa-shopping-cart', pathName: 'OrderView' },
  { text: 'Chat', icon: 'fas fa-comments', pathName: 'ChatView' },
  { text: 'Home', icon: 'fas fa-home', pathName: 'HomeView' },
])

const handleLogout = async () => {
  try {
    await authStore.logoutUser(router)
    showLogoutModal.value = false
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

<style scoped>
.sidebar {
  font-family: 'Judson', serif;
  width: 280px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background-color: rgb(188, 173, 163);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-x: hidden;
  z-index: 20;
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed {
  width: 80px;
}

.logo {
  padding: 24px;
  display: flex;
  justify-content: center;
}

.logo-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-image {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: white;
  padding: 5px;
}

.logo h2 {
  font-family: 'Judson', serif;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 700;
  white-space: nowrap;
  transition: opacity 0.3s ease;
}

.admin-label {
  font-family: 'Judson', serif;
  background-color: rgb(139, 116, 99);
  color: white;
  padding: 8px 30px;
  border-radius: 20px;
  margin: 0 auto 20px;
  transition: all 0.3s ease;
  font-size: 18px;
}

.admin-label.collapsed-label {
  padding: 8px 15px;
  margin: 0 auto 20px;
}

.nav-links {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px;
  margin-bottom: 80px; /* Space for profile */
}

.nav-item {
  font-family: 'Judson', serif;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 20px;
  color: #2c3e50;
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.3s ease;
  font-size: 17px;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
}

.nav-item.active {
  background-color: rgba(0, 0, 0, 0.15);
  color: #2c3e50;
  border-radius: 60px;
  border: 1px solid #ffffff;
  font-weight: 500;
}

.nav-item i {
  min-width: 24px;
  text-align: center;
  font-size: 1.1em;
}

.nav-item.collapsed-item {
  padding: 12px;
  justify-content: center;
}

.user-profile {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
}

.profile-content {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-icon {
  min-width: 40px;
  height: 40px;
  background-color: rgb(139, 116, 99);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-icon i {
  color: white;
}

.profile-info {
  transition: opacity 0.3s ease;
}

.profile-info h4 {
  font-family: 'Judson', serif;
  color: #2c3e50;
  font-size: 17px;
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
}

.profile-info p {
  font-family: 'Judson', serif;
  color: #666;
  font-size: 15px;
  margin: 4px 0 0 0;
  white-space: nowrap;
}

.hide-text {
  opacity: 0;
  visibility: hidden;
}

@media (max-width: 768px) {
  .sidebar {
    width: 280px !important;
  }

  .hide-text {
    opacity: 1 !important;
    visibility: visible !important;
  }

  .sidebar.collapsed {
    width: 0 !important;
    visibility: hidden;
  }
}

.logout-btn {
  color: #f44336;
  cursor: pointer;
  margin-top: auto;
}

.logout-btn:hover {
  background-color: rgba(244, 67, 54, 0.1);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  text-align: center;
}

.modal-content h3 {
  margin: 0 0 16px 0;
  color: #333;
}

.modal-content p {
  margin-bottom: 24px;
  color: #666;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.modal-actions button {
  padding: 8px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-btn {
  background-color: #e0e0e0;
  color: #333;
}

.confirm-btn {
  background-color: #f44336;
  color: white;
}

.cancel-btn:hover {
  background-color: #d5d5d5;
}

.confirm-btn:hover {
  background-color: #e53935;
}
</style>
