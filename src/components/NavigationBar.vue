<template>
  <div
    class="navbar-wrapper"
    :class="{
      'navbar-hidden': shouldHideNav,
      'no-voucher-offset': !hasActiveVouchers,
    }"
  >
    <nav :class="{ 'nav-scrolled': isScrolled, 'nav-expanded': isMobileMenuOpen }">
      <!-- Main navigation container -->
      <div class="nav-container">
        <!-- Left side - Logo -->
        <div class="nav-logo">
          <img src="../assets/Logo_Difia_Haki.png" alt="Difia Logo" class="logo-image" />
        </div>

        <!-- Center - Navigation links with improved interaction -->
        <div class="nav-links-container">
          <div class="nav-links-backdrop" :class="{ active: isMobileMenuOpen }"></div>
          <ul class="nav-links" :class="{ 'menu-active': isMobileMenuOpen }">
            <li v-for="(item, index) in navItems" :key="index" class="nav-item">
              <a
                @click.prevent="navigateTo(item.path, item.section)"
                :href="item.href"
                class="nav-link"
                :class="{ active: isActiveLink(item.section) }"
              >
                <span class="nav-link-text">{{ item.text }}</span>
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

        <!-- Right side - user actions with improved accessibility -->
        <div class="user-actions">
          <!-- Notification bell with improved animation -->
          <button
            v-if="authStore.isLoggedIn"
            class="action-button notification-button"
            @click="handleNotificationClick"
            aria-label="Notifications"
          >
            <div class="button-content">
              <i class="fas fa-history"></i>
              <div v-if="notificationStore.notificationCount > 0" class="notification-badge pulse">
                {{
                  notificationStore.notificationCount > 99
                    ? '99+'
                    : notificationStore.notificationCount
                }}
              </div>
            </div>
          </button>

          <!-- Shopping cart with improved visual feedback -->
          <button
            class="action-button cart-button"
            @click="navigateToCart"
            aria-label="Shopping Cart"
          >
            <div class="button-content">
              <i class="fas fa-shopping-cart"></i>
              <div v-if="cartItemCount > 0" class="cart-badge">
                {{ cartItemCount > 99 ? '99+' : cartItemCount }}
              </div>
            </div>
          </button>

          <!-- User account section with dropdown menu -->
          <div class="user-section">
            <button v-if="!authStore.isLoggedIn" class="login-button" @click="navigateToLogin">
              <span class="login-text">Login</span>
              <i class="fas fa-arrow-right login-arrow"></i>
            </button>

            <div v-else class="user-profile">
              <div
                class="profile-container"
                @click="toggleProfileDropdown"
                :style="{ backgroundImage: `url(${userProfilePhoto})` }"
                aria-label="User Profile"
                role="button"
              >
                <div class="profile-accent"></div>
              </div>

              <!-- Profile Dropdown Menu -->
              <div v-if="showProfileDropdown" class="profile-dropdown">
                <div class="dropdown-user-info">
                  <div
                    class="dropdown-avatar"
                    :style="{ backgroundImage: `url(${userProfilePhoto})` }"
                  ></div>
                  <div class="dropdown-user-details">
                    <p class="dropdown-username">{{ authStore.currentUser?.name }}</p>
                    <p class="dropdown-email">{{ authStore.currentUser?.email }}</p>
                  </div>
                </div>
                <div class="dropdown-divider"></div>
                <ul class="dropdown-menu">
                  <li @click="navigateToAccount('orders')">
                    <i class="fas fa-shopping-bag"></i> Pesanan
                    <i class="fas fa-chevron-right menu-arrow"></i>
                  </li>
                  <li @click="navigateToAccount('profile')">
                    <i class="fas fa-user"></i> Profil
                    <i class="fas fa-chevron-right menu-arrow"></i>
                  </li>
                  <li @click="navigateToAccount('address')">
                    <i class="fas fa-map-marker-alt"></i> Alamat
                    <i class="fas fa-chevron-right menu-arrow"></i>
                  </li>
                  <li @click="showLogoutModal = true">
                    <i class="fas fa-sign-out-alt"></i> Keluar Akun
                    <i class="fas fa-chevron-right menu-arrow"></i>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Mobile menu toggle with improved animations -->
          <button class="menu-toggle" @click="toggleMobileMenu" aria-label="Toggle Menu">
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
import { useVoucherStore } from '@/stores/VoucherStore'

