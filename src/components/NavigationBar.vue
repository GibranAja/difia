<template>
  <nav 
    :class="{ 'nav-hidden': isHidden }"
    :style="{ 
      background: isScrolled ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
      backdropFilter: isScrolled ? 'blur(10px)' : 'none'
    }"
  >
    <div class="link">
      <a href="#header"><b>Beranda</b></a>
      <a href="#about"><b>Tentang Kami</b></a>
      <a href="#catalog"><b>Katalog</b></a>
      <a href="#articel"><b>Artikel</b></a>
      <!-- Add Dashboard link for admin users -->
      <router-link v-if="authStore.currentUser?.isAdmin" to="/admin"><b>Dashboard</b></router-link>
    </div>

    <a href="">
      <i class="fas fa-bell"></i>
    </a>

    <a href="">
      <i class="fas fa-cart-shopping"></i>
    </a>

    <!-- Show login button when user is not logged in -->
    <template v-if="!authStore.isLoggedIn">
      <a href="/login" class="masuk">Login</a>
    </template>

    <!-- Show user icon and logout when user is logged in -->
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
        <a href="" class="keluar" @click.prevent="handleLogout">Log out</a>
      </div>
    </template>

    <!-- Profile Modal -->
    <ModalProfile 
      v-if="showProfileModal" 
      @close="showProfileModal = false"
    />
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/AuthStore'
import { useRouter } from 'vue-router'
import ModalProfile from './ModalProfile.vue'
import defaultAvatarImage from '../assets/default-avatar-wm14gXiP.png' // Import the image directly

const router = useRouter()
const authStore = useAuthStore()
const showProfileModal = ref(false)
const isScrolled = ref(false)
const isHidden = ref(false)
const lastScrollPosition = ref(0)

// Handle scroll event
const handleScroll = () => {
  const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop
  isScrolled.value = currentScrollPosition > 0

  // Don't do anything if the scroll position is negative
  if (currentScrollPosition < 0) {
    return
  }

  // Only trigger hide/show if we've scrolled more than 50px
  if (Math.abs(currentScrollPosition - lastScrollPosition.value) < 50) {
    return
  }

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
  await authStore.logoutUser(router)
}

// Add event listeners
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
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
}

.nav-hidden {
  transform: translateY(-100%);
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

.link a{
  font-size: 1.4rem;
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
  font-size: 3rem;
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
</style>
