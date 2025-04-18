<!-- components/AuthComponent.vue -->
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
          <input type="text" v-model="user.name" placeholder="Nama" class="auth-input" required />
        </div>

        <!-- Phone number field for registration -->
        <div class="form-group" v-if="!isLogin">
          <input
            type="tel"
            v-model="user.phone"
            placeholder="Nomor Telepon"
            class="auth-input"
            required
            maxlength="13"
            @input="validatePhone"
          />
          <p v-if="phoneError" class="error-text">{{ phoneError }}</p>
        </div>

        <div class="form-group">
          <input
            type="text"
            v-model="emailOrPhone"
            :placeholder="isLogin ? 'Email atau Nomor Telepon' : 'Email'"
            class="auth-input"
            required
          />
        </div>

        <div class="form-group password-field">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="user.password"
            placeholder="Kata Sandi"
            class="auth-input"
            required
          />
          <button type="button" class="toggle-password" @click="showPassword = !showPassword">
            <!-- SVG Eye icon that toggles between open/closed -->
            <svg
              v-if="!showPassword"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
              ></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>

        <!-- Confirm password field for registration -->
        <div class="form-group password-field" v-if="!isLogin">
          <input
            :type="showConfirmPassword ? 'text' : 'password'"
            v-model="confirmPassword"
            placeholder="Konfirmasi Kata Sandi"
            class="auth-input"
            required
          />
          <button
            type="button"
            class="toggle-password"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <!-- SVG Eye icon that toggles between open/closed -->
            <svg
              v-if="!showConfirmPassword"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
              ></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
          <p v-if="passwordError" class="error-text">{{ passwordError }}</p>
        </div>

        <div class="auth-links">
          <div class="auth-redirect">
            <span>{{ isLogin ? 'Belum' : 'Sudah' }} punya akun? </span>
            <router-link :to="isLogin ? '/register' : '/login'" class="redirect-link">
              {{ isLogin ? 'Daftar' : 'Masuk' }}
            </router-link>
          </div>
          <router-link v-if="isLogin" to="/forgot-password" class="redirect-link">
            Forgot Password?
          </router-link>
        </div>

        <button
          type="submit"
          class="submit-button"
          :disabled="isLoading || (!isLogin && !formValid)"
          :class="{ 'button-loading': isLoading }"
        >
          {{ isLoading ? 'Processing...' : isLogin ? 'Masuk' : 'Daftar' }}
        </button>

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
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '../stores/AuthStore.js'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const { user } = storeToRefs(authStore)

// Add phone to user object in local component
user.value.phone = ''

// Form state
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const confirmPassword = ref('')
const passwordError = ref('')
const phoneError = ref('')
const loginIdentifier = ref('')

// Computed property for email/phone input
const emailOrPhone = computed({
  get() {
    return props.isLogin ? loginIdentifier.value : user.value.email
  },
  set(value) {
    if (props.isLogin) {
      loginIdentifier.value = value
    } else {
      user.value.email = value
    }
  }
})

const props = defineProps({
  isLogin: {
    type: Boolean,
    default: false,
  },
})

// Form validation
const formValid = computed(() => {
  if (props.isLogin) return true

  if (
    !user.value.phone ||
    !user.value.name ||
    !user.value.email ||
    !user.value.password ||
    !confirmPassword.value
  ) {
    return false
  }

  if (phoneError.value) return false
  if (user.value.password !== confirmPassword.value) {
    return false
  }

  return true
})

// Separate function to check password match
const validatePasswordMatch = () => {
  if (!props.isLogin && user.value.password && confirmPassword.value) {
    if (user.value.password !== confirmPassword.value) {
      passwordError.value = 'Password dan konfirmasi password harus sama'
    } else {
      passwordError.value = ''
    }
  }
}

// Call validation when relevant values change
watch([() => user.value.password, confirmPassword], () => {
  validatePasswordMatch()
})

// Watch for password changes to validate match
watch([() => user.value.password, confirmPassword], ([password, confirm]) => {
  if (!props.isLogin && password && confirm && password !== confirm) {
    passwordError.value = 'Password dan konfirmasi password harus sama'
  } else {
    passwordError.value = ''
  }
})

const validatePhone = () => {
  // Remove non-digits
  user.value.phone = user.value.phone.replace(/\D/g, '')

  // Validate format
  if (user.value.phone && !/^(62|0)\d{9,12}$/.test(user.value.phone)) {
    phoneError.value = 'Format nomor telepon tidak valid'
  } else {
    phoneError.value = ''
  }
}

const handleSubmit = async () => {
  try {
    if (!props.isLogin && user.value.password !== confirmPassword.value) {
      passwordError.value = 'Password dan konfirmasi password harus sama'
      return
    }

    isLoading.value = true
    if (props.isLogin) {
      // Login with either email or phone
      await authStore.authUser(props.isLogin, router, loginIdentifier.value)
    } else {
      // Register with all fields
      await authStore.authUser(props.isLogin, router)
    }
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
/* Change font family from Judson to Montserrat */
* {
  font-family: 'Montserrat', sans-serif;
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
  order: 1;
}

.auth-title {
  font-size: 3rem;
  color: #02163b;
  margin-bottom: 3rem;
  font-weight: 700;
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
  background-color: #e8ba38;
  font-size: 1.1rem;
  color: #000000;
  transition: border-color 0.3s ease;
}

.auth-input:focus {
  outline: none;
  border-color: #8b7355; /* Brown border on focus */
}

.auth-input::placeholder {
  color: #000000; /* Darker gray for placeholder */
  opacity: 0.7;
}

/* Password field with eye icon */
.password-field {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  color: #02163b;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-links {
  text-align: left;
  margin: 1rem 0 2rem;
}

.redirect-link {
  color: #02163b;
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
  background: #8b7355;
  opacity: 0.3;
  z-index: 0;
}

/* Update button styles */
.google-button,
.submit-button {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 50px;
  background-color: #02163b; /* Darker brown */
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

.google-button:hover,
.submit-button:hover {
  background-color: #0f3172; /* Even darker on hover */
  color: #ffffff;
  transform: translateY(-1px); /* Slight lift effect */
}

.google-button:active,
.submit-button:active {
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

/* Error text */
.error-text {
  color: #d32f2f;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  padding-left: 1.5rem;
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
  background-color: #0f3172 !important; /* Darker shade when loading */
  cursor: not-allowed !important;
  opacity: 0.7;
}

.google-button:disabled,
.submit-button:disabled {
  cursor: not-allowed;
  transform: none !important;
}

.toggle-password svg {
  color: #02163b;
  width: 20px;
  height: 20px;
}

.button-loading:hover {
  transform: none !important;
  background-color: #998269 !important;
}
</style>
