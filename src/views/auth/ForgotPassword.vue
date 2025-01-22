<template>
  <div class="forgot-container">
    <h1>Reset Password</h1>
    <p>Enter your email address to receive a verification code</p>

    <form @submit.prevent="handleSubmit" class="forgot-form">
      <div class="form-group">
        <input
          type="email"
          v-model="email"
          placeholder="Email"
          required
          class="auth-input"
        />
      </div>

      <button type="submit" class="submit-btn" :disabled="loading">
        {{ loading ? 'Sending...' : 'Send Code' }}
      </button>

      <router-link to="/login" class="back-link">
        Back to Login
      </router-link>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const email = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  try {
    loading.value = true
    
    // Check if email exists in users collection
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', email.value))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      toast.error('No account found with this email')
      return
    }

    // Generate random 6 digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000)
    
    // Store email and code in authStore
    authStore.setResetEmail(email.value)
    authStore.setVerificationCode(verificationCode)
    
    // Send verification code email
    await authStore.sendVerificationEmail(email.value, verificationCode)
    
    router.push('/verify-code')
  } catch (error) {
    toast.error('Error sending verification code')
    console.error('Forgot password error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.forgot-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
  text-align: center;
}

.forgot-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.auth-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #e8ba38;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:disabled {
  background: #ccc;
}

.back-link {
  display: block;
  margin-top: 20px;
  color: #666;
  text-decoration: none;
}
</style>