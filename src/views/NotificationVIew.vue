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
            <!-- Move cancellation reason to appear first when status is cancelled -->
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

                <!-- First 2 products shown by default -->
                <div
                  v-for="(product, index) in getVisibleProducts(order)"
                  :key="`${order.id}-product-${index}`"
                  class="product-item"
                >
                  <div class="product-info">
                    <img
                      :src="getProductImageForItem(product)"
                      :alt="product.productName"
                      class="product-image"
                      @error="handleImageError"
                    />
                    <div class="product-details">
                      <div class="product-header">
                        <h4>{{ product.productName }}</h4>
                        <!-- Design logo if available -->
                        <div
                          class="custom-design-container"
                          v-if="
                            product.customOptions?.purchaseType === 'Souvenir' &&
                            product.customOptions?.uploadedImage
                          "
                        >
                          <span class="design-logo-label">Design Logo</span>
                          <div class="custom-design-thumbnail">
                            <img :src="product.customOptions.uploadedImage" alt="Design Logo" />
                          </div>
                        </div>
                      </div>
                      <div class="product-specs">
                        <span class="product-quantity">{{ product.quantity }}x</span>
                        <span class="product-price">Rp {{ formatPrice(product.price) }}</span>
                      </div>
                      <div class="product-options">
                        <p>Tipe: {{ product.customOptions.purchaseType }}</p>
                        <p>Harga: {{ product.customOptions.priceType }}</p>

                        <!-- Expandable details -->
                        <button
                          class="toggle-details-btn"
                          @click="toggleProductDetails(order.id, index)"
                        >
                          {{
                            isProductExpanded(order.id, index)
                              ? 'Sembunyikan Detail'
                              : 'Lihat Detail'
                          }}
                        </button>

                        <div v-if="isProductExpanded(order.id, index)" class="expanded-details">
                          <p>Bahan Luar: {{ product.customOptions.bahanLuar }}</p>
                          <p>Bahan Dalam: {{ product.customOptions.bahanDalam }}</p>
                          <p>Aksesoris: {{ product.customOptions.aksesoris.join(', ') }}</p>
                          <p v-if="product.customOptions.note" class="product-note">
                            <strong>Catatan:</strong> {{ product.customOptions.note }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Show more products button -->
                <div v-if="hasMoreProducts(order)" class="show-more-container">
                  <button @click="toggleShowAllProducts(order.id)" class="show-more-btn">
                    <i
                      :class="[
                        'fas',
                        isShowingAllProducts(order.id) ? 'fa-chevron-up' : 'fa-chevron-down',
                      ]"
                    ></i>
                    {{
                      isShowingAllProducts(order.id)
                        ? 'Tampilkan Lebih Sedikit'
                        : `Lihat ${getHiddenProductCount(order)} Produk Lainnya`
                    }}
                  </button>
                </div>

                <!-- Additional products (shown when expanded) -->
                

                <!-- Order summary -->
                <div class="order-summary">
                  <div class="summary-row">
                    <span>Total Produk:</span>
                    <span>{{ getTotalProductCount(order) }} item</span>
                  </div>
                  <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>Rp {{ formatPrice(getOrderSubtotal(order)) }}</span>
                  </div>
                  <div class="summary-row">
                    <span>Biaya Pengiriman:</span>
                    <span>Rp {{ formatPrice(order.shippingCost || 0) }}</span>
                  </div>
                  <div v-if="order.discountAmount" class="summary-row discount">
                    <span>Diskon:</span>
                    <span>-Rp {{ formatPrice(order.discountAmount) }}</span>
                  </div>
                  <div class="summary-row total">
                    <span>Total:</span>
                    <span>Rp {{ formatPrice(order.totalAmount) }}</span>
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

      <!-- Empty State -->
      <div v-if="filteredOrders.length === 0" class="empty-state">
        Tidak ada pesanan yang ditemukan
      </div>
    </div>
    <ReviewModal v-if="showReviewModal" :order="selectedOrder" @close="closeReviewModal" />
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
import ReviewModal from '@/components/ReviewModal.vue'

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
const showReviewModal = ref(false)
const selectedOrder = ref(null)

// Add these new refs for multiple product display
const expandedProducts = ref({}) // Track expanded state for first 2 products
const showAllProductsMap = ref({}) // Track which orders show all products

