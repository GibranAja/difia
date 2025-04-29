<!-- components/AuthComponent.vue -->
<template>
  <div class="auth-container">
    <!-- Logo Container with conditional class -->
    <div class="logo-container" :class="{ 'logo-left': !isLogin }">
      <img src="../assets/Logo Difia Haki.png" alt="DIFIA" class="difia-logo" />
    </div>

    <div class="auth-content">
      <h1 class="auth-title">{{ isLogin ? 'MASUK' : 'DAFTAR' }}</h1>

      <!-- Login Form -->
      <form v-if="isLogin" @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <input
            type="text"
            v-model="emailOrPhone"
            placeholder="Email atau Nomor Telepon"
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

        <div class="auth-links">
          <div class="auth-redirect">
            <span>Belum punya akun? </span>
            <router-link to="/register" class="redirect-link"> Daftar </router-link>
          </div>
          <router-link to="/forgot-password" class="redirect-link"> Forgot Password? </router-link>
        </div>

        <button
          type="submit"
          class="submit-button"
          :disabled="isLoading"
          :class="{ 'button-loading': isLoading }"
        >
          {{ isLoading ? 'Processing...' : 'Masuk' }}
        </button>

        <div class="divider">
          <span class="divider-text">Atau Masuk Dengan</span>
        </div>

        <button
          @click="handleGoogleSignIn"
          type="button"
          class="google-button"
          :disabled="isLoading"
          :class="{ 'button-loading': isLoading }"
        >
          <img src="../assets/google.svg" alt="Google" class="google-icon" />
          {{ isLoading ? 'Processing...' : 'Masuk menggunakan Google' }}
        </button>
      </form>

      <!-- Registration Multi-Step Form -->
      <div v-else class="register-container">
        <!-- Step indicator -->
        <div class="step-indicator">
          <div
            v-for="step in 3"
            :key="step"
            class="step"
            :class="{ active: currentStep >= step, complete: currentStep > step }"
          >
            <div class="step-number">{{ step }}</div>
            <div class="step-label">{{ getStepLabel(step) }}</div>
          </div>
          <div class="step-line"></div>
        </div>

        <!-- Step 1: Personal Information -->
        <form v-if="currentStep === 1" @submit.prevent="nextStep" class="auth-form">
          <div class="form-group">
            <input type="text" v-model="user.name" placeholder="Nama" class="auth-input" required />
          </div>

          <div class="form-group">
            <input
              type="email"
              v-model="user.email"
              placeholder="Email"
              class="auth-input"
              required
            />
          </div>

          <div class="form-group">
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

          <div class="form-group password-field">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="user.password"
              placeholder="Kata Sandi"
              class="auth-input"
              required
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
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

          <div class="form-group password-field">
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
              <span>Sudah punya akun? </span>
              <router-link to="/login" class="redirect-link"> Masuk </router-link>
            </div>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="submit-button"
              :disabled="isLoading || !isStep1Valid"
              :class="{ 'button-loading': isLoading }"
            >
              Selanjutnya
            </button>
          </div>

          <div class="divider">
            <span class="divider-text">Atau Daftar Dengan</span>
          </div>

          <button
            @click="handleGoogleSignIn"
            type="button"
            class="google-button"
            :disabled="isLoading"
            :class="{ 'button-loading': isLoading }"
          >
            <img src="../assets/google.svg" alt="Google" class="google-icon" />
            {{ isLoading ? 'Processing...' : 'Daftar menggunakan Google' }}
          </button>
        </form>

        <!-- Step 2: Payment Information -->
        <form v-if="currentStep === 2" @submit.prevent="nextStep" class="auth-form">
          <div class="form-group">
            <label>Metode Pembayaran</label>
            <div class="payment-method-options">
              <div
                class="payment-option"
                :class="{ selected: paymentMethod === 'bank' }"
                @click="paymentMethod = 'bank'"
              >
                <i class="fas fa-university"></i>
                <span>Bank</span>
              </div>
              <div
                class="payment-option"
                :class="{ selected: paymentMethod === 'ewallet' }"
                @click="paymentMethod = 'ewallet'"
              >
                <i class="fas fa-wallet"></i>
                <span>E-Wallet</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>{{ paymentMethod === 'bank' ? 'Nama Bank' : 'Nama E-Wallet' }}</label>
            <div class="custom-dropdown" :class="{ active: isDropdownOpen }">
              <div class="selected-option" @click="isDropdownOpen = !isDropdownOpen">
                <span>{{
                  paymentDetails.name ||
                  (paymentMethod === 'bank' ? 'Pilih Bank' : 'Pilih E-Wallet')
                }}</span>
                <i
                  class="fas fa-chevron-down dropdown-icon"
                  :class="{ rotate: isDropdownOpen }"
                ></i>
              </div>
              <div class="dropdown-menu" v-if="isDropdownOpen">
                <div
                  v-for="option in paymentMethod === 'bank' ? bankOptions : ewalletOptions"
                  :key="option"
                  class="dropdown-item"
                  :class="{ selected: paymentDetails.name === option }"
                  @click="selectOption(option)"
                >
                  <i class="fas fa-check check-icon" v-if="paymentDetails.name === option"></i>
                  {{ option }}
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>{{ paymentMethod === 'bank' ? 'Nomor Rekening' : 'Nomor E-Wallet' }}</label>
            <input
              type="text"
              v-model="paymentDetails.number"
              :placeholder="
                paymentMethod === 'bank' ? 'Masukkan nomor rekening' : 'Masukkan nomor e-wallet'
              "
              class="auth-input"
              required
              @input="validateAccountNumber"
              maxlength="paymentMethod === 'bank' ? 17 : 13"
            />
            <p v-if="accountNumberError" class="error-text">{{ accountNumberError }}</p>
          </div>

          <div class="form-group">
            <label>Nama Pemilik</label>
            <input
              type="text"
              v-model="paymentDetails.ownerName"
              placeholder="Nama pemilik rekening/e-wallet"
              class="auth-input"
              required
            />
          </div>

          <div class="form-actions">
            <button type="button" class="back-button" @click="prevStep">Kembali</button>
            <button
              type="submit"
              class="submit-button"
              :disabled="isLoading || !isStep2Valid"
              :class="{ 'button-loading': isLoading }"
            >
              Selanjutnya
            </button>
          </div>
        </form>

        <!-- Step 3: Review and Submit -->
        <form v-if="currentStep === 3" @submit.prevent="handleSubmit" class="auth-form">
          <div class="review-section">
            <h3>Informasi Pribadi</h3>
            <div class="review-item">
              <span class="review-label">Nama:</span>
              <span class="review-value">{{ user.name }}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Email:</span>
              <span class="review-value">{{ user.email }}</span>
            </div>
            <div class="review-item">
              <span class="review-label">No. Telepon:</span>
              <span class="review-value">{{ user.phone }}</span>
            </div>

            <h3>Informasi Pembayaran</h3>
            <div class="review-item">
              <span class="review-label">Metode Pembayaran:</span>
              <span class="review-value">{{ paymentMethod === 'bank' ? 'Bank' : 'E-Wallet' }}</span>
            </div>
            <div class="review-item">
              <span class="review-label">{{
                paymentMethod === 'bank' ? 'Bank:' : 'E-Wallet:'
              }}</span>
              <span class="review-value">{{ paymentDetails.name }}</span>
            </div>
            <div class="review-item">
              <span class="review-label">{{
                paymentMethod === 'bank' ? 'No. Rekening:' : 'No. E-Wallet:'
              }}</span>
              <span class="review-value">{{ paymentDetails.number }}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Nama Pemilik:</span>
              <span class="review-value">{{ paymentDetails.ownerName }}</span>
            </div>
          </div>

          <p class="info-text">
            Setelah mendaftar, Anda akan menerima email verifikasi. Silakan verifikasi email Anda
            untuk mengaktifkan akun.
          </p>

          <div class="form-actions">
            <button type="button" class="back-button" @click="prevStep">Kembali</button>
            <button
              type="submit"
              class="submit-button"
              :disabled="isLoading"
              :class="{ 'button-loading': isLoading }"
            >
              {{ isLoading ? 'Processing...' : 'Daftar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/AuthStore.js'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

// Add this line to load Font Awesome
onMounted(() => {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
  document.head.appendChild(link)
})

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()
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

// Multi-step registration
const currentStep = ref(1)
const paymentMethod = ref('bank')
const paymentDetails = ref({
  name: '',
  number: '',
  ownerName: '',
})
const accountNumberError = ref('')
const isDropdownOpen = ref(false)

// Options for banks and e-wallets
const bankOptions = ref(['BCA', 'Mandiri', 'BNI', 'BRI'])
const ewalletOptions = ref(['OVO', 'GoPay', 'DANA', 'Shopee'])

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
  },
})

