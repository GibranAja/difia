<template>
  <div class="verify-container">
    <h1>Enter Verification Code</h1>
    <p>We've sent a 6-digit code to {{ maskEmail(email) }}</p>

    <form @submit.prevent="handleSubmit" class="verify-form">
      <div class="code-inputs">
        <input
          v-for="(n, index) in 6"
          :key="index"
          type="text"
          maxlength="1"
          v-model="code[index]"
          @input="handleInput($event, index)"
          @keydown.delete="handleBackspace($event, index)"
          ref="inputs"
          class="code-input"
        />
      </div>

      <div class="resend-section">
        <button 
          type="button" 
          @click="resendCode"
          :disabled="cooldown > 0"
          class="resend-btn"
        >
          {{ cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code' }}
        </button>
      </div>

      <button type="submit" class="submit-btn" :disabled="!isCodeComplete">
        Verify Code
      </button>
    </form>
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
const code = ref(['','','','','',''])
const inputs = ref([])
const cooldown = ref(0)
let cooldownTimer = null

// Redirect if no email in store
if (!email) {
  router.push('/forgot-password')
}

const isCodeComplete = computed(() => {
  return code.value.every(digit => digit.length === 1)
})

const maskEmail = (email) => {
  if (!email) return ''
  const [username, domain] = email.split('@')
  return `${username[0]}${new Array(username.length-1).join('*')}@${domain}`
}

const handleInput = (event, index) => {
  const value = event.target.value
  if (value.length > 0 && index < 5) {
    inputs.value[index + 1].focus()
  }
}

const handleBackspace = (event, index) => {
  if (event.target.value === '' && index > 0) {
    inputs.value[index - 1].focus()
  }
}

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
  const enteredCode = code.value.join('')
  if (enteredCode === String(authStore.verificationCode)) {
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
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
  text-align: center;
}

.code-inputs {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 20px 0;
}

.code-input {
  width: 40px;
  height: 40px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 20px;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #e8ba38;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
}

.submit-btn:disabled {
  background: #ccc;
}

.resend-section {
  margin: 20px 0;
}

.resend-btn {
  background: none;
  border: none;
  color: #e8ba38;
  cursor: pointer;
}

.resend-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}
</style>