<template>
    <div class="katalog-container">
      <h1>DAFTAR KATALOG</h1>
  
      <div class="katalog-controls">
        <div class="top-controls">
          <button class="add-btn" @click="showModal = true">Tambah Katalog</button>
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
        <table class="katalog-table">
          <colgroup>
            <col style="width: 5%" />
            <col style="width: 20%" />
            <col style="width: 15%" />
            <col style="width: 25%" />
            <col style="width: 20%" />
            <col style="width: 15%" />
          </colgroup>
          <thead>
            <tr>
              <th>No.</th>
              <th>Nama Katalog</th>
              <th>Harga Katalog</th>
              <th>Detail Produk</th>
              <th>Foto Produk</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in paginatedKatalog" :key="item.id">
              <td>{{ startIndex + index + 1 }}</td>
              <td>{{ item.nama }}</td>
              <td>{{ formatPrice(item.harga) }}</td>
              <td class="detail-cell">
                <div class="detail-content">{{ item.detail }}</div>
              </td>
              <td class="image-cell">
                <div class="image-gallery">
                  <img 
                    v-for="(image, imgIndex) in item.images.slice(0, 3)"
                    :key="imgIndex"
                    :src="image"
                    :alt="'Product ' + (imgIndex + 1)"
                    @click="showImageGallery(item.images)"
                  />
                  <span v-if="item.images.length > 3" class="more-images">
                    +{{ item.images.length - 3 }}
                  </span>
                </div>
              </td>
              <td class="action-cell">
                <div class="action-buttons">
                  <button class="edit-btn" @click="editItem(item)">
                    Edit
                  </button>
                  <button class="delete-btn" @click="confirmDelete(item.id)">
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <div class="pagination">
        <button 
          :disabled="currentPage === 1" 
          @click="currentPage--"
        >&lt;&lt;</button>
        <span>{{ currentPage }} of {{ totalPages }}</span>
        <button 
          :disabled="currentPage >= totalPages" 
          @click="currentPage++"
        >&gt;&gt;</button>
      </div>
  
      <CreateKatalogComponent
        v-if="showModal"
        :edit-data="editData"
        @close="closeModal"
        @submit="handleSubmit"
      />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useKatalogStore } from '@/stores/KatalogStore'
import CreateKatalogComponent from '@/components/admin/CreateKatalogComponent.vue'

const katalogStore = useKatalogStore()
const showModal = ref(false)
const editData = ref(null)
const searchQuery = ref('')
const currentPage = ref(1)
const entriesPerPage = ref(10)

const filteredKatalog = computed(() => {
  return katalogStore.katalogItems.filter(item => 
    item.nama.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.detail.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const totalPages = computed(() => 
  Math.ceil(filteredKatalog.value.length / entriesPerPage.value)
)

const startIndex = computed(() => 
  (currentPage.value - 1) * entriesPerPage.value
)

const paginatedKatalog = computed(() => {
  const start = startIndex.value
  const end = start + entriesPerPage.value
  return filteredKatalog.value.slice(start, end)
})

onMounted(async () => {
  await katalogStore.fetchKatalog()
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(price)
}

const editItem = (item) => {
  editData.value = { ...item }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editData.value = null
}

const handleSubmit = async (formData) => {
  try {
    if (editData.value) {
      await katalogStore.updateKatalog(editData.value.id, formData)
    } else {
      const result = await katalogStore.addKatalog(formData)
      if (!result.success) {
        throw new Error(result.error)
      }
    }
    await katalogStore.fetchKatalog()
    closeModal()
  } catch (error) {
    console.error('Error submitting katalog:', error)
    alert('Failed to save katalog: ' + error.message)
  }
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
</script>

<style scoped>
.katalog-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
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
  background-color: #b69b87;
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
}

.katalog-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  min-width: 1000px;
}

.katalog-table th,
.katalog-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
  word-wrap: break-word;
  overflow: hidden;
}

.katalog-table th {
  background-color: #b69b87;
  color: white;
}

.detail-cell {
  position: relative;
}

.detail-content {
  max-height: 100px;
  overflow-y: auto;
  white-space: pre-wrap;
}

.image-cell {
  padding: 8px;
}

.image-gallery {
  display: flex;
  gap: 5px;
  align-items: center;
}

.image-gallery img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.image-gallery img:hover {
  transform: scale(1.1);
}

.more-images {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
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
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  min-width: 60px;
}

.edit-btn {
  background-color: #4caf50;
  color: white;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination button {
  padding: 5px 10px;
  border: 1px solid #ddd;
  background-color: #b69b87;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}

.pagination button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}
</style>