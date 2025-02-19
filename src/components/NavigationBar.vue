<template>
  <nav
    :class="{
      'nav-hidden': isHidden,
      'at-top': !isScrolled,
    }"
    :style="{
      // background: isScrolled ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.43)',
      // backdropFilter: isScrolled ? 'blur(10px)' : 'blur(0px)'
    }"
  >
    <div class="link">
      <a @click.prevent="navigateTo('/', 'home')" href="#home"><b>Beranda</b></a>
      <a @click.prevent="navigateTo('/', 'about')" href="#about"><b>Tentang Kami</b></a>
      <a @click.prevent="navigateTo('/', 'catalog')" href="#catalog"><b>Katalog</b></a>
      <a @click.prevent="navigateTo('/', 'articel')" href="#articel"><b>Artikel</b></a>
      <router-link v-if="authStore.currentUser?.isAdmin" to="/admin"><b>Dashboard</b></router-link>
    </div>

    <a href="/notification" class="notification-icon-container" @click="handleNotificationClick">
      <i class="fas fa-bell"></i>
      <span v-if="notificationStore.notificationCount > 0" class="notification-counter">
        {{ notificationStore.notificationCount }}
      </span>
    </a>

    <a href="/cart" class="cart-icon-container">
      <i class="fas fa-cart-shopping"></i>
      <span v-if="cartItemCount > 0" class="cart-counter">{{ cartItemCount }}</span>
    </a>

    <template v-if="!authStore.isLoggedIn">
      <a href="/login" class="masuk">Login</a>
    </template>

    <template v-if="authStore.isLoggedIn">
      <div class="login">
        <div class="profile-photo-container" @click="showProfileModal = true">
          <img
            :src="userProfilePhoto"
            :alt="authStore.currentUser?.name || 'User'"
            class="profile-photo"
            @error="handleImageError"
          />
        </div>
        <a href="" class="keluar" @click.prevent="showLogoutModal = true">Log out</a>
      </div>
    </template>

    <ModalProfile v-if="showProfileModal" @close="showProfileModal = false" />

    <NegativeModal
      v-if="showLogoutModal"
      title="Konfirmasi Logout"
      message="Apakah Anda yakin ingin keluar?"
      :loading="isLoggingOut"
      @close="showLogoutModal = false"
      @confirm="handleLogout"
    />
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useAuthStore } from '../stores/AuthStore'
import { useCartStore } from '@/stores/CartStore' // Add this import
import { useRouter, useRoute } from 'vue-router' // Add useRoute
import ModalProfile from './ModalProfile.vue'
import NegativeModal from './NegativeModal.vue' // Add this import
import defaultAvatarImage from '../assets/default-avatar-wm14gXiP.png' // Import the image directly
import { useNotificationStore } from '@/stores/NotificationStore' // Add this import

const router = useRouter()
const route = useRoute() // Add this
const authStore = useAuthStore()
const cartStore = useCartStore() // Add this
const notificationStore = useNotificationStore() // Add this
const showProfileModal = ref(false)
const isScrolled = ref(false)
const isHidden = ref(false)
const lastScrollPosition = ref(0)

// Add these refs
const showLogoutModal = ref(false)
const isLoggingOut = ref(false)

// Handle scroll event
const handleScroll = () => {
  const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop
  isScrolled.value = currentScrollPosition > 0

  // Hide navbar when at the very top
  if (currentScrollPosition < 50) {
    isHidden.value = true
    return
  }

  // Only trigger hide/show if we've scrolled more than 50px
  if (Math.abs(currentScrollPosition - lastScrollPosition.value) < 50) {
    return
  }

  // Hide when scrolling down, show when scrolling up
  isHidden.value = currentScrollPosition > lastScrollPosition.value
  lastScrollPosition.value = currentScrollPosition
}

// Your existing code...
const userProfilePhoto = computed(() => {
  return authStore.currentUser?.profilePhoto || defaultAvatarImage
})

