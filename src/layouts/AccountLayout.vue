<template>
  <!-- Add NavigationBar at the top -->
  <NavigationBar />

  <div class="account-layout">
    <div class="account-container">
      <div class="account-sidebar">
        <div class="sidebar-header">
          <div class="user-avatar" :style="{ backgroundImage: `url(${userProfilePhoto})` }">
            <div class="avatar-overlay"></div>
          </div>
          <h3 class="user-name">{{ authStore.currentUser?.name }}</h3>
          <p class="user-email">{{ authStore.currentUser?.email }}</p>
        </div>
        <div class="sidebar-divider"></div>
        <nav class="sidebar-nav">
          <router-link
            to="/my-account/orders"
            class="nav-item"
            :class="{ active: $route.path.includes('/orders') }"
          >
            <i class="fas fa-shopping-bag"></i>
            <span>Pesanan</span>
          </router-link>
          <router-link
            to="/my-account/profile"
            class="nav-item"
            :class="{ active: $route.path.includes('/profile') }"
          >
            <i class="fas fa-user"></i>
            <span>Profil</span>
          </router-link>
          <router-link
            to="/my-account/address"
            class="nav-item"
            :class="{ active: $route.path.includes('/address') }"
          >
            <i class="fas fa-map-marker-alt"></i>
            <span>Alamat</span>
          </router-link>
        </nav>
      </div>
      <div class="account-content">
        <router-view></router-view>
      </div>
    </div>
  </div>

  <!-- Add FooterComponent at the bottom -->
  <FooterComponent />
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/AuthStore'
import defaultAvatarImage from '@/assets/default-avatar-wm14gXiP.png'
import NavigationBar from '@/components/NavigationBar.vue'
import FooterComponent from '@/components/FooterComponent.vue'

const authStore = useAuthStore()

const userProfilePhoto = computed(() => {
  return authStore.currentUser?.profilePhoto || defaultAvatarImage
})
</script>

<style scoped>
.account-layout {
  background-color: #f8f9fa;
  min-height: calc(100vh - 110px);
  padding: 2rem 0;
  margin-top: 70px; /* Already accounts for navbar height */
}

.account-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 2rem;
  padding: 0 1rem;
}

.account-sidebar {
  width: 280px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  padding-bottom: 1rem;
  height: fit-content;
}

.sidebar-header {
  background: linear-gradient(135deg, #02163b, #02265e);
  padding: 2rem 1.5rem;
  color: white;
  text-align: center;
  position: relative;
}

.user-avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  margin: 0 auto 1rem;
  background-size: cover;
  background-position: center;
  border: 4px solid rgba(255, 255, 255, 0.2);
  position: relative;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
  border-radius: 50%;
  opacity: 0.4;
}

.user-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.user-email {
  font-size: 0.9rem;
  margin: 0.5rem 0 0;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-divider {
  height: 1px;
  background-color: #eee;
  margin: 0;
}

.sidebar-nav {
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.8rem 1.5rem;
  color: #444;
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-item:hover {
  background-color: #f5f5f5;
  color: #02163b;
}

.nav-item.active {
  background-color: rgba(232, 186, 56, 0.1);
  color: #02163b;
  border-left: 4px solid #e8ba38;
}

.nav-item i {
  margin-right: 12px;
  width: 20px;
  text-align: center;
}

.account-content {
  flex: 1;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  min-height: 500px;
}

@media (max-width: 768px) {
  .account-container {
    flex-direction: column;
  }

  .account-sidebar {
    width: 100%;
  }
}
</style>
