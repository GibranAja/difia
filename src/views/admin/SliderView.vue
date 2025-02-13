<template>
  <div class="slider-container" :class="{ 'sidebar-collapsed': !isSidebarOpen }">
    <LoadComponent v-if="sliderStore.isLoading" />
    
    <template v-else>
      <h1>KELOLA SLIDER</h1>

      <div class="slider-controls">
        <div class="top-controls">
          <label class="upload-btn" :class="{ disabled: isUploading }">
            <input 
              type="file" 
              @change="handleImageUpload" 
              accept="image/*"
              :disabled="isUploading"
              multiple
            >
            {{ isUploading 
              ? `Mengunggah (${uploadProgress.current}/${uploadProgress.total})` 
              : 'Tambah Slider' 
            }}
          </label>
        </div>
      </div>

      <div class="slider-grid">
        <!-- Empty state -->
        <div v-if="!sliderStore.sliderItems.length" class="empty-state">
          <div class="empty-state-content">
            <span class="empty-icon">🖼️</span>
            <h3>Belum ada slider</h3>
            <p>Mulai dengan menambahkan gambar slider baru</p>
          </div>
        </div>

        <!-- Slider items grid -->
        <div v-else class="slider-items">
          <div 
            v-for="slider in sliderStore.sliderItems" 
            :key="slider.id" 
            class="slider-item"
          >
            <div class="image-wrapper">
              <img :src="slider.image" :alt="'Slider ' + slider.id">
              <div class="overlay">
                <button 
                  class="delete-btn"
                  @click="showDeleteConfirmation(slider.id)"
                  :disabled="isDeleting"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div class="item-info">
              <span class="upload-date">
                {{ formatDate(slider.createdAt) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Add NegativeModal -->
    <NegativeModal
      v-if="showDeleteModal"
      title="Hapus Slider"
      message="Apakah Anda yakin ingin menghapus slider ini?"
      :loading="isDeleting"
      @close="closeDeleteModal"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSliderStore } from '@/stores/SliderStore'
import LoadComponent from '@/components/LoadComponent.vue'
import NegativeModal from '@/components/NegativeModal.vue'
import { useToast } from 'vue-toastification'

const toast = useToast()
const sliderStore = useSliderStore()
const isUploading = ref(false)
const isDeleting = ref(false)
const showDeleteModal = ref(false)
const selectedSliderId = ref(null)

const uploadProgress = ref({
  total: 0,
  current: 0
})

defineProps({
  isSidebarOpen: {
    type: Boolean,
    default: true
  }
})

const handleImageUpload = async (event) => {
  const files = Array.from(event.target.files)
  if (!files.length) return

  try {
    isUploading.value = true
    uploadProgress.value = {
      total: files.length,
      current: 0
    }
    
    for (const file of files) {
      try {
        const result = await sliderStore.addSlider(file)
        if (result.success) {
          toast.success(`Slider ${file.name} berhasil ditambahkan`)
        } else {
          toast.error(`Gagal mengunggah ${file.name}: ${result.error}`)
        }
      } catch (error) {
        toast.error(`Error saat mengunggah ${file.name}: ${error.message}`)
      }
      uploadProgress.value.current++
    }
    
    event.target.value = '' // Reset input
  } catch (error) {
    toast.error('Terjadi kesalahan: ' + error.message)
  } finally {
    isUploading.value = false
    uploadProgress.value = { total: 0, current: 0 }
  }
}

// Show delete confirmation modal
const showDeleteConfirmation = (id) => {
  selectedSliderId.value = id
  showDeleteModal.value = true
}

// Close delete modal
const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedSliderId.value = null
}

// Handle delete confirmation
const handleDelete = async () => {
  if (!selectedSliderId.value) return

  try {
    isDeleting.value = true
    const result = await sliderStore.deleteSlider(selectedSliderId.value)
    if (result.success) {
      toast.success('Slider berhasil dihapus')
      closeDeleteModal()
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    toast.error('Gagal menghapus slider: ' + error.message)
  } finally {
    isDeleting.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(async () => {
  await sliderStore.fetchSliders()
})
</script>

<style scoped>
.slider-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.slider-controls {
  margin: 20px 0;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #02163b;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px; /* Add this to prevent button size changes */
  justify-content: center; /* Add this to center the text */
}

.upload-btn:hover {
  background-color: #032456;
}

.upload-btn.disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.upload-btn input {
  display: none;
}

.slider-grid {
  margin-top: 20px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background-color: #f9f9f9;
  border: 2px dashed #ddd;
  border-radius: 8px;
}

.empty-state-content {
  text-align: center;
  color: #666;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.slider-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.slider-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.image-wrapper {
  position: relative;
  padding-top: 56.25%; /* 16:9 aspect ratio */
}

.image-wrapper img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.slider-item:hover .overlay {
  opacity: 1;
}

.delete-btn {
  background: #dc3545;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background: #bd2130;
}

.delete-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.item-info {
  padding: 12px;
}

.upload-date {
  color: #666;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .slider-items {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>