const handleImageError = (e) => {
  e.target.src = defaultAvatarImage
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

// Add navigation function
const navigateTo = async (path, section = null) => {
  // If we're already on the home page
  if (route.path === '/' && section) {
    // Just scroll to section
    const element = document.getElementById(section)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    return
  }

  // If we're on a different page
  if (route.path !== '/') {
    // First navigate to home page
    await router.push('/')

    // Wait for navigation to complete
    await nextTick()

    // Then scroll to section if specified
    if (section) {
      setTimeout(() => {
        const element = document.getElementById(section)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100) // Small delay to ensure DOM is updated
    } else {
      // If no section specified, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}

// Add cart counter computed property
const cartItemCount = computed(() => {
  if (!authStore.isLoggedIn) return 0
  return cartStore.cartItems.length
})

// Modify onMounted to fetch cart items
onMounted(async () => {
  window.addEventListener('scroll', handleScroll)
  if (authStore.isLoggedIn) {
    await cartStore.fetchCartItems()
  }

  // Setup notification tracking if user is logged in
  if (authStore.isLoggedIn && authStore.currentUser?.id) {
    const unsubscribe = notificationStore.trackStatusUpdates(authStore.currentUser.id)

    // Cleanup on unmount
    onUnmounted(() => {
      unsubscribe && unsubscribe()
    })
  }
})

// Add event listeners
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const handleNotificationClick = () => {
  notificationStore.resetCount()
}
</script>

<style scoped>
.nav-hidden {
  transform: translateY(-100%);
  pointer-events: none;
  opacity: 0;
  transition: all 0.3s ease;
}

nav {
  display: flex;
  flex-wrap: wrap;
  position: fixed;
  top: 0;
  width: 100%;
  padding: 10px;
  gap: 5px;
  z-index: 10;
  justify-content: space-around;
  align-items: center;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
  transform: translateY(0);
  opacity: 1;
  background: rgba(0, 0, 0, 0.43);
  backdrop-filter: blur(10px);
}

.nav-hidden {
  transform: translateY(-100%);
  pointer-events: none;
}

/* Add style for when at top */
nav.at-top {
  background: transparent;
  backdrop-filter: none;
}

.link {
  display: flex;
  gap: 50px;
  align-items: center;
  justify-content: center;
  border-radius: 100px;
  background-color: #02163b;
  padding: 5px;
  width: 60%;
}

.link a {
  font-size: 1.3rem;
}

a {
  text-decoration: none;
  color: white;
  padding: 10px;
  transition: all 700ms;
}

a.masuk {
  background-color: #e8ba38;
  padding: 10px;
  border-radius: 10px;
  width: 10%;
  text-align: center;
}

.login {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  width: 25%;
  gap: 20px;
  padding: 10px;
  border-radius: 100px;
}

i {
  color: #e8ba38;
  transition: all 700ms;
  font-size: 1.7rem;
}

i:hover {
  color: #02163b;
}

a.keluar:hover {
  color: #e8ba38;
  background-color: white;
  border: solid 1px #e8ba38;
}

a.masuk:hover {
  color: #e8ba38;
  background-color: white;
  border: solid 1px #e8ba38;
}

.link a:hover {
  background-color: #e8ba38;
  border-radius: 100px;
  padding: 10px;
}

a.keluar {
  color: white;
  background-color: #e8ba38;
  text-align: center;
  padding: 10px;
  width: 120px;
  height: 20px;
  border-radius: 50px;
  justify-content: center;
  align-items: center;
  display: flex;
}

/* Add style for the dashboard link to match other navigation items */
.link router-link {
  text-decoration: none;
  color: white;
  padding: 10px;
  transition: all 700ms;
}

.link router-link:hover {
  background-color: #e8ba38;
  border-radius: 100px;
  padding: 10px;
}

.profile-photo-container {
  cursor: pointer;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #e8ba38;
  transition: transform 0.3s ease;
}

.profile-photo-container:hover {
  transform: scale(1.1);
}

.profile-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-icon-container {
  position: relative;
  display: inline-block;
}

.cart-counter {
  position: absolute;
  top: -2px;
  right: -1px;
  background-color: #e83838;
  color: #ffffff;
  border-radius: 50%;
  padding: 1px px;
  font-size: 12px;
  font-weight: bold;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* border: 2px solid #fff; */
}

/* Add these styles to your existing CSS */
.notification-icon-container {
  position: relative;
  display: inline-block;
}

.notification-counter {
  position: absolute;
  top: -2px;
  right: -1px;
  background-color: #e83838;
  color: #ffffff;
  border-radius: 50%;
  padding: 1px;
  font-size: 12px;
  font-weight: bold;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
