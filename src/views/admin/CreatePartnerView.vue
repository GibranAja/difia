<template>
  <div class="create-partner-container">
    <h1>{{ isEditing ? 'Edit Partner' : 'Tambah Partner Baru' }}</h1>

    <form @submit.prevent="handleSubmit" class="partner-form">
      <div class="form-group">
        <label for="name">Nama Partner</label>
        <input
          type="text"
          id="name"
          v-model="formData.name"
          required
          placeholder="Masukkan nama partner"
        />
        <span class="error-message" v-if="errors.name">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label>Logo Partner</label>
        <div class="image-upload">
          <input
            type="file"
            @change="handleImageUpload"
            accept="image/*"
            :required="!isEditing && !formData.image"
          />
          <div v-if="formData.image" class="image-preview">
            <img :src="formData.image" alt="Preview" />
            <button type="button" @click="removeImage" class="remove-image">×</button>
          </div>
        </div>
        <span class="error-message" v-if="errors.image">{{ errors.image }}</span>
        <div class="image-info" v-if="imageSize">
          Image Size: {{ (imageSize / 1024 / 1024).toFixed(2) }}MB
        </div>
      </div>

      <div class="form-actions">
        <button type="button" @click="goBack" class="cancel-btn">Batal</button>
        <button type="submit" class="submit-btn" :disabled="isSubmitting || !isFormValid">
          {{ isSubmitting ? 'Menyimpan...' : isEditing ? 'Update' : 'Tambah' }} Partner
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePartnerStore } from '@/stores/PartnerStore'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const partnerStore = usePartnerStore()
const toast = useToast()

const isEditing = computed(() => !!route.params.id)
const isSubmitting = ref(false)
const errors = ref({})
const imageSize = ref(0)

// Image validation constants
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

const formData = ref({
  name: '',
  image: '',
  imageFile: null
})

// Form validation
const isFormValid = computed(() => {
  return formData.value.name.trim() && (!isEditing.value || formData.value.image)
})

// Resize image before uploading
const resizeImage = (file) => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    image.onload = () => {
      const maxWidth = 1200
      const maxHeight = 1200
      let width = image.width
      let height = image.height

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(image, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }

    image.onerror = reject
    image.src = URL.createObjectURL(file)
  })
}

// Handle image upload
const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  errors.value.image = ''

  if (file) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.value.image = 'Hanya file JPEG, PNG, GIF, dan WebP yang diperbolehkan'
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      errors.value.image = 'Ukuran gambar tidak boleh melebihi 5MB'
      return
    }

    try {
      const base64String = await resizeImage(file)
      formData.value.image = base64String
      formData.value.imageFile = file
      imageSize.value = file.size
    } catch (error) {
      console.error('Error processing image:', error)
      errors.value.image = 'Error saat memproses gambar. Silakan coba lagi.'
    }
  }
}

// Remove image
const removeImage = () => {
  formData.value.image = ''
  formData.value.imageFile = null
  imageSize.value = 0
  const fileInput = document.querySelector('input[type="file"]')
  if (fileInput) fileInput.value = ''
}

// Load existing partner data
const loadPartnerData = () => {
  const partner = partnerStore.partners.find(item => item.id === route.params.id)
  if (partner) {
    formData.value = {
      name: partner.name,
      image: partner.image,
      imageFile: null
    }
  }
}

// Form submission
const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    isSubmitting.value = true
    const partnerData = {
      name: formData.value.name.trim(),
      imageFile: formData.value.imageFile
    }

    let result
    if (isEditing.value) {
      result = await partnerStore.updatePartner(route.params.id, partnerData)
    } else {
      result = await partnerStore.addPartner(partnerData)
    }

    if (result.success) {
      toast.success(isEditing.value ? 'Partner updated successfully' : 'Partner added successfully')
      router.push('/admin/partner')
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('Error saving partner:', error)
    toast.error('Failed to save partner: ' + error.message)
  } finally {
    isSubmitting.value = false
  }
}

const validateForm = () => {
  errors.value = {}

  if (!formData.value.name.trim()) {
    errors.value.name = 'Nama partner harus diisi'
  }

  if (!isEditing.value && !formData.value.image) {
    errors.value.image = 'Logo partner harus diunggah'
  }

  return Object.keys(errors.value).length === 0
}

const goBack = () => {
  router.push('/admin/partner')
}

onMounted(() => {
  if (isEditing.value) {
    loadPartnerData()
  }
})
</script>

<style scoped>
.create-partner-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.create-partner-container h1 {
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.partner-form {
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

.form-group input[type="text"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.image-upload {
  border: 2px dashed #ddd;
  padding: 20px;
  border-radius: 4px;
  margin-top: 10px;
}

.image-preview {
  position: relative;
  margin-top: 15px;
  max-width: 300px;
}

.image-preview img {
  width: 100%;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.remove-image {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.submit-btn,
.cancel-btn {
  padding: 10px 25px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.submit-btn {
  background-color: #4caf50;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background-color: #45a049;
  transform: translateY(-1px);
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
  transform: translateY(-1px);
}

.error-message {
  color: #f44336;
  font-size: 0.875rem;
  margin-top: 4px;
  display: block;
}

.image-info {
  margin-top: 8px;
  font-size: 0.875rem;
  color: #666;
}

@media (max-width: 768px) {
  .create-partner-container {
    padding: 15px;
  }

  .partner-form {
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