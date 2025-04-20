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
  background-color: #f8f9fa;
  padding: 20px;
  font-family: 'Montserrat', sans-serif;
}

.verify-email-content {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.verify-email-logo {
  margin-bottom: 2rem;
  text-align: center;
}

.difia-logo {
  width: 160px;
  height: auto;
}

.verify-email-box {
  width: 100%;
  background-color: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.verify-title {
  font-size: 2rem;
  color: #02163b;
  font-weight: 700;
  margin-bottom: 2.5rem;
  position: relative;
}

.verify-title::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 4px;
  background-color: #e8ba38;
  border-radius: 2px;
}

/* Success state */
.verification-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadeIn 0.5s ease-in;
}

.success-icon {
  font-size: 4rem;
  color: #28a745;
  margin-bottom: 1.5rem;
}

.verified-btn {
  margin-top: 2rem;
  background-color: #02163b;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 300px;
}

.verified-btn:hover {
  background-color: #0f3172;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(2, 22, 59, 0.2);
}

.verified-btn:active {
  transform: translateY(0);
}

/* Pending state */
.verification-pending {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadeIn 0.5s ease-in;
}

.pending-icon {
  font-size: 4rem;
  color: #e8ba38;
  margin-bottom: 1.5rem;
  animation: pulse 2s infinite ease-in-out;
}

.verification-pending h2 {
  font-size: 1.5rem;
  color: #02163b;
  margin-bottom: 1rem;
  font-weight: 600;
}

.verification-pending p {
  color: #555;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.verification-pending p strong {
  color: #02163b;
  font-weight: 600;
}

.verification-instructions {
  background-color: rgba(232, 186, 56, 0.1);
  border-left: 4px solid #e8ba38;
  padding: 1rem;
  border-radius: 0 8px 8px 0;
  text-align: left;
  margin: 1.5rem 0;
  font-size: 0.95rem;
}

.resend-section {
  margin-top: 2rem;
  width: 100%;
}

.resend-btn {
  background-color: white;
  color: #02163b;
  border: 2px solid #02163b;
  border-radius: 50px;
  padding: 0.8rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.resend-btn:hover:not(:disabled) {
  background-color: #02163b;
  color: white;
}

.resend-btn:disabled {
  border-color: #ccc;
  color: #999;
  cursor: not-allowed;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .verify-email-box {
    padding: 1.8rem;
  }

  .verify-title {
    font-size: 1.8rem;
  }

  .verification-pending h2 {
    font-size: 1.3rem;
  }

  .verification-instructions {
    font-size: 0.9rem;
  }
}
</style>
