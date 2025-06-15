<template>
  <div class="navigation-container">
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

          <!-- Right side - Mobile Profile Display -->
          <div class="mobile-profile-display" v-if="authStore.isLoggedIn && !isMobileMenuOpen">
            <div
              class="profile-container"
              @click.stop="toggleMobileProfileDropdown"
              :style="{ backgroundImage: `url(${userProfilePhoto})` }"
              aria-label="User Profile"
              role="button"
            >
              <div class="profile-accent"></div>
            </div>

            <!-- Mobile Mini Dropdown -->
            <div v-if="showMobileProfileDropdown" class="mobile-dropdown" @click.stop>
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
                  <i class="fas fa-sign-out-alt"></i> Keluar
                  <i class="fas fa-chevron-right menu-arrow"></i>
                </li>
              </ul>
            </div>
          </div>

          <!-- Right side - Mobile Menu Toggle -->
          <button class="menu-toggle" @click="toggleMobileMenu" aria-label="Toggle Menu">
            <div class="menu-icon" :class="{ open: isMobileMenuOpen }">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>

          <!-- Mobile Menu Dropdown -->
          <div class="mobile-menu-container" :class="{ active: isMobileMenuOpen }">
            <div class="mobile-menu-header">
              <img src="../assets/Logo_Difia_Haki.png" alt="Difia Logo" class="logo-image" />
            </div>

            <!-- Main Content Area with Sections -->
            <div class="mobile-menu-content">
              <!-- Main Navigation -->
              <div class="menu-section">
                <h3 class="section-title">Menu</h3>
                <ul class="menu-list">
                  <li v-for="(item, index) in navItems" :key="index" class="menu-item">
                    <a
                      @click.prevent="navigateTo(item.path, item.section)"
                      :href="item.href"
                      class="menu-link"
                      :class="{ active: isActiveLink(item.section) }"
                    >
                      <span>{{ item.text }}</span>
                    </a>
                  </li>
                </ul>
              </div>

              <!-- Account Section (only shown if logged in) -->
              <div v-if="authStore.isLoggedIn" class="menu-section">
                <h3 class="section-title">Akun Saya</h3>
                <ul class="menu-list">
                  <li class="menu-item">
                    <a @click.prevent="navigateToAccount('profile')" class="menu-link">
                      <i class="fas fa-user"></i>
                      <span>Profil</span>
                    </a>
                  </li>
                  <li class="menu-item">
                    <a @click.prevent="navigateToAccount('orders')" class="menu-link">
                      <i class="fas fa-shopping-bag"></i>
                      <span>Pesanan</span>
                    </a>
                  </li>
                  <li class="menu-item">
                    <a @click.prevent="navigateToAccount('address')" class="menu-link">
                      <i class="fas fa-map-marker-alt"></i>
                      <span>Alamat</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Bottom Action Bar -->
            <div class="mobile-menu-footer">
              <div class="quick-actions">
                <button
                  v-if="authStore.isLoggedIn"
                  class="action-circle"
                  @click="handleNotificationClick"
                >
                  <i class="fas fa-bell"></i>
                  <span v-if="notificationStore.unreadCount > 0" class="action-badge">
                    {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
                  </span>
                </button>

                <button v-if="authStore.isLoggedIn" class="action-circle" @click="navigateToCart">
                  <i class="fas fa-shopping-cart"></i>
                  <span v-if="cartItemCount > 0" class="action-badge">
                    {{ cartItemCount > 99 ? '99+' : cartItemCount }}
                  </span>
                </button>
              </div>

              <button
                v-if="!authStore.isLoggedIn"
                class="mobile-auth-button login-btn"
                @click="navigateToLogin"
              >
                <span>Login / Daftar</span>
                <i class="fas fa-arrow-right"></i>
              </button>

              <button v-else class="mobile-auth-button logout-btn" @click="showLogoutModal = true">
                <i class="fas fa-sign-out-alt"></i>
                <span>Keluar Akun</span>
              </button>
            </div>
          </div>

          <!-- Hidden on mobile: Desktop Center - Navigation links -->
          <div class="nav-links-container desktop-only">
            <ul class="nav-links">
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
            </ul>
          </div>

          <!-- Hidden on mobile: Desktop User Actions -->
          <div class="user-actions desktop-only">
            <button
              v-if="authStore.isLoggedIn"
              class="action-button notification-button"
              @click="handleNotificationClick"
              aria-label="Notifications"
            >
              <div class="button-content">
                <i class="fas fa-bell"></i>
                <div v-if="notificationStore.unreadCount > 0" class="notification-badge">
                  {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
                </div>
              </div>
            </button>

            <button
              v-if="authStore.isLoggedIn"
              class="action-button cart-button"
              @click="navigateToCart"
              aria-label="Shopping Cart"
            >
              <div class="button-content">
                <i class="fas fa-shopping-cart"></i>
                <div v-if="cartItemCount > 0" class="notification-badge">
                  {{ cartItemCount > 99 ? '99+' : cartItemCount }}
                </div>
              </div>
            </button>

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
  </div>
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
// import { db } from '@/config/firebase'
import { ref as dbRef, onValue, query as rtdbQuery, orderByChild, equalTo } from 'firebase/database'
import { rtdb } from '@/config/firebase'

// Define props and emits
defineProps({
  showLogout: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['logout'])

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
const showMobileProfileDropdown = ref(false)

// Navigation items
const navItems = [
  { text: 'Beranda', path: '/', section: 'home', href: '#home' },
  { text: 'Tentang Kami', path: '/tentangkami', section: 'about', href: '/tentangkami' },
  { text: 'Katalog', path: '/', section: 'catalog', href: '#catalog' },
  { text: 'Artikel', path: '/', section: 'articel', href: '#articel' },
]

// Check if a link is active
const isActiveLink = (section) => {
  return activeSection.value === section
}

// Update active section based on scroll position
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

const toggleMobileProfileDropdown = (event) => {
  event.stopPropagation()
  showMobileProfileDropdown.value = !showMobileProfileDropdown.value

  // Close the main mobile menu if it's open
  if (isMobileMenuOpen.value) {
    isMobileMenuOpen.value = false
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
  isMobileMenuOpen.value = false
}

const navigateToCart = () => {
  router.push('/cart')
  isMobileMenuOpen.value = false
}

const handleNotificationClick = () => {
  if (notificationStore.unreadCount > 0) {
    notificationStore.markAllAsRead()
  }
  router.push('/notification')
  isMobileMenuOpen.value = false
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
  isMobileMenuOpen.value = false
}

// Close menu when clicking outside
const handleClickOutside = (event) => {
  if (isMobileMenuOpen.value) {
    const navElement = document.querySelector('nav')
    const menuToggle = document.querySelector('.menu-toggle')
    if (
      (navElement && !navElement.contains(event.target)) ||
      (menuToggle && menuToggle.contains(event.target))
    ) {
      // Don't close when clicking the toggle itself - that's handled by toggleMobileMenu
      if (!(menuToggle && menuToggle.contains(event.target))) {
        isMobileMenuOpen.value = false
        document.body.style.overflow = ''
      }
    }
  }

  if (showProfileDropdown.value) {
    const profileDropdown = document.querySelector('.user-profile')
    const mobileProfileDropdown = document.querySelector('.mobile-user-profile')
    if (
      profileDropdown &&
      !profileDropdown.contains(event.target) &&
      mobileProfileDropdown &&
      !mobileProfileDropdown.contains(event.target)
    ) {
      showProfileDropdown.value = false
    }
  }

  if (showMobileProfileDropdown.value) {
    const mobileProfileDisplay = document.querySelector('.mobile-profile-display')
    if (mobileProfileDisplay && !mobileProfileDisplay.contains(event.target)) {
      showMobileProfileDropdown.value = false
    }
  }
}

// Set up real-time notification listener
const setupNotificationListener = () => {
  if (!authStore.isLoggedIn || !authStore.currentUser?.id) return null

  // Use RTDB reference instead of Firestore
  const notificationsRefPath = 'notifications'
  const notificationsRef = dbRef(rtdb, notificationsRefPath)

  // Create RTDB query
  const userNotificationsQuery = rtdbQuery(
    notificationsRef,
    orderByChild('userId'),
    equalTo(authStore.currentUser.id),
  )

  // Set up real-time listener with onValue for RTDB
  return onValue(
    userNotificationsQuery,
    (snapshot) => {
      let unreadCount = 0

      // Count unread notifications
      snapshot.forEach((childSnapshot) => {
        const notification = childSnapshot.val()
        if (notification && notification.read === false) {
          unreadCount++
        }
      })

      // Update the unread count in real time
      notificationStore.unreadCount = unreadCount
    },
    (error) => {
      console.error('Error fetching notifications:', error)
    },
  )
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

    // Set up real-time notification listener
    const unsubscribeNotifications = setupNotificationListener()

    // Store the unsubscribe function for cleanup
    onUnmounted(() => {
      if (unsubscribeNotifications) {
        unsubscribeNotifications()
      }
    })
  }

  // Watch for auth state changes
  watch(
    () => authStore.isLoggedIn,
    (isLoggedIn) => {
      if (isLoggedIn && authStore.currentUser?.id) {
        // Set up real-time listener when user logs in
        const unsubscribeNotifications = setupNotificationListener()

        // Clean up on next login change
        onUnmounted(() => {
          if (unsubscribeNotifications) {
            unsubscribeNotifications()
          }
        })
      }
    },
  )

  // Fetch vouchers
  voucherStore.fetchVouchers()

  // Add event listener for clicks outside
  document.addEventListener('click', handleClickOutside)
})

// Ensure we clean up all event listeners
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

/* Desktop Navigation Links */
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

.notification-badge {
  position: absolute;
  top: -1px;
  right: -2px;
  background-color: #e8ba38;
  color: white;
  height: 13px;
  width: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  animation: pulse 2s infinite;
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

/* Improved mobile menu transitions & aesthetics */
.profile-accent {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(232, 186, 56, 0.7), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.profile-container:hover .profile-accent {
  opacity: 1;
}

/* Profile dropdown styling */
.profile-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 280px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
  padding: 1.2rem;
  z-index: 100;
  animation: fadeInDown 0.3s ease;
  transform-origin: top right;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dropdown-user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.dropdown-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  border: 2px solid #e8ba38;
}

.dropdown-user-details {
  flex: 1;
  overflow: hidden;
}

.dropdown-username {
  font-weight: 600;
  margin: 0;
  color: #02163b;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-email {
  margin: 0.2rem 0 0;
  color: #666;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-divider {
  height: 1px;
  background-color: #eee;
  margin: 0.8rem 0;
}

.dropdown-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dropdown-menu li {
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  border-radius: 10px;
  color: #333;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 0.3rem;
  transition: all 0.2s ease;
  position: relative;
}

.dropdown-menu li:last-child {
  margin-bottom: 0;
}

.dropdown-menu li i:first-child {
  margin-right: 0.8rem;
  width: 20px;
  text-align: center;
  color: #02163b;
}

.dropdown-menu .menu-arrow {
  position: absolute;
  right: 1rem;
  opacity: 0;
  transform: translateX(-5px);
  transition: all 0.2s ease;
  color: #e8ba38;
}

.dropdown-menu li:hover {
  background-color: #f8f8f8;
  color: #02163b;
}

.dropdown-menu li:hover .menu-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* Enhanced Mobile Menu Styling */
.menu-toggle {
  display: none;
  background: transparent;
  border: none;
  width: 48px;
  height: 48px;
  position: relative;
  cursor: pointer;
  z-index: 110;
  border-radius: 12px;
  overflow: hidden;
}

.menu-icon {
  width: 24px;
  height: 18px;
  position: relative;
  margin: 0 auto;
  transform: rotate(0deg);
  transition: 0.5s ease-in-out;
}

.menu-icon span {
  display: block;
  position: absolute;
  height: 3px;
  width: 100%;
  background: #02163b;
  border-radius: 9px;
  opacity: 1;
  left: 0;
  transform: rotate(0deg);
  transition: 0.25s ease-in-out;
}

.menu-icon span:nth-child(1) {
  top: 0;
}

.menu-icon span:nth-child(2) {
  top: 8px;
  width: 80%;
}

.menu-icon span:nth-child(3) {
  top: 16px;
}

.menu-icon.open span:nth-child(1) {
  top: 8px;
  transform: rotate(135deg);
}

.menu-icon.open span:nth-child(2) {
  opacity: 0;
  width: 0;
}

.menu-icon.open span:nth-child(3) {
  top: 8px;
  transform: rotate(-135deg);
}

.menu-toggle::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(232, 186, 56, 0.12);
  border-radius: 12px;
  transform: scale(0);
  transition: transform 0.4s ease;
}

.menu-toggle:hover::before {
  transform: scale(1);
}

/* Completely redesigned mobile menu */
.mobile-menu-container {
  position: fixed;
  top: 0;
  right: -100%;
  width: 100%;
  height: 100vh;
  background-color: #fff;
  z-index: 100;
  transition: right 0.4s cubic-bezier(0.77, 0, 0.175, 1);
  display: flex;
  flex-direction: column;
  box-shadow: -5px 0 25px rgba(0, 0, 0, 0.1);
}

.mobile-menu-container.active {
  right: 0;
}

/* Clean header with logo */
.mobile-menu-header {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #f0f0f0;
}

.mobile-menu-header .logo-image {
  height: 60px;
  width: 120px;
  object-fit: contain;
}

/* Scrollable content area */
.mobile-menu-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 1.25rem;
  -webkit-overflow-scrolling: touch;
}

/* Section styling */
.menu-section:not(:last-child) {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: #888;
  margin-bottom: 1rem;
  font-weight: 600;
}

/* Menu item styling */
.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  margin-bottom: 0.5rem;
}

