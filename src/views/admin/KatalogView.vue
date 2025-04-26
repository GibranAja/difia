<template>
  <div class="katalog-container" :class="{ 'sidebar-collapsed': !isSidebarOpen }">
    <LoadComponent v-if="katalogStore.loading" />

    <template v-else>
      <h1>DAFTAR KATALOG</h1>

      <div class="katalog-controls">
        <div class="top-controls">
          <router-link to="/admin/katalog/create" class="add-btn"> Tambah Katalog </router-link>
        </div>

        <div class="filter-controls">
          <div class="entries-control">
            <select v-model="entriesPerPage">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span>entries per page</span>
          </div>

          <div class="search-box">
            <input type="text" v-model="searchQuery" placeholder="Search..." />
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <!-- Empty state message -->
        <div v-if="!paginatedKatalog.length" class="empty-state">
          <div class="empty-state-content">
            <span class="empty-icon">📦</span>
            <h3>Tidak ada katalog disini</h3>
            <p>Mulai dengan menambahkan katalog baru</p>
          </div>
        </div>

        <!-- Table with data -->
        <table v-else class="katalog-table">
          <colgroup>
            <col style="width: 5%" />
            <!-- No -->
            <col style="width: 10%" />
            <!-- Nama -->
            <col style="width: 15%" />
            <!-- Harga -->
            <col style="width: 30%" />
            <!-- Detail -->
            <col style="width: 20%" />
            <!-- Waktu -->
            <col style="width: 15%" />
            <!-- Foto -->
            <col style="width: 15%" />
            <!-- Aksi -->
          </colgroup>
          <thead>
            <tr>
              <th>No.</th>
              <th>Nama Katalog</th>
              <th>Harga Katalog</th>
              <th>Detail Katalog</th>
              <th>Waktu</th>
              <th>Foto</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in paginatedKatalog" :key="item.id">
              <td class="text-center">{{ startIndex + index + 1 }}</td>
              <td>{{ item.nama }}</td>
              <td>
                <div class="price-list">
                  <div>Standar: {{ formatPrice(item.harga.standar) }}</div>
                  <div>Premium: {{ formatPrice(item.harga.premium) }}</div>
                  <div>Budgetting: {{ item.harga.budgetting }}</div>
                </div>
              </td>
              <td class="detail-cell">
                <div class="detail-content">
                  <div class="detail-section">
                    <strong>Ukuran:</strong>
                    <div class="detail-ukuran">
                      <span>P: {{ item.detail?.ukuran?.panjang || 0 }} cm</span>
                      <span>L: {{ item.detail?.ukuran?.lebar || 0 }} cm</span>
                      <span>T: {{ item.detail?.ukuran?.tinggi || 0 }} cm</span>
                      <span>Berat: {{ item.detail?.berat || 0 }} gram</span>
                    </div>
                  </div>
                  <div class="detail-section">
                    <strong>Bahan:</strong>
                    <div>Luar: {{ item.detail?.bahanLuar || '-' }}</div>
                    <div>Dalam: {{ item.detail?.bahanDalam || '-' }}</div>
                  </div>
                  <div class="detail-section">
                    <strong>Aksesoris:</strong>
                    <div>{{ item.detail?.aksesoris || '-' }}</div>
                  </div>
                  <div class="detail-section">
                    <strong>Warna:</strong>
                    <div>{{ item.detail?.warna || '-' }}</div>
                  </div>
                </div>
              </td>
              <td class="detail-cell">
                <div class="detail-content">
                  <div class="detail-section">
                    <strong>Waktu Pengerjaan:</strong>
                    <div class="waktu-list">
                      <div>50-100 pcs: {{ item.waktuPengerjaan.pcs50_100 }} hari</div>
                      <div>200 pcs: {{ item.waktuPengerjaan.pcs200 }} hari</div>
                      <div>300 pcs: {{ item.waktuPengerjaan.pcs300 }} hari</div>
                      <div>>300 pcs: {{ item.waktuPengerjaan.pcsAbove300 }} hari</div>
                      <div class="express-info">Express: {{ item.waktuPengerjaan.express }}</div>
                    </div>
                  </div>
                </div>
              </td>
              <td class="image-cell">
                <div class="image-gallery">
                  <img
                    v-for="(image, imgIndex) in item.images.slice(0, 3)"
                    :key="imgIndex"
                    :src="image"
                    :alt="'Product ' + (imgIndex + 1)"
                    @click="openImageGallery(item.images, imgIndex)"
                  />
                  <span
                    v-if="item.images.length > 3"
                    class="more-images"
                    @click="openImageGallery(item.images, 3)"
                  >
                    +{{ item.images.length - 3 }}
                  </span>
                </div>
              </td>
              <td class="action-cell">
                <div class="action-buttons">
                  <router-link :to="`/admin/katalog/edit/${item.id}`" class="edit-btn">
                    Edit
                  </router-link>
                  <button class="delete-btn" @click="confirmDelete(item.id)">Hapus</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="paginatedKatalog.length" class="pagination">
        <button :disabled="currentPage === 1" @click="goToPrevPage">
          <i class="fas fa-chevron-left"></i>
        </button>
        <span>{{ currentPage }} of {{ totalPages }}</span>
        <button :disabled="currentPage >= totalPages" @click="goToNextPage">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <!-- Image Gallery Modal -->
      <div v-if="showGallery" class="gallery-modal" @click="closeGallery">
        <div class="gallery-content" @click.stop>
          <button class="gallery-close" @click="closeGallery">&times;</button>

          <div class="gallery-image-container">
            <button
              class="gallery-nav prev"
              @click="prevImage"
              :class="{ disabled: currentImageIndex === 0 }"
              v-show="galleryImages.length > 1"
            >
              &lt;
            </button>

            <div class="gallery-image">
              <img
                :src="galleryImages[currentImageIndex]"
                :alt="'Gallery image ' + (currentImageIndex + 1)"
              />
            </div>

            <button
              class="gallery-nav next"
              @click="nextImage"
              :class="{ disabled: currentImageIndex === galleryImages.length - 1 }"
              v-show="galleryImages.length > 1"
            >
              &gt;
            </button>
          </div>

          <div class="gallery-counter" v-if="galleryImages.length > 1">
            {{ currentImageIndex + 1 }} / {{ galleryImages.length }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useKatalogStore } from '@/stores/KatalogStore'
