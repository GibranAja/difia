<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <h2>{{ editData ? 'Edit Katalog' : 'Tambah Katalog' }}</h2>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="nama">Nama Katalog</label>
          <input id="nama" v-model="formData.nama" type="text" required />
        </div>

        <div class="form-group">
          <label for="harga">Harga Katalog</label>
          <input id="harga" v-model.number="formData.harga" type="number" required />
        </div>

        <div class="form-group">
          <label for="detail">Detail Produk</label>
          <textarea id="detail" v-model="formData.detail" required></textarea>
        </div>

        <div class="form-group">
          <label for="waktuPengerjaan">Waktu Pengerjaan (hari)</label>
          <input 
            id="waktuPengerjaan" 
            v-model.number="formData.waktuPengerjaan" 
            type="number" 
            min="1"
            required 
          />
        </div>

        <div class="form-group">
          <label>Foto Produk</label>
          <input type="file" @change="handleFileChange" accept="image/*" multiple ref="fileInput" />
          <div class="preview-images">
            <div v-for="(image, index) in previewImages" :key="index" class="preview-image">
              <img :src="image" alt="Preview" />
              <button type="button" class="remove-image" @click="removeImage(index)">×</button>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="cancel-btn" @click="closeModal">Cancel</button>
          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            {{ isSubmitting ? 'Processing...' : editData ? 'Update' : 'Submit' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  editData: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'submit'])
const isSubmitting = ref(false)
const fileInput = ref(null)

const formData = ref({
  nama: '',
  harga: 0,
  detail: '',
  waktuPengerjaan: 1, // NEW: default value
  images: [],
})

const previewImages = ref([])
const existingImages = ref([])

onMounted(() => {
  if (props.editData) {
    formData.value = {
      nama: props.editData.nama,
      harga: props.editData.harga,
      detail: props.editData.detail,
      waktuPengerjaan: props.editData.waktuPengerjaan || 1, // NEW
      images: [], // Initialize empty array for new images
    };
    // Store existing images separately
    existingImages.value = props.editData.images ? [...props.editData.images] : [];
    previewImages.value = [...existingImages.value];
  }
});
const handleFileChange = async (event) => {
  const files = Array.from(event.target.files)
  const maxSize = 2 * 1024 * 1024 // 2MB limit

  // Validate and process files
  for (const file of files) {
    if (file.size > maxSize) {
      alert(`File ${file.name} is too large. Maximum size is 2MB`)
      continue
    }

    try {
      const preview = await readFileAsDataURL(file)
      formData.value.images.push(file)
      previewImages.value.push(preview)
    } catch (error) {
      console.error('Error processing file:', error)
    }
  }

  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = (e) => reject(e)
    reader.readAsDataURL(file)
  })
}

const removeImage = (index) => {
  if (index < existingImages.value.length) {
    // Removing existing image
    existingImages.value.splice(index, 1);
    previewImages.value.splice(index, 1);
  } else {
    // Removing newly added image
    const adjustedIndex = index - existingImages.value.length;
    formData.value.images.splice(adjustedIndex, 1);
    previewImages.value.splice(index, 1);
  }
};

const closeModal = () => {
  emit('close')
}

const handleSubmit = async () => {
  if (isSubmitting.value) return;

  try {
    isSubmitting.value = true;

    // Create submission data
    const submissionData = {
      nama: formData.value.nama,
      harga: formData.value.harga,
      detail: formData.value.detail,
      waktuPengerjaan: Number(formData.value.waktuPengerjaan), // Add this line
      existingImages: existingImages.value,
      images: formData.value.images,
    };

    await emit('submit', submissionData);
  } catch (error) {
    console.error('Submit error:', error);
    alert('Error submitting form: ' + error.message);
  } finally {
    isSubmitting.value = false;
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.preview-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.preview-image {
  position: relative;
  width: 100px;
  height: 100px;
}

.preview-image img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.remove-image {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: red;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn,
.submit-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #ddd;
}

.submit-btn {
  background-color: #b69b87;
  color: white;
}

.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
