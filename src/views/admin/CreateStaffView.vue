<!-- views/admin/CreateStaffView.vue -->
<template>
  <div class="create-staff-container">
    <h1>{{ isEditing ? 'Edit Staff' : 'Tambah Staff Baru' }}</h1>

    <form @submit.prevent="handleSubmit" class="staff-form">
      <div class="form-group">
        <label for="name">Nama Staff</label>
        <input
          type="text"
          id="name"
          v-model="formData.name"
          required
          placeholder="Masukkan nama staff"
        />
        <span class="error-message" v-if="errors.name">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label for="email">Email Staff</label>
        <input
          type="email"
          id="email"
          v-model="formData.email"
          required
          placeholder="Masukkan email staff"
          :disabled="isEditing"
        />
        <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
      </div>

      <div class="form-group" v-if="!isEditing">
        <label for="password">Password</label>
        <div class="password-input-group">
          <input
            :type="showPassword ? 'text' : 'password'"
            id="password"
            v-model="formData.password"
            required
            placeholder="Masukkan password"
          />
          <button 
            type="button" 
            class="toggle-password"
            @click="showPassword = !showPassword"
          >
            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </button>
        </div>
        <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
      </div>

      <div class="form-actions">
        <button type="button" @click="goBack" class="cancel-btn">Batal</button>
        <button 
          type="submit" 
          class="submit-btn" 
          :disabled="isSubmitting || !isFormValid"
        >
          {{ isSubmitting ? 'Menyimpan...' : isEditing ? 'Update' : 'Tambah' }} Staff
        </button>
      </div>
    </form>

    <EmailExistsModal
      v-if="showEmailExistsModal"
      :email="formData.email"
      @cancel="showEmailExistsModal = false"
      @recovered="handleRecoverySuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStaffStore } from '@/stores/StaffStore'
import { useToast } from 'vue-toastification'
import EmailExistsModal from '@/components/admin/EmailExistsModal.vue'

const route = useRoute()
const toast = useToast()
const router = useRouter()
const staffStore = useStaffStore()

const isEditing = computed(() => !!route.params.id)
const isSubmitting = ref(false)
const showPassword = ref(false)
const errors = ref({})
const showEmailExistsModal = ref(false)

const formData = ref({
  name: '',
  email: '',
  password: ''
})

const validateForm = () => {
  errors.value = {}

  if (!formData.value.name.trim()) {
    errors.value.name = 'Nama staff harus diisi'
  }

  if (!isEditing.value) {
    if (!formData.value.email.trim()) {
      errors.value.email = 'Email staff harus diisi'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
      errors.value.email = 'Format email tidak valid'
    }

    if (!formData.value.password) {
      errors.value.password = 'Password harus diisi'
    } else if (formData.value.password.length < 6) {
      errors.value.password = 'Password minimal 6 karakter'
    }
  }

  return Object.keys(errors.value).length === 0
}

const isFormValid = computed(() => {
  if (isEditing.value) {
    return formData.value.name.trim()
  }
  return (
    formData.value.name.trim() &&
    formData.value.email.trim() &&
    formData.value.password.length >= 6
  )
})

const loadStaffData = async () => {
  try {
    const staff = staffStore.staffItems.find(item => item.id === route.params.id)
    if (staff) {
      formData.value = {
        name: staff.name,
        email: staff.email,
        password: '' // Password is not loaded for security
      }
    } else {
      throw new Error('Staff not found')
    }
  } catch (error) {
    console.error('Error loading staff:', error)
    router.push('/admin/staff')
  }
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    isSubmitting.value = true

    const staffData = {
      name: formData.value.name.trim(),
      email: formData.value.email.trim(),
      password: formData.value.password
    }

    let result
    if (isEditing.value) {
      result = await staffStore.updateStaff(route.params.id, staffData)
    } else {
      result = await staffStore.addStaff(staffData)
    }

    if (result.success) {
      router.push('/admin/staff')
    } else if (result.emailExists) {
      // Show the EmailExistsModal when email already exists
      showEmailExistsModal.value = true
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('Error saving staff:', error)
    toast.error('Gagal menyimpan data staff: ' + error.message)
  } finally {
    isSubmitting.value = false
  }
}

const handleRecoverySuccess = () => {
  showEmailExistsModal.value = false
  router.push('/admin/staff')
}

const goBack = () => {
  router.push('/admin/staff')
}

onMounted(() => {
  if (isEditing.value) {
    loadStaffData()
  }
})
</script>

<style scoped>
.create-staff-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.create-staff-container h1 {
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.staff-form {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.password-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.toggle-password {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 5px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.submit-btn,
.cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.submit-btn {
  background-color: #4CAF50;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #f44336;
  color: white;
}

.cancel-btn:hover {
  background-color: #da190b;
}

.error-message {
  color: #f44336;
  font-size: 0.875rem;
  margin-top: 4px;
  display: block;
}

@media (max-width: 768px) {
  .create-staff-container {
    padding: 15px;
  }

  .staff-form {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .submit-btn,
  .cancel-btn {
    width: 100%;
  }
}
</style>