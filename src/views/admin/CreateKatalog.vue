<template>
  <div class="create-katalog-container">
    <h1>{{ isEditing ? 'Edit Katalog' : 'Tambah Katalog Baru' }}</h1>

    <form @submit.prevent="handleSubmit" class="katalog-form">
      <div class="form-group">
        <label for="name">Nama Katalog</label>
        <input
          type="text"
          id="name"
          v-model="formData.nama"
          required
          placeholder="Masukkan nama katalog"
        />
        <span class="error-message" v-if="errors.nama">{{ errors.nama }}</span>
      </div>

      <div class="pricing-section">
        <h3>Harga Katalog</h3>
        <div class="pricing-grid">
          <div class="form-group">
            <label for="hargaStandar">Harga Standar</label>
            <input
              type="number"
              id="hargaStandar"
              v-model="formData.harga.standar"
              required
              min="0"
              placeholder="Masukkan harga standar"
            />
          </div>
          <div class="form-group">
            <label for="hargaPremium">Harga Premium</label>
            <input
              type="number"
              id="hargaPremium"
              v-model="formData.harga.premium"
              required
              min="0"
              placeholder="Masukkan harga premium"
            />
          </div>
          <div class="form-group">
            <label for="hargaBudgetting">Harga Budgetting</label>
            <input
              type="text"
              id="hargaBudgetting"
              value="By Request"
              readonly
              class="by-request-input"
            />
          </div>
        </div>
        <span class="error-message" v-if="errors.harga">{{ errors.harga }}</span>
      </div>

      <div class="form-group">
        <label>Foto Katalog</label>
        <div class="image-upload">
          <input
            type="file"
            @change="handleImageUpload"
            accept="image/*"
            multiple
            :required="!isEditing && !formData.images.length && !formData.existingImages.length"
          />
          <div class="image-grid">
            <!-- Existing Images -->
            <div
              v-for="(image, index) in formData.existingImages"
              :key="`existing-${index}`"
              class="image-preview"
            >
              <img :src="image" alt="Existing Preview" />
              <button type="button" @click="removeExistingImage(index)" class="remove-image">
                ×
              </button>
            </div>
            <!-- New Images -->
            <div
              v-for="(image, index) in previewImages"
              :key="`new-${index}`"
              class="image-preview"
            >
              <img :src="image" alt="New Preview" />
              <button type="button" @click="removeImage(index)" class="remove-image">×</button>
            </div>
          </div>
        </div>
        <span class="error-message" v-if="errors.images">{{ errors.images }}</span>
        <div class="image-info" v-if="totalImageSize">
          Total Image Size: {{ (totalImageSize / 1024 / 1024).toFixed(2) }}MB
        </div>
      </div>

      <div class="form-group details-section">
        <h3>Detail Katalog</h3>

        <div class="details-grid">
          <!-- Ukuran Section -->
          <div class="ukuran-section">
            <h4>Ukuran</h4>
            <div class="ukuran-grid">
              <div class="ukuran-item">
                <label for="panjang">Panjang (cm)</label>
                <input
                  type="number"
                  id="panjang"
                  v-model="formData.detail.ukuran.panjang"
                  required
                  min="0"
                  step="0.1"
                />
              </div>
              <div class="ukuran-item">
                <label for="tinggi">Tinggi (cm)</label>
                <input
                  type="number"
                  id="tinggi"
                  v-model="formData.detail.ukuran.tinggi"
                  required
                  min="0"
                  step="0.1"
                />
              </div>
              <div class="ukuran-item">
                <label for="lebar">Lebar (cm)</label>
                <input
                  type="number"
                  id="lebar"
                  v-model="formData.detail.ukuran.lebar"
                  required
                  min="0"
                  step="0.1"
                />
              </div>
              <div class="ukuran-item">
                <label for="berat">Berat (gram)</label>
                <input
                  type="number"
                  id="berat"
                  v-model="formData.detail.berat"
                  required
                  min="0"
                  step="1"
                  placeholder="Masukkan berat"
                />
              </div>
            </div>
          </div>

          <!-- Bahan Section -->
          <div class="bahan-section">
            <div class="form-group">
              <label for="bahanLuar">Bahan Luar</label>
              <input
                type="text"
                id="bahanLuar"
                v-model="formData.detail.bahanLuar"
                required
                placeholder="Masukkan bahan luar"
              />
              <textarea
                id="bahanLuarDesc"
                v-model="formData.detail.bahanLuarDesc"
                placeholder="Penjelasan tentang bahan luar"
                rows="2"
                class="material-description"
              ></textarea>

              <div class="material-image-section">
                <label>Contoh Bahan Luar</label>
                <div class="material-image-upload">
                  <input
                    type="file"
                    @change="(e) => handleMaterialImageUpload(e, 'luar')"
                    accept="image/*"
                  />

                  <div v-if="formData.detail.bahanLuarImage" class="material-preview">
                    <img :src="formData.detail.bahanLuarImage" alt="Contoh Bahan Luar" />
                    <button type="button" @click="removeMaterialImage('luar')" class="remove-image">
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="bahanDalam">Bahan Dalam</label>
              <input
                type="text"
                id="bahanDalam"
                v-model="formData.detail.bahanDalam"
                required
                placeholder="Masukkan bahan dalam"
              />
              <textarea
                id="bahanDalamDesc"
                v-model="formData.detail.bahanDalamDesc"
                placeholder="Penjelasan tentang bahan dalam"
                rows="2"
                class="material-description"
              ></textarea>

              <div class="material-image-section">
                <label>Contoh Bahan Dalam</label>
                <div class="material-image-upload">
                  <input
                    type="file"
                    @change="(e) => handleMaterialImageUpload(e, 'dalam')"
                    accept="image/*"
                  />

                  <div v-if="formData.detail.bahanDalamImage" class="material-preview">
                    <img :src="formData.detail.bahanDalamImage" alt="Contoh Bahan Dalam" />
                    <button
                      type="button"
                      @click="removeMaterialImage('dalam')"
                      class="remove-image"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Aksesoris dan Warna -->
          <div class="additional-details">
            <div class="form-group">
              <label for="aksesoris">Aksesoris</label>
              <textarea
                id="aksesoris"
                v-model="formData.detail.aksesoris"
                required
                placeholder="Masukkan detail aksesoris"
                rows="3"
              ></textarea>
            </div>
            <div class="form-group">
              <label for="warna">Warna</label>
              <textarea
                id="warna"
                v-model="formData.detail.warna"
                required
                placeholder="Masukkan pilihan warna yang tersedia"
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <div class="form-group details-section">
        <h3>Waktu Pengerjaan</h3>
        <div class="waktu-pengerjaan-grid">
          <div class="waktu-item">
            <label for="pcs50_100">50-100 pcs</label>
            <input
              type="text"
              id="pcs50_100"
              v-model="formData.waktuPengerjaan.pcs50_100"
              required
              placeholder="contoh: 5-7"
            />
            <span class="unit">hari</span>
          </div>

          <div class="waktu-item">
            <label for="pcs200">200 pcs</label>
            <input
              type="text"
              id="pcs200"
              v-model="formData.waktuPengerjaan.pcs200"
              required
              placeholder="contoh: 7-10"
            />
            <span class="unit">hari</span>
          </div>

          <div class="waktu-item">
            <label for="pcs300">300 pcs</label>
            <input
              type="text"
              id="pcs300"
              v-model="formData.waktuPengerjaan.pcs300"
              required
              placeholder="contoh: 10-14"
            />
            <span class="unit">hari</span>
          </div>

          <div class="waktu-item">
            <label for="pcsAbove300">&gt;300 pcs</label>
            <input
              type="text"
              id="pcsAbove300"
              v-model="formData.waktuPengerjaan.pcsAbove300"
              required
              placeholder="contoh: 14-21"
            />
            <span class="unit">hari</span>
          </div>

          <div class="waktu-item">
            <label for="express">Express</label>
            <input type="text" value="Additional 5% dari totalan" readonly class="express-input" />
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" @click="goBack" class="cancel-btn">Batal</button>
        <button type="submit" class="submit-btn" :disabled="isSubmitting || !isFormValid">
          {{ isSubmitting ? 'Menyimpan...' : isEditing ? 'Update' : 'Tambah' }} Katalog
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useKatalogStore } from '@/stores/KatalogStore'

