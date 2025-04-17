<!-- src/components/ReviewModal.vue -->
<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Tulis Ulasan</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <div class="modal-body">
        <!-- Product Info -->
        <div class="product-info">
          <img :src="order.customOptions?.productImage" :alt="order.productName" class="product-thumbnail">
          <div class="product-details">
            <h3>{{ order.productName }}</h3>
            <p class="variant">{{ order.customOptions?.purchaseType }}</p>
          </div>
        </div>

        <!-- Rating -->
        <div class="rating-section">
          <p class="rating-label">Berikan Rating</p>
          <div class="star-rating">
            <button
              v-for="star in 5"
              :key="star"
              class="star-btn"
              :class="{ active: star <= rating }"
              @click="rating = star"
              @mouseover="hoverRating = star"
              @mouseleave="hoverRating = 0"
            >
              <i class="fas fa-star"></i>
            </button>
          </div>
        </div>

        <!-- Review Text -->
        <div class="review-section">
          <label for="review">Tulis Ulasan</label>
          <textarea
            id="review"
            v-model="reviewText"
            rows="4"
            placeholder="Bagikan pengalaman Anda dengan produk ini..."
            :maxlength="maxReviewLength"
          ></textarea>
          <div class="review-length">{{ reviewText.length }}/{{ maxReviewLength }}</div>
          
          <!-- Suggestions -->
          <div class="suggestions" v-if="reviewText.length < 10">
            <p class="suggestion-label">Saran Ulasan:</p>
            <div class="suggestion-tags">
              <button
                v-for="(suggestion, index) in reviewStore.reviewSuggestions"
                :key="index"
                class="suggestion-tag"
                @click="appendSuggestion(suggestion)"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>
        </div>

        <!-- Image Upload - Enhanced UI -->
        <div class="image-upload-section">
          <label class="upload-label">
            Tambahkan Foto
            <span class="upload-info">Maks. 3 foto (Opsional)</span>
          </label>
          
          <div class="image-upload-container">
            <div
              class="image-dropzone"
              :class="{ active: isDragging }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleImageDrop"
              v-if="reviewImages.length < 3"
            >
              <input
                type="file"
                ref="fileInput"
                @change="handleImageSelect"
                accept="image/*"
                multiple
                hidden
              >
              <div class="dropzone-content">
                <div class="upload-icon">
                  <i class="fas fa-cloud-upload-alt"></i>
                </div>
                <p class="upload-text">Seret & letakkan foto di sini</p>
                <p class="upload-or">atau</p>
                <button class="browse-btn" @click="$refs.fileInput.click()">Pilih Foto</button>
                <p class="upload-hint">Format: JPG, PNG (Maks. 5MB)</p>
              </div>
            </div>

            <div class="image-preview-container" v-if="reviewImages.length > 0">
              <div
                v-for="(image, index) in reviewImages"
                :key="index"
                class="preview-card"
              >
                <div class="preview-img-wrapper">
                  <img :src="image.preview" alt="Preview">
                </div>
                <div class="preview-actions">
                  <button class="remove-image-btn" @click="removeImage(index)" title="Hapus foto">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
                <div class="image-overlay">
                  <div class="image-number">{{ index + 1 }}/{{ reviewImages.length }}</div>
                </div>
              </div>
              
              <div class="add-more-photos" v-if="reviewImages.length < 3" @click="$refs.fileInput.click()">
                <i class="fas fa-plus"></i>
                <span>Tambah Foto</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" @click="closeModal">Batal</button>
        <button class="submit-btn" :disabled="!isValid || isSubmitting" @click="submitReview">
          <i class="fas fa-paper-plane" v-if="!isSubmitting"></i>
          <i class="fas fa-spinner fa-spin" v-else></i>
          {{ isSubmitting ? 'Mengirim...' : 'Kirim Ulasan' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useReviewStore } from '@/stores/ReviewStore'
import { useAuthStore } from '@/stores/AuthStore'
import { useToast } from 'vue-toastification'

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])
const toast = useToast()
const reviewStore = useReviewStore()
const authStore = useAuthStore()

const rating = ref(0)
const hoverRating = ref(0)
const reviewText = ref('')
const reviewImages = ref([])
const isSubmitting = ref(false)
const isDragging = ref(false)
const fileInput = ref(null)
const maxReviewLength = 500

const closeModal = () => emit('close')

const isValid = computed(() => {
  return rating.value > 0 && reviewText.value.trim().length >= 10
})

const appendSuggestion = (suggestion) => {
  if (reviewText.value) {
    reviewText.value += '. ' + suggestion
  } else {
    reviewText.value = suggestion
  }
}

const handleImageSelect = (event) => {
  handleFiles(Array.from(event.target.files))
  // Reset file input to allow selecting the same file again
  if (fileInput.value) fileInput.value.value = ''
}

const handleImageDrop = (event) => {
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files).filter(file => file.type.startsWith('image/'))
  handleFiles(files)
}

const handleFiles = async (files) => {
  for (const file of files) {
    if (reviewImages.value.length >= 3) {
      toast.info('Maksimal 3 foto dapat diunggah')
      break
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB')
      continue
    }

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        reviewImages.value.push({
          file,
          preview: e.target.result,
          name: file.name
        })
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error reading file:', error)
      toast.error('Gagal membaca file')
    }
  }
}

