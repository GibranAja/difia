<template>
  <div class="navbar-wrapper" :class="{ 'navbar-hidden': shouldHideNav }">
    <nav :class="{ 'nav-scrolled': isScrolled, 'nav-expanded': isMobileMenuOpen }">
      <!-- Main navigation container -->
      <div class="nav-container">
        <!-- Left side - Navigation links with unique animation -->
        <div class="nav-links-container">
          <div class="nav-links-backdrop" :class="{ active: isMobileMenuOpen }"></div>
          <ul class="nav-links" :class="{ 'menu-active': isMobileMenuOpen }">
            <li v-for="(item, index) in navItems" :key="index" class="nav-item">
              <a
                @click.prevent="navigateTo(item.path, item.section)"
                :href="item.href"
                class="nav-link"
              >
                <span class="nav-link-text">{{ item.text }}</span>
                <span class="nav-link-indicator"></span>
              </a>
            </li>
            <li v-if="authStore.currentUser?.isAdmin" class="nav-item admin-item">
              <router-link to="/admin" class="nav-link admin-link">
                <i class="fas fa-chart-line admin-icon"></i>
                <span class="nav-link-text">Dashboard</span>
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Right side - user actions -->
        <div class="user-actions">
          <!-- Notification bell with animation -->
          <button class="action-button notification-button" @click="handleNotificationClick">
            <div class="button-content">
              <i class="fas fa-bell"></i>
              <div v-if="notificationStore.notificationCount > 0" class="notification-badge pulse">
                {{
                  notificationStore.notificationCount > 99
                    ? '99+'
                    : notificationStore.notificationCount
                }}
              </div>
            </div>
          </button>

          <!-- Shopping cart with animated indicator -->
          <button class="action-button cart-button" @click="navigateToCart">
            <div class="button-content">
              <i class="fas fa-shopping-bag"></i>
              <div v-if="cartItemCount > 0" class="cart-badge">
                {{ cartItemCount > 99 ? '99+' : cartItemCount }}
              </div>
            </div>
          </button>

          <!-- User account section -->
          <div class="user-section">
            <button v-if="!authStore.isLoggedIn" class="login-button" @click="navigateToLogin">
              <span class="login-text">Login</span>
              <i class="fas fa-arrow-right login-arrow"></i>
            </button>

            <div v-else class="user-profile">
              <div
                class="profile-container"
                @click="showProfileModal = true"
                :style="{ backgroundImage: `url(${userProfilePhoto})` }"
              >
                <div class="profile-accent"></div>
              </div>

              <button class="logout-button" @click="showLogoutModal = true">
                <i class="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>

          <!-- Mobile menu toggle -->
          <button class="menu-toggle" @click="toggleMobileMenu">
            <div class="menu-icon" :class="{ open: isMobileMenuOpen }">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </div>
    </nav>
  </div>

  <!-- Modals -->
  <ModalProfile v-if="showProfileModal" @close="showProfileModal = false" />

  <NegativeModal
    v-if="showLogoutModal"
    title="Konfirmasi Logout"
    message="Apakah Anda yakin ingin keluar?"
    :loading="isLoggingOut"
    @close="showLogoutModal = false"
    @confirm="handleLogout"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useAuthStore } from '../stores/AuthStore'
import { useCartStore } from '@/stores/CartStore'
import { useRouter, useRoute } from 'vue-router'
import ModalProfile from './ModalProfile.vue'
import NegativeModal from './NegativeModal.vue'
import defaultAvatarImage from '../assets/default-avatar-wm14gXiP.png'
import { useNotificationStore } from '@/stores/NotificationStore'

// Stores and routing
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const cartStore = useCartStore()
const notificationStore = useNotificationStore()

// Reactive state
const isScrolled = ref(false)
const shouldHideNav = ref(false)
const lastScrollPosition = ref(0)
const isMobileMenuOpen = ref(false)
const showProfileModal = ref(false)
const showLogoutModal = ref(false)
const isLoggingOut = ref(false)

// Navigation items
const navItems = [
  { text: 'Beranda', path: '/', section: 'home', href: '#home' },
  { text: 'Tentang Kami', path: '/', section: 'about', href: '#about' },
  { text: 'Katalog', path: '/', section: 'catalog', href: '#catalog' },
  { text: 'Artikel', path: '/', section: 'articel', href: '#articel' },
]

// Close mobile menu on route change
watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false
  },
)

// Computed properties
const userProfilePhoto = computed(() => {
  return authStore.currentUser?.profilePhoto || defaultAvatarImage
})

const cartItemCount = computed(() => {
  if (!authStore.isLoggedIn) return 0
  return cartStore.cartItems.length
})

