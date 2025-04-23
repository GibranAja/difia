<template>
  <div class="order-container" :class="{ 'sidebar-collapsed': !isSidebarOpen }">
    <LoadComponent v-if="loading" />

    <template v-else>
      <h1>KELOLA PESANAN</h1>

      <!-- Order controls component -->
      <OrderControls
        v-model:activeOrderType="activeOrderType"
        v-model:searchQuery="searchQuery"
        v-model:selectedStatuses="selectedStatuses"
      />

      <!-- Regular Orders Section -->
      <div class="order-section" v-if="activeOrderType === 'regular'">
        <OrderTable
          :orders="paginatedRegularOrders"
          :searchQuery="searchQuery"
          orderType="regular"
          :showEmbossColumn="false"
          :emptyStateTitle="regularOrders.length ? 'Tidak ada data order' : 'Belum Ada Pesanan'"
          :emptyStateMessage="
            regularOrders.length
              ? 'Tidak ditemukan pesanan dengan filter yang dipilih'
              : 'Saat ini belum ada pesanan satuan yang masuk'
          "
          @update-status="openStatusModal"
          @view-payment="openPaymentProof"
        />

        <PaginationControls
          v-if="regularOrders.length"
          :currentPage="currentRegularPage"
          :totalPages="totalRegularPages"
          :entriesPerPage="entriesPerPage"
          @prev-page="goToPrevRegularPage"
          @next-page="goToNextRegularPage"
          @update:entriesPerPage="updateEntriesPerPage"
        />
      </div>

      <!-- Souvenir Orders Section -->
      <div class="order-section" v-if="activeOrderType === 'souvenir'">
        <OrderTable
          :orders="paginatedSouvenirOrders"
          :searchQuery="searchQuery"
          orderType="souvenir"
          :showEmbossColumn="true"
          :emptyStateIcon="'fa-gift'"
          :emptyStateTitle="souvenirOrders.length ? 'Tidak ada data order' : 'Belum Ada Pesanan'"
          :emptyStateMessage="
            souvenirOrders.length
              ? 'Tidak ditemukan pesanan dengan filter yang dipilih'
              : 'Saat ini belum ada pesanan souvenir yang masuk'
          "
          @update-status="openStatusModal"
          @view-payment="openPaymentProof"
          @view-design="openImagePreview"
        />

        <PaginationControls
          v-if="souvenirOrders.length"
          :currentPage="currentSouvenirPage"
          :totalPages="totalSouvenirPages"
          :entriesPerPage="entriesPerPage"
          @prev-page="goToPrevSouvenirPage"
          @next-page="goToNextSouvenirPage"
          @update:entriesPerPage="updateEntriesPerPage"
        />
      </div>
    </template>

    <!-- Status Update Modal -->
    <OrderStatusModal
      :show="showStatusModal"
      :order="selectedOrder"
      :selectedStatus="newStatus"
      :cancelReason="cancelReason"
      v-model:cancelReason="cancelReason"
      @close="closeStatusModal"
      @status-selected="newStatus = $event"
      @update-status="updateOrderStatus"
    />

    <!-- Image Preview Modal -->
    <ImagePreviewModal
      :show="showImagePreview"
      :imageSrc="previewImage"
      altText="Design preview"
      @close="closeImagePreview"
    />

    <!-- Payment Proof Modal -->
    <ImagePreviewModal
      :show="showPaymentProofModal"
      :imageSrc="paymentProofImage"
      altText="Payment proof"
      @close="closePaymentProofModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { db } from '@/config/firebase'
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore'
import LoadComponent from '@/components/LoadComponent.vue'
import { useToast } from 'vue-toastification'
import { useOrderStore } from '@/stores/OrderStore'