const route = useRoute()
const router = useRouter()
const katalogStore = useKatalogStore()

const isEditing = computed(() => !!route.params.id)
const isSubmitting = ref(false)
const errors = ref({})
const previewImages = ref([])
const totalImageSize = ref(0)

// Image validation constants
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB per image
const MAX_TOTAL_IMAGES = 5
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image.heic',
  'image.heif',
]

// Constants for image processing
const MAX_DIMENSION = 600 // Reduced from 800
const COMPRESSION_QUALITY = 0.4 // Reduced from 0.6

const formData = ref({
  nama: '',
  harga: {
    standar: 0,
    premium: 0,
    budgetting: 'By Request',
  },
  detail: {
    ukuran: {
      panjang: 0,
      tinggi: 0,
      lebar: 0,
    },
    berat: 0, // Add this new field
    bahanLuar: '',
    bahanLuarDesc: '',
    bahanLuarImage: null,
    bahanDalam: '',
    bahanDalamDesc: '',
    bahanDalamImage: null,
    aksesoris: '',
    warna: '',
  },
  waktuPengerjaan: {
    pcs50_100: '',
    pcs200: '',
    pcs300: '',
    pcsAbove300: '',
    express: 'Additional 5% dari totalan',
  },
  images: [],
  existingImages: [],
})

