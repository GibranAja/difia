<template>
  <div class="orders-view">
    <h2 class="section-title">Pesanan Saya</h2>

    <!-- Search Bar and Filter Dropdown Side-by-Side -->
    <div class="search-filter-container">
      <div class="search-container">
        <div class="search-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Cari pesanan berdasarkan ID atau status..."
            v-model="searchQuery"
          />
        </div>
      </div>

      <!-- Filter Dropdown -->
      <div class="filter-dropdown">
        <div class="dropdown-toggle" @click="isFilterOpen = !isFilterOpen">
          <span>
            <i :class="['fas', getActiveFilterIcon()]"></i>
            {{ getActiveFilterLabel() }}
          </span>
          <i class="fas fa-chevron-down"></i>
        </div>
        <div class="dropdown-menu" v-if="isFilterOpen">
          <div
            v-for="status in statusFilters"
            :key="status.value"
            @click="
              setFilter(status.value);
              isFilterOpen = false
            "
            :class="['dropdown-item', { active: currentFilter === status.value }]"
          >
            <i :class="['fas', status.icon]"></i>
            {{ status.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Component -->
    <div v-if="loading">
      <LoadComponent />
    </div>

    <!-- Order List - only show when not loading and has orders -->
    <div v-else-if="filteredOrders.length > 0" class="order-list">
      <div v-for="order in filteredOrders" :key="order.id" class="order-card">
        <div class="order-header" @click="toggleOrder(order.id)">
          <div class="order-main-info">
            <div class="order-id">#{{ order.id }}</div>
            <div class="order-date">{{ formatDate(order.createdAt) }}</div>
            <div class="order-amount">Total: Rp {{ formatPrice(order.totalAmount) }}</div>
          </div>
          <div class="order-status">
            <span :class="['status-badge', getStatusClass(order.status)]">
              {{ getStatusLabel(order.status) }}
            </span>
            <i :class="['fas', expandedOrders[order.id] ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
          </div>
        </div>

        <!-- Expanded Order Details -->
        <Transition name="slide">
          <div v-if="expandedOrders[order.id]" class="order-expanded">
            <!-- Cancellation Reason (if cancelled) -->
            <div
              v-if="order.status === 'cancelled' && order.cancelReason"
              class="cancellation-reason"
            >
              <div class="reason-header">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Alasan Pembatalan</h3>
              </div>
              <p>{{ order.cancelReason }}</p>
            </div>

            <div class="order-grid">
              <!-- Product Details -->
              <div class="detail-section">
                <h3>Detail Produk</h3>
                <div class="product-info">
                  <img
                    :src="getProductImage(order)"
                    :alt="order.productName"
                    class="product-image"
                    @error="handleImageError"
                  />
                  <div class="product-details">
                    <div class="product-header">
                      <h4>{{ order.productName }}</h4>
                      <div
                        class="custom-design-container"
                        v-if="
                          order.customOptions?.purchaseType === 'Souvenir' &&
                          order.customOptions?.uploadedImage
                        "
                      >
                        <span class="design-logo-label">Design Logo</span>
                        <div class="custom-design-thumbnail">
                          <img :src="order.customOptions.uploadedImage" alt="Design Logo" />
                        </div>
                      </div>
                    </div>
                    <p>Tipe: {{ order.customOptions?.purchaseType || 'Satuan' }}</p>
                    <p>Harga: {{ order.customOptions?.priceType || 'Standard' }}</p>
                    <p>Jumlah: {{ order.quantity }} pcs</p>
                    <p>Bahan Luar: {{ order.customOptions?.bahanLuar }}</p>
                    <p>Bahan Dalam: {{ order.customOptions?.bahanDalam }}</p>
                    <p>Aksesoris: {{ order.customOptions?.aksesoris?.join(', ') }}</p>
                    <p v-if="order.customOptions?.note">Catatan: {{ order.customOptions?.note }}</p>
                  </div>
                </div>
              </div>

              <!-- Shipping Details -->
              <div class="detail-section">
                <h3>Informasi Pengiriman</h3>
                <div class="shipping-info">
                  <p><strong>Penerima:</strong> {{ order.shippingDetails?.name }}</p>
                  <p><strong>Email:</strong> {{ order.shippingDetails?.email }}</p>
                  <p><strong>Telepon:</strong> {{ order.shippingDetails?.phone }}</p>
                  <p><strong>Alamat:</strong> {{ order.shippingDetails?.address }}</p>
                  <p><strong>Kota:</strong> {{ order.shippingDetails?.city }}</p>
                  <p><strong>Provinsi:</strong> {{ order.shippingDetails?.province }}</p>
                  <p><strong>Kode Pos:</strong> {{ order.shippingDetails?.zip }}</p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="action-section">
                <!-- Download invoice button (for processing orders) -->
                <button
                  v-if="order.status === 'process'"
                  class="invoice-btn"
                  @click="downloadOrderInvoice(order.id)"
                  :disabled="processingInvoice === order.id || cooldowns[order.id] > 0"
                >
                  <i class="fas fa-file-invoice"></i>
                  <span v-if="processingInvoice === order.id">Processing...</span>
                  <span v-else-if="cooldowns[order.id] > 0">
                    Tunggu ({{ cooldowns[order.id] }}s)
                  </span>
                  <span v-else>Lihat Invoice</span>
                </button>

                <!-- Confirm delivery button (for delivery status) -->
                <button
                  v-if="order.status === 'delivery'"
                  class="complete-btn"
                  @click="completeOrder(order.id)"
                >
                  Pesanan Diterima
                </button>

                <!-- Cancel button (for pending orders) -->
                <button
                  v-if="order.status === 'pending'"
                  class="cancel-btn"
                  @click="openCancelModal(order)"
                >
                  <i class="fas fa-times-circle"></i>
                  Batalkan Pesanan
                </button>

                <!-- Refund button (for cancelled orders) -->
                <button
                  v-if="order.status === 'cancelled' && !order.refundRequest"
                  class="refund-btn"
                  @click="openRefundModal(order)"
                >
                  <i class="fas fa-money-bill-wave"></i>
                  Ajukan Refund
                </button>

                <!-- Refund status indicator (if refund request exists) -->
                <div v-if="order.refundRequest" class="refund-status">
                  <i :class="['fas', getRefundStatusIcon(order.refundRequest.status)]"></i>
                  <span>Refund: {{ getRefundStatusLabel(order.refundRequest.status) }}</span>
                </div>

                <!-- Actions for completed orders -->
                <div v-if="order.status === 'complete'" class="completed-actions">
                  <router-link
                    :to="{
                      path: '/checkout',
                      query: { reorder: true, orderId: order.id },
                    }"
                    class="buy-again-btn"
                    @click="handleReorder(order)"
                  >
                    Beli Lagi
                  </router-link>
                  <button class="review-btn" @click="openReviewModal(order)">Tulis Ulasan</button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Empty state when no orders match filters -->
    <div v-else class="empty-state">
      <i class="fas fa-shopping-bag empty-icon"></i>
      <h3>Belum Ada Pesanan</h3>
      <p>
        {{
          currentFilter === 'all'
            ? 'Anda belum memiliki pesanan apapun.'
            : `Tidak ada pesanan dengan status ${getStatusLabel(currentFilter)}.`
        }}
      </p>
      <router-link to="/" class="shop-now-btn">Belanja Sekarang</router-link>
    </div>

    <!-- Review Modal -->
    <ReviewModal v-if="showReviewModal" :order="selectedOrder" @close="closeReviewModal" />

    <!-- Refund Modal - will be shown for both refunds and cancellations -->
    <RefundModal 
      v-if="showRefundModal" 
      :order="selectedOrder" 
      :is-cancellation="isCancellation"
      @close="closeRefundModal" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from '@/stores/AuthStore'
import { useToast } from 'vue-toastification'
import { useInvoiceStore } from '@/stores/InvoiceStore'
import { useNotificationStore } from '@/stores/NotificationStore'
import { useRoute } from 'vue-router'
import ReviewModal from '@/components/ReviewModal.vue'
import RefundModal from '@/components/RefundModal.vue'
import LoadComponent from '@/components/LoadComponent.vue'

const authStore = useAuthStore()
const toast = useToast()
const invoiceStore = useInvoiceStore()
const notificationStore = useNotificationStore()
const route = useRoute()

// Reactive state
const orders = ref([])
const searchQuery = ref('')
const expandedOrders = ref({})
const processingInvoice = ref(null)
const cooldowns = ref({})
const showReviewModal = ref(false)
const selectedOrder = ref(null)
const currentFilter = ref('all')
const isFilterOpen = ref(false)
const loading = ref(true) // New loading state
const showRefundModal = ref(false) // Refund modal state
const isCancellation = ref(false) // Track whether it's a cancellation or refund
let unsubscribe = null

// Status filter options
const statusFilters = [
  { label: 'Semua', value: 'all', icon: 'fa-list' },
  { label: 'Menunggu', value: 'pending', icon: 'fa-clock' },
  { label: 'Diproses', value: 'process', icon: 'fa-cog' },
  { label: 'Dikirim', value: 'delivery', icon: 'fa-shipping-fast' },
  { label: 'Selesai', value: 'complete', icon: 'fa-check-circle' },
  { label: 'Dibatalkan', value: 'cancelled', icon: 'fa-times-circle' },
]

// Set active filter
const setFilter = (filter) => {
  currentFilter.value = filter
}

// Get active filter icon
const getActiveFilterIcon = () => {
  const activeFilter = statusFilters.find((filter) => filter.value === currentFilter.value)
  return activeFilter ? activeFilter.icon : 'fa-list'
}

// Get active filter label
const getActiveFilterLabel = () => {
  const activeFilter = statusFilters.find((filter) => filter.value === currentFilter.value)
  return activeFilter ? activeFilter.label : 'Semua'
}

// Get orders from Firestore
onMounted(async () => {
  loading.value = true // Set loading to true at the start

  // Add a timeout to show "no data" after 5 seconds
  const timeoutId = setTimeout(() => {
    if (loading.value) {
      loading.value = false
    }
  }, 5000)

  const searchParam = route.query.search
  if (searchParam) {
    searchQuery.value = searchParam
  }

  if (!authStore.isLoggedIn) {
    loading.value = false // Turn off loading if not logged in
    clearTimeout(timeoutId) // Clear the timeout
    return
  }

  try {
    const userId = authStore.currentUser.id
    const ordersRef = collection(db, 'orders')
    const ordersQuery = query(
      ordersRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    )

    unsubscribe = onSnapshot(
      ordersQuery,
      async (snapshot) => {
        const orderDocs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Fetch catalog images for each order
        const ordersWithImages = await Promise.all(
          orderDocs.map(async (order) => {
            if (order.productId) {
              try {
                const catalogRef = doc(db, 'katalog', order.productId)
                const catalogDoc = await getDoc(catalogRef)
                if (catalogDoc.exists()) {
                  const catalogData = catalogDoc.data()
                  return {
                    ...order,
                    productImage: catalogData.images?.[0] || null,
                    customOptions: {
                      ...order.customOptions,
                      productImage: catalogData.images?.[0] || order.customOptions?.productImage,
                    },
                  }
                }
              } catch (err) {
                console.error('Error fetching catalog:', err)
              }
            }
            return order
          }),
        )

        orders.value = ordersWithImages
        loading.value = false // Turn off loading after data is loaded
        clearTimeout(timeoutId) // Clear the timeout since data loaded successfully
      },
      (error) => {
        console.error('Error in orders snapshot:', error)
        toast.error('Gagal memuat pesanan')
        loading.value = false // Turn off loading on error
        clearTimeout(timeoutId) // Clear the timeout
      },
    )
  } catch (error) {
    console.error('Error setting up orders listener:', error)
    toast.error('Gagal memuat pesanan')
    loading.value = false // Turn off loading on error
    clearTimeout(timeoutId) // Clear the timeout
  }
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})

// Computed filtered orders
const filteredOrders = computed(() => {
  const query = searchQuery.value.toLowerCase()
  const filtered = orders.value.filter(
    (order) =>
      order.id.toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query) ||
      getStatusLabel(order.status).toLowerCase().includes(query),
  )

  // Apply status filter if not "all"
  if (currentFilter.value !== 'all') {
    return filtered.filter((order) => order.status === currentFilter.value)
  }

  return filtered
})