// Handle image error
const handleImageError = (e) => {
  console.warn('Image failed to load:', e.target.src)
  e.target.src = '/src/assets/default-avatar-wm14gXiP.png'
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

        // Process each order to ensure proper product format
        const ordersWithImages = await Promise.all(
          orderDocs.map(async (order) => {
            // Handle new multi-product format
            if (order.products && Array.isArray(order.products)) {
              // Fetch images for each product if needed
              const productsWithImages = await Promise.all(
                order.products.map(async (product) => {
                  if (product.productId) {
                    try {
                      const catalogRef = doc(db, 'katalog', product.productId)
                      const catalogDoc = await getDoc(catalogRef)
                      if (catalogDoc.exists()) {
                        const catalogData = catalogDoc.data()
                        return {
                          ...product,
                          image: product.image || catalogData.images?.[0],
                          customOptions: {
                            ...product.customOptions,
                            productImage:
                              catalogData.images?.[0] || product.customOptions?.productImage,
                          },
                        }
                      }
                    } catch (err) {
                      console.error('Error fetching catalog for product:', err)
                    }
                  }
                  return product
                }),
              )

              return {
                ...order,
                products: productsWithImages,
              }
            }
            // Handle legacy single-product format
            else if (order.productId) {
              try {
                const catalogRef = doc(db, 'katalog', order.productId)
                const catalogDoc = await getDoc(catalogRef)
                if (catalogDoc.exists()) {
                  const catalogData = catalogDoc.data()
                  // Create a backward compatible structure
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

const openReviewModal = (order) => {
  selectedOrder.value = order
  showReviewModal.value = true
}

const closeReviewModal = () => {
  showReviewModal.value = false
  selectedOrder.value = null
}

// Add these functions
const getVisibleProducts = (order) => {
  if (!order.products || !Array.isArray(order.products)) {
    // Handle legacy orders with single product
    return [
      {
        productId: order.productId,
        productName: order.productName,
        quantity: order.quantity || 1,
        price: order.price || 0,
        customOptions: order.customOptions || {},
      },
    ]
  }

  return isShowingAllProducts(order.id) ? order.products : order.products.slice(0, 2)
}

// This function was redundant since getVisibleProducts already handles showing all products

const hasMoreProducts = (order) => {
  return order.products && Array.isArray(order.products) && order.products.length > 2
}

const getHiddenProductCount = (order) => {
  if (!order.products || !Array.isArray(order.products)) {
    return 0
  }

  return Math.max(0, order.products.length - 2)
}

const getTotalProductCount = (order) => {
  if (!order.products || !Array.isArray(order.products)) {
    return 1 // Legacy single product order
  }

  return order.products.length
}

// Toggle functions
const toggleShowAllProducts = (orderId) => {
  showAllProductsMap.value = {
    ...showAllProductsMap.value,
    [orderId]: !showAllProductsMap.value[orderId],
  }
}

const isShowingAllProducts = (orderId) => {
  return showAllProductsMap.value[orderId] || false
}

const toggleProductDetails = (orderId, productIndex) => {
  const key = `${orderId}-${productIndex}`
  expandedProducts.value = {
    ...expandedProducts.value,
    [key]: !expandedProducts.value[key],
  }
}

const isProductExpanded = (orderId, productIndex) => {
  const key = `${orderId}-${productIndex}`
  return expandedProducts.value[key] || false
}

// Helper function to get product image for each item
const getProductImageForItem = (product) => {
  return product.customOptions?.productImage || product.image || 'default-product.jpg'
}

// Calculate order subtotal (without shipping)
const getOrderSubtotal = (order) => {
  if (!order.products || !Array.isArray(order.products)) {
    // Handle legacy orders
    return order.price * (order.quantity || 1)
  }

  return order.products.reduce((total, product) => {
    return total + product.price * product.quantity
  }, 0)
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
  right: -19rem;
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

.invoice-btn:disabled:hover {
  background-color: #cccccc;
}

/* Cancellation reason styling */
.cancellation-reason {
  margin-left: 1.2rem;
  width: fit-content;
  padding: 1rem;
  background-color: #fff8f8;
  border-left: 4px solid #f44336;
  border-radius: 4px;
  font-family: 'Montserrat', sans-serif;
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

/* Keep existing styles and add these new styles */

/* Product item styling */
.product-item {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.2s ease;
}

.product-item:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.additional-product {
  background-color: #fcfcfc;
  border-left: 3px solid #e8ba38;
}

.product-info {
  display: flex;
  padding: 1rem;
  gap: 1rem;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #eee;
}

.product-details {
  flex: 1;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.product-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #02163b;
}

.product-specs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.product-quantity {
  font-weight: 600;
  color: #666;
}

.product-price {
  font-weight: 600;
  color: #02163b;
}

.product-options {
  font-size: 0.9rem;
  color: #555;
}

.product-options p {
  margin: 0.25rem 0;
}

.product-note {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #fff8e6;
  border-radius: 4px;
  font-size: 0.85rem;
}

/* Toggle buttons */
.toggle-details-btn {
  background: none;
  border: none;
  color: #e8ba38;
  font-size: 0.85rem;
  padding: 0.25rem 0;
  margin: 0.25rem 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.toggle-details-btn:hover {
  text-decoration: underline;
}

.toggle-details-btn::after {
  content: '';
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-right: 2px solid #e8ba38;
  border-bottom: 2px solid #e8ba38;
  transform: rotate(45deg);
  transition: transform 0.2s;
  margin-left: 0.25rem;
}

.expanded-details {
  padding: 0.5rem 0;
  border-top: 1px dashed #eee;
  margin-top: 0.5rem;
}

/* Show more button */
.show-more-container {
  display: flex;
  justify-content: center;
  margin: 0.5rem 0 1rem;
}

.show-more-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #02163b;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 50px;
  background-color: #f5f5f5;
  transition: all 0.2s ease;
}

.show-more-btn:hover {
  background-color: #e8e8e8;
}

.show-more-btn i {
  font-size: 0.8rem;
}

/* Order summary */
.order-summary {
  margin-top: 1.5rem;
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.9rem;
  color: #555;
}

.summary-row.total {
  font-weight: 700;
  color: #02163b;
  font-size: 1.1rem;
  border-top: 1px solid #eee;
  padding-top: 0.75rem;
  margin-top: 0.25rem;
}

.summary-row.discount {
  color: #e53935;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .product-info {
    flex-direction: column;
  }

  .product-image {
    width: 100%;
    height: 150px;
  }

  .product-header {
    flex-direction: column;
  }

  .custom-design-container {
    margin-top: 0.5rem;
  }
}
</style>