// Update loadKatalogData function to handle the new fields
const loadKatalogData = () => {
  const katalog = katalogStore.katalogItems.find((item) => item.id === route.params.id)
  if (katalog) {
    formData.value = {
      nama: katalog.nama,
      harga: {
        standar: katalog.harga.standar,
        premium: katalog.harga.premium,
        budgetting: 'By Request',
      },
      detail: {
        ukuran: katalog.detail.ukuran,
        berat: katalog.detail.berat || 0, // Add this line to load weight
        bahanLuar: katalog.detail.bahanLuar || '',
        bahanLuarDesc: katalog.detail.bahanLuarDesc || '',
        bahanLuarImage: katalog.detail.bahanLuarImage || null,
        bahanDalam: katalog.detail.bahanDalam || '',
        bahanDalamDesc: katalog.detail.bahanDalamDesc || '',
        bahanDalamImage: katalog.detail.bahanDalamImage || null,
        aksesoris: katalog.detail.aksesoris || '',
        warna: katalog.detail.warna || '',
      },
      waktuPengerjaan: katalog.waktuPengerjaan,
      images: [], // New images to be uploaded
      existingImages: katalog.images || [], // Store existing images
    }
  }
}

// Modify onMounted to load data when editing
onMounted(async () => {
  if (isEditing.value) {
    // First try to find in existing items
    const existingKatalog = katalogStore.katalogItems.find((item) => item.id === route.params.id)

    if (existingKatalog) {
      loadKatalogData()
    } else {
      // If not found, fetch from server
      try {
        await katalogStore.fetchKatalog()
        loadKatalogData()
      } catch (error) {
        console.error('Error loading katalog:', error)
        alert('Failed to load katalog data')
        router.push('/admin/katalog')
      }
    }
  }
})

const isFormValid = computed(() => {
  return (
    formData.value.nama.trim() &&
    formData.value.harga.standar > 0 &&
    formData.value.harga.premium > 0 &&
    formData.value.detail.ukuran.panjang > 0 &&
    formData.value.detail.ukuran.tinggi > 0 &&
    formData.value.detail.ukuran.lebar > 0 &&
    formData.value.detail.berat > 0 &&
    formData.value.detail.bahanLuar.trim() &&
    formData.value.detail.bahanDalam.trim() &&
    formData.value.detail.aksesoris.trim() &&
    formData.value.detail.warna.trim() &&
    formData.value.waktuPengerjaan.pcs50_100.trim() &&
    formData.value.waktuPengerjaan.pcs200.trim() &&
    formData.value.waktuPengerjaan.pcs300.trim() &&
    formData.value.waktuPengerjaan.pcsAbove300.trim() &&
    (isEditing.value ||
      (formData.value.images && formData.value.images.length > 0) ||
      (formData.value.existingImages && formData.value.existingImages.length > 0))
  )
})

