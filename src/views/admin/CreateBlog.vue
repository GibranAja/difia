<template>
  <div class="create-blog-container">
    <h1>{{ isEditing ? 'Edit Artikel' : 'Tambah Artikel' }}</h1>

    <form @submit.prevent="handleSubmit" class="blog-form">
      <div class="form-group">
        <label for="title">Judul Artikel</label>
        <input
          type="text"
          id="title"
          v-model="formData.title"
          required
          placeholder="Masukkan judul blog"
        />
        <span class="error-message" v-if="errors.title">{{ errors.title }}</span>
      </div>

      <div class="form-group">
        <label>Gambar Artikel</label>
        <div class="image-upload">
          <input
            type="file"
            @change="handleImageUpload"
            accept="image/*"
            :required="!isEditing && !formData.image"
          />
          <div class="image-preview" v-if="formData.image">
            <img :src="formData.image" alt="Preview" />
            <button type="button" @click="removeImage" class="remove-image">×</button>
          </div>
        </div>
        <span class="error-message" v-if="errors.image">{{ errors.image }}</span>
        <div class="image-info" v-if="formData.imageSize">
          Image Size: {{ (formData.imageSize / 1024 / 1024).toFixed(2) }}MB
        </div>
      </div>

      <div class="form-group">
        <label for="description">Deskripsi Artikel</label>
        <textarea
          id="description"
          v-model="formData.description"
          required
          placeholder="Masukkan deskripsi blog"
          rows="10"
          class="description-input"
        ></textarea>
        <span class="error-message" v-if="errors.description">{{ errors.description }}</span>
      </div>

      <div class="form-actions">
        <button type="button" @click="goBack" class="cancel-btn">Cancel</button>
        <button
          type="submit"
          class="submit-btn"
          :disabled="
            isSubmitting ||
            !formData.title.trim() ||
            (!isEditing && !formData.image) ||
            !formData.description.trim()
          "
        >
          {{ isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create' }} Blog
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore } from '@/stores/BlogStore'

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()

const isEditing = computed(() => !!route.params.id)
const isSubmitting = ref(false)
const errors = ref({})

const formData = ref({
  title: '',
  image: '',
  description: '',
  imageSize: 0,
})

// Image validation constants
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

// Validation function
const validateForm = () => {
  errors.value = {}

  if (!formData.value.title.trim()) {
    errors.value.title = 'Title is required'
  }

  if (!isEditing.value && !formData.value.image) {
    errors.value.image = 'Image is required'
  }

  if (!formData.value.description.trim()) {
    errors.value.description = 'Description is required'
  }

  return Object.keys(errors.value).length === 0
}

// Resize image before converting to base64
const resizeImage = (file) => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    image.onload = () => {
      // Maximum dimensions
      const maxWidth = 1200
      const maxHeight = 1200

      let width = image.width
      let height = image.height

      // Calculate new dimensions
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

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw resized image
      ctx.drawImage(image, 0, 0, width, height)

      // Convert to base64
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      resolve(dataUrl)
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
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.value.image = 'Only JPEG, PNG, GIF, and WebP images are allowed'
      return
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      errors.value.image = 'Image size should not exceed 5MB'
      return
    }

    try {
      // Resize and convert to base64
      const base64String = await resizeImage(file)
      formData.value.image = base64String
      formData.value.imageSize = file.size
    } catch (error) {
      console.error('Error processing image:', error)
      errors.value.image = 'Error processing image. Please try again.'
    }
  }
}

// Remove image
const removeImage = () => {
  formData.value.image = ''
  formData.value.imageSize = 0
  const fileInput = document.querySelector('input[type="file"]')
  if (fileInput) fileInput.value = ''
}

// Load existing blog data for editing
onMounted(async () => {
  if (isEditing.value) {
    try {
      const blog = blogStore.getBlogById(route.params.id)
      if (!blog) {
        await blogStore.fetchBlogs()
        const fetchedBlog = blogStore.getBlogById(route.params.id)
        if (!fetchedBlog) {
          throw new Error('Blog not found')
        }
        loadBlogData(fetchedBlog)
      } else {
        loadBlogData(blog)
      }
    } catch (error) {
      console.error('Error loading blog:', error)
      alert('Failed to load blog data')
      router.push('/admin/blog')
    }
  }
})

watch(
  () => ({
    title: formData.value.title,
    image: formData.value.image,
    description: formData.value.description,
  }),
  () => {
    validateForm()
  },
  { deep: true },
)

const loadBlogData = (blog) => {
  formData.value = {
    title: blog.title,
    image: blog.image,
    description: blog.description,
    imageSize: 0, // Reset size for existing image
  }
}

const goBack = () => {
  router.push('/admin/blog')
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    isSubmitting.value = true

    const blogData = {
      title: formData.value.title.trim(),
      description: formData.value.description.trim(),
      image: formData.value.image,
    }

    let result
    if (isEditing.value) {
      result = await blogStore.updateBlog(route.params.id, blogData)
    } else {
      result = await blogStore.addBlog(blogData)
    }

    if (result.success) {
      router.push('/admin/blog')
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('Error saving blog:', error)
    alert('Failed to save blog: ' + error.message)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.create-blog-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.create-blog-container h1 {
  margin-bottom: 30px;
  color: #333;
}

.blog-form {
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

.form-group input[type='text'] {
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
  position: relative;
}

.image-upload input[type='file'] {
  width: 100%;
  margin-bottom: 15px;
}

.image-preview {
  position: relative;
  display: inline-block;
  margin-top: 15px;
}

.image-preview img {
  max-width: 300px;
  max-height: 200px;
  object-fit: contain;
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

.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  resize: vertical;
  min-height: 200px;
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

/* Responsive styles */
@media (max-width: 768px) {
  .create-blog-container {
    padding: 15px;
  }

  .blog-form {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .submit-btn,
  .cancel-btn {
    width: 100%;
  }

  .image-preview img {
    max-width: 100%;
  }
}
</style>
