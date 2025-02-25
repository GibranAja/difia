<template>
  <div class="container">
    <div class="header">
      <router-link to="/" class="back-btn">
        <i class="fas fa-chevron-left"></i>
      </router-link>
      <h1>Riwayat Pesanan</h1>
    </div>

    <!-- Search Bar -->
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

    <!-- Order List -->
    <div class="order-list">
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
            <div class="order-grid">
              <!-- Product Details -->
              <div class="detail-section">
                <h3>Detail Produk</h3>
                <div class="product-info">
                  <!-- Main Product Image (Catalog) -->
                  <img
                    :src="getProductImage(order)"
                    :alt="order.productName"
                    class="product-image"
                    @error="handleImageError"
                  />
                  <div class="product-details">
                    <div class="product-header">
                      <h4>{{ order.productName }}</h4>
                      <!-- Tambahkan container baru untuk design logo -->
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
                    <p>Tipe: {{ order.customOptions.purchaseType }}</p>
                    <p>Harga: {{ order.customOptions.priceType }}</p>
                    <p>Jumlah: {{ order.quantity }} pcs</p>
                    <p>Bahan Luar: {{ order.customOptions.bahanLuar }}</p>
                    <p>Bahan Dalam: {{ order.customOptions.bahanDalam }}</p>
                    <p>Aksesoris: {{ order.customOptions.aksesoris.join(', ') }}</p>
                    <p v-if="order.customOptions.note">Catatan: {{ order.customOptions.note }}</p>
                  </div>
                </div>
              </div>

              <!-- Shipping Details -->
              <div class="detail-section">
                <h3>Informasi Pengiriman</h3>
                <div class="shipping-info">
                  <p><strong>Penerima:</strong> {{ order.shippingDetails.name }}</p>
                  <p><strong>Email:</strong> {{ order.shippingDetails.email }}</p>
                  <p><strong>Telepon:</strong> {{ order.shippingDetails.phone }}</p>
                  <p><strong>Alamat:</strong> {{ order.shippingDetails.address }}</p>
                  <p><strong>Kota:</strong> {{ order.shippingDetails.city }}</p>
                  <p><strong>Provinsi:</strong> {{ order.shippingDetails.province }}</p>
                  <p><strong>Kode Pos:</strong> {{ order.shippingDetails.zip }}</p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="action-section">
                <!-- Add download invoice button for orders in process -->
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

                <button
                  v-if="order.status === 'delivery'"
                  class="complete-btn"
                  @click="completeOrder(order.id)"
                >
                  Pesanan Diterima
                </button>

                <div v-if="order.status === 'complete'" class="completed-actions">
                  <router-link
                    :to="{
                      path: `/custom/${order.productId}`,
                      query: { reorder: true, orderId: order.id },
                    }"
                    class="buy-again-btn"
                  >
                    Beli Lagi
                  </router-link>
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
                  <button class="review-btn">Tulis Ulasan</button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Empty State -->
      <div v-if="filteredOrders.length === 0" class="empty-state">
        Tidak ada pesanan yang ditemukan
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from '@/stores/AuthStore'
import { useToast } from 'vue-toastification'
import { updateDoc } from 'firebase/firestore'
import { useNotificationStore } from '@/stores/NotificationStore'
import { useInvoiceStore } from '@/stores/InvoiceStore' // Add this import

const authStore = useAuthStore()
const toast = useToast()
const searchQuery = ref('')
const expandedOrders = ref({})
const orders = ref([])
let unsubscribe = null
const notificationStore = useNotificationStore()
const invoiceStore = useInvoiceStore() // Add this
// Add these with other refs
const processingInvoice = ref(null) // Tracks which invoice is being processed
const cooldowns = ref({}) // Tracks cooldown timers for each invoice

// Handle image error
const handleImageError = (e) => {
  console.warn('Image failed to load:', e.target.src)
  e.target.src = '/src/assets/default-avatar-wm14gXiP.png'
}

// Update the getProductImage function
const getProductImage = (order) => {
  // For catalog product image (both standard and souvenir)
  if (order.productId && order.productImage) {
    return order.productImage
  }

  // Fallback to custom uploaded image for souvenir if no catalog image
  if (order.customOptions?.purchaseType === 'Souvenir' && order.customOptions?.uploadedImage) {
    return order.customOptions.uploadedImage
  }

  // Other fallbacks
  return (
    order.customOptions?.productImage || order.image || '/src/assets/default-avatar-wm14gXiP.png'
  )
}

// Fetch orders on component mount
onMounted(async () => {
  if (!authStore.currentUser?.id) return

  try {
    const ordersRef = collection(db, 'orders')
    const ordersQuery = query(
      ordersRef,
      where('userId', '==', authStore.currentUser.id),
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
      },
      (error) => {
        console.error('Error fetching orders:', error)
        toast.error('Gagal memuat pesanan')
      },
    )
  } catch (error) {
    console.error('Error setting up orders listener:', error)
    toast.error('Gagal memuat pesanan')
  }
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})