// Enhanced image resizing function with stronger compression
const resizeImage = async (file) => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    image.onload = () => {
      let width = image.width
      let height = image.height

      // Calculate new dimensions - more aggressive resizing
      if (width > height) {
        if (width > MAX_DIMENSION) {
          height = Math.round((height * MAX_DIMENSION) / width)
          width = MAX_DIMENSION
        }
      } else {
        if (height > MAX_DIMENSION) {
          width = Math.round((width * MAX_DIMENSION) / height)
          height = MAX_DIMENSION
        }
      }

      canvas.width = width
      canvas.height = height

      // Use canvas to resize
      ctx.drawImage(image, 0, 0, width, height)

      // Convert to a more compressed JPEG
      canvas.toBlob(
        (blob) => {
          // Convert the blob to a base64 string for preview
          const reader = new FileReader()
          reader.onloadend = () => {
            resolve(reader.result)
          }
          reader.readAsDataURL(blob)

          // Store the compressed blob for upload
          const fileName = file.name.split('.')[0] + '.jpg'
          const compressedFile = new File([blob], fileName, { type: 'image/jpeg' })

          // Replace the original file with the compressed one
          const index = formData.value.images.findIndex((f) => f === file)
          if (index !== -1) {
            formData.value.images[index] = compressedFile
            totalImageSize.value = totalImageSize.value - file.size + compressedFile.size
          }
        },
        'image/jpeg',
        COMPRESSION_QUALITY,
      )
    }

    image.onerror = reject
    image.src = URL.createObjectURL(file)
  })
}

// Enhanced image upload handler with chunked processing
const handleImageUpload = async (event) => {
  const files = Array.from(event.target.files)
  errors.value.images = ''

  if (
    files.length + formData.value.images.length + formData.value.existingImages.length >
    MAX_TOTAL_IMAGES
  ) {
    errors.value.images = `Maksimal ${MAX_TOTAL_IMAGES} foto yang dapat diunggah`
    return
  }

  try {
    for (const file of files) {
      // Enhanced file type validation for HEIC/HEIF
      const fileExtension = file.name.split('.').pop().toLowerCase()
      const isHeicOrHeif = ['heic', 'heif'].includes(fileExtension)

      if (!ALLOWED_TYPES.includes(file.type) && !isHeicOrHeif) {
        errors.value.images = 'Hanya file JPEG, PNG, GIF, WebP, HEIC, dan HEIF yang diperbolehkan'
        return
      }

      if (file.size > MAX_IMAGE_SIZE) {
        errors.value.images = 'Ukuran setiap foto tidak boleh melebihi 5MB'
        return
      }

      formData.value.images.push(file)
      totalImageSize.value += file.size

      try {
        if (isHeicOrHeif) {
          previewImages.value.push(URL.createObjectURL(file))
        } else {
          const base64String = await resizeImage(file)
          previewImages.value.push(base64String)
        }
      } catch (imgError) {
        console.error('Error processing specific image:', imgError)
        previewImages.value.push(URL.createObjectURL(file))
      }
    }
  } catch (error) {
    console.error('Error processing images:', error)
    errors.value.images = 'Error saat memproses foto. Silakan coba lagi.'
  }
}

const removeImage = (index) => {
  totalImageSize.value -= formData.value.images[index].size
  formData.value.images.splice(index, 1)
  previewImages.value.splice(index, 1)
}

const removeExistingImage = (index) => {
  formData.value.existingImages.splice(index, 1)
  // If there are no images left at all, reset validation
  if (formData.value.existingImages.length === 0 && formData.value.images.length === 0) {
    errors.value.images = 'Minimal satu foto harus diunggah'
  }
}