// Event handlers
const handleScroll = () => {
  const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop

  // Update scroll state
  isScrolled.value = currentScrollPosition > 20

  // Navigation hide logic - don't hide when menu is open
  if (isMobileMenuOpen.value || currentScrollPosition < 100) {
    shouldHideNav.value = false
  } else {
    const isScrollingDown = currentScrollPosition > lastScrollPosition.value

    // Add hysteresis - only hide/show after passing threshold
    if (Math.abs(currentScrollPosition - lastScrollPosition.value) > 10) {
      shouldHideNav.value = isScrollingDown
    }
  }

  lastScrollPosition.value = currentScrollPosition
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value

  // Prevent body scroll when menu is open
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const navigateTo = async (path, section = null) => {
  // Close mobile menu
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''

  // Handle same-page navigation
  if (route.path === path && section) {
    const element = document.getElementById(section)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    return
  }

  // Handle different page navigation
  if (route.path !== path) {
    await router.push(path)
    await nextTick()

    if (section) {
      setTimeout(() => {
        const element = document.getElementById(section)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 150)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}

const navigateToLogin = () => {
  router.push('/login')
}

const navigateToCart = () => {
  router.push('/cart')
}

const handleNotificationClick = () => {
  notificationStore.resetCount()
  router.push('/notification')
}

const handleLogout = async () => {
  try {
    isLoggingOut.value = true
    await authStore.logoutUser(router)
    showLogoutModal.value = false
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    isLoggingOut.value = false
  }
}

// Close menu when clicking outside
const handleClickOutside = (event) => {
  if (isMobileMenuOpen.value) {
    const navElement = document.querySelector('nav')
    if (navElement && !navElement.contains(event.target)) {
      isMobileMenuOpen.value = false
      document.body.style.overflow = ''
    }
  }
}

// Lifecycle hooks
onMounted(() => {
  // Initialize scroll handler with throttle
  let ticking = false
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll()
        ticking = false
      })
      ticking = true
    }
  })

  // Initialize scroll state
  handleScroll()

  // Fetch data if user is logged in
  if (authStore.isLoggedIn) {
    cartStore.fetchCartItems()

    if (authStore.currentUser?.id) {
      const unsubscribe = notificationStore.trackStatusUpdates(authStore.currentUser.id)
      onUnmounted(() => unsubscribe && unsubscribe())
    }
  }

  // Add event listener for clicks outside
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* Base styles with white dominant theme */
.navbar-wrapper {
  position: fixed;
  top: 40px; /* Add this - adjust height based on your VoucherNotification height */
  left: 0;
  width: 100%;
  z-index: 100;
  transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.navbar-hidden {
  transform: translateY(-100%);
}

nav {
  background-color: #ffffff;
  height: 70px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.4s ease;
  position: relative;
}

.nav-scrolled {
  height: 60px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.nav-container {
  max-width: 1500px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Innovative navigation links */
.nav-links-container {
  position: relative;
  margin-right: 2rem;
}

.nav-links {
  display: flex;
  padding: 0;
  margin: 0;
  list-style: none;
  gap: 0.2rem;
  position: relative;
  z-index: 2;
}

.nav-item {
  position: relative;
}

.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 1.25rem;
  color: #222222;
  text-decoration: none;
  font-weight: 600;
  border-radius: 10px;
  position: relative;
  font-family: 'Montserrat', sans-serif;
  transition: color 0.3s ease;
}

.nav-link-text {
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease;
}

.nav-link:hover .nav-link-text {
  transform: translateY(-2px);
  color: #02163b;
}

.nav-link-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 3px;
  background-color: #e8ba38;
  transition:
    width 0.3s ease,
    left 0.3s ease;
  border-radius: 2px;
}

.nav-link:hover .nav-link-indicator {
  width: 40%;
  left: 30%;
}

.admin-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #02163b;
  background-color: rgba(232, 186, 56, 0.1);
  border-radius: 10px;
  padding: 0.5rem 1rem;
  margin-left: 0.5rem;
}

.admin-icon {
  color: #e8ba38;
  font-size: 0.9rem;
}

/* User actions section - right side */
.user-actions {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

/* Action buttons with unique design */
.action-button {
  position: relative;
  background: transparent;
  border: none;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.action-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(232, 186, 56, 0.1);
  border-radius: 50%;
  transform: scale(0);
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.action-button:hover::before {
  transform: scale(1);
}

.button-content {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.action-button i {
  color: #02163b;
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.action-button:hover i {
  transform: scale(1.1);
  color: #e8ba38;
}

/* Badges with pulse animation */
.notification-badge,
.cart-badge {
  position: absolute;
  top: -1px;
  right: -1px;
  background-color: #e8ba38;
  color: #02163b;
  border-radius: 10px;
  font-size: 0.55rem;
  font-weight: bold;
  padding: 1px 4px;
  min-width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #ffffff;
}

/* Pulse animation for notification badge */
.pulse {
  animation: pulse-animation 2s infinite;
}

@keyframes pulse-animation {
  0% {
    box-shadow: 0 0 0 0 rgba(232, 186, 56, 0.7);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(232, 186, 56, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(232, 186, 56, 0);
  }
}

/* User section with profile and login */
.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Redesigned login button */
.login-button {
  background: linear-gradient(135deg, #02163b, #02265e);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.6rem 1.3rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  position: relative;
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  box-shadow: 0 4px 12px rgba(2, 22, 59, 0.2);
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e8ba38, #f8d575);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(2, 22, 59, 0.3);
}

.login-button:hover::before {
  opacity: 1;
}

.login-text,
.login-arrow {
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease;
}

.login-button:hover .login-text {
  color: #02163b;
}

.login-button:hover .login-arrow {
  transform: translateX(4px);
  color: #02163b;
}

/* Profile section with accent */
.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.profile-container {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  background-size: cover;
  background-position: center;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  border: 2px solid #fff;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.profile-container:hover {
  transform: scale(1.1);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.profile-accent {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30%;
  background: linear-gradient(to top, rgba(232, 186, 56, 0.7), transparent);
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.profile-container:hover .profile-accent {
  transform: translateY(0);
}

.logout-button {
  background-color: transparent;
  border: 1px solid #e1e1e1;
  color: #555;
  width: 36px;
  height: 36px;
  border-radius: u;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border-radius: 50%;
}

.logout-button:hover {
  background-color: #f6f6f6;
  border-color: #e8ba38;
}

.logout-button i {
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.logout-button:hover i {
  color: #e8ba38;
}

/* Mobile menu toggle button */
.menu-toggle {
  display: none;
  background: transparent;
  border: none;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.menu-icon {
  width: 24px;
  height: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.menu-icon span {
  display: block;
  width: 100%;
  height: 2px;
  background-color: #02163b;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.menu-icon.open span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
  background-color: #e8ba38;
}

.menu-icon.open span:nth-child(2) {
  opacity: 0;
}

.menu-icon.open span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
  background-color: #e8ba38;
}

/* Responsive adaptations */
@media (max-width: 1024px) {
  .nav-link {
    padding: 0.5rem 1rem;
  }

  .nav-container {
    padding: 0 1rem;
  }
}

@media (max-width: 768px) {
  .menu-toggle {
    display: flex;
  }

  .nav-links-container {
    position: static;
    margin-right: 0;
  }

  .nav-links-backdrop {
    position: fixed;
    top: 60px;
    left: 0;
    width: 100%;
    height: 0;
    background-color: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    overflow: hidden;
    transition: height 0.4s cubic-bezier(0.19, 1, 0.22, 1);
    z-index: 1;
  }

  .nav-links-backdrop.active {
    height: calc(100vh - 60px);
  }

  .nav-links {
    position: fixed;
    top: 60px;
    left: 0;
    width: 100%;
    padding: 1.5rem 0;
    flex-direction: column;
    align-items: center;
    transform: translateY(-20px);
    opacity: 0;
    visibility: hidden;
    transition: all 0.4s ease;
    z-index: 2;
  }

  .nav-links.menu-active {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .nav-link {
    padding: 1rem 0;
    width: 80%;
    text-align: center;
    border-bottom: 1px solid #f0f0f0;
  }

  .nav-link-indicator {
    display: none;
  }

  .admin-link {
    margin: 1rem 0 0 0;
    justify-content: center;
    width: 80%;
  }

  .user-actions {
    justify-content: flex-end;
    flex-grow: 1;
  }

  .login-button {
    padding: 0.5rem 1rem;
  }

  .login-text {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 0.8rem;
  }

  .action-button {
    width: 36px;
    height: 36px;
  }

  .user-actions {
    gap: 0.8rem;
  }

  .login-button {
    padding: 0.5rem 0.8rem;
  }

  .profile-container {
    width: 36px;
    height: 36px;
  }

  .logout-button {
    width: 32px;
    height: 32px;
  }
}

/* Unique animation for mobile menu transition */
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav-links.menu-active .nav-item {
  animation: fadeSlideIn 0.4s forwards;
}

.nav-links.menu-active .nav-item:nth-child(1) {
  animation-delay: 0.1s;
}
.nav-links.menu-active .nav-item:nth-child(2) {
  animation-delay: 0.2s;
}
.nav-links.menu-active .nav-item:nth-child(3) {
  animation-delay: 0.3s;
}
.nav-links.menu-active .nav-item:nth-child(4) {
  animation-delay: 0.4s;
}
.nav-links.menu-active .nav-item:nth-child(5) {
  animation-delay: 0.5s;
}
</style>
