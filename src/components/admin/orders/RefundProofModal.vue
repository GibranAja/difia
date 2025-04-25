<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>Upload Bukti Refund</h3>
          <button class="close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="refund-info">
            <p><strong>Order ID:</strong> {{ order?.id }}</p>
            <p><strong>Customer:</strong> {{ order?.shippingDetails?.name }}</p>
            <p><strong>Jumlah Refund:</strong> {{ formatPrice(order?.totalAmount) }}</p>
          </div>

          <div class="upload-section">
            <label for="refundProof" class="upload-area" :class="{ 'has-file': previewUrl }">
              <div v-if="!previewUrl">
                <i class="fas fa-cloud-upload-alt"></i>
                <span>Klik atau drag file ke sini</span>
                <small>Format file: JPG, PNG, atau PDF (Maks. 2MB)</small>
              </div>
              <img v-else :src="previewUrl" alt="Bukti Refund" class="preview-image" />
              <input
                type="file"
                id="refundProof"
                @change="handleFileUpload"
                accept="image/*,application/pdf"
                hidden
              />
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">Tutup</button>
          <button
            class="btn-primary"
            :disabled="!refundProofFile || isSubmitting"
            @click="submitRefundProof"
          >
            <span v-if="isSubmitting"><i class="fas fa-spinner fa-spin"></i> Proses...</span>
            <span v-else>Kirim Bukti Refund</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  order: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'submit'])

const refundProofFile = ref(null)
const previewUrl = ref(null)
const isSubmitting = ref(false)

// Reset state when modal visibility changes
watch(
  () => props.show,
  (newValue) => {
    if (newValue === true) {
      // Modal is being opened - reset state
      resetModalState()
    }
  },
)

// Also watch for order changes to reset state when a different order is selected
watch(
  () => props.order?.id,
  () => {
    if (props.show) {
      resetModalState()
    }
  },
)

const resetModalState = () => {
  refundProofFile.value = null
  previewUrl.value = null
  isSubmitting.value = false
}

const closeModal = () => {
  resetModalState()
  emit('close')
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // File size validation (2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert('File terlalu besar, maksimal 2MB')
    return
  }

  refundProofFile.value = file

  // Create a preview
  if (file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      previewUrl.value = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    previewUrl.value = '/pdf-icon.png' // Use a PDF icon for preview
  }
}

const submitRefundProof = async () => {
  if (!refundProofFile.value) return

  isSubmitting.value = true // Set this first to prevent multiple clicks

  try {
    // Convert file to base64 for easier handling
    const base64 = await fileToBase64(refundProofFile.value)

    // Emit to parent
    emit('submit', {
      orderId: props.order.id,
      proof: base64,
      fileName: refundProofFile.value.name,
      fileType: refundProofFile.value.type,
    })

    // Let the parent component handle closing the modal
    // Don't reset state here as it might make the UI flash
  } catch (error) {
    console.error('Error processing file:', error)
    alert('Gagal mengupload bukti refund')
    isSubmitting.value = false // Only reset if there's an error
  }
}

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

const formatPrice = (price) => {
  if (!price) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  width: 90%;
  max-width: 500px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #02163b;
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.close-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.refund-info {
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.refund-info p {
  margin: 0.5rem 0;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: #02163b;
}

.upload-area.has-file {
  border-style: solid;
}

.upload-area i {
  font-size: 2.5rem;
  color: #ccc;
  margin-bottom: 1rem;
}

.upload-area span {
  display: block;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.upload-area small {
  display: block;
  color: #666;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
}

.btn-secondary,
.btn-primary {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.btn-secondary {
  background-color: #f1f1f1;
  color: #333;
}

.btn-primary {
  background-color: #02163b;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Animation */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
