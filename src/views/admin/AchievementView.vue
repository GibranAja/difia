<!-- src/views/admin/AchievementView.vue -->
<template>
  <div class="achievement-container" :class="{ 'sidebar-collapsed': !isSidebarOpen }">
    <LoadComponent v-if="achievementStore.loading" />

    <template v-else>
      <h1>DAFTAR PENGHARGAAN</h1>

      <div class="achievement-controls">
        <div class="top-controls">
          <router-link to="/admin/achievement/create" class="add-btn">
            Tambah Penghargaan
          </router-link>
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
        <!-- Empty state -->
        <div v-if="!paginatedAchievements.length" class="empty-state">
          <div class="empty-state-content">
            <span class="empty-icon">🏆</span>
            <h3>Tidak ada penghargaan disini</h3>
            <p>Mulai dengan menambahkan penghargaan baru</p>
          </div>
        </div>

        <!-- Achievement table -->
        <table v-else class="achievement-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Gambar</th>
              <th>Judul</th>
              <th>Deskripsi</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(achievement, index) in paginatedAchievements" :key="achievement.id">
              <td>{{ startIndex + index + 1 }}</td>
              <td class="image-cell">
                <img :src="achievement.image" :alt="achievement.title" />
              </td>
              <td>{{ achievement.title }}</td>
              <td class="description-cell">
                <div class="description-content">
                  {{ achievement.description }}
                </div>
              </td>
              <td>{{ formatDate(achievement.createdAt) }}</td>
              <td class="action-cell">
                <div class="action-buttons">
                  <router-link :to="`/admin/achievement/edit/${achievement.id}`" class="edit-btn">
                    Edit
                  </router-link>
                  <button class="delete-btn" @click="confirmDelete(achievement.id)">Hapus</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="paginatedAchievements.length" class="pagination">
        <button :disabled="currentPage === 1" @click="currentPage--">&lt;&lt;</button>
        <span>{{ currentPage }} of {{ totalPages }}</span>
        <button :disabled="currentPage >= totalPages" @click="currentPage++">&gt;&gt;</button>
      </div>
    </template>

    <!-- Delete confirmation modal -->
    <NegativeModal
      v-if="showDeleteModal"
      title="Hapus Penghargaan"
      message="Apakah Anda yakin ingin menghapus penghargaan ini?"
      :loading="isDeleting"
      @close="closeDeleteModal"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAchievementStore } from '@/stores/AchievementStore'
import LoadComponent from '@/components/LoadComponent.vue'
import NegativeModal from '@/components/NegativeModal.vue'
import { useToast } from 'vue-toastification'

const toast = useToast()
const achievementStore = useAchievementStore()
const searchQuery = ref('')
const currentPage = ref(1)
const entriesPerPage = ref(10)
const showDeleteModal = ref(false)
const selectedAchievementId = ref(null)
const isDeleting = ref(false)

// Computed properties for filtering and pagination
const filteredAchievements = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return achievementStore.achievements.filter(
    (achievement) =>
      achievement.title.toLowerCase().includes(query) ||
      achievement.description.toLowerCase().includes(query),
  )
})

const totalPages = computed(() =>
  Math.ceil(filteredAchievements.value.length / entriesPerPage.value),
)

const startIndex = computed(() => (currentPage.value - 1) * entriesPerPage.value)

const paginatedAchievements = computed(() =>
  filteredAchievements.value.slice(startIndex.value, startIndex.value + entriesPerPage.value),
)

// Modal functions
const confirmDelete = (id) => {
  selectedAchievementId.value = id
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedAchievementId.value = null
}

const handleDelete = async () => {
  if (!selectedAchievementId.value) return

  try {
    isDeleting.value = true
    const result = await achievementStore.deleteAchievement(selectedAchievementId.value)
    if (result.success) {
      toast.success('Penghargaan berhasil dihapus')
      closeDeleteModal()
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    toast.error('Gagal menghapus penghargaan: ' + error.message)
  } finally {
    isDeleting.value = false
  }
}

const formatDate = (date) => {
  return new Date(date?.toDate?.() || date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Fetch achievements on component mount
onMounted(async () => {
  await achievementStore.fetchAchievements()
})

// Props
defineProps({
  isSidebarOpen: {
    type: Boolean,
    default: true,
  },
})
</script>

<style scoped>
.achievement-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.achievement-container h1 {
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.achievement-controls {
  margin-bottom: 20px;
}

.top-controls {
  margin-bottom: 20px;
}

.add-btn {
  display: inline-block;
  background-color: #02163b;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.add-btn:hover {
  background-color: #032454;
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

.achievement-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.achievement-table th,
.achievement-table td {
  border: 1px solid #02163b;
  padding: 12px;
  text-align: left;
  word-wrap: break-word;
  overflow: hidden;
}

.achievement-table th {
  background-color: #02163b;
  color: white;
  padding: 12px;
  font-weight: 500;
  text-align: left;
  border-bottom: 2px solid #0a1f3b;
}

.image-cell {
  width: 120px;
}

.image-cell img {
  width: 100px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.description-cell {
  max-width: 300px;
}

.description-content {
  max-height: 100px;
  overflow-y: auto;
  white-space: pre-line;
  padding: 8px;
}

.action-cell {
  width: 150px;
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
  text-decoration: none;
  color: white;
}

.edit-btn {
  background-color: #2196f3;
}

.delete-btn {
  background-color: #f44336;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
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

/* Add responsive styles */
@media (max-width: 768px) {
  .achievement-container {
    padding: 15px;
  }

  .filter-controls {
    flex-direction: column;
    gap: 15px;
  }

  .search-box input {
    width: 100%;
  }
}
</style>