const filteredOrders = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return orders.value.filter(
    (order) => order.id.toLowerCase().includes(query) || order.status.toLowerCase().includes(query),
  )
})

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate()
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

const formatPrice = (price) => {
  return price.toLocaleString('id-ID')
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
  notificationStore.markAsViewed(orderId)
}

const completeOrder = async (orderId) => {
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status: 'complete',
    })
    toast.success('Pesanan telah selesai')
  } catch (error) {
    console.error('Error completing order:', error)
    toast.error('Gagal menyelesaikan pesanan')
  }
}

// Add this function
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

// Add this function
const handleReorder = (order) => {
  // Prepare order data for checkout
  const reorderData = {
    id: Date.now().toString(), // Generate new ID
    productId: order.productId,
    name: order.productName,
    price: order.price,
    quantity: order.quantity,
    image: order.customOptions.productImage,
    customOptions: order.customOptions,
    shippingDetails: order.shippingDetails,
  }

  // Save to localStorage for checkout
  localStorage.setItem('reorder_data', JSON.stringify(reorderData))
}
</script>

<style scoped>
.container {
  max-width: 128rem;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #f8f9fa;
  color: #02163b;
  transition: all 0.2s ease;
  text-decoration: none;
}

.back-btn:hover {
  background: #e8ba38;
  color: white;
}

h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #02163b;
  margin: 0;
}

.search-container {
  width: 95.5%;
  margin-bottom: 2rem;
}

.search-wrapper {
  position: relative;
  width: 100%;
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
  background-color: #ececec;
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

.status-progress {
  background: #dbeafe;
  color: #1e40af;
}

.status-canceled {
  background: #fee2e2;
  color: #991b1b;
}

.order-expanded {
  border-top: 1px solid #f1f1f1;
  padding: 1.25rem;
  background: #f8f9fa;
  overflow: hidden; /* Add this to contain the sliding animation */
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  color: #666;
  font-size: 1.1rem;
  font-family: 'Montserrat', sans-serif;
}

/* Slide Animation */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease-out;
  max-height: 300px; /* Adjust based on your content */
  opacity: 1;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

/* Add styles for order items to make them look better */
.order-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 8px;
}

.order-item span:last-child {
  font-weight: 500;
  color: #02163b;
}

@media (max-width: 640px) {
  .container {
    padding: 1rem;
  }

  .header {
    margin-bottom: 1.5rem;
  }

  .status-badge {
    padding: 0.35rem 0.75rem;
    font-size: 0.75rem;
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
}

.order-grid {
  display: grid;
  gap: 1.5rem;
  padding: 1.25rem;
}

.detail-section {
  background: white;
  border-radius: 8px;
  padding: 1rem;
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

/* New styles for product header with custom design */
.product-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between; /* Pastikan space-between untuk memisahkan konten */
  margin-bottom: 0.75rem;
  position: relative; /* Add this to help with absolute positioning */
  width: 100%;
}

.custom-design-container {
  position: absolute; /* Change to absolute positioning */
  right: -24rem;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-right: -20px; /* Push it further right */
}

.design-logo-label {
  font-size: 0.875rem;
  font-weight: 600; /* Increased weight */
  color: #666;
  margin: 0;
  white-space: nowrap; /* Prevent text wrapping */
}

/* Increase thumbnail size */
.custom-design-thumbnail {
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  width: 120px; /* Increased from 80px to 120px */
  height: 120px; /* Increased from 80px to 120px */
}

.custom-design-thumbnail img {
  width: 120px; /* Increased from 80px to 120px */
  height: 120px; /* Increased from 80px to 120px */
  object-fit: cover;
  display: block;
}

/* Ensure the product name takes appropriate space */
.product-header h4 {
  margin: 0;
  flex: 1;
  margin-right: 140px; /* Increased from 100px to 140px */
}

.action-section {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.complete-btn,
.buy-again-btn,
.review-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  font-family: 'Montserrat', sans-serif;
}

.complete-btn {
  background: #02163b;
  color: white;
}

.completed-actions {
  display: flex;
  gap: 1rem;
}

.buy-again-btn {
  background: #e8ba38;
  color: white;
  text-decoration: none;
}

.review-btn {
  background: #f8f9fa;
  color: #02163b;
  border: 1px solid #02163b;
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
  background: #f8d7da;
  color: #842029;
}

/* Responsive adjustments for custom design */
@media (max-width: 640px) {
  .product-header {
    flex-direction: row; /* Ubah ke row untuk tetap sejajar */
    align-items: center;
  }

  .custom-design-container {
    position: relative; /* Reset position for mobile */
    margin-right: 0; /* Reset margin for mobile */
  }

  .product-header h4 {
    margin-right: 0; /* Reset margin for mobile */
  }
}

@media (min-width: 768px) {
  .order-grid {
    grid-template-columns: 2fr 1fr;
  }

  .action-section {
    grid-column: 1 / -1;
  }
}

/* Add these styles */
.invoice-btn {
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

.invoice-btn:disabled:hover {
  background-color: #cccccc;
}
</style>