// Helper Functions
const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

const formatPrice = (price) => {
  return price ? price.toLocaleString('id-ID') : '0'
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'status-pending',
    process: 'status-process',
    delivery: 'status-delivery',
    complete: 'status-success',
    cancelled: 'status-canceled',
  }
  return classes[status] || 'status-default'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Menunggu Konfirmasi',
    process: 'Diproses',
    delivery: 'Dalam Pengiriman',
    complete: 'Selesai',
    cancelled: 'Dibatalkan',
  }
  return labels[status] || status
}

const toggleOrder = (orderId) => {
  expandedOrders.value = {
    ...expandedOrders.value,
    [orderId]: !expandedOrders.value[orderId],
  }
}

const completeOrder = async (orderId) => {
  try {
    const orderRef = doc(db, 'orders', orderId)
    const orderDoc = await getDoc(orderRef)

    if (!orderDoc.exists()) {
      toast.error('Pesanan tidak ditemukan')
      return
    }

    const orderData = orderDoc.data()

    // Update order status
    await updateDoc(orderRef, {
      status: 'complete',
    })

    // Create a completion notification
    await notificationStore.createNotification({
      title: 'Pesanan Selesai! 🎉',
      message: `Terima kasih! Pesanan #${orderId.slice(-6)} untuk ${orderData.productName} telah dikonfirmasi selesai. Semoga Anda puas dengan produk kami!`,
      type: 'order',
      userId: authStore.currentUser?.id,
      orderId: orderId,
      icon: 'fas fa-check-circle',
      color: '#16a34a',
      link: `/my-account/orders?search=${orderId}`,
    })

    toast.success('Pesanan telah selesai')
  } catch (error) {
    console.error('Error completing order:', error)
    toast.error('Gagal menyelesaikan pesanan')
  }
}