.menu-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  color: #333;
  text-decoration: none;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
}

.menu-link i {
  width: 24px;
  font-size: 1.1rem;
  color: #02163b;
  text-align: center;
}

.menu-link.active {
  background-color: rgba(232, 186, 56, 0.1);
  color: #02163b;
  font-weight: 600;
}

.admin-menu-link {
  background-color: rgba(232, 186, 56, 0.15);
}

.admin-menu-link i {
  color: #e8ba38;
}

/* Bottom action bar */
.mobile-menu-footer {
  padding: 1.25rem;
  border-top: 1px solid #f0f0f0;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.quick-actions {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 0.5rem;
}

.action-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: white;
  color: #02163b;
  font-size: 1.2rem;
  position: relative;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.action-circle:active {
  transform: scale(0.95);
}

.action-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #e8ba38;
  color: white;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: bold;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  border: 2px solid white;
}

.mobile-auth-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.login-btn {
  background-color: #02163b;
  color: white;
}

.logout-btn {
  background-color: #f0f0f0;
  color: #333;
}

.login-btn:active,
.logout-btn:active {
  transform: scale(0.98);
}

/* Mobile profile photo in navbar - Add this to your existing CSS */
.mobile-profile-display {
  display: none;
  margin-right: -100px;
}

.mobile-profile-display .profile-container {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
}

