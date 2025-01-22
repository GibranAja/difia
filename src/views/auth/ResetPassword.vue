<template>
  <div class="reset-container">
    <h1>Reset Password</h1>
    <p>Enter your new password</p>

    <form @submit.prevent="handleSubmit" class="reset-form">
      <div class="form-group">
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="password"
          placeholder="New Password"
          required
          class="auth-input"
        />
      </div>

      <div class="form-group">
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="confirmPassword"
          placeholder="Confirm Password"
          required
          class="auth-input"
        />
      </div>

      <div class="show-password">
        <label>
          <input type="checkbox" v-model="showPassword">
          Show password
        </label>
      </div>

      <button type="submit" class="submit-btn" :disabled="loading">
        {{ loading ? 'Updating...' : 'Update Password' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)

// Redirect if no email in store
if (!authStore.resetEmail) {
  router.push('/forgot-password')
}

const handleSubmit = async () => {
  if (password.value !== confirmPassword.value) {
    toast.error('Passwords do not match')
    return
  }

  if (password.value.length < 6) {
    toast.error('Password must be at least 6 characters')
    return
  }

  try {
    loading.value = true
    await authStore.updatePassword(password.value)
    toast.success('Password updated successfully')
    router.push('/login')
  } catch (error) {
    toast.error('Error updating password')
    console.error('Reset password error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reset-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
  text-align: center;
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

.show-password {
  text-align: left;
  margin-bottom: 20px;
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
</style>