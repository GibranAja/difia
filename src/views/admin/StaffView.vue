<template>
  <div class="staff-container">
    <h1>DAFTAR STAFF</h1>

    <div class="staff-controls">
      <div class="top-controls">
        <router-link to="/admin/staff/create" class="add-btn">
          Tambah Staff
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
      <div v-if="!paginatedStaff.length" class="empty-state">
        <div class="empty-state-content">
          <span class="empty-icon">👥</span>
          <h3>Tidak ada staff disini</h3>
          <p>Mulai dengan menambahkan staff baru</p>
        </div>
      </div>

      <!-- Staff table -->
      <table v-else class="staff-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Nama</th>
            <th>Email</th>
            <th>Role</th>
            <th>Tanggal Bergabung</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(staff, index) in paginatedStaff" :key="staff.id">
            <td class="text-center">{{ startIndex + index + 1 }}</td>
            <td>{{ staff.name }}</td>
            <td>{{ staff.email }}</td>
            <td>{{ staff.role || 'Staff' }}</td>
            <td>{{ formatDate(staff.createdAt) }}</td>
            <td class="action-cell">
              <div class="action-buttons">
                <router-link :to="`/admin/staff/edit/${staff.id}`" class="edit-btn">
                  Edit
                </router-link>
                <button class="delete-btn" @click="confirmDelete(staff.id)">Hapus</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="paginatedStaff.length" class="pagination">
      <button :disabled="currentPage === 1" @click="currentPage--">&lt;&lt;</button>
      <span>{{ currentPage }} of {{ totalPages }}</span>
      <button :disabled="currentPage >= totalPages" @click="currentPage++">&gt;&gt;</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStaffStore } from '@/stores/StaffStore'

const staffStore = useStaffStore()
const searchQuery = ref('')
const currentPage = ref(1)
const entriesPerPage = ref(10)

// Fetch staff on component mount
onMounted(async () => {
  await staffStore.fetchStaff()
})

// Computed properties for filtering and pagination
const filteredStaff = computed(() => {
  return staffStore.staffItems.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const totalPages = computed(() => Math.ceil(filteredStaff.value.length / entriesPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * entriesPerPage.value)

const paginatedStaff = computed(() => {
  const start = startIndex.value
  const end = start + entriesPerPage.value
  return filteredStaff.value.slice(start, end)
})

// Helper functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const confirmDelete = async (id) => {
  if (confirm('Apakah Anda yakin ingin menghapus staff ini?')) {
    try {
      await staffStore.deleteStaff(id)
    } catch (error) {
      console.error('Error deleting staff:', error)
      alert('Gagal menghapus staff')
    }
  }
}
</script>

<style scoped>
.staff-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.staff-container h1 {
  margin-bottom: 30px;
  color: #333;
}

.staff-controls {
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
  text-decoration: none;
  display: inline-block;
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

.staff-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

.staff-table th,
.staff-table td {
  border: 1px solid #02163b;
  padding: 12px;
  text-align: left;
}

.staff-table th {
  background-color: #02163b;
  color: white;
}

.text-center {
  text-align: center;
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