const props = defineProps({
  isLogin: {
    type: Boolean,
    default: false,
  },
})

// Helper function to get step label
const getStepLabel = (step) => {
  switch (step) {
    case 1:
      return 'Informasi Pribadi'
    case 2:
      return 'Informasi Pembayaran'
    case 3:
      return 'Verifikasi'
    default:
      return ''
  }
}

// Validate phone number
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

// Validate account/e-wallet number
const validateAccountNumber = () => {
  // Remove non-digits
  paymentDetails.value.number = paymentDetails.value.number.replace(/\D/g, '')

  const maxLength = paymentMethod.value === 'bank' ? 17 : 13

  if (paymentDetails.value.number && paymentDetails.value.number.length > maxLength) {
    paymentDetails.value.number = paymentDetails.value.number.substring(0, maxLength)
  }

  // Validate for bank (typically 10-17 digits)
  if (paymentMethod.value === 'bank') {
    if (paymentDetails.value.number && paymentDetails.value.number.length < 10) {
      accountNumberError.value = 'Nomor rekening bank minimal 10 digit'
    } else {
      accountNumberError.value = ''
    }
  }
  // Validate for e-wallet (typically 10-13 digits)
  else if (paymentMethod.value === 'ewallet') {
    if (paymentDetails.value.number && paymentDetails.value.number.length < 10) {
      accountNumberError.value = 'Nomor e-wallet minimal 10 digit'
    } else {
      accountNumberError.value = ''
    }
  }
}