const downloadOrderInvoice = async (orderId) => {
  if (processingInvoice.value === orderId || cooldowns.value[orderId] > 0) return

  try {
    processingInvoice.value = orderId
    const result = await invoiceStore.downloadInvoice(orderId)

    if (!result.success) {
      throw new Error(result.error)
    }

    // Start cooldown after successful download
    cooldowns.value[orderId] = 10
    const timer = setInterval(() => {
      cooldowns.value[orderId]--
      if (cooldowns.value[orderId] <= 0) {
        clearInterval(timer)
        delete cooldowns.value[orderId]
      }
    }, 1000)
  } catch (error) {
    console.error('Error downloading invoice:', error)
    toast.error('Gagal mengunduh invoice: ' + error.message)
  } finally {
    processingInvoice.value = null
  }
}

const handleReorder = (order) => {
  // Prepare order data for checkout
  const reorderData = {
    id: Date.now().toString(),
    productId: order.productId,
    name: order.productName,
    price: order.price,
    quantity: order.quantity,
    image: order.customOptions?.productImage,
    customOptions: order.customOptions,
    shippingDetails: order.shippingDetails,
  }

  // Save to localStorage for checkout
  localStorage.setItem('reorder_data', JSON.stringify(reorderData))
}

const getProductImage = (order) => {
  return (
    order.productImage ||
    order.customOptions?.productImage ||
    '/src/assets/default-avatar-wm14gXiP.png'
  )
}

