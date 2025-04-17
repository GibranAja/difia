<template>
  <div class="verify-email-container">
    <div class="verify-email-content">
      <div class="verify-email-logo">
        <img src="../../assets/Logo_Difia_Haki.png" alt="DIFIA" class="difia-logo" />
      </div>

      <div class="verify-email-box">
        <h1 class="verify-title">Verifikasi Email</h1>

        <div v-if="isVerified" class="verification-success">
          <i class="fas fa-check-circle success-icon"></i>
          <p>Email Anda telah terverifikasi!</p>
          <button @click="navigateToHome" class="verified-btn">Lanjutkan ke Beranda</button>
        </div>

        <div v-else class="verification-pending">
          <i class="fas fa-envelope pending-icon"></i>
          <h2>Silakan verifikasi email Anda</h2>
          <p>
            Kami telah mengirimkan email verifikasi ke
            <strong>{{ userEmail }}</strong>
          </p>
          <p class="verification-instructions">
            Klik tautan dalam email untuk memverifikasi akun Anda. Jika Anda tidak menerima email,
            periksa folder spam atau klik tombol di bawah untuk mengirim ulang.
          </p>

          <div class="resend-section">
            <button @click="resendEmail" class="resend-btn" :disabled="isLoading || countdown > 0">
              {{
                isLoading
                  ? 'Mengirim...'
                  : countdown > 0
                    ? `Kirim ulang (${countdown})`
                    : 'Kirim ulang email verifikasi'
              }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import { useToast } from 'vue-toastification'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const isVerified = ref(false)
const countdown = ref(60) // Start with initial 60-second countdown
const timer = ref(null)
const checkInterval = ref(null)
const isLoading = ref(false)
const isInitialLoad = ref(true) // Track if this is the initial page load

const userEmail = computed(() => {
  return authStore.currentUser?.email || '...'
})

// Check verification status every 5 seconds
const startVerificationCheck = () => {
  checkInterval.value = setInterval(async () => {
    const verified = await authStore.checkEmailVerification()
    if (verified) {
      isVerified.value = true
      clearInterval(checkInterval.value)

      // Auto-redirect to home page after verification (with a short delay)
      setTimeout(() => {
        navigateToHome()
      }, 2000) // 2 seconds delay to show success message
    }
  }, 5000) // Check every 5 seconds
}

const startCountdown = () => {
  // Start countdown for resend button (60 seconds)
  timer.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer.value)
      if (isInitialLoad.value) {
        isInitialLoad.value = false
      }
    }
  }, 1000)
}

const resendEmail = async () => {
  if (countdown.value > 0) return

  try {
    isLoading.value = true
    await authStore.resendVerificationEmail()
    toast.success('Email verifikasi telah dikirim ulang')

    // Reset countdown for next cooldown
    countdown.value = 60
    startCountdown()
  } catch (error) {
    console.error('Error resending verification:', error)
    toast.error('Gagal mengirim email verifikasi')
  } finally {
    isLoading.value = false
  }
}

const navigateToHome = () => {
  router.push('/')
}

onMounted(async () => {
  // Start initial countdown
  startCountdown()

  // Initial check
  const verified = await authStore.checkEmailVerification()
  isVerified.value = verified

  // If already verified, redirect to home
  if (verified) {
    setTimeout(() => {
      navigateToHome()
    }, 1500) // Small delay to show the verified state
  } else {
    // If not verified, start the interval check
    startVerificationCheck()
  }

  // Check if user is logged in
  if (!authStore.currentUser) {
    toast.error('Sesi tidak valid. Silakan login kembali.')
    router.push('/login')
  }
})

onUnmounted(() => {
  // Clean up intervals
  if (checkInterval.value) clearInterval(checkInterval.value)
  if (timer.value) clearInterval(timer.value)
})
</script>

<style scoped>
.verify-email-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f7f7f7;
  padding: 20px;
}

/* Rest of your CSS remains unchanged */
</style>