// Import new components
import OrderControls from '@/components/admin/orders/OrderControls.vue'
import OrderTable from '@/components/admin/orders/OrderTable.vue'
import OrderStatusModal from '@/components/admin/orders/OrderStatusModal.vue'
import ImagePreviewModal from '@/components/admin/orders/ImagePreviewModal.vue'
import PaginationControls from '@/components/admin/orders/PaginationControls.vue'

const toast = useToast()
const loading = ref(true)
const orders = ref([])
const showStatusModal = ref(false)
const showImagePreview = ref(false)
const selectedOrder = ref(null)
const newStatus = ref('')
const cancelReason = ref('')
const previewImage = ref('')
const showPaymentProofModal = ref(false)
const paymentProofImage = ref('')
const activeOrderType = ref('regular')
const selectedStatuses = ref([])
const searchQuery = ref('')
const orderStore = useOrderStore()

defineProps({
  isSidebarOpen: {
    type: Boolean,
    default: true,
  },
})

// Computed properties for filtered orders
const regularOrders = computed(() => {
  let filtered = orders.value.filter((order) => !order.isBulkOrder)

  // Apply status filter
  if (selectedStatuses.value.length > 0) {
    filtered = filtered.filter((order) => selectedStatuses.value.includes(order.status))
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter((order) => {
      return (
        order.id.toLowerCase().includes(query) ||
        order.shippingDetails.name.toLowerCase().includes(query) ||
        order.shippingDetails.email.toLowerCase().includes(query) ||
        order.shippingDetails.phone.toLowerCase().includes(query) ||
        order.productName.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query)
      )
    })
  }

  return filtered
})

const souvenirOrders = computed(() => {
  let filtered = orders.value.filter((order) => order.isBulkOrder)

  // Apply status filter
  if (selectedStatuses.value.length > 0) {
    filtered = filtered.filter((order) => selectedStatuses.value.includes(order.status))
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter((order) => {
      return (
        order.id.toLowerCase().includes(query) ||
        order.shippingDetails.name.toLowerCase().includes(query) ||
        order.shippingDetails.email.toLowerCase().includes(query) ||
        order.shippingDetails.phone.toLowerCase().includes(query) ||
        order.productName.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query)
      )
    })
  }

  return filtered
})

// Fetch orders
const fetchOrders = async () => {
  try {
    loading.value = true
    const ordersRef = collection(db, 'orders')
    const q = query(ordersRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)

    orders.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    toast.error('Failed to fetch orders')
    console.error('Error fetching orders:', error)
  } finally {
    loading.value = false
  }
}

// Modal controls
const openStatusModal = (order) => {
  selectedOrder.value = order
  newStatus.value = ''
  cancelReason.value = ''
  showStatusModal.value = true
}

const closeStatusModal = () => {
  showStatusModal.value = false
  selectedOrder.value = null
  newStatus.value = ''
  cancelReason.value = ''
}

const openImagePreview = (imageUrl) => {
  previewImage.value = imageUrl
  showImagePreview.value = true
}

const closeImagePreview = () => {
  showImagePreview.value = false
  previewImage.value = ''
}

const openPaymentProof = (proofUrl) => {
  if (!proofUrl) {
    toast.error('No payment proof available')
    return
  }
  paymentProofImage.value = proofUrl
  showPaymentProofModal.value = true
}

const closePaymentProofModal = () => {
  showPaymentProofModal.value = false
  paymentProofImage.value = ''
}

// Convert status code to human-readable label
const getStatusLabel = (status) => {
  const statusLabels = {
    'pending': 'Menunggu Pembayaran',
    'processing': 'Diproses',
    'shipped': 'Dikirim',
    'delivered': 'Diterima',
    'cancelled': 'Dibatalkan',
    'completed': 'Selesai',
    'refunded': 'Dikembalikan'
  }
  return statusLabels[status] || status
}