import LoadComponent from '@/components/LoadComponent.vue'
// import { useRouter } from 'vue-router'

// const router = useRouter()
const katalogStore = useKatalogStore()
const searchQuery = ref('')
const currentPage = ref(1)
const entriesPerPage = ref(10)
const showGallery = ref(false)
const galleryImages = ref([])
const currentImageIndex = ref(0)

const filteredKatalog = computed(() => {
  return katalogStore.katalogItems.filter((item) => {
    const searchTerm = searchQuery.value.toLowerCase()
    const itemName = item.nama?.toLowerCase() || ''
    const itemDetail =
      item.detail?.bahanLuar?.toLowerCase() ||
      '' + item.detail?.bahanDalam?.toLowerCase() ||
      '' + item.detail?.aksesoris?.toLowerCase() ||
      '' + item.detail?.warna?.toLowerCase() ||
      ''

    return itemName.includes(searchTerm) || itemDetail.includes(searchTerm)
  })
})

defineProps({
  isSidebarOpen: {
    type: Boolean,
    default: true,
  },
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredKatalog.value.length / parseInt(entriesPerPage.value)))
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * parseInt(entriesPerPage.value)
})

const paginatedKatalog = computed(() => {
  const start = startIndex.value
  const end = start + parseInt(entriesPerPage.value)
  return filteredKatalog.value.slice(start, end)
})

