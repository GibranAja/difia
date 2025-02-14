<template>
  <div class="voucher-container" :class="{ 'sidebar-collapsed': !isSidebarOpen }">
    <LoadComponent v-if="voucherStore.isLoading" />

    <template v-else>
      <h1>DAFTAR VOUCHER</h1>

      <div class="voucher-controls">
        <div class="top-controls">
          <router-link :to="{ path: '/admin/voucher/create' }" class="add-btn">
            <i class="fas fa-plus"></i> Tambah Voucher
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
            <input type="text" v-model="searchQuery" placeholder="Search voucher..." />
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <!-- Empty state -->
        <div v-if="!paginatedVouchers.length" class="empty-state">
          <div class="empty-state-content">
            <span class="empty-icon">🎟️</span>
            <h3>Tidak ada voucher</h3>
            <p>Mulai dengan menambahkan voucher baru</p>
          </div>
        </div>

        <!-- Voucher table -->
        <table v-else class="voucher-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Kode Voucher</th>
              <th>Tipe Diskon</th>
              <th>Nilai Diskon</th>
              <th>Berlaku Sampai</th>
              <th>Penggunaan</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(voucher, index) in paginatedVouchers" :key="voucher.id">
              <td class="text-center">{{ startIndex + index + 1 }}</td>
              <td>{{ voucher.code }}</td>
              <td>{{ voucher.discountType === 'percentage' ? 'Persentase' : 'Nominal' }}</td>
              <td>{{ formatDiscount(voucher.discountType, voucher.discountValue) }}</td>
              <td>{{ formatDate(voucher.validUntil) }}</td>
              <td>{{ voucher.currentUses }}/{{ voucher.maxUses }}</td>
              <td>
                <span
                  class="status-badge"
                  :class="{ active: isVoucherActive(voucher), inactive: !isVoucherActive(voucher) }"
                >
                  {{ isVoucherActive(voucher) ? 'Aktif' : 'Nonaktif' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <router-link :to="`/admin/voucher/edit/${voucher.id}`" class="edit-btn">
                    <i class="fas fa-edit"></i>
                  </router-link>
                  <button class="delete-btn" @click="showDeleteConfirmation(voucher.id)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="paginatedVouchers.length" class="pagination">
          <button :disabled="currentPage === 1" @click="currentPage--">&lt;&lt;</button>
          <span>{{ currentPage }} of {{ totalPages }}</span>
          <button :disabled="currentPage >= totalPages" @click="currentPage++">&gt;&gt;</button>
        </div>
      </div>
    </template>

    <!-- Delete confirmation modal -->
    <NegativeModal
      v-if="showDeleteModal"
      title="Hapus Voucher"
      message="Apakah Anda yakin ingin menghapus voucher ini?"
      :loading="isDeleting"
      @close="closeDeleteModal"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useVoucherStore } from '@/stores/VoucherStore'
import LoadComponent from '@/components/LoadComponent.vue'
import NegativeModal from '@/components/NegativeModal.vue'
import { useToast } from 'vue-toastification'

const toast = useToast()
const voucherStore = useVoucherStore()
const searchQuery = ref('')
const currentPage = ref(1)
const entriesPerPage = ref(10)
const showDeleteModal = ref(false)
const selectedVoucherId = ref(null)
const isDeleting = ref(false)

defineProps({
  isSidebarOpen: {
    type: Boolean,
    default: true,
  },
})

// Computed properties
const filteredVouchers = computed(() => {
  return voucherStore.voucherItems.filter((voucher) =>
    voucher.code.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

const startIndex = computed(() => (currentPage.value - 1) * entriesPerPage.value)

const paginatedVouchers = computed(() => {
  return filteredVouchers.value.slice(startIndex.value, startIndex.value + entriesPerPage.value)
})

const totalPages = computed(() => Math.ceil(filteredVouchers.value.length / entriesPerPage.value))

// Helper functions
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatDiscount = (type, value) => {
  if (type === 'percentage') {
    return `${value}%`
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(value)
}

const isVoucherActive = (voucher) => {
  const now = new Date()
  const expiryDate = new Date(voucher.validUntil)
  return voucher.isActive && expiryDate > now && voucher.currentUses < voucher.maxUses
}

// Modal functions
const showDeleteConfirmation = (id) => {
  selectedVoucherId.value = id
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedVoucherId.value = null
}

const handleDelete = async () => {
  if (!selectedVoucherId.value) return

  try {
    isDeleting.value = true
    const result = await voucherStore.deleteVoucher(selectedVoucherId.value)
    if (result.success) {
      toast.success('Voucher berhasil dihapus')
      closeDeleteModal()
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    toast.error('Gagal menghapus voucher: ' + error.message)
  } finally {
    isDeleting.value = false
  }
}

onMounted(async () => {
  await voucherStore.fetchVouchers()
})
</script>

<style scoped>
.voucher-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  transition: margin-left 0.3s;
}

.voucher-container h1 {
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.voucher-controls {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.add-btn {
  background-color: #02163b;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: opacity 0.3s;
}

.add-btn:hover {
  opacity: 0.9;
}

.filter-controls {
  display: flex;
  gap: 15px;
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
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
}

.voucher-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.voucher-table th,
.voucher-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.voucher-table th {
  background-color: #02163b;
  color: white;
  font-weight: 500;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.inactive {
  background-color: #ffebee;
  color: #c62828;
}

.delete-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.delete-btn:hover {
  opacity: 0.9;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
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

.action-buttons {
  display: flex;
  gap: 8px;
}

.edit-btn {
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.2s;
}

.edit-btn:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .voucher-container {
    padding: 15px;
  }

  .voucher-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-controls {
    flex-direction: column;
  }

  .search-box input {
    width: 100%;
  }
}
</style>