// Form validation for step 1
const isStep1Valid = computed(() => {
  if (
    !user.value.name ||
    !user.value.email ||
    !user.value.phone ||
    !user.value.password ||
    !confirmPassword.value
  ) {
    return false
  }

  if (phoneError.value || user.value.password !== confirmPassword.value) {
    return false
  }

  return true
})

// Form validation for step 2
const isStep2Valid = computed(() => {
  if (
    !paymentDetails.value.name ||
    !paymentDetails.value.number ||
    !paymentDetails.value.ownerName ||
    accountNumberError.value
  ) {
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

// Add this watch to reset the name when payment method changes
watch(
  () => paymentMethod.value,
  () => {
    // Reset the payment name when method changes
    paymentDetails.value.name = ''
  },
)

// Navigation between steps
const nextStep = () => {
  if (currentStep.value === 1 && !isStep1Valid.value) {
    toast.error('Silakan lengkapi semua informasi pribadi dengan benar')
    return
  }

  if (currentStep.value === 2 && !isStep2Valid.value) {
    toast.error('Silakan lengkapi semua informasi pembayaran dengan benar')
    return
  }

  currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
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
      // Register with all fields including payment information
      // Add payment details to user object before registration
      user.value.paymentInfo = {
        method: paymentMethod.value,
        name: paymentDetails.value.name,
        accountNumber: paymentDetails.value.number,
        accountName: paymentDetails.value.ownerName,
      }

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
    // Mark as Google sign-in for tracking completion status
    sessionStorage.setItem('googleSignInFlow', 'true')
    const result = await authStore.signInWithGoogle(router)

    // Check if additional info is needed
    if (result && result.needsProfileCompletion) {
      router.push('/complete-profile')
    }
  } catch (error) {
    console.error('Google sign-in error:', error)
  } finally {
    isLoading.value = false
  }
}

const selectOption = (option) => {
  paymentDetails.value.name = option
  isDropdownOpen.value = false
}

// Optional: Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.custom-dropdown')
    if (dropdown && !dropdown.contains(e.target)) {
      isDropdownOpen.value = false
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('click', () => {})
})
</script>

<style scoped>
/* Change font family from Judson to Montserrat */
* {
  font-family: 'Montserrat', sans-serif;
}

/* Fix container centering */
.auth-container {
  display: flex;
  width: 100%;
  max-width: 1200px;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  margin: 0 auto; /* Center horizontally */
  box-sizing: border-box; /* Include padding in width calculation */
}

/* Fix content centering */
.auth-content {
  flex: 1;
  padding: 3rem 4rem;
  max-width: 600px;
  order: 1;
  margin: 0 auto; /* Center content */
  width: 100%; /* Ensure full width */
  box-sizing: border-box; /* Include padding in width */
}

/* Fix input styling to prevent truncation */
.auth-input {
  width: 100%;
  padding: 1rem 1.5rem;
  border: 2px solid #c2c2c2;
  border-radius: 50px;
  background-color: #e8ba38;
  font-size: 1.1rem;
  color: #000000;
  transition: border-color 0.3s ease;
  box-sizing: border-box; /* Fix sizing calculation */
  max-width: 100%; /* Prevent overflow */
  text-overflow: ellipsis; /* Handle text overflow */
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

/* Better center form */
.auth-form {
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-group {
  margin-bottom: 1.5rem;
  width: 100%; /* Full width */
  position: relative; /* For positioning children */
}

/* Form labels */
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
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

.back-button {
  padding: 1rem;
  border: 1px solid #02163b;
  border-radius: 50px;
  background-color: transparent;
  color: #02163b;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 1rem;
  width: 45%;
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
  width: 100%; /* Change from 65% to 100% for full width */
  max-width: 400px; /* Add a maximum width to prevent it from being too wide on large screens */
  margin: 0 auto;
  display: block;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  width: 100%; /* Ensure the container is full width */
}

.google-button:hover,
.submit-button:hover {
  background-color: #0f3172; /* Even darker on hover */
  color: #ffffff;
  transform: translateY(-1px); /* Slight lift effect */
}

.back-button:hover {
  background-color: rgba(2, 22, 59, 0.1);
  transform: translateY(-1px);
}

.google-button:active,
.submit-button:active,
.back-button:active {
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

/* Step indicator styles */
.step-indicator {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
  position: relative;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-weight: bold;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background-color: #02163b;
  color: white;
}

.step.complete .step-number {
  background-color: #4caf50;
  color: white;
}

.step-label {
  font-size: 0.8rem;
  color: #666;
}

.step.active .step-label,
.step.complete .step-label {
  color: #02163b;
  font-weight: 600;
}

.step-line {
  position: absolute;
  top: 15px;
  left: 15%;
  right: 15%;
  height: 2px;
  background-color: #e0e0e0;
  z-index: 0;
}

/* Payment method options */
.payment-method-options {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.payment-option {
  flex: 1;
  padding: 1rem;
  border: 2px solid rgba(2, 22, 59, 0.3); /* Changed from #e0e0e0 to blue with opacity */
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-option.selected {
  border-color: #02163b;
  background-color: rgba(2, 22, 59, 0.05);
}

.payment-option i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  display: block;
  color: #02163b; /* Add blue color to icons */
}

/* Review section styles */
.review-section {
  background-color: rgba(232, 186, 56, 0.2);
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
}

.review-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #02163b;
  font-size: 1.2rem;
}

.review-item {
  display: flex;
  margin-bottom: 0.75rem;
}

.review-label {
  font-weight: 600;
  width: 120px;
  color: #555;
}

.review-value {
  flex: 1;
}

.info-text {
  background-color: rgba(25, 118, 210, 0.1);
  padding: 1rem;
  border-radius: 8px;
  color: #1976d2;
  margin-bottom: 1.5rem;
}

/* Dropdown styles */
.dropdown-icon {
  color: #02163b; /* Make dropdown icon blue */
}

.dropdown-item.selected {
  background-color: rgba(2, 22, 59, 0.1);
  font-weight: 500;
}

.check-icon {
  position: absolute;
  left: 0.75rem;
  color: #02163b; /* Ensure check icon is blue */
}

/* Mobile improvements */
@media (max-width: 768px) {
  .auth-container {
    flex-direction: column;
    min-height: 100vh;
    border-radius: 0;
    padding: 0;
    background-color: #fff;
    width: 100%;
  }

  /* Hide logo on mobile */
  .logo-container {
    display: none;
  }

  .auth-content {
    padding: 1.5rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    padding-left: 20px;
    padding-right: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 auto; /* Ensure proper centering */
    order: 1; /* Reset order to ensure proper display */
  }

  /* Add additional centering for auth-title */
  .auth-title {
    text-align: center;
    width: 100%;
    margin: 1rem 0 2rem;
  }

  .auth-form {
    padding: 0;
    width: 100%;
    display: flex;
    align-items: center; /* Center form items */
  }

  /* Ensure input fields don't get cut off and are centered properly */
  .auth-input {
    padding: 0.9rem 1.2rem;
    font-size: 1rem;
    border-radius: 12px;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  /* Fix button widths for mobile */
  .submit-button {
    max-width: 100%; /* Remove max-width restriction on mobile */
  }

  /* When there are two buttons in form-actions (back and next) */
  .form-actions {
    width: 100%;
    flex-direction: column-reverse; /* Stack buttons with primary action on top */
    gap: 1rem;
  }

  /* Make back button full width too when in multi-step form */
  .back-button {
    width: 100%;
    margin-right: 0;
    margin-top: 0.5rem;
  }

  /* Register container full width */
  .register-container {
    width: 100%;
  }

  /* Step indicator needs more breathing room */
  .step-indicator {
    width: 100%;
    margin-bottom: 2rem;
  }

  /* Ensure auth links are centered */
  .auth-links {
    text-align: center;
    width: 100%;
  }
}

/* Fix button widths */
.google-button,
.submit-button,
.back-button {
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .submit-button,
  .back-button {
    max-width: 100%;
  }
}

/* Add to your existing <style> section */
.button-loading {
  background-color: #0f3172 !important; /* Darker shade when loading */
  cursor: not-allowed !important;
  opacity: 0.7;
}

.google-button:disabled,
.submit-button:disabled,
.back-button:disabled {
  cursor: not-allowed;
  transform: none !important;
  opacity: 0.7;
}

.toggle-password svg {
  color: #02163b;
  width: 20px;
  height: 20px;
}

.button-loading:hover {
  transform: none !important;
  background-color: #0f3172 !important;
}

/* Add to your existing style section */
.custom-select {
  position: relative;
  width: 100%;
}

.custom-select select {
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  padding-right: 2.5rem;
}

.select-arrow {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #02163b;
}

.custom-select select:focus + .select-arrow i {
  transform: rotate(180deg);
}

/* Style for when dropdown is open */
.custom-select select:focus {
  border-color: #8b7355;
  outline: none;
}

/* Custom dropdown styles */
.custom-dropdown {
  position: relative;
  width: 100%;
}

.selected-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border: 2px solid #c2c2c2;
  border-radius: 50px;
  background-color: #e8ba38; /* Changed from white to match other inputs */
  font-size: 1.1rem;
  color: #000000;
  cursor: pointer;
  transition: all 0.2s ease;
}

.selected-option:hover {
  border-color: #02163b;
}

.custom-dropdown.active .selected-option {
  border-color: #02163b;
  box-shadow: 0 0 0 2px rgba(2, 22, 59, 0.1);
}

/* The dropdown menu itself remains white */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 100%;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 300px;
  overflow-y: auto;
}

.dropdown-item {
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  position: relative;
  padding-left: 2.5rem;
}

.dropdown-item:hover {
  background-color: rgba(2, 22, 59, 0.05);
}

.dropdown-item.selected {
  background-color: rgba(2, 22, 59, 0.1);
  font-weight: 500;
}

.check-icon {
  position: absolute;
  left: 0.75rem;
  color: #02163b;
}
</style>