const handleImageError = (e) => {
  e.target.src = '/src/assets/default-avatar-wm14gXiP.png'
}

const openReviewModal = (order) => {
  selectedOrder.value = order
  showReviewModal.value = true
}

const closeReviewModal = () => {
  showReviewModal.value = false
  selectedOrder.value = null
}

const openRefundModal = (order) => {
  selectedOrder.value = order
  showRefundModal.value = true
  isCancellation.value = false // This is a refund request, not a cancellation
}

const openCancelModal = (order) => {
  selectedOrder.value = order
  showRefundModal.value = true
  isCancellation.value = true // This is a cancellation request
}

const closeRefundModal = () => {
  showRefundModal.value = false
  selectedOrder.value = null
  isCancellation.value = false
}

const getRefundStatusIcon = (status) => {
  const icons = {
    pending: 'fa-clock',
    processed: 'fa-check-circle',
    rejected: 'fa-times-circle',
  }
  return icons[status] || 'fa-question-circle'
}

const getRefundStatusLabel = (status) => {
  const labels = {
    pending: 'Sedang Diproses',
    processed: 'Berhasil',
    rejected: 'Ditolak',
  }
  return labels[status] || 'Tidak Diketahui'
}
</script>

<style scoped>
.orders-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem;
}

.section-title {
  margin: 0 0 1.5rem;
  color: #02163b;
  font-weight: 600;
  font-size: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.75rem;
}

