<template>
  <div class="reset-container">
    <div class="content-wrapper">
      <div class="left-section">
        <div class="header-section">
          <h1 class="title">Atur Kata Sandi</h1>
          <p class="subtitle">
            Kata sandi anda sebelumnya telah diatur ulang<br />
            Silakan atur kata sandi baru untuk akun Anda.
          </p>
        </div>

        <div class="form-section">
          <div class="input-group">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              placeholder="Buat Kata Sandi"
              required
              class="auth-input"
            />
            <button 
              type="button" 
              class="eye-button"
              @click="showPassword = !showPassword"
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>

          <div class="input-group">
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="confirmPassword"
              placeholder="Masukan Ulang Kata Sandi"
              required
              class="auth-input"
            />
            <button 
              type="button" 
              class="eye-button"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>

          <button 
            @click="handleSubmit" 
            class="submit-button"
            :disabled="loading"
          >
            Atur Kata Sandi
          </button>
        </div>
      </div>

      <div class="illustration">
        <img 
          src="../../assets/Logo Difia Haki.png" 
          alt="Laptop illustration" 
          class="laptop-image"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
// Script remains unchanged
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
const showConfirmPassword = ref(false)
const loading = ref(false)

const handleSubmit = async () => {
  if (password.value !== confirmPassword.value) {
    toast.error('Kata sandi tidak cocok')
    return
  }

  if (password.value.length < 6) {
    toast.error('Kata sandi minimal 6 karakter')
    return
  }

  try {
    loading.value = true
    await authStore.updatePassword(password.value)
    toast.success('Kata sandi berhasil diperbarui')
    router.push('/login')
  } catch (error) {
    toast.error('Gagal memperbarui kata sandi')
    console.error('Reset password error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reset-container {
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
}

.content-wrapper {
  width: 100%;
  max-width: 1200px;
  margin-top: 5vh;
  display: flex;
  gap: 40px;
  align-items: center;
}

.left-section {
  flex: 1;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  gap: 16px; /* Reduced gap between header and form */
  min-height: 500px;
}

.header-section {
  width: 100%;
}

.title {
  font-size: 32px;
  font-weight: 600;
  color: #000;
  margin-bottom: 8px; /* Reduced bottom margin */
}

.subtitle {
  color: #666;
  line-height: 1.5;
  margin-bottom: 8px; /* Added small bottom margin */
}

.form-section {
  width: 100%;
}

.input-group {
  position: relative;
  margin-bottom: 24px;
}

.auth-input {
  width: 26rem;
  padding: 12px 16px;
  border: 2px solid #FFB800;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
}

.auth-input::placeholder {
  color: #999;
}

.eye-button {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #FFB800;
}

.submit-button {
  width: 100%;
  padding: 12px 16px;
  background: #001F3F;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 16px;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background: #003366;
}

.submit-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.illustration {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -9rem;
}

.laptop-image {
  width: 300px;
  height: auto;
  object-fit: contain;
}

@media (max-width: 768px) {
  .reset-container {
    padding: 20px;
    height: 100vh;
  }

  .content-wrapper {
    margin-top: 0;
    flex-direction: column;
    gap: 24px;
  }

  .left-section {
    min-height: auto;
    gap: 16px; /* Maintained consistent gap */
  }

  .header-section {
    text-align: center;
  }

  .form-section {
    order: 3;
    width: 100%;
    max-width: 100%;
  }

  .illustration {
    order: 2;
    min-height: auto;
  }

  .laptop-image {
    width: 200px;
  }
}
</style>