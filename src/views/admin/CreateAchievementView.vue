<!-- src/views/admin/CreateAchievement.vue -->
<template>
  <div class="create-container">
    <h1>{{ isEditing ? 'Edit Penghargaan' : 'Tambah Penghargaan Baru' }}</h1>

    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-group">
        <label for="title">Judul Penghargaan</label>
        <input
          type="text"
          id="title"
          v-model="formData.title"
          required
          placeholder="Masukkan judul penghargaan"
          class="form-input"
        />
        <span class="error-message" v-if="errors.title">{{ errors.title }}</span>
      </div>

      <div class="form-group">
        <label for="description">Deskripsi</label>
        <textarea
          id="description"
          v-model="formData.description"
          rows="4"
          required
          placeholder="Masukkan deskripsi penghargaan"
          class="form-input"
        ></textarea>
        <span class="error-message" v-if="errors.description">{{ errors.description }}</span>
      </div>

      <div class="form-group">
        <label>Foto Penghargaan</label>
        <div class="image-upload">
          <input
            type="file"
            @change="handleImageUpload"
            accept="image/*"
            :required="!isEditing && !formData.image"
          />
          <div class="image-preview" v-if="previewImage">
            <img :src="previewImage" alt="Preview" />
            <button type="button" @click="removeImage" class="remove-image">×</button>
          </div>
        </div>
        <span class="error-message" v-if="errors.image">{{ errors.image }}</span>
        <div class="image-info" v-if="formData.imageSize">
          Image Size: {{ (formData.imageSize / 1024 / 1024).toFixed(2) }}MB
        </div>
      </div>

      <div class="form-actions">
        <button type="button" @click="goBack" class="cancel-btn">Batal</button>
        <button type="submit" class="submit-btn" :disabled="isSubmitting || !isFormValid">
          {{ isSubmitting ? 'Menyimpan...' : isEditing ? 'Update' : 'Tambah' }}
          Penghargaan
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAchievementStore } from '@/stores/AchievementStore'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const achievementStore = useAchievementStore()
const toast = useToast()

const isEditing = computed(() => !!route.params.id)
const isSubmitting = ref(false)
const errors = ref({})
const previewImage = ref(null)

const formData = ref({
  title: '',
  description: '',
  imageFile: null,
  image: '',
  imageSize: null,
})

const validateForm = () => {
  errors.value = {}
  let isValid = true

  if (!formData.value.title.trim()) {
    errors.value.title = 'Judul penghargaan harus diisi'
    isValid = false
  }

  if (!formData.value.description.trim()) {
    errors.value.description = 'Deskripsi harus diisi'
    isValid = false
  }

  if (!isEditing.value && !formData.value.imageFile && !formData.value.image) {
    errors.value.image = 'Foto penghargaan harus diupload'
    isValid = false
  }

  return isValid
}

const isFormValid = computed(() => {
  return (
    formData.value.title.trim() &&
    formData.value.description.trim() &&
    (isEditing.value || formData.value.imageFile || formData.value.image)
  )
})

const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    errors.value.image = 'Ukuran file tidak boleh lebih dari 5MB'
    return
  }

  formData.value.imageFile = file
  formData.value.imageSize = file.size
  const reader = new FileReader()
  reader.onload = (e) => {
    previewImage.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  formData.value.imageFile = null
  formData.value.image = ''
  formData.value.imageSize = null
  previewImage.value = null
}

const goBack = () => {
  router.push('/admin/achievement')
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    isSubmitting.value = true
    const achievementData = {
      title: formData.value.title.trim(),
      description: formData.value.description.trim(),
      imageFile: formData.value.imageFile,
    }

    let result
    if (isEditing.value) {
      result = await achievementStore.updateAchievement(route.params.id, achievementData)
    } else {
      result = await achievementStore.addAchievement(achievementData)
    }

    if (result.success) {
      router.push('/admin/achievement')
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    toast.error('Gagal menyimpan penghargaan: ' + error.message)
  } finally {
    isSubmitting.value = false
  }
}

const loadAchievementData = () => {
  const achievement = achievementStore.achievements.find((item) => item.id === route.params.id)
  if (achievement) {
    formData.value = {
      title: achievement.title,
      description: achievement.description,
      image: achievement.image,
      imageFile: null,
      imageSize: null,
    }
    previewImage.value = achievement.image
  }
}

onMounted(() => {
  if (isEditing.value) {
    loadAchievementData()
  }
})
</script>

<style scoped>
.create-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.create-container h1 {
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.form {
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

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

textarea.form-input {
  resize: vertical;
  min-height: 100px;
}

.image-upload {
  border: 2px dashed #ddd;
  padding: 20px;
  border-radius: 4px;
  text-align: center;
  margin-top: 8px;
}

.image-upload input[type='file'] {
  width: 100%;
}

.image-preview {
  position: relative;
  margin-top: 15px;
  display: inline-block;
}

.image-preview img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 4px;
  object-fit: cover;
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
  gap: 15px;
  justify-content: flex-end;
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
  .create-container {
    padding: 15px;
  }

  .form {
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