/* Search and Filter Container */
.search-filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

/* Search bar */
.search-container {
  flex: 1;
}

.search-wrapper {
  position: relative;
  width: 90%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #02163b;
  opacity: 0.5;
}

input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid transparent;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  font-family: 'Montserrat', sans-serif;
}

input:focus {
  outline: none;
  border-color: #e8ba38;
  box-shadow: 0 0 0 4px rgba(232, 186, 56, 0.1);
}

/* Filter Dropdown */
.filter-dropdown {
  position: relative;
  min-width: 180px;
}

.dropdown-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: white;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.dropdown-toggle:hover {
  border-color: #02163b;
}

.dropdown-toggle span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dropdown-toggle i.fa-chevron-down {
  transition: transform 0.2s ease;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  overflow: hidden;
  animation: fadeIn 0.2s ease;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item.active {
  background-color: #02163b;
  color: white;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Order list */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-card {
  border: none;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.order-card:hover {
  transform: translateY(-2px);
}

.order-header {
  padding: 1.25rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: background-color 0.2s ease;
}

.order-header:hover {
  background-color: #f8f9fa;
}

.order-main-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.order-id {
  font-weight: 600;
  color: #02163b;
  font-family: 'Montserrat', sans-serif;
}

.order-details p {
  margin: 0.25rem 0;
  color: #666;
}

.order-status {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  min-width: 120px;
  text-align: center;
  font-family: 'Montserrat', sans-serif;
}

.status-success {
  background: #dcfce7;
  color: #166534;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-process {
  background: #cce5ff;
  color: #004085;
}

.status-delivery {
  background: #d4edda;
  color: #155724;
}

.status-canceled {
  background: #fee2e2;
  color: #991b1b;
}

/* Order expanded details */
.order-expanded {
  border-top: 1px solid #f1f1f1;
  padding: 1.25rem;
  background: #f8f9fa;
  overflow: hidden;
}

.order-grid {
  display: grid;
  gap: 1.5rem;
}

.detail-section {
  background: white;
  border-radius: 8px;
  padding: 1rem;
}

.detail-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #02163b;
}

.product-info {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.product-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  position: relative;
  width: 100%;
}

.product-header h4 {
  margin: 0;
  flex: 1;
  margin-right: 140px;
}

.custom-design-container {
  position: absolute;
  right: -19rem;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-right: -20px;
}

.design-logo-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
  margin: 0;
  white-space: nowrap;
}

.custom-design-thumbnail {
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  width: 120px;
  height: 120px;
}

.custom-design-thumbnail img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  display: block;
}

