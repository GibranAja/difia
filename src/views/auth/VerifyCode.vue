<template>
  <div class="verify-container">
    <div class="content-wrapper">
      <h1 class="title">Verifikasi Kata Sandi</h1>
      <p class="subtitle">Kode autentikasi telah dikirim ke email Anda.</p>

      <form @submit.prevent="handleSubmit" class="verify-form">
        <div class="input-wrapper">
          <div class="input-container">
            <input
              type="text"
              inputmode="numeric"
              placeholder="Masukan Kode"
              v-model="combinedCode"
              class="code-input"
            />
          </div>
        </div>

        <div class="resend-section">
          <span class="resend-text">Belum menerima kode? </span>
          <button 
            type="button" 
            @click="resendCode"
            :disabled="cooldown > 0"
            class="resend-btn"
          >
            Kirim Ulang
          </button>
        </div>

        <button type="submit" class="submit-btn" :disabled="!isCodeComplete">
          Verifikasi
        </button>
      </form>
    </div>
    
    <img src="../../assets/Logo Difia Haki.png" alt="Logo" class="logo" />
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const email = authStore.resetEmail
const combinedCode = ref('')
const cooldown = ref(0)
let cooldownTimer = null

if (!email) {
  router.push('/forgot-password')
}

const isCodeComplete = computed(() => {
  return combinedCode.value.length === 6
})

const resendCode = async () => {
  if (cooldown.value > 0) return

  try {
    const newCode = Math.floor(100000 + Math.random() * 900000)
    authStore.setVerificationCode(newCode)
    await authStore.sendVerificationEmail(email, newCode)
    
    cooldown.value = 30
    cooldownTimer = setInterval(() => {
      cooldown.value--
      if (cooldown.value <= 0) {
        clearInterval(cooldownTimer)
      }
    }, 1000)
    
    toast.success('New code sent!')
  } catch (error) {
    toast.error('Error sending new code')
    console.error('Resend code error:', error)
  }
}

const handleSubmit = () => {
  if (combinedCode.value === String(authStore.verificationCode)) {
    router.push('/reset-password')
  } else {
    toast.error('Invalid verification code')
  }
}

onBeforeUnmount(() => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer)
  }
})
</script>

<style scoped>
.verify-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
  height: 100vh; /* Changed from min-height to height */
  overflow: hidden; /* Added to prevent scrolling */
  box-sizing: border-box; /* Added to include padding in height calculation */
}

.content-wrapper {
  flex: 1;
  max-width: 500px;
  padding: 40px;
  display: flex;  /* Added for vertical centering of content */
  flex-direction: column;
  justify-content: center;  /* Added for vertical centering */
}

.logo {
  width: 300px;  /* Increased from 120px */
  height: auto;  /* Added to maintain aspect ratio */
  object-fit: contain;  /* Added to maintain aspect ratio */
  margin: 40px;  /* Changed from margin-bottom only */
}

.title {
  font-size: 32px;
  color: #1a1a1a;
  margin-bottom: 16px;
  font-weight: 600;
}

.subtitle {
  color: #666;
  margin-bottom: 32px;
}

.input-wrapper {
  margin-bottom: 24px;
}

.input-container {
  position: relative;
  width: 100%;
}

.code-input {
  width: 27rem;
  padding: 16px;
  border: 2px solid #FFB800;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  padding-right: 48px;
}

.eye-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #666;
}

.resend-section {
  margin: 24px 0;
}

.resend-text {
  color: #666;
}

.resend-btn {
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  font-weight: 500;
  padding: 0;
  margin-left: 4px;
}

.resend-btn:disabled {
  color: #999;
  cursor: not-allowed;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: #000033;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
}

.submit-btn:disabled {
  background: #ccc;
}

@media (max-width: 768px) {
  .verify-container {
    flex-direction: column-reverse;
    padding: 20px;
    height: 100vh; /* Ensure it takes full viewport height */
    overflow: hidden; /* Prevent scrolling on mobile */
  }

  .logo {
    width: 200px;
    margin: 20px auto;
  }

  .content-wrapper {
    padding: 20px;
    overflow-y: auto; /* Allow scrolling within content if needed */
  }

  .code-input {
    width: 100%; /* Make input responsive */
    max-width: 27rem; /* Keep maximum width */
  }
}
</style>