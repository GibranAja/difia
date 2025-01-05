<!-- AuthComponent.vue -->
<template>
    <div class="auth-container">
      <div class="auth-card">
        <h2 class="auth-title">{{ isLogin ? 'Login' : 'Register' }}</h2>
        
        <form @submit.prevent="handleSubmit">
          <div class="error-message" v-if="isError">
            {{ message }}
          </div>
  
          <!-- Name field (Register only) -->
          <div class="form-group" v-if="!isLogin">
            <label>Name</label>
            <div class="input-group">
              <i class="fas fa-user"></i>
              <input 
                type="text" 
                v-model="user.name"
                placeholder="Enter your name"
                @blur="validateName"
              >
            </div>
            <span class="error" v-if="nameError">{{ nameError }}</span>
          </div>
  
          <!-- Email field -->
          <div class="form-group">
            <label>Email</label>
            <div class="input-group">
              <i class="fas fa-envelope"></i>
              <input 
                type="email" 
                v-model="user.email"
                placeholder="Enter your email"
                @blur="validateEmail"
              >
            </div>
            <span class="error" v-if="emailError">{{ emailError }}</span>
          </div>
  
          <!-- Password field -->
          <div class="form-group">
            <label>Password</label>
            <div class="input-group">
              <i class="fas fa-lock"></i>
              <input 
                :type="showPassword ? 'text' : 'password'"
                v-model="user.password"
                placeholder="Enter your password"
                @blur="validatePassword"
              >
              <i 
                class="password-toggle"
                :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                @click="showPassword = !showPassword"
              ></i>
            </div>
            <span class="error" v-if="passwordError">{{ passwordError }}</span>
          </div>
  
          <button 
            type="submit" 
            class="auth-button"
            :class="{
              'processing': buttonState === 'processing',
              'failed': buttonState === 'failed'
            }"
            :disabled="!isFormValid || buttonState === 'processing'"
          >
            {{ buttonText }}
          </button>
        </form>
  
        <div class="auth-switch">
          <router-link :to="isLogin ? '/register' : '/login'">
            {{ isLogin ? "Don't have an account? Register" : 'Already have an account? Login' }}
          </router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useAuthStore } from '../stores/AuthStore.js'
  import { storeToRefs } from 'pinia'
  import { useRouter } from 'vue-router'
  
  const authStore = useAuthStore()
  const router = useRouter()
  const { user, isError, message } = storeToRefs(authStore)
  const { authUser } = authStore
  
  const showPassword = ref(false)
  const nameError = ref('')
  const emailError = ref('')
  const passwordError = ref('')
  const buttonState = ref('default') // 'default' | 'processing' | 'failed'
  
  const props = defineProps({
    isLogin: {
      type: Boolean,
      default: false
    }
  })
  
  const buttonText = computed(() => {
    switch (buttonState.value) {
      case 'processing':
        return 'Processing...'
      case 'failed':
        return 'Failed!'
      default:
        return props.isLogin ? 'Login' : 'Register'
    }
  })
  
  const validateName = () => {
    if (!props.isLogin) {
      nameError.value = user.value.name ? '' : 'Name is required'
    }
  }
  
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    emailError.value = !user.value.email 
      ? 'Email is required'
      : !emailRegex.test(user.value.email)
      ? 'Invalid email format'
      : ''
  }
  
  const validatePassword = () => {
    passwordError.value = !user.value.password 
      ? 'Password is required'
      : user.value.password.length < 8
      ? 'Password must be at least 8 characters'
      : ''
  }
  
  const isFormValid = computed(() => {
    const basicValidation = !emailError.value && !passwordError.value && user.value.email && user.value.password
    return props.isLogin 
      ? basicValidation
      : basicValidation && !nameError.value && user.value.name
  })
  
  const handleSubmit = async () => {
    buttonState.value = 'processing'
    try {
      // Pass router instance to authUser
      await authUser(props.isLogin, router)
    } catch {
      buttonState.value = 'failed'
      setTimeout(() => {
        buttonState.value = 'default'
      }, 3000)
    }
  }
  </script>
  
  <style scoped>
  .auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
    background-color: #f5f5f5;
  }
  
  .auth-card {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
  }
  
  .auth-title {
    text-align: center;
    color: #333;
    margin-bottom: 2rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .input-group {
    position: relative;
    display: flex;
    align-items: center;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 0.5rem;
  }
  
  .input-group i {
    color: #666;
    margin-right: 10px;
  }
  
  .input-group input {
    border: none;
    outline: none;
    width: 100%;
    padding: 0.5rem;
  }
  
  .password-toggle {
    cursor: pointer;
  }
  
  .error {
    color: red;
    font-size: 0.8rem;
    margin-top: 0.5rem;
  }
  
  .auth-button {
    width: 100%;
    padding: 0.8rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.3s ease;
  }
  
  .auth-button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  .auth-button:hover:not(:disabled) {
    background: #0056b3;
  }
  
  .auth-button.processing {
    background: #004494;
    cursor: not-allowed;
  }
  
  .auth-button.failed {
    background: #dc3545;
    cursor: not-allowed;
  }
  
  .auth-switch {
    text-align: center;
    margin-top: 1rem;
  }
  
  .auth-switch a {
    color: #007bff;
    text-decoration: none;
  }
  </style>