onMounted(async () => {
  await katalogStore.fetchKatalog(25) // Ubah menjadi 25 atau lebih
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const goToPrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const handleKeyPress = (e) => {
  if (!showGallery.value) return

  switch (e.key) {
    case 'ArrowLeft':
      prevImage()
      break
    case 'ArrowRight':
      nextImage()
      break
    case 'Escape':
      closeGallery()
      break
  }
}

const formatPrice = (price) => {
  if (price === null || price === undefined) return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(price)
}

const confirmDelete = async (id) => {
  if (confirm('Are you sure you want to delete this item?')) {
    try {
      await katalogStore.deleteKatalog(id)
    } catch (error) {
      console.error('Error deleting katalog:', error)
      alert('Failed to delete katalog')
    }
  }
}

// Image gallery functions
const openImageGallery = (images, index = 0) => {
  galleryImages.value = images
  currentImageIndex.value = index
  showGallery.value = true
}

const closeGallery = () => {
  showGallery.value = false
  galleryImages.value = []
  currentImageIndex.value = 0
}

const nextImage = () => {
  if (currentImageIndex.value < galleryImages.value.length - 1) {
    currentImageIndex.value++
  }
}

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

watch(entriesPerPage, (newValue) => {
  // Reset to page 1 when changing entries per page
  currentPage.value = 1

  // Ensure we're using numeric values
  entriesPerPage.value = parseInt(newValue)
})

// Add this watch to ensure currentPage stays valid when filteredKatalog changes
watch(
  filteredKatalog,
  () => {
    const maxPage = totalPages.value
    if (currentPage.value > maxPage) {
      currentPage.value = maxPage
    }
  },
  { deep: true },
)
</script>

<style scoped>
.katalog-container {
  padding: 20px;
  width: 100%;
  margin: 0 auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Adjust max-width based on sidebar state */
.katalog-container:not(.sidebar-collapsed) {
  max-width: calc(100vw - 250px - 40px); /* 250px for sidebar, 40px for padding */
}

.katalog-container.sidebar-collapsed {
  max-width: calc(100vw - 80px - 40px); /* 80px for collapsed sidebar, 40px for padding */
}

.katalog-controls {
  margin: 20px 0 30px 0;
}

.top-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-btn {
  background-color: #02163b;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.filter-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.entries-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.entries-control select {
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.search-box input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
}

.table-responsive {
  overflow-x: auto;
  margin-bottom: 20px;
  width: 100%;
}

/* Adjust table width */
.katalog-table {
  width: 100%;
  min-width: 1000px; /* Maintain minimum width for scrolling on very small screens */
  transition: width 0.3s ease;
}

.katalog-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  min-width: 1000px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.katalog-table th,
.katalog-table td {
  border: 1px solid #02163b;
  padding: 12px;
  text-align: left;
  word-wrap: break-word;
  overflow: hidden;
}

.katalog-table th {
  background-color: #02163b;
  color: white;
  padding: 12px;
  font-weight: 500;
  text-align: left;
  border-bottom: 2px solid #0a1f3b;
}

.katalog-table td {
  padding: 12px;
  border: 1px solid #dee2e6;
  vertical-align: top;
}

.detail-cell {
  position: relative;
}

.detail-content {
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  padding: 8px;
}

.detail-section {
  margin-bottom: 8px;
  padding: 4px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section strong {
  display: block;
  margin-bottom: 4px;
  color: #02163b;
}

.detail-ukuran {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.detail-ukuran span {
  background-color: #e9ecef;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

.image-cell {
  padding: 8px;
}

.image-gallery {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-wrap: wrap;
}

.image-gallery img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #dee2e6;
  transition:
    transform 0.2s,
    opacity 0.2s;
}

.image-gallery img:hover {
  transform: scale(1.1);
  opacity: 0.9;
}

.price-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background-color: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
}

.price-list div {
  font-size: 0.9em;
  padding: 2px 0;
}

.katalog-table td {
  vertical-align: top;
  padding: 12px;
}

.more-images {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.more-images:hover {
  background: rgba(0, 0, 0, 0.8);
}

.action-cell {
  padding: 8px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.edit-btn,
.delete-btn {
  width: 80px; /* Tetapkan lebar yang sama */
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  font-size: 0.9em;
  transition: opacity 0.2s;
  display: inline-block; /* Memastikan tampilan konsisten */
  text-decoration: none; /* Menghilangkan garis bawah pada link */
  margin: 0; /* Reset margin */
}

.edit-btn {
  background-color: #2196f3;
  color: white;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.edit-btn:hover,
.delete-btn:hover {
  opacity: 0.9;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination button {
  padding: 8px 12px;
  border: 1px solid #02163b;
  background-color: #02163b;
  color: white;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.pagination button:hover:not(:disabled) {
  background-color: #032661;
}

.pagination button:disabled {
  background-color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}

.pagination span {
  font-weight: 500;
  color: #02163b;
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
  display: block;
  margin-bottom: 16px;
}

.gallery-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.gallery-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.gallery-image-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.gallery-image img {
  max-width: 90vw;
  max-height: 80vh;
  object-fit: contain;
}

.gallery-close {
  position: absolute;
  top: -40px;
  right: -40px;
  background: none;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
  padding: 10px;
  z-index: 1110;
}

.gallery-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.3);
  border: none;
  color: white;
  font-size: 24px;
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  border-radius: 4px;
}

.gallery-nav:hover {
  background: rgba(255, 255, 255, 0.5);
}

.gallery-nav.prev {
  left: -60px;
}

.gallery-nav.next {
  right: -60px;
}

.gallery-nav.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.gallery-counter {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 14px;
}

/* Add hover effect for gallery thumbnails */
.image-gallery img {
  cursor: pointer;
  transition:
    transform 0.2s,
    opacity 0.2s;
}

.image-gallery img:hover {
  transform: scale(1.1);
  opacity: 0.9;
}

.more-images {
  cursor: pointer;
  transition: background-color 0.2s;
}

.more-images:hover {
  background: rgba(0, 0, 0, 0.8);
}

.text-center {
  text-align: center;
}

.detail-cell .detail-content {
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
}

.detail-section {
  margin-bottom: 8px;
  padding: 4px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section strong {
  display: block;
  margin-bottom: 4px;
  color: #02163b;
}

.detail-ukuran {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.detail-ukuran span {
  background-color: #e9ecef;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

.katalog-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  min-width: 1000px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.katalog-table th {
  background-color: #02163b;
  color: white;
  padding: 12px;
  font-weight: 500;
  text-align: left;
  border-bottom: 2px solid #0a1f3b;
}

.katalog-table td {
  padding: 12px;
  border: 1px solid #dee2e6;
  vertical-align: top;
}

.price-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background-color: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
}

.price-list div {
  font-size: 0.9em;
  padding: 2px 0;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.edit-btn,
.delete-btn {
  width: 80px; /* Tetapkan lebar yang sama */
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  font-size: 0.9em;
  transition: opacity 0.2s;
  display: inline-block; /* Memastikan tampilan konsisten */
  text-decoration: none; /* Menghilangkan garis bawah pada link */
  margin: 0; /* Reset margin */
}

.edit-btn:hover,
.delete-btn:hover {
  opacity: 0.9;
}

.image-gallery {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-wrap: wrap;
}

.image-gallery img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #dee2e6;
}

.waktu-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.waktu-list div {
  font-size: 0.9em;
  padding: 2px 6px;
  background-color: #e9ecef;
  border-radius: 4px;
}

.waktu-list .express-info {
  background-color: #cfe0ff;
  color: #02163b;
  font-weight: 500;
}

/* Add responsive adjustments for smaller screens */
@media (max-width: 1200px) {
  .katalog-container:not(.sidebar-collapsed) {
    max-width: 100%;
    padding: 15px;
  }

  .katalog-container.sidebar-collapsed {
    max-width: 100%;
    padding: 15px;
  }
}
</style>
