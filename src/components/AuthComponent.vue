// AuthComponent.vue
<template>
  <div class="auth-container">
    <!-- Logo Container with conditional class -->
    <div class="logo-container" :class="{ 'logo-left': !isLogin }">
      <img src="../assets/Logo Difia Haki.png" alt="DIFIA" class="difia-logo" />
    </div>

    <div class="auth-content">
      <h1 class="auth-title">{{ isLogin ? 'MASUK' : 'DAFTAR' }}</h1>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <!-- Only show name field for registration -->
        <div class="form-group" v-if="!isLogin">
          <input
            type="text"
            v-model="user.name"
            placeholder="Nama"
            class="auth-input"
            required
          >
        </div>

        <div class="form-group">
          <input
            type="email"
            v-model="user.email"
            placeholder="Email"
            class="auth-input"
            required
          >
        </div>

        <div class="form-group">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="user.password"
            placeholder="Kata Sandi"
            class="auth-input"
            required
          >
        </div>

        <div class="auth-links">
          <div class="auth-redirect">
            <span>{{ isLogin ? 'Belum' : 'Sudah' }} punya akun? </span>
            <router-link :to="isLogin ? '/register' : '/login'" class="redirect-link">
              {{ isLogin ? 'Daftar' : 'Masuk' }}
            </router-link>
          </div>
          <router-link to="/forgot-password" class="forgot-link">
            Forgot Password?
          </router-link>
        </div>

        <div class="divider">
          <span class="divider-text">Atau {{ isLogin ? 'Masuk' : 'Daftar' }} Dengan</span>
        </div>

        <button
          @click="handleGoogleSignIn"
          type="button"
          class="google-button"
          :disabled="isLoading"
          :class="{ 'button-loading': isLoading }"
        >
          <img src="../assets/google.svg" alt="Google" class="google-icon" />
          {{ isLoading ? 'Processing...' : (isLogin ? 'Masuk' : 'Daftar') + ' menggunakan Google' }}
        </button>

        <button
          type="submit"
          class="submit-button"
          :disabled="isLoading"
          :class="{ 'button-loading': isLoading }"
        >
          {{ isLoading ? 'Processing...' : (isLogin ? 'Masuk' : 'Daftar') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/AuthStore.js'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const { user } = storeToRefs(authStore)
const showPassword = ref(false)
const isLoading = ref(false)

const props = defineProps({
  isLogin: {
    type: Boolean,
    default: false
  }
})

const handleSubmit = async () => {
  try {
    isLoading.value = true
    await authStore.authUser(props.isLogin, router)
  } catch (error) {
    console.error('Authentication error:', error)
  } finally {
    isLoading.value = false
  }
}

const handleGoogleSignIn = async () => {
  try {
    isLoading.value = true
    await authStore.signInWithGoogle(router)
  } catch (error) {
    console.error('Google sign-in error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Apply Judson font family to all elements */
* {
  font-family: 'Judson', serif;
}

.auth-container {
  display: flex;
  width: 100%;
  max-width: 1200px;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
}

.auth-content {
  flex: 1;
  padding: 3rem 4rem;
  max-width: 600px;
  /* Default order for login (left side) */
  order: 1;
}

.auth-title {
  font-size: 3rem;
  color: #8B7355;
  margin-bottom: 3rem;
  font-weight: bold;
  letter-spacing: 1px;
}

.auth-form {
  width: 100%;
}

.form-group {
  margin-bottom: 1.5rem;
}

/* Update input styles */
.auth-input {
  width: 100%;
  padding: 1rem 1.5rem;
  border: 2px solid #c2c2c2; /* Light gray border */
  border-radius: 50px;
  background-color: #d4c4b5;
  font-size: 1.1rem;
  color: #000000;
  transition: border-color 0.3s ease;
}

.auth-input:focus {
  outline: none;
  border-color: #8B7355; /* Brown border on focus */
}

.auth-input::placeholder {
  color: #000000; /* Darker gray for placeholder */
  opacity: 0.7;
}

.auth-links {
  text-align: left;
  margin: 1rem 0 2rem;
}

.redirect-link {
  color: #8B7355;
  text-decoration: none;
  font-weight: bold;
}

.divider {
  position: relative;
  text-align: center;
  margin: 2rem 0;
}

.divider-text {
  background: #ffffff;
  padding: 0 1rem;
  color: #000000;
  position: relative;
  z-index: 1;
  font-size: 1.1rem;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #8B7355;
  opacity: 0.3;
  z-index: 0;
}

/* Update button styles */
.google-button, .submit-button {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 50px;
  background-color: #b69c7c; /* Darker brown */
  color: #ffffff; /* White text */
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.google-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
  width: 100%;
}

.submit-button {
  width: 65%;
  margin: 0 auto;
  display: block;
}

.google-button:hover, .submit-button:hover {
  background-color: #8b7254; /* Even darker on hover */
  color: #ffffff;
  transform: translateY(-1px); /* Slight lift effect */
}

.google-button:active, .submit-button:active {
  transform: translateY(0);
}

.google-icon {
  width: 24px;
  height: 24px;
}

.logo-container {
  position: relative;
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  /* Default order for login (right side) */
  order: 2;
}

/* Styles for registration page */
.logo-container.logo-left {
  order: 1; /* Move logo to left for registration */
}

/* When logo is on left, move content to right */
.logo-container.logo-left + .auth-content {
  order: 2;
}

.difia-logo {
  width: 100%;
  max-width: 300px;
  height: auto;
}

/* Media query for mobile responsiveness */
@media (max-width: 768px) {
  .auth-container {
    flex-direction: column;
  }

  .auth-content,
  .logo-container,
  .logo-container.logo-left,
  .logo-container.logo-left + .auth-content {
    width: 100%;
    order: 0;
    padding: 2rem;
  }

  .logo-container {
    justify-content: center;
  }

  .difia-logo {
    max-width: 200px;
  }
}

/* Add to your existing <style> section */
.button-loading {
  background-color: #998269 !important; /* Darker shade when loading */
  cursor: not-allowed !important;
  opacity: 0.7;
}

.google-button:disabled,
.submit-button:disabled {
  cursor: not-allowed;
  transform: none !important;
}

.button-loading:hover {
  transform: none !important;
  background-color: #998269 !important;
}
</style>