.shipping-info p {
  margin: 0.5rem 0;
  color: #444;
}

.action-section {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.invoice-btn {
  font-family: 'Montserrat', sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.invoice-btn:hover {
  background-color: #45a049;
}

.invoice-btn i {
  font-size: 1rem;
}

.invoice-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.complete-btn {
  background: #02163b;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  font-family: 'Montserrat', sans-serif;
}

.complete-btn:hover {
  background: #01122d;
}

.completed-actions {
  display: flex;
  gap: 1rem;
}

.buy-again-btn {
  background: #e8ba38;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  font-family: 'Montserrat', sans-serif;
  text-decoration: none;
}

.buy-again-btn:hover {
  background: #d5a832;
}

.review-btn {
  background: #f8f9fa;
  color: #02163b;
  border: 1px solid #02163b;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  font-family: 'Montserrat', sans-serif;
}

.review-btn:hover {
  background: #eef1f3;
}

/* Refund button styles */
.refund-btn {
  background-color: #9333ea;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Montserrat', sans-serif;
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: 500;
}

.refund-btn:hover {
  background-color: #7e22ce;
}

/* Cancel button styles */
.cancel-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Montserrat', sans-serif;
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: 500;
}

.cancel-btn:hover {
  background-color: #dc2626;
}

/* Refund status indicator */
.refund-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f4f4f4;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #444;
}

.refund-status i {
  font-size: 1rem;
}

.refund-status i.fa-clock {
  color: #f59e0b;
}

.refund-status i.fa-check-circle {
  color: #10b981;
}

.refund-status i.fa-times-circle {
  color: #ef4444;
}

/* Cancellation reason */
.cancellation-reason {
  margin-left: 1.2rem;
  width: fit-content;
  padding: 1rem;
  background-color: #fff8f8;
  border-left: 4px solid #f44336;
  border-radius: 4px;
  font-family: 'Montserrat', sans-serif;
  margin-bottom: 1.5rem;
}

.reason-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.reason-header i {
  color: #f44336;
  font-size: 1.1rem;
}

.reason-header h3 {
  font-size: 1rem;
  color: #842029;
  margin: 0;
  font-weight: 600;
}

.cancellation-reason p {
  margin: 0;
  color: #555;
  font-size: 0.95rem;
  line-height: 1.5;
  white-space: pre-line;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  color: #666;
}

.empty-icon {
  font-size: 3rem;
  color: #e8ba38;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.2rem;
  color: #02163b;
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin-bottom: 2rem;
}

.shop-now-btn {
  display: inline-block;
  background: #02163b;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.shop-now-btn:hover {
  background: #e8ba38;
  transform: translateY(-2px);
}

/* Animations */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease-out;
  max-height: 2000px;
  opacity: 1;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

/* Responsive styles */
@media (min-width: 768px) {
  .order-grid {
    grid-template-columns: 1fr 1fr;
  }

  .action-section {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .search-filter-container {
    flex-direction: column;
  }

  .filter-dropdown {
    width: 100%;
  }

  .filter-options {
    overflow-x: auto;
    padding-bottom: 0.5rem;
    gap: 0.5rem;
  }

  .filter-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    white-space: nowrap;
  }

  .order-header {
    flex-direction: column;
    gap: 1rem;
  }

  .order-status {
    width: 100%;
    justify-content: space-between;
  }

  .status-badge {
    min-width: unset;
  }

  .product-header {
    flex-direction: row;
    align-items: center;
  }

  .custom-design-container {
    position: relative;
    margin-right: 0;
    right: 0;
  }

  .product-header h4 {
    margin-right: 0;
  }

  .custom-design-thumbnail {
    width: 80px;
    height: 80px;
  }

  .custom-design-thumbnail img {
    width: 80px;
    height: 80px;
  }

  .action-section {
    flex-wrap: wrap;
  }
}
</style>