// Function to handle material image uploads
const handleMaterialImageUpload = async (event, type) => {
  const file = event.target.files[0]
  if (!file) return

  errors.value.materialImages = ''

  // Validate image type
  const fileExtension = file.name.split('.').pop().toLowerCase()
  const isHeicOrHeif = ['heic', 'heif'].includes(fileExtension)

  if (!ALLOWED_TYPES.includes(file.type) && !isHeicOrHeif) {
    errors.value.materialImages =
      'Hanya file JPEG, PNG, GIF, WebP, HEIC, dan HEIF yang diperbolehkan'
    return
  }

  // Validate image size
  if (file.size > MAX_IMAGE_SIZE) {
    errors.value.materialImages = 'Ukuran foto tidak boleh melebihi 5MB'
    return
  }

  try {
    // Process image the same way as catalog images
    const base64String = await resizeImage(file)

    // Store image in the appropriate field
    if (type === 'luar') {
      formData.value.detail.bahanLuarImage = base64String
    } else if (type === 'dalam') {
      formData.value.detail.bahanDalamImage = base64String
    }
  } catch (error) {
    console.error('Error processing material image:', error)
    errors.value.materialImages = 'Error saat memproses foto. Silakan coba lagi.'
  }
}

// Function to remove material images
const removeMaterialImage = (type) => {
  if (type === 'luar') {
    formData.value.detail.bahanLuarImage = null
  } else if (type === 'dalam') {
    formData.value.detail.bahanDalamImage = null
  }
}

const validateForm = () => {
  errors.value = {}

  if (!formData.value.nama.trim()) {
    errors.value.nama = 'Nama katalog harus diisi'
  }

  if (!formData.value.harga.standar || !formData.value.harga.premium) {
    errors.value.harga = 'Harga standar dan premium harus diisi'
  }

  if (!isEditing.value && !formData.value.images.length && !formData.value.existingImages.length) {
    errors.value.images = 'Minimal satu foto harus diunggah'
  }

  // Check total size of all images
  if (totalImageSize.value > 10 * 1024 * 1024) {
    // 10MB total limit
    errors.value.images = 'Total ukuran gambar tidak boleh melebihi 10MB'
  }

  return Object.keys(errors.value).length === 0
}

const goBack = () => {
  router.push('/admin/katalog')
}

// Improved submit function with chunked image processing
const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    isSubmitting.value = true

    const totalSize = formData.value.images.reduce((sum, file) => sum + file.size, 0)
    if (totalSize > 5 * 1024 * 1024) {
      await Promise.all(
        formData.value.images.map(async (file, index) => {
          const fileExtension = file.name.split('.').pop().toLowerCase()
          const isHeicOrHeif = ['heic', 'heif'].includes(fileExtension)

          if (isHeicOrHeif) return

          const newQuality = 0.2
          const image = new Image()
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          await new Promise((resolve) => {
            image.onload = resolve
            image.src = URL.createObjectURL(file)
          })

          const maxDimension = 400
          let width = image.width
          let height = image.height

          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }

          canvas.width = width
          canvas.height = height
          ctx.drawImage(image, 0, 0, width, height)

          const blob = await new Promise((resolve) =>
            canvas.toBlob(resolve, 'image/jpeg', newQuality),
          )

          const newFile = new File([blob], file.name.split('.')[0] + '_compressed.jpg', {
            type: 'image/jpeg',
          })
          formData.value.images[index] = newFile
        }),
      )
    }

    const katalogFormData = new FormData()

    const basicInfo = {
      nama: formData.value.nama.trim(),
      harga: {
        standar: formData.value.harga.standar,
        premium: formData.value.harga.premium,
        budgetting: 'By Request',
      },
      detail: {
        ukuran: {
          panjang: formData.value.detail.ukuran.panjang,
          tinggi: formData.value.detail.ukuran.tinggi,
          lebar: formData.value.detail.ukuran.lebar,
        },
        berat: formData.value.detail.berat,
        bahanLuar: formData.value.detail.bahanLuar.trim(),
        bahanLuarDesc: formData.value.detail.bahanLuarDesc.trim(),
        bahanLuarImage: formData.value.detail.bahanLuarImage,
        bahanDalam: formData.value.detail.bahanDalam.trim(),
        bahanDalamDesc: formData.value.detail.bahanDalamDesc.trim(),
        bahanDalamImage: formData.value.detail.bahanDalamImage,
        aksesoris: formData.value.detail.aksesoris.trim(),
        warna: formData.value.detail.warna.trim(),
      },
      waktuPengerjaan: formData.value.waktuPengerjaan,
      existingImages: formData.value.existingImages,
    }

    katalogFormData.append('data', JSON.stringify(basicInfo))

    formData.value.images.forEach((file, index) => {
      const fileExtension = file.name.split('.').pop().toLowerCase()
      katalogFormData.append(`image_${index}`, file)
      katalogFormData.append(`image_${index}_ext`, fileExtension)
    })

    let result
    if (isEditing.value) {
      result = await katalogStore.updateKatalogWithFormData(route.params.id, katalogFormData)
    } else {
      result = await katalogStore.addKatalogWithFormData(katalogFormData)
    }

    if (result.success) {
      router.push('/admin/katalog')
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('Error saving katalog:', error)
    alert('Gagal menyimpan katalog: ' + error.message)
  } finally {
    isSubmitting.value = false
  }
}

