<!-- layouts/AdminLayout.vue -->

<template>
    <div class="admin-layout">
      <!-- Sidebar with overlay for mobile -->
      <div v-if="isSidebarOpen && isMobile" class="sidebar-overlay" @click="toggleSidebar"></div>
  
      <SidebarAdmin
        :is-open="isSidebarOpen"
        class="sidebar-transition" />
  
      <div class="main-content" :class="{ 'sidebar-open': isSidebarOpen }">
        <!-- Navbar -->
        <nav class="admin-navbar">
          <div class="navbar-left">
            <h1 class="dashboard-title">DASHBOARD</h1>
          </div>
  
          <div class="navbar-right">
            <!-- Search Bar -->
            <div class="search-container">
              <input 
                type="text" 
                placeholder="Search..." 
                class="search-input"
              />
              <button class="search-btn">
                <i class="fas fa-search"></i>
              </button>
            </div>
  
            <!-- Notification and Profile -->
            <div class="nav-actions">
              <button class="icon-btn notification-btn">
                <i class="fas fa-bell"></i>
              </button>
              <button class="icon-btn profile-btn">
                <i class="fas fa-user"></i>
              </button>
            </div>
          </div>
        </nav>
  
        <!-- Main Content Area -->
        <main class="content-area">
          <RouterView />
        </main>
      </div>
    </div>
  </template>
  
  <script setup>
  // Script remains the same
  import { ref, onMounted, onUnmounted } from 'vue'
  import { RouterView } from 'vue-router'
  import SidebarAdmin from '../components/admin/SidebarAdmin.vue'
  
  const isSidebarOpen = ref(true)
  const isMobile = ref(false)
  
  const checkMobile = () => {
    isMobile.value = window.innerWidth <= 768
    if (isMobile.value) {
      isSidebarOpen.value = false
    }
  }
  
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
  }
  
  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })
  </script>
  
  <style scoped>
  .admin-layout {
    font-family: 'Judson', serif;
    display: flex;
    min-height: 100vh;
    position: relative;
    background-color: #f8f9fa;
  }
  
  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 15;
  }
  
  .main-content {
    flex: 1;
    margin-left: 272px;
    transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    width: calc(100% - 280px);
    display: flex;
    flex-direction: column;
    min-height: 1vh;
  }
  
  .main-content:not(.sidebar-open) {
    margin-left: 80px;
    width: calc(100% - 80px);
  }
  
  .admin-navbar {
    font-family: 'Judson', serif;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 64px;
    background-color: rgb(188, 173, 163);
    padding: 0 1.5rem;
    position: sticky;
    top: 0;
    z-index: 10;
    margin: 0;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .navbar-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .dashboard-title {
    color: white;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }
  
  .navbar-right {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }
  
  .search-container {
    display: flex;
    align-items: center;
    background: white;
    border-radius: 20px;
    padding: 0 0.5rem;
    width: 300px;
  }
  
  .search-input {
    border: none;
    background: none;
    padding: 0.5rem 1rem;
    width: 100%;
    outline: none;
    font-family: inherit;
  }
  
  .search-btn {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    color: #666;
  }
  
  .nav-actions {
    display: flex;
    gap: 1rem;
  }
  
  .icon-btn {
    background: rgba(0, 0, 0, 0.2);
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    transition: all 0.3s ease;
  }
  
  .icon-btn:hover {
    background: rgba(0, 0, 0, 0.3);
  }
  
  .toggle-btn {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    transition: all 0.3s ease;
    color: white;
  }
  
  .content-area {
    flex: 1;
    padding: 1.5rem;
    background-color: #f8f9fa;
    overflow-x: auto;
  }
  
  @media (max-width: 768px) {
    .main-content {
      margin-left: 0 !important;
      width: 100%;
    }
  
    .sidebar-transition {
      position: fixed;
      left: -280px;
      transition: left 0.3s ease;
    }
  
    .sidebar-transition:not(.sidebar-collapsed) {
      left: 0;
    }
  
    .search-container {
      width: 200px;
    }
  
    .dashboard-title {
      display: none;
    }
  }
  </style>