// Stores and routing
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const cartStore = useCartStore()
const notificationStore = useNotificationStore()
const voucherStore = useVoucherStore()

// Reactive state
const isScrolled = ref(false)
const shouldHideNav = ref(false)
const lastScrollPosition = ref(0)
const isMobileMenuOpen = ref(false)
const showProfileModal = ref(false)
const showLogoutModal = ref(false)
const isLoggingOut = ref(false)
const activeSection = ref('home')
const showProfileDropdown = ref(false)

// Navigation items
const navItems = [
  { text: 'Beranda', path: '/', section: 'home', href: '#home' },
  { text: 'Tentang Kami', path: '/', section: 'about', href: '#about' },
  { text: 'Katalog', path: '/', section: 'catalog', href: '#catalog' },
  { text: 'Artikel', path: '/', section: 'articel', href: '#articel' },
]

// Check if a link is active - New function
const isActiveLink = (section) => {
  return activeSection.value === section
}

// Update active section based on scroll position - New function
const updateActiveSection = () => {
  const sections = navItems.map((item) => item.section)

  for (const section of sections) {
    const element = document.getElementById(section)
    if (element) {
      const rect = element.getBoundingClientRect()
      // If the section is in view (with some buffer for better UX)
      if (rect.top <= 200 && rect.bottom >= 200) {
        activeSection.value = section
        break
      }
    }
  }
}

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