const removeImage = (index) => {
  reviewImages.value.splice(index, 1)
}

const submitReview = async () => {
  if (!isValid.value) return

  try {
    isSubmitting.value = true

    const images = await Promise.all(
      reviewImages.value.map(img => img.preview)
    )

    const result = await reviewStore.addReview({
      orderId: props.order.id,
      productId: props.order.productId,
      userId: authStore.currentUser.id,
      rating: rating.value,
      review: reviewText.value.trim(),
      images
    })

    if (result.success) {
      toast.success('Terima kasih atas ulasan Anda!')
      closeModal()
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    toast.error('Gagal mengirim ulasan: ' + error.message)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(3px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 650px; /* Lebar modal diperbesar */
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  scrollbar-width: none; /* Firefox */
}

.modal-content::-webkit-scrollbar {
  width: 0; /* Chrome, Safari, Opera */
  display: none;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  border-radius: 16px 16px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #02163b;
  font-weight: 600;
}

.close-btn {
  width: 36px;
  height: 36px;
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #eee;
  color: #333;
}

.modal-body {
  padding: 24px;
}

.product-info {
  display: flex;
  gap: 16px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
}

.product-thumbnail {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-details h3 {
  margin: 0 0 8px;
  font-size: 1.1rem;
  color: #02163b;
}

.variant {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

.rating-section {
  margin: 24px 0;
}

.rating-label {
  margin-bottom: 12px;
  font-weight: 500;
  color: #333;
}

.star-rating {
  display: flex;
  gap: 8px;
}

.star-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  color: #ddd;
  cursor: pointer;
  transition: transform 0.2s, color 0.2s;
  padding: 0;
}

.star-btn.active {
  color: #e8ba38;
}

.star-btn:hover {
  color: #e8ba38;
  transform: scale(1.1);
}

.review-section {
  margin: 24px 0;
}

.review-section label {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  color: #333;
}

textarea {
  width: 100%;
  padding: 14px;
  border: 1px solid #ddd;
  border-radius: 12px;
  resize: vertical;
  font-family: inherit;
  font-size: 15px;
  transition: border-color 0.2s;
  background: #f9f9f9;
}

textarea:focus {
  outline: none;
  border-color: #02163b;
  background: white;
  box-shadow: 0 0 0 3px rgba(2, 22, 59, 0.1);
}

.review-length {
  text-align: right;
  font-size: 0.875rem;
  color: #666;
  margin-top: 6px;
}

.suggestions {
  margin-top: 16px;
}

.suggestion-label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 10px;
}

.suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-tag {
  background: #f5f5f5;
  border: none;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #444;
}

.suggestion-tag:hover {
  background: #e8ba38;
  color: white;
  transform: translateY(-2px);
}

/* Enhanced Image Upload Section */
.image-upload-section {
  margin: 24px 0;
}

.upload-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
  color: #333;
}

.upload-info {
  font-size: 0.875rem;
  color: #666;
  font-weight: normal;
}

.image-upload-container {
  margin-top: 16px;
}

.image-dropzone {
  border: 2px dashed #ddd;
  border-radius: 12px;
  padding: 30px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #f9f9f9;
}

.image-dropzone.active {
  border-color: #02163b;
  background: rgba(2, 22, 59, 0.05);
}

.image-dropzone:hover {
  border-color: #02163b;
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  font-size: 2.5rem;
  color: #02163b;
  margin-bottom: 10px;
}

.upload-text {
  font-weight: 500;
  color: #333;
  margin: 0;
}

.upload-or {
  color: #666;
  margin: 0;
}

.upload-hint {
  font-size: 0.8rem;
  color: #888;
  margin-top: 10px;
}

.browse-btn {
  background: #02163b;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 10px;
}

.browse-btn:hover {
  background: #032a66;
  transform: translateY(-2px);
}

.image-preview-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.preview-card {
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  aspect-ratio: 1;
}

.preview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.preview-img-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.preview-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.preview-card:hover img {
  transform: scale(1.05);
}

.preview-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 5;
  opacity: 0;
  transition: opacity 0.3s;
}

.preview-card:hover .preview-actions {
  opacity: 1;
}

.remove-image-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 70, 70, 0.9);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-image-btn:hover {
  background: #ff4646;
  transform: scale(1.1);
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  opacity: 0;
  transition: opacity 0.3s;
}

.preview-card:hover .image-overlay {
  opacity: 1;
}

.image-number {
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
}

.add-more-photos {
  border: 2px dashed #ddd;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  aspect-ratio: 1;
  background: #f9f9f9;
  gap: 8px;
}

.add-more-photos:hover {
  border-color: #02163b;
  background: rgba(2, 22, 59, 0.05);
}

.add-more-photos i {
  font-size: 1.5rem;
  color: #666;
}

.add-more-photos span {
  font-size: 0.875rem;
  color: #666;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 10;
  border-radius: 0 0 16px 16px;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #eee;
  color: #333;
}

.submit-btn {
  background: #02163b;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.submit-btn:hover:not(:disabled) {
  background: #032a66;
  transform: translateY(-2px);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 580px) {
  .modal-content {
    height: 100%;
    max-height: none;
    border-radius: 0;
    max-width: 100%;
  }
  
  .modal-header {
    border-radius: 0;
  }
  
  .image-preview-container {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .suggestion-tags {
    max-height: 100px;
    overflow-y: auto;
  }
}
</style>