// Update order status
const updateOrderStatus = async () => {
  if (!selectedOrder.value || !newStatus.value) return

  try {
    const orderRef = doc(db, 'orders', selectedOrder.value.id)
    const updateData = {
      status: newStatus.value,
    }

    if (newStatus.value === 'cancelled') {
      updateData.cancelReason = cancelReason.value
    }

    await updateDoc(orderRef, updateData)

    // Update local state
    const orderIndex = orders.value.findIndex((o) => o.id === selectedOrder.value.id)
    if (orderIndex !== -1) {
      orders.value[orderIndex] = {
        ...orders.value[orderIndex],
        ...updateData,
      }
    }

    // Send notification to the customer
    await orderStore.sendOrderStatusNotification(
      selectedOrder.value.id,
      newStatus.value,
      selectedOrder.value.userId,
    )

    closeStatusModal()
    toast.success(`Status pesanan berhasil diubah menjadi ${getStatusLabel(newStatus.value)}`)
  } catch (error) {
    console.error('Error updating order status:', error)
    toast.error('Gagal mengubah status pesanan')
  }
}

// Add pagination state
const currentRegularPage = ref(1)
const currentSouvenirPage = ref(1)
const entriesPerPage = ref(10)

// Computed properties for pagination
const totalRegularPages = computed(() => {
  return Math.max(1, Math.ceil(regularOrders.value.length / entriesPerPage.value))
})

const totalSouvenirPages = computed(() => {
  return Math.max(1, Math.ceil(souvenirOrders.value.length / entriesPerPage.value))
})

const paginatedRegularOrders = computed(() => {
  const startIndex = (currentRegularPage.value - 1) * entriesPerPage.value
  const endIndex = startIndex + entriesPerPage.value
  return regularOrders.value.slice(startIndex, endIndex)
})

const paginatedSouvenirOrders = computed(() => {
  const startIndex = (currentSouvenirPage.value - 1) * entriesPerPage.value
  const endIndex = startIndex + entriesPerPage.value
  return souvenirOrders.value.slice(startIndex, endIndex)
})

// Navigation functions
const goToNextRegularPage = () => {
  if (currentRegularPage.value < totalRegularPages.value) {
    currentRegularPage.value++
  }
}

const goToPrevRegularPage = () => {
  if (currentRegularPage.value > 1) {
    currentRegularPage.value--
  }
}

const goToNextSouvenirPage = () => {
  if (currentSouvenirPage.value < totalSouvenirPages.value) {
    currentSouvenirPage.value++
  }
}

const goToPrevSouvenirPage = () => {
  if (currentSouvenirPage.value > 1) {
    currentSouvenirPage.value--
  }
}

const updateEntriesPerPage = (value) => {
  entriesPerPage.value = value
  // Reset page numbers
  currentRegularPage.value = 1
  currentSouvenirPage.value = 1
}

// Add a watcher for when entriesPerPage changes
watch(entriesPerPage, () => {
  // Reset page numbers when entries per page changes to avoid being on a now non-existent page
  currentRegularPage.value = 1
  currentSouvenirPage.value = 1
})

// Lifecycle hooks
onMounted(fetchOrders)
</script>

<style scoped>
.order-container {
  font-family: 'Montserrat', sans-serif;
  padding: 20px;
  width: 100%;
  height: calc(100vh - 64px); /* 64px adalah tinggi navbar, sesuaikan jika berbeda */
  overflow-y: auto; /* Enables vertical scrolling for the whole page */
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.order-container:not(.sidebar-collapsed) {
  max-width: calc(100vw - 250px - 40px);
}

.order-container.sidebar-collapsed {
  max-width: calc(100vw - 80px - 40px);
}

.order-section {
  margin-bottom: 40px;
  animation: fadeIn 0.3s ease;
}

h1 {
  color: #333;
  font-size: 24px;
  margin-bottom: 30px;
  font-family: 'Montserrat', sans-serif;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Adjustments */
@media (max-width: 1200px) {
  .order-container:not(.sidebar-collapsed),
  .order-container.sidebar-collapsed {
    max-width: 100%;
    padding: 15px;
  }
}
</style>
