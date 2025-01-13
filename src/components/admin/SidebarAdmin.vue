<!-- components/admin/SidebarAdmin.vue -->

<template>
    <aside class="sidebar" :class="{ collapsed: !isOpen }">
      <!-- Logo Section -->
      <div class="logo">
        <div class="logo-content">
          <img src="../../assets/difia.jpg" alt="DIFIA" class="logo-image" />
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
  { text: 'Chat', icon: 'fas fa-comments', pathName: 'ChatList' },
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
  width: 250px;
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

/* Mengatur logo saat collapsed */
.sidebar.collapsed .logo-content {
  justify-content: center;
  gap: 0;
}

.sidebar.collapsed .logo {
  padding: 24px 16px;
}

/* Mengatur admin label saat collapsed */
.admin-label {
  font-family: 'Judson', serif;
  background-color: rgb(139, 116, 99);
  color: white;
  padding: 8px 30px;
  border-radius: 20px;
  margin: 0 auto 20px;
  transition: all 0.3s ease;
  font-size: 18px;
  white-space: nowrap;
}

.sidebar.collapsed .admin-label {
  padding: 8px;
  width: 40px;
  display: flex;
  justify-content: center;
  overflow: hidden;
}

/* Mengatur nav items saat collapsed */
.nav-links {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px;
  margin-bottom: 80px;
}

.sidebar.collapsed .nav-links {
  padding: 0 8px;
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
  position: relative;
}

.sidebar.collapsed .nav-item {
  padding: 12px;
  justify-content: center;
  width: 48px;
  margin: 0 auto;
}

.nav-item i {
  min-width: 24px;
  text-align: center;
  font-size: 1.1em;
}

.sidebar.collapsed .nav-item i {
  margin: 0;
  min-width: unset;
}

/* Mengatur active state saat collapsed */
.nav-item.active {
  background-color: rgba(0, 0, 0, 0.15);
  color: #2c3e50;
  border-radius: 60px;
  border: 1px solid #ffffff;
  font-weight: 500;
}

.sidebar.collapsed .nav-item.active {
  border-radius: 50%;
  width: 48px;
  height: 48px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Mengatur logout button saat collapsed */
.logout-btn {
  color: #f44336;
  cursor: pointer;
  margin-top: auto;
}

.sidebar.collapsed .logout-btn {
  padding: 12px;
  width: 48px;
  height: 48px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

/* Menyembunyikan teks saat collapsed */
.hide-text {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  position: absolute;
  left: 100%;
}

/* Hover tooltips untuk collapsed state */
.sidebar.collapsed .nav-item:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  white-space: nowrap;
  margin-left: 10px;
  z-index: 1000;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 280px !important;
  }

  .hide-text {
    opacity: 1 !important;
    visibility: visible !important;
    position: static;
  }

  .sidebar.collapsed {
    width: 0 !important;
    visibility: hidden;
  }

  .sidebar.collapsed .nav-item,
  .sidebar.collapsed .logout-btn {
    width: auto;
  }
}

/* Modal Styles */
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
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-family: 'Judson', serif;
}

.modal-content p {
  color: #666;
  margin-bottom: 1.5rem;
  font-family: 'Judson', serif;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.modal-actions button {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Judson', serif;
}

.cancel-btn {
  background-color: #e0e0e0;
  color: #666;
}

.confirm-btn {
  background-color: #f44336;
  color: white;
}

.cancel-btn:hover {
  background-color: #d5d5d5;
}

.confirm-btn:hover {
  background-color: #d32f2f;
}

/* Optional: Add animation */
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content {
  animation: modalFadeIn 0.3s ease;
}
</style>