const hasActiveVouchers = computed(() => {
  const now = new Date()
  const activeVouchers = voucherStore.voucherItems.filter((voucher) => {
    const isNotExpired = new Date(voucher.validUntil) > now
    const hasRemainingUses = voucher.currentUses < voucher.maxUses
    return voucher.isActive && isNotExpired && hasRemainingUses
  })

  return activeVouchers.length > 0
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

    // Only hide/show after passing threshold
    if (Math.abs(currentScrollPosition - lastScrollPosition.value) > 10) {
      shouldHideNav.value = isScrollingDown
    }
  }

  lastScrollPosition.value = currentScrollPosition

  // Update active section for menu highlighting
  updateActiveSection()
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
      activeSection.value = section
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
          activeSection.value = section
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

const toggleProfileDropdown = () => {
  showProfileDropdown.value = !showProfileDropdown.value
}

const navigateToAccount = (section) => {
  router.push(`/my-account/${section}`)
  showProfileDropdown.value = false
}

// Update existing methods
// const goToOrders = () => {
//   navigateToAccount('orders')
// }

// const openProfileModal = () => {
//   navigateToAccount('profile')
// }

// Close menu when clicking outside
const handleClickOutside = (event) => {
  if (isMobileMenuOpen.value) {
    const navElement = document.querySelector('nav')
    if (navElement && !navElement.contains(event.target)) {
      isMobileMenuOpen.value = false
      document.body.style.overflow = ''
    }
  }

  if (showProfileDropdown.value) {
    const profileDropdown = document.querySelector('.user-profile')
    if (profileDropdown && !profileDropdown.contains(event.target)) {
      showProfileDropdown.value = false
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

  // Fetch vouchers
  voucherStore.fetchVouchers()

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
/* Base styles with improved aesthetics */
.navbar-wrapper {
  position: fixed;
  top: 40px;
  left: 0;
  width: 100%;
  z-index: 100;
  transition:
    transform 0.4s cubic-bezier(0.215, 0.61, 0.355, 1),
    top 0.3s ease;
}

.no-voucher-offset {
  top: 0;
}

.navbar-hidden {
  transform: translateY(-100%);
}

nav {
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  height: 70px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s ease;
  position: relative;
}

.nav-scrolled {
  height: 60px;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.12);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Logo styles with consistent dimensions */
.nav-logo {
  display: flex;
  align-items: center;
}

.logo-image {
  height: 120px;
  width: 200px;
  border-radius: 0;
  transition: transform 0.3s ease;
  object-fit: contain;
}

/* Keep the same dimensions when scrolled */
.nav-scrolled .logo-image {
  height: 120px;
  width: 200px;
}

.logo-image:hover {
  transform: scale(1.05);
}

/* Ensure consistent dimensions on mobile devices */
@media (max-width: 768px) {
  .logo-image {
    height: 120px;
    width: 200px;
  }
}

@media (max-width: 480px) {
  .logo-image {
    height: 120px;
    width: 200px;
  }
}

/* Improved navigation links - CENTERED */
.nav-links-container {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.nav-links {
  display: flex;
  padding: 0;
  margin: 0;
  list-style: none;
  gap: 0.5rem;
  position: relative;
  z-index: 2;
}

.nav-item {
  position: relative;
}

.nav-link {
  position: relative;
  padding: 0.7rem 1.25rem;
  color: #333;
  text-decoration: none;
  font-weight: 500;
  border-radius: 12px;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
  overflow: hidden;
}

.nav-link:before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background-color: #e8ba38;
  transition: width 0.3s ease;
  border-radius: 3px;
}

.nav-link:hover:before,
.nav-link.active:before {
  width: 60%;
}

.nav-link-text {
  position: relative;
  z-index: 2;
  transition:
    transform 0.3s ease,
    color 0.3s ease;
}

.nav-link:hover .nav-link-text,
.nav-link.active .nav-link-text {
  transform: translateY(-2px);
  color: #02163b;
  font-weight: 600;
}

.nav-link:after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(232, 186, 56, 0.08);
  border-radius: 12px;
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform 0.3s ease;
  z-index: 1;
}

.nav-link:hover:after,
.nav-link.active:after {
  transform: scaleY(1);
}

.admin-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #02163b;
  background-color: rgba(232, 186, 56, 0.12);
  border-radius: 12px;
  padding: 0.7rem 1.25rem;
  margin-left: 0.5rem;
  transition: all 0.3s ease;
}

.admin-link:hover {
  background-color: rgba(232, 186, 56, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(232, 186, 56, 0.15);
}

.admin-icon {
  color: #e8ba38;
  font-size: 0.9rem;
}

/* User actions section with improved interactions */
.user-actions {
  display: flex;
  align-items: center;
  gap: 1.4rem;
}

/* Action buttons with enhanced feedback */
.action-button {
  position: relative;
  background: transparent;
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 12px;
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
  background-color: rgba(232, 186, 56, 0.12);
  border-radius: 12px;
  transform: scale(0);
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.action-button:hover::before {
  transform: scale(1);
}

.action-button:active::before {
  background-color: rgba(232, 186, 56, 0.25);
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
  transition:
    transform 0.3s ease,
    color 0.3s ease;
}

.action-button:hover i {
  transform: scale(1.1);
  color: #e8ba38;
}

/* Enhanced badges */
.notification-badge,
.cart-badge {
  position: absolute;
  top: 5px;
  right: 1px;
  background-color: #e8ba38;
  color: #02163b;
  border-radius: 12px;
  font-size: 0.6rem;
  font-weight: bold;
  padding: 1px 5px;
  min-width: 6px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  border: 2px solid #ffffff;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;
}

.action-button:hover .notification-badge,
.action-button:hover .cart-badge {
  transform: scale(1.1);
  background-color: #f3c847;
}

/* Improved pulse animation */
.pulse {
  animation: pulse-animation 2s infinite;
}

@keyframes pulse-animation {
  0% {
    box-shadow: 0 0 0 0 rgba(232, 186, 56, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(232, 186, 56, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(232, 186, 56, 0);
  }
}

/* Reimagined login button */
.login-button {
  background: linear-gradient(135deg, #02163b, #02265e);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.7rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(2, 22, 59, 0.2);
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
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(2, 22, 59, 0.25);
}

.login-button:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(2, 22, 59, 0.2);
}

.login-button:hover::before {
  opacity: 1;
}

.login-text,
.login-arrow {
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.login-button:hover .login-text {
  color: #02163b;
  transform: translateX(-3px);
}

.login-button:hover .login-arrow {
  transform: translateX(5px);
  color: #02163b;
}

/* Enhanced profile section */
.user-profile {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.profile-container {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  background-size: cover;
  background-position: center;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  border: 2px solid #fff;
  transition: all 0.3s ease;
}

.profile-container:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border-color: #e8ba38;
}

.profile-accent {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(232, 186, 56, 0.7), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.profile-container:hover .profile-accent {
  opacity: 0.7;
}

.logout-button {
  background-color: transparent;
  border: 1px solid #e1e1e1;
  color: #555;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background-color: #f6f6f6;
  border-color: #e8ba38;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.logout-button i {
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.logout-button:hover i {
  color: #e8ba38;
  transform: scale(1.1);
}

/* Profile dropdown styles */
.profile-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 280px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.15);
  z-index: 100;
  overflow: hidden;
  animation: fadeIn 0.2s ease-out;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.dropdown-user-info {
  display: flex;
  align-items: center;
  padding: 15px;
  gap: 12px;
}

.dropdown-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  border: 2px solid #e8ba38;
}

.dropdown-user-details {
  overflow: hidden;
}

.dropdown-username {
  font-weight: 600;
  margin: 0;
  font-size: 0.95rem;
  color: #333;
}

.dropdown-email {
  margin: 0;
  font-size: 0.8rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 190px;
}

.dropdown-divider {
  height: 1px;
  background-color: #eee;
  margin: 0;
}

.dropdown-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dropdown-menu li {
  padding: 15px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #333;
  position: relative;
  font-size: 0.9rem;
}

.dropdown-menu li:hover {
  background-color: #f9f9f9;
}

.dropdown-menu li i:first-child {
  margin-right: 12px;
  width: 16px;
  color: #02163b;
}

.menu-arrow {
  position: absolute;
  right: 15px;
  color: #999;
  font-size: 0.7rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modern mobile menu toggle */
.menu-toggle {
  display: none;
  background: transparent;
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.menu-toggle:hover {
  background-color: rgba(232, 186, 56, 0.12);
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
  transition: all 0.4s ease;
}

.menu-icon.open span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
  background-color: #e8ba38;
}

.menu-icon.open span:nth-child(2) {
  opacity: 0;
  transform: translateX(-10px);
}

.menu-icon.open span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
  background-color: #e8ba38;
}

/* Enhanced responsive adaptations */
@media (max-width: 1024px) {
  .nav-link {
    padding: 0.6rem 1rem;
  }

  .nav-container {
    padding: 0 1.5rem;
  }

  .nav-links-container {
    position: relative;
    left: 0;
    transform: none;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .menu-toggle {
    display: flex;
  }

  .nav-logo {
    order: 2; /* Reposition logo to center on mobile */
    margin: 0 auto;
  }

  .nav-links-container {
    position: static;
    margin-right: 0;
    transform: none;
  }

  .nav-links-backdrop {
    position: fixed;
    top: 60px;
    left: 0;
    width: 100%;
    height: 0;
    background-color: rgba(255, 255, 255, 0.97);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    overflow: hidden;
    transition: height 0.5s cubic-bezier(0.19, 1, 0.22, 1);
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
    padding: 2rem 0;
    flex-direction: column;
    align-items: center;
    transform: translateY(-20px);
    opacity: 0;
    visibility: hidden;
    transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
    z-index: 2;
  }

  .nav-links.menu-active {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .nav-link {
    padding: 1rem 0;
    width: 100%;
    max-width: 250px;
    text-align: center;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }

  .nav-link:before {
    bottom: -3px;
  }

  .admin-link {
    margin: 1rem 0 0 0;
    justify-content: center;
    width: 100%;
    max-width: 250px;
  }

  .user-actions {
    justify-content: flex-end;
    flex-grow: 1;
  }

  .login-button {
    padding: 0.6rem 1.2rem;
  }

  .nav-container {
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 1rem;
  }

  .action-button {
    width: 40px;
    height: 40px;
  }

  .logo-image {
    height: 32px;
    width: 32px;
  }

  .user-actions {
    gap: 1rem;
  }

  .login-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .profile-container {
    width: 38px;
    height: 38px;
  }

  .logout-button {
    width: 36px;
    height: 36px;
  }
}

/* Fluid animation for mobile menu items */
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(-15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav-links.menu-active .nav-item {
  animation: fadeSlideIn 0.5s forwards cubic-bezier(0.19, 1, 0.22, 1);
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
