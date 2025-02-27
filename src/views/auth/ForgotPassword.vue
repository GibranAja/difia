<template>
  <div class="reset-container">
    <div class="reset-content">
      <div class="reset-form-section">
        <h1 class="title">Atur Ulang Kata Sandi</h1>
        <p class="subtitle">
          Masukkan Email yang terhubung dengan akun Difia untuk mengatur ulang kata sandi
        </p>

        <form @submit.prevent="handleSubmit" class="reset-form">
          <div class="form-group">
            <label class="form-label">Email</label>
            <div class="form-field-container">
              <input
                type="email"
                v-model="email"
                placeholder="Contoh: Difia@gmail.com"
                required
                class="form-input"
              />
            </div>
          </div>

          <div class="form-field-container">
            <button type="submit" class="submit-btn" :disabled="loading">
              {{ loading ? 'Memproses...' : 'Atur Ulang Kata Sandi' }}
            </button>
          </div>
        </form>
      </div>

      <div class="image-section">
        <img
          src="../../assets/Logo Difia Haki.png"
          alt="Reset Password Illustration"
          class="reset-image"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/config/firebase'
import { sendPasswordResetEmail } from 'firebase/auth'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()
const email = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  try {
    loading.value = true

    // Send password reset email using Firebase Auth
    await sendPasswordResetEmail(auth, email.value)

    toast.success('Email reset password telah dikirim. Silakan cek inbox email Anda.')
    router.push('/login')
  } catch (error) {
    let errorMessage = 'Gagal mengirim email reset password'

    // Handle specific Firebase Auth errors
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'Email tidak terdaftar'
        break
      case 'auth/invalid-email':
        errorMessage = 'Format email tidak valid'
        break
      case 'auth/too-many-requests':
        errorMessage = 'Terlalu banyak permintaan. Silakan coba lagi nanti'
        break
    }

    toast.error(errorMessage)
    console.error('Reset password error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reset-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #ffffff;
}

.reset-content {
  width: 100%;
  max-width: 1200px;
  display: flex;
  gap: 40px;
  align-items: center;
  justify-content: space-between;
}

.reset-form-section {
  flex: 1;
  max-width: 600px;
}

.title {
  font-size: 32px;
  font-weight: bold;
  color: #000000;
  margin-bottom: 16px;
}

.subtitle {
  font-size: 16px;
  color: #666666;
  margin-bottom: 32px;
  line-height: 1.5;
  max-width: 500px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: #000000;
  margin-bottom: 8px;
  text-align: left;
}

.form-field-container {
  width: 350px; /* Fixed width for both input and button containers */
}

.form-input {
  width: 19.8rem;
  padding: 12px 16px;
  border: 2px solid #ffb800;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
}

.form-input::placeholder {
  color: #999999;
}

.submit-btn {
  width: 100%;
  padding: 12px 16px;
  background-color: #01174f;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background-color: #022177;
}

.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.image-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.reset-image {
  max-width: 100%;
  height: auto;
}

@media (max-width: 768px) {
  .reset-content {
    flex-direction: column-reverse;
  }

  .image-section {
    margin-bottom: 32px;
  }

  .reset-form-section {
    width: 100%;
  }

  .form-field-container {
    width: 100%; /* Full width on mobile */
  }
}
</style>