.mobile-dropdown {
  position: absolute;
  top: 60px;
  right: 1rem;
  width: 220px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  z-index: 200;
  animation: fadeInDown 0.25s ease;
  padding: 0.8rem;
}

.mobile-dropdown .dropdown-user-info {
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
}

.mobile-dropdown .dropdown-avatar {
  width: 40px;
  height: 40px;
}

.mobile-dropdown .dropdown-username,
.mobile-dropdown .dropdown-email {
  font-size: 0.8rem;
}

.mobile-dropdown .dropdown-menu li {
  padding: 0.7rem 0.8rem;
  font-size: 0.85rem;
}

/* Update the existing media query */
@media screen and (max-width: 992px) {
  /* Other media query styles remain the same */

  /* Modify this section to reduce the size of menu items */
  .mobile-nav-links .nav-link {
    height: 50px; /* Change from 100% to auto */
    padding: 0.7rem 0.3rem; /* Reduce padding from 1.2rem 0.5rem */
    gap: 0.3rem; /* Reduce gap from 0.5rem */
    font-size: 0.9rem; /* Add this to make the text smaller */
  }

  /* Add this to reduce the space between menu items */
  .mobile-nav-links {
    height: 50px;
    gap: 0.5rem; /* Reduce from 0.75rem */
  }

  /* Optional: Make the active state background smaller */
  .mobile-nav-links .nav-link.active {
    background-color: rgba(232, 186, 56, 0.1);
    height: 50px;
    padding: 0.6rem 0.3rem; /* Even smaller padding for active items */
  }

  .mobile-profile-display {
    display: block;
    margin-right: 10px; /* Replace negative margin with positive */
    transition: all 0.3s ease;
  }

  /* Fix positioning in navbar */
  .nav-container {
    position: relative;
    justify-content: space-between;
  }

  /* Logo adjustments when scrolled */
  .nav-scrolled .logo-image {
    height: 80px; /* Smaller when scrolled on mobile */
    width: 120px;
    transition: all 0.3s ease;
  }

  /* Adjust right side spacing */
  .menu-toggle {
    margin-left: 5px;
  }

  /* Fix profile position when scrolled */
  .nav-scrolled .mobile-profile-display {
    position: relative;
    z-index: 111; /* Above the menu toggle */
  }

  /* When navbar is scrolled, adjust container width */
  .nav-scrolled .nav-container {
    padding: 0 1rem;
  }

  /* Ensure flex layout doesn't push elements */
  .nav-container {
    display: flex;
    align-items: center;
  }

  .nav-logo {
    flex: 1;
  }

  /* Create a container for the right-side elements */
  .mobile-controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .desktop-only {
    display: none;
  }

  .menu-toggle {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .navbar-wrapper {
    top: 0;
  }

  nav {
    height: 60px;
  }

  .nav-container {
    padding: 0 1.5rem;
  }

  .logo-image {
    height: 100px;
    width: 160px;
  }

  .mobile-user-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .action-button {
    margin-right: auto;
  }

  .mobile-user-section {
    width: 100%;
    margin-top: 1rem;
  }

  /* Enhanced bottom nav drawer feel */
  .mobile-nav-links {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    padding: 90px 1.5rem 1.5rem;
  }

  .mobile-nav-links .nav-item {
    margin-bottom: 0;
  }

  .mobile-nav-links .nav-link {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    text-align: center;
    padding: 1.2rem 0.5rem;
    gap: 0.5rem;
  }

  /* Mobile optimized dropdown menu items */
  .dropdown-menu li {
    padding: 0.9rem 1rem;
    margin-bottom: 0.4rem;
  }

  /* Improve scroll experience */
  .mobile-nav-links {
    -webkit-overflow-scrolling: touch;
    /* For momentum scrolling on iOS */
    scrollbar-width: none;
  }

  .mobile-nav-links::-webkit-scrollbar {
    display: none;
  }
}

/* Extra small devices */
@media screen and (max-width: 360px) {
  /* Further reduce sizes for very small screens */
  .nav-scrolled .logo-image {
    height: 70px;
    width: 100px;
  }

  .mobile-profile-display .profile-container {
    width: 32px;
    height: 32px;
  }
}

/* Small mobile devices */
@media screen and (max-width: 576px) {
  .mobile-nav-links {
    grid-template-columns: 1fr;
    padding-top: 80px;
  }

  .nav-container {
    padding: 0 1rem;
  }

  .logo-image {
    height: 90px;
    width: 140px;
  }

  .dropdown-menu li {
    padding: 12px;
  }
}

/* Add bouncy animation for menu items */
@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  60% {
    opacity: 1;
    transform: translateY(-5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.mobile-menu-container.active .nav-item {
  animation: bounceIn 0.5s forwards;
  opacity: 0;
}

/* Stagger animation for each menu item */
.mobile-menu-container.active .nav-item:nth-child(1) {
  animation-delay: 0.1s;
}
.mobile-menu-container.active .nav-item:nth-child(2) {
  animation-delay: 0.15s;
}
.mobile-menu-container.active .nav-item:nth-child(3) {
  animation-delay: 0.2s;
}
.mobile-menu-container.active .nav-item:nth-child(4) {
  animation-delay: 0.25s;
}
.mobile-menu-container.active .nav-item:nth-child(5) {
  animation-delay: 0.3s;
}
</style>
```