// Watch for form changes to validate
watch(
  () => ({
    nama: formData.value.nama,
    harga: formData.value.harga,
    detail: formData.value.detail,
    waktuPengerjaan: formData.value.waktuPengerjaan,
    images: formData.value.images,
  }),
  () => {
    validateForm()
  },
  { deep: true },
)
</script>

<style scoped>
.create-katalog-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.create-katalog-container h1 {
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.katalog-form {
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

.form-group input[type='text'],
.form-group input[type='number'] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.pricing-section {
  margin-bottom: 25px;
}

.pricing-section h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 18px;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.image-upload {
  border: 2px dashed #ddd;
  padding: 20px;
  border-radius: 4px;
  margin-top: 10px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.image-preview {
  position: relative;
  aspect-ratio: 1;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.by-request-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #666;
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

.details-section {
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 25px;
}

.details-section h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 1.2rem;
}

.details-grid {
  display: grid;
  gap: 20px;
}

.ukuran-section h4 {
  margin-bottom: 15px;
  color: #555;
}

.ukuran-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.ukuran-item {
  display: flex;
  flex-direction: column;
}

.ukuran-item label {
  margin-bottom: 5px;
  font-size: 0.9rem;
  color: #666;
}

.ukuran-item input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.bahan-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.additional-details {
  display: grid;
  gap: 15px;
}

.additional-details textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  resize: vertical;
}

.waktu-pengerjaan-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 15px;
}

.waktu-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.waktu-item input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.express-input {
  background-color: #f5f5f5;
  color: #666;
}

.unit {
  color: #666;
  font-size: 0.9em;
  margin-left: 5px;
}

.material-description {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  margin-top: 8px;
  resize: vertical;
  font-size: 14px;
}

.material-image-section {
  margin-top: 12px;
}

.material-image-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
}

.material-image-upload {
  border: 1px dashed #ddd;
  padding: 12px;
  border-radius: 4px;
}

.material-preview {
  position: relative;
  width: 120px;
  height: 120px;
  margin-top: 12px;
}

.material-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error-message.material-error {
  margin-top: 8px;
}

@media (max-width: 768px) {
  .create-katalog-container {
    padding: 15px;
  }

  .katalog-form {
    padding: 20px;
  }

  .pricing-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .form-actions {
    flex-direction: column;
  }

  .submit-btn,
  .cancel-btn {
    width: 100%;
  }

  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
  }

  .ukuran-grid {
    grid-template-columns: 1fr;
  }

  .bahan-section {
    grid-template-columns: 1fr;
  }

  .material-preview {
    width: 100px;
    height: 100px;
  }
}
</style>
