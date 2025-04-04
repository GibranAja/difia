<template>
  <div class="order-container" :class="{ 'sidebar-collapsed': !isSidebarOpen }">
    <LoadComponent v-if="loading" />

    <template v-else>
      <h1>KELOLA PESANAN</h1>

      <div class="order-controls">
        <!-- Order Type Toggle -->
        <div class="order-type-toggle">
          <button
            :class="['toggle-btn', { active: activeOrderType === 'regular' }]"
            @click="activeOrderType = 'regular'"
          >
            <i class="fas fa-shopping-bag"></i>
            Satuan
          </button>
          <button
            :class="['toggle-btn', { active: activeOrderType === 'souvenir' }]"
            @click="activeOrderType = 'souvenir'"
          >
            <i class="fas fa-gift"></i>
            Souvenir
          </button>
        </div>

        <!-- Add search input -->
        <div class="search-container">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search orders by ID, customer, product..."
            class="search-input"
          />
          <i class="fas fa-search search-icon"></i>
        </div>

        <!-- Add this new filter dropdown -->
        <div class="status-filter">
          <div class="dropdown-select" @click="toggleDropdown" ref="dropdownRef">
            <div class="selected-text">
              {{
                selectedStatuses.length ? `${selectedStatuses.length} selected` : 'Filter Status'
              }}
            </div>
            <div class="dropdown-menu" v-if="isDropdownOpen">
              <label
                v-for="status in ['pending', 'process', 'delivery', 'complete', 'cancelled']"
                :key="status"
                class="dropdown-item"
                @click.stop
              >
                <input type="checkbox" v-model="selectedStatuses" :value="status" />
                <span class="status-badge" :class="status">{{ status }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Regular Orders Section -->
      <div class="order-section" v-if="activeOrderType === 'regular'">
        <h2>Regular Orders</h2>

        <!-- Show empty state for no orders -->
        <div v-if="!orders.length" class="empty-state">
          <div class="empty-state-content">
            <i class="fas fa-box-open empty-state-icon"></i>
            <h3>Belum Ada Pesanan</h3>
            <p>Saat ini belum ada pesanan satuan yang masuk</p>
          </div>
        </div>

        <!-- Show empty state for filtered orders -->
        <div v-else-if="!regularOrders.length" class="empty-state">
          <div class="empty-state-content">
            <i class="fas fa-box-open empty-state-icon"></i>
            <h3>Tidak ada data order</h3>
            <p>Tidak ditemukan pesanan dengan filter yang dipilih</p>
          </div>
        </div>

        <!-- Table container -->
        <div class="table-container" v-if="regularOrders.length">
          <!-- Scrollable table wrapper -->
          <div class="table-responsive">
            <table class="order-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Address</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Total Amount</th>
                  <th>Payment Proof</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in paginatedRegularOrders" :key="order.id">
                  <td v-html="highlightMatch(order.id, searchQuery)"></td>
                  <td>
                    <div class="customer-info">
                      <div v-html="highlightMatch(order.shippingDetails.name, searchQuery)"></div>
                      <div
                        class="customer-email"
                        v-html="highlightMatch(order.shippingDetails.email, searchQuery)"
                      ></div>
                      <div
                        class="customer-email"
                        v-html="highlightMatch(order.shippingDetails.phone, searchQuery)"
                      ></div>
                    </div>
                  </td>
                  <td>
                    <div class="address-info">
                      <div
                        class="full-address"
                        v-html="highlightMatch(order.shippingDetails.address, searchQuery)"
                      ></div>
                      <div class="location">
                        <span
                          v-html="highlightMatch(order.shippingDetails.city, searchQuery)"
                        ></span
                        >,
                        <span
                          v-html="highlightMatch(order.shippingDetails.province, searchQuery)"
                        ></span>
                      </div>
                      <div
                        class="postal-code"
                        v-html="highlightMatch(order.shippingDetails.zip, searchQuery)"
                      ></div>
                    </div>
                  </td>
                  <td>
                    <div class="product-name-wrapper">
                      <span
                        class="product-name"
                        v-html="highlightMatch(order.productName, searchQuery)"
                      ></span>
                      <div class="product-details-tooltip">
                        <div class="tooltip-content">
                          <!-- Main product info -->
                          <div class="product-header">
                            <h4>{{ order.productName }}</h4>
                            <span
                              class="price-type-badge"
                              :class="order.customOptions.priceType.toLowerCase()"
                            >
                              {{ order.customOptions.priceType }}
                            </span>
                          </div>

                          <!-- Materials section -->
                          <div class="details-section">
                            <h5>Material</h5>
                            <div class="detail-row">
                              <span class="detail-label">Luar:</span>
                              <span class="detail-value">{{ order.customOptions.bahanLuar }}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-label">Dalam:</span>
                              <span class="detail-value">{{ order.customOptions.bahanDalam }}</span>
                            </div>
                          </div>

                          <!-- Accessories section -->
                          <div class="details-section">
                            <h5>Aksesoris</h5>
                            <div class="accessories-tags">
                              <span
                                v-for="(acc, index) in order.customOptions.aksesoris"
                                :key="index"
                                class="acc-tag"
                              >
                                {{ acc }}
                              </span>
                            </div>
                          </div>

                          <!-- Notes if exists -->
                          <div v-if="order.customOptions.note" class="details-section notes">
                            <h5>Catatan</h5>
                            <p class="note-text">{{ order.customOptions.note }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{{ order.quantity }}</td>
                  <td>{{ formatPrice(order.totalAmount) }}</td>
                  <td>
                    <div class="payment-proof">
                      <button
                        class="view-proof-btn"
                        @click="openPaymentProof(order.paymentProof)"
                        title="View Payment Proof"
                      >
                        <i class="fas fa-receipt"></i>
                        View Proof
                      </button>
                    </div>
                  </td>
                  <td>
                    <span class="status-badge" :class="order.status">
                      {{ order.status }}
                    </span>
                  </td>
                  <td>
                    <button
                      class="action-btn"
                      @click="openStatusModal(order)"
                      :disabled="order.status === 'complete' || order.status === 'cancelled'"
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination outside scrollable area -->
          <div class="pagination-wrapper">
            <div class="entries-dropdown">
              <span>Show</span>
              <select v-model="entriesPerPage">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <span>entries</span>
            </div>

            <div class="pagination">
              <button :disabled="currentRegularPage === 1" @click="goToPrevRegularPage">
                <i class="fas fa-chevron-left"></i>
              </button>
              <span>{{ currentRegularPage }} of {{ totalRegularPages }}</span>
              <button
                :disabled="currentRegularPage >= totalRegularPages"
                @click="goToNextRegularPage"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Souvenir Orders Section -->
      <div class="order-section" v-if="activeOrderType === 'souvenir'">
        <h2>Souvenir Orders</h2>

        <!-- Show empty state for no orders -->
        <div v-if="!orders.length" class="empty-state">
          <div class="empty-state-content">
            <i class="fas fa-gift empty-state-icon"></i>
            <h3>Belum Ada Pesanan</h3>
            <p>Saat ini belum ada pesanan souvenir yang masuk</p>
          </div>
        </div>

        <!-- Show empty state for filtered orders -->
        <div v-else-if="!souvenirOrders.length" class="empty-state">
          <div class="empty-state-content">
            <i class="fas fa-gift empty-state-icon"></i>
            <h3>Tidak ada data order</h3>
            <p>Tidak ditemukan pesanan dengan filter yang dipilih</p>
          </div>
        </div>

        <!-- Table container -->
        <div class="table-container" v-if="souvenirOrders.length">
          <!-- Scrollable table wrapper -->
          <div class="table-responsive">
            <table class="order-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Address</th>
                  <!-- Add this line -->
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Total Amount</th>
                  <th>Payment Proof</th>
                  <th>Emboss</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in paginatedSouvenirOrders" :key="order.id">
                  <td>{{ order.id }}</td>
                  <td>
                    <div class="customer-info">
                      <div>{{ order.shippingDetails.name }}</div>
                      <div class="customer-email">{{ order.shippingDetails.email }}</div>
                      <div class="customer-email">{{ order.shippingDetails.phone }}</div>
                    </div>
                  </td>
                  <!-- Add this cell -->
                  <td>
                    <div class="address-info">
                      <div class="full-address">{{ order.shippingDetails.address }}</div>
                      <div class="location">
                        {{ order.shippingDetails.city }}, {{ order.shippingDetails.province }}
                      </div>
                      <div class="postal-code">{{ order.shippingDetails.zip }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="product-name-wrapper">
                      <span class="product-name">
                        {{ order.productName }}
                      </span>
                      <div class="product-details-tooltip">
                        <div class="tooltip-content">
                          <!-- Main product info -->
                          <div class="product-header">
                            <h4>{{ order.productName }}</h4>
                            <span
                              class="price-type-badge"
                              :class="order.customOptions.priceType.toLowerCase()"
                            >
                              {{ order.customOptions.priceType }}
                            </span>
                          </div>

                          <!-- Materials section -->
                          <div class="details-section">
                            <h5>Material</h5>
                            <div class="detail-row">
                              <span class="detail-label">Luar:</span>
                              <span class="detail-value">{{ order.customOptions.bahanLuar }}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-label">Dalam:</span>
                              <span class="detail-value">{{ order.customOptions.bahanDalam }}</span>
                            </div>
                          </div>

                          <!-- Accessories section -->
                          <div class="details-section">
                            <h5>Aksesoris</h5>
                            <div class="accessories-tags">
                              <span
                                v-for="(acc, index) in order.customOptions.aksesoris"
                                :key="index"
                                class="acc-tag"
                              >
                                {{ acc }}
                              </span>
                            </div>
                          </div>

                          <!-- Notes if exists -->
                          <div v-if="order.customOptions.note" class="details-section notes">
                            <h5>Catatan</h5>
                            <p class="note-text">{{ order.customOptions.note }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{{ order.quantity }}</td>
                  <td>{{ formatPrice(order.totalAmount) }}</td>
                  <td>
                    <div class="payment-proof">
                      <button
                        class="view-proof-btn"
                        @click="openPaymentProof(order.paymentProof)"
                        title="View Payment Proof"
                      >
                        <i class="fas fa-receipt"></i>
                        View Proof
                      </button>
                    </div>
                  </td>
                  <td>
                    <div
                      v-if="order.customOptions?.uploadedImage"
                      class="design-preview"
                      @click="openImagePreview(order.customOptions.uploadedImage)"
                    >
                      <img :src="order.customOptions.uploadedImage" alt="Design preview" />
                    </div>
                    <div v-else class="no-design">Tidak ada emboss</div>
                  </td>
                  <td>
                    <span class="status-badge" :class="order.status">
                      {{ order.status }}
                    </span>
                  </td>
                  <td>
                    <button
                      class="action-btn"
                      @click="openStatusModal(order)"
                      :disabled="order.status === 'complete' || order.status === 'cancelled'"
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination outside scrollable area -->
          <div class="pagination-wrapper">
            <div class="entries-dropdown">
              <span>Show</span>
              <select v-model="entriesPerPage">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <span>entries</span>
            </div>

            <div class="pagination">
              <button :disabled="currentSouvenirPage === 1" @click="goToPrevSouvenirPage">
                <i class="fas fa-chevron-left"></i>
              </button>
              <span>{{ currentSouvenirPage }} of {{ totalSouvenirPages }}</span>
              <button
                :disabled="currentSouvenirPage >= totalSouvenirPages"
                @click="goToNextSouvenirPage"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Status Update Modal -->
    <Transition name="fade">
      <div v-if="showStatusModal" class="modal-overlay" @click="closeStatusModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Update Status Pesanan</h3>
            <button class="close-modal" @click="closeStatusModal">×</button>
          </div>

          <div class="modal-body">
            <div class="order-info">
              <div class="info-item">
                <span class="label">Order ID:</span>
                <span class="value">{{ selectedOrder?.id }}</span>
              </div>
              <div class="info-item">
                <span class="label">Status Saat Ini:</span>
                <span class="value status-badge" :class="selectedOrder?.status">
                  {{ selectedOrder?.status }}
                </span>
              </div>
            </div>

            <div class="status-buttons">
              <button
                v-for="status in availableStatuses"
                :key="status"
                :class="['status-action-btn', status]"
                @click="newStatus = status"
              >
                <i :class="getStatusIcon(status)"></i>
                {{ getStatusLabel(status) }}
              </button>
            </div>

            <div v-if="newStatus === 'cancelled'" class="cancellation-form">
              <label for="cancelReason">Alasan Pembatalan:</label>
              <textarea
                id="cancelReason"
                v-model="cancelReason"
                rows="3"
                placeholder="Berikan alasan pembatalan pesanan..."
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="closeStatusModal">Tutup</button>
            <button
              v-if="newStatus"
              class="btn-primary"
              :class="newStatus"
              @click="updateOrderStatus"
              :disabled="newStatus === 'cancelled' && !cancelReason"
            >
              Konfirmasi {{ getStatusLabel(newStatus) }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Image Preview Modal -->
    <Transition name="fade">
      <div v-if="showImagePreview" class="modal-overlay" @click="closeImagePreview">
        <div class="image-preview-content" @click.stop>
          <img :src="previewImage" alt="Design preview" />
          <button class="close-btn" @click="closeImagePreview">&times;</button>
        </div>
      </div>
    </Transition>

    <!-- Payment Proof Modal -->
    <Transition name="fade">
      <div v-if="showPaymentProofModal" class="modal-overlay" @click="closePaymentProofModal">
        <div class="image-preview-content" @click.stop>
          <img :src="paymentProofImage" alt="Payment proof" />
          <button class="close-btn" @click="closePaymentProofModal">&times;</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { db } from '@/config/firebase'
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore'
import LoadComponent from '@/components/LoadComponent.vue'
import { useToast } from 'vue-toastification'

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
const isDropdownOpen = ref(false)
const dropdownRef = ref(null)
const searchQuery = ref('')

// const statusFlow = {
//   pending: ['process', 'cancelled'],
//   process: ['delivery', 'cancelled'],
//   delivery: ['cancelled'], // complete hanya bisa dari user
//   complete: [], // tidak bisa diubah
//   cancelled: [], // tidak bisa diubah
// }

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

// Add this method to highlight matched text
const highlightMatch = (text, query) => {
  if (!query.trim() || !text) return text

  const regex = new RegExp(`(${query.trim()})`, 'gi')
  return text.toString().replace(regex, '<span class="highlight">$1</span>')
}

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

    toast.success('Order status updated successfully')
    closeStatusModal()
  } catch (error) {
    toast.error('Failed to update order status')
    console.error('Error updating order status:', error)
  }
}

// Format price
const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(price)
}

// Add this function with your other functions
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

// Add a watcher for when entriesPerPage changes
watch(entriesPerPage, () => {
  // Reset page numbers when entries per page changes to avoid being on a now non-existent page
  currentRegularPage.value = 1
  currentSouvenirPage.value = 1
})

// Lifecycle hooks
onMounted(fetchOrders)

const getStatusLabel = (status) => {
  const labels = {
    process: 'Proses Pesanan',
    delivery: 'Kirim Pesanan',
    cancelled: 'Batalkan Pesanan',
  }
  return labels[status] || status
}

const getStatusIcon = (status) => {
  const icons = {
    process: 'fas fa-cog',
    delivery: 'fas fa-truck',
    cancelled: 'fas fa-times-circle',
  }
  return icons[status] || 'fas fa-circle'
}

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// Add click outside handler
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
      isDropdownOpen.value = false
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('click', (e) => {
    if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
      isDropdownOpen.value = false
    }
  })
})
</script>

<style scoped>
/* Add this at the top of your <style> section */
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

/* Update specific text elements */
h1,
h2,
h3,
.customer-info,
.customer-email,
.status-badge,
.action-btn,
.view-proof-btn,
.toggle-btn,
.modal-header h3,
.info-item,
.status-action-btn,
.cancellation-form label,
.cancellation-form textarea,
.btn-secondary,
.btn-primary {
  font-family: 'Montserrat', sans-serif;
}

/* Ensure table text uses Montserrat */
.order-table {
  font-family: 'Montserrat', sans-serif;
  width: 100%;
  min-width: 1200px; /* Increased from 1000px */
}

/* Ensure modal content uses Montserrat */
.modal-content {
  font-family: 'Montserrat', sans-serif;
}

/* Update input/textarea elements */
input,
textarea,
select,
button:not([class*='fas']) {
  font-family: 'Montserrat', sans-serif;
}

.order-container {
  padding: 20px;
  width: 100%;
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
}

.order-section h2 {
  display: none; /* Hide the section titles since we have a main title now */
}

.table-responsive {
  position: relative;
  margin-bottom: 20px;
  width: 100%;
  overflow-x: auto; /* Horizontal scroll hanya untuk tabel */
  overflow-y: hidden; /* Mencegah double scrollbar vertikal */
}

.order-table {
  width: 100%;
  min-width: 1200px; /* Increased from 1000px */
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin: 0; /* Reset margin */
}

/* Tambahkan sticky header */
.order-table thead th {
  position: sticky;
  top: 0;
  background-color: #02163b;
  z-index: 10;
}

/* Pastikan dropdown filter tetap di atas tabel */
.status-filter .dropdown-menu {
  z-index: 20;
}

/* Pastikan tooltip produk tetap di atas tabel */
.product-details-tooltip {
  z-index: 30;
}

/* Pastikan modal tetap di atas semua */
.modal-overlay {
  z-index: 100;
}

.order-table th {
  background-color: #02163b;
  color: white;
  padding: 12px;
  text-align: left;
  border-bottom: 2px solid #0a1f3b;
}

.order-table td {
  padding: 12px;
  border: 1px solid #dee2e6;
  vertical-align: top;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.customer-email {
  color: #666;
  font-size: 0.9em;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: 500;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.process {
  background-color: #cce5ff;
  color: #004085;
}

/* Update status-badge for delivery */
.status-badge.delivery {
  background-color: #e9d5ff;
  color: #6b21a8;
}

.status-badge.complete {
  background-color: #d1e7dd;
  color: #0f5132;
}

.status-badge.cancelled {
  background-color: #f8d7da;
  color: #842029;
}

.action-btn {
  background-color: #02163b;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.action-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.action-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.design-preview {
  width: 50px;
  height: 50px;
  cursor: pointer;
}

.design-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
  color: #02163b;
  margin-bottom: 16px;
}

.order-info {
  margin-bottom: 20px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.status-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.status-btn {
  padding: 8px 16px;
  border: 2px solid #02163b;
  border-radius: 4px;
  background: none;
  color: #02163b;
  cursor: pointer;
  transition: all 0.2s;
}

.status-btn.active {
  background-color: #02163b;
  color: white;
}

.cancellation-reason {
  margin-bottom: 20px;
}

.cancellation-reason label {
  display: block;
  margin-bottom: 8px;
  color: #02163b;
}

.cancellation-reason textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn,
.confirm-btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
}

.confirm-btn {
  background-color: #02163b;
  color: white;
}

.confirm-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.cancel-btn:hover,
.confirm-btn:hover:not(:disabled) {
  opacity: 0.9;
}

/* Image Preview Modal */
.image-preview-content {
  position: relative;
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  max-width: 90vw;
  max-height: 90vh;
}

.image-preview-content img {
  max-width: 100%;
  max-height: calc(90vh - 32px);
  object-fit: contain;
}

.close-btn {
  position: absolute;
  top: -15px;
  right: -15px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #02163b;
  color: white;
  border: none;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #0a1f3b;
}

/* Fade Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive Adjustments */
@media (max-width: 1200px) {
  .order-container:not(.sidebar-collapsed),
  .order-container.sidebar-collapsed {
    max-width: 100%;
    padding: 15px;
  }

  .status-options {
    flex-direction: column;
  }

  .status-btn {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    padding: 16px;
  }

  .order-info {
    padding: 8px;
  }

  .status-badge {
    padding: 2px 6px;
  }

  .action-btn {
    padding: 4px 8px;
    font-size: 0.9em;
  }
}

/* Additional Table Styles */
.order-table tr:nth-child(even) {
  background-color: #f8f9fa;
}

.order-table tr:hover {
  background-color: #f2f2f2;
}

/* Empty State */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background-color: #f9f9f9;
  border: 2px dashed #ddd;
  border-radius: 8px;
  margin: 20px 0;
}

.empty-state-content {
  text-align: center;
  color: #666;
}

.empty-state-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

/* Loading State */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

/* Filter Controls (Optional) */
.filter-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.search-box input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filter-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 150px;
}

/* Status History (Optional) */
.status-history {
  margin-top: 12px;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 0.9em;
}

.status-history-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid #dee2e6;
}

.status-history-item:last-child {
  border-bottom: none;
}

/* Tooltip styles */
.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  font-size: 0.8em;
  white-space: nowrap;
  z-index: 1000;
}

/* Print styles */
@media print {
  .action-btn,
  .modal-overlay {
    display: none;
  }

  .order-container {
    padding: 0;
  }

  .order-table {
    box-shadow: none;
  }
}

/* Add these styles with your existing styles */
.payment-proof {
  display: flex;
  justify-content: center;
}

.view-proof-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: #02163b;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: opacity 0.2s;
}

.view-proof-btn:hover {
  opacity: 0.9;
}

.view-proof-btn i {
  font-size: 1em;
}

/* Optional: Style for when there's no proof */
.view-proof-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Add these styles with your existing styles */
.order-type-toggle {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.toggle-btn {
  padding: 10px 20px;
  border: 2px solid #02163b;
  border-radius: 4px;
  background: none;
  color: #02163b;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-btn.active {
  background-color: #02163b;
  color: white;
}

/* Existing styles... */

.order-type-toggle {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: 2px solid #02163b;
  border-radius: 8px;
  background: none;
  color: #02163b;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn i {
  font-size: 1.1em;
}

.toggle-btn.active {
  background-color: #02163b;
  color: white;
}

.toggle-btn:hover:not(.active) {
  background-color: rgba(2, 22, 59, 0.1);
}

/* Optional: Animation for switching between tables */
.order-section {
  animation: fadeIn 0.3s ease;
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

/* Responsive styles for toggle buttons */
@media (max-width: 768px) {
  .order-type-toggle {
    flex-direction: column;
    gap: 8px;
  }

  .toggle-btn {
    width: 100%;
    justify-content: center;
  }
}

/* Existing styles... */

h1 {
  color: #333;
  font-size: 24px;
  margin-bottom: 30px;
}

.order-controls {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.order-type-toggle {
  display: flex;
  gap: 8px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 2px solid #02163b;
  border-radius: 4px;
  background: none;
  color: #02163b;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn i {
  font-size: 1em;
}

.toggle-btn.active {
  background-color: #02163b;
  color: white;
}

.toggle-btn:hover:not(.active) {
  background-color: rgba(2, 22, 59, 0.1);
}

/* Update section styles */
.order-section {
  animation: fadeIn 0.3s ease;
}

.order-section h2 {
  display: none; /* Hide the section titles since we have a main title now */
}

/* Rest of your existing styles... */

/* Modal Styles */
.modal-overlay {
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 95%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  color: #1f2937;
  margin: 0;
  font-size: 1.25rem;
}

.close-modal {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 5px;
}

.modal-body {
  padding: 1.5rem;
}

.order-info {
  background: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.info-item .label {
  color: #6b7280;
}

.status-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.status-action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
}

.status-action-btn.process {
  background: #3b82f6;
  color: white;
}

.status-action-btn.delivery {
  background: #10b981;
  color: white;
}

.status-action-btn.cancelled {
  background: #ef4444;
  color: white;
}

.cancellation-form {
  margin-top: 1rem;
}

.cancellation-form label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
}

.cancellation-form textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  resize: vertical;
  min-height: 100px;
}

.modal-footer {
  padding: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: #9ca3af;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: white;
}

.btn-primary.process {
  background: #3b82f6;
}

.btn-primary.delivery {
  background: #10b981;
}

.btn-primary.cancelled {
  background: #ef4444;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Add this */
.address-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 250px;
}

.full-address {
  font-size: 0.9em;
  line-height: 1.4;
  display: block;
  word-break: break-word; /* Allow breaking long words if needed */
  white-space: normal; /* Ensure text wraps */
  max-width: 250px; /* Keep this for width control */
}

.location {
  color: #666;
  font-size: 0.9em;
}

.postal-code {
  color: #666;
  font-size: 0.85em;
}

/* Add these new styles */
.order-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.status-filter {
  position: relative;
  min-width: 200px;
}

.dropdown-select {
  position: relative;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.selected-text {
  padding: 8px 12px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.selected-text::after {
  content: '▼';
  font-size: 0.8em;
  margin-left: 8px;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  gap: 8px;
  user-select: none; /* Prevent text selection */
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item input[type='checkbox'] {
  margin: 0;
  cursor: pointer;
}

/* Product details tooltip styling */
.product-name-wrapper {
  position: relative;
  cursor: pointer;
}

.product-name {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: default;
  transition: all 0.2s ease;
  background-color: #f0f0f0;
  color: #02163b;
  font-weight: 500;
  position: relative;
}

.product-name:hover {
  background-color: #e0e0e0;
}

.product-details-tooltip {
  position: absolute;
  left: 0;
  top: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  width: 280px;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  pointer-events: none;
  margin-top: 5px;
  border: 2px solid #02163b;
}

.product-name-wrapper:hover .product-name {
  background: #e9ecef;
}

.product-name-wrapper:hover .info-icon {
  opacity: 1;
  transform: scale(1.1);
}

.product-name-wrapper:hover .product-details-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(5px);
  animation: tooltipBounce 0.3s ease;
}

/* Tambahkan style khusus untuk baris terakhir */
.order-table tr:last-child .product-details-tooltip {
  bottom: 100%; /* Ubah dari top ke bottom */
  top: auto; /* Reset top property */
  margin-top: 0;
  margin-bottom: 1px;
}

/* Ubah animasi untuk tooltip baris terakhir */
.order-table tr:last-child .product-name-wrapper:hover .product-details-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(-5px); /* Ubah arah translate */
}

.tooltip-content {
  padding: 12px;
}

/* Product header */
.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.product-header h4 {
  margin: 0;
  color: #02163b;
  font-size: 0.9rem;
  font-weight: 600;
}

.price-type-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.price-type-badge.standard {
  background: #e3f2fd;
  color: #1565c0;
}
.price-type-badge.premium {
  background: #fdf4e3;
  color: #f59e0b;
}
.price-type-badge.budget {
  background: #e8f5e9;
  color: #2e7d32;
}

/* Sections styling */
.details-section {
  margin-bottom: 10px;
  padding-bottom: 8px;
}

.details-section:not(:last-child) {
  border-bottom: 1px solid #f0f0f0;
}

.details-section h5 {
  margin: 0 0 5px 0;
  color: #666;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-row {
  display: flex;
  font-size: 0.8rem;
  line-height: 1.4;
}

.detail-label {
  color: #666;
  width: 45px;
  flex-shrink: 0;
}

.detail-value {
  color: #333;
  font-weight: 500;
}

/* Accessories tags */
.accessories-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.acc-tag {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #333;
}

/* Notes section */
.notes {
  margin-bottom: 0;
  padding-bottom: 0;
}

.note-text {
  font-size: 0.8rem;
  color: #666;
  font-style: italic;
  margin: 0;
  line-height: 1.4;
}

/* Add info icon styling */
.info-icon {
  color: #02163b;
  font-size: 0.9em;
  opacity: 0.7;
  transition: all 0.2s ease;
}

/* Add pulse animation to info icon */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Apply animation on first hover */
.product-name-wrapper:hover .info-icon {
  animation: pulse 0.5s ease;
}

/* Add a subtle bounce effect */
@keyframes tooltipBounce {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
  100% {
    transform: translateY(0);
  }
}

/* Add tooltip arrow */
.product-details-tooltip::before {
  content: '';
  position: absolute;
  top: -9px;
  left: 20px;
  width: 14px;
  height: 14px;
  background: white;
  border-left: 2px solid #02163b;
  border-top: 2px solid #02163b;
  transform: rotate(45deg);
}

/* Tambahkan ini setelah style .product-details-tooltip::before */

/* Override arrow position for last row tooltip */
.order-table tr:last-child .product-details-tooltip::before {
  top: auto; /* Reset top property */
  bottom: -8px; /* Position at bottom */
  border: none; /* Reset border */
  border-right: 2px solid #02163b; /* Add new borders for downward arrow */
  border-bottom: 2px solid #02163b;
  transform: rotate(45deg); /* Rotate to point downward */
}

/* Adjust tooltip position and animation for last row */
.order-table tr:last-child .product-details-tooltip {
  bottom: 100%;
  top: auto;
  margin-top: 0;
  margin-bottom: 10px;
}

/* Update animation for last row tooltip */
.order-table tr:last-child .product-name-wrapper:hover .product-details-tooltip {
  transform: translateY(-5px);
}

@keyframes tooltipBounceReverse {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
  100% {
    transform: translateY(0);
  }
}

.order-table tr:last-child .product-name-wrapper:hover .product-details-tooltip {
  animation: tooltipBounceReverse 0.3s ease;
}

/* Add pagination controls styles */
.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.pagination-controls button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-controls button:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.pagination-controls span {
  font-size: 0.9rem;
  color: #666;
}

/* Add these new styles to your CSS */
.table-container {
  width: 100%;
  margin-bottom: 20px;
}

.table-responsive {
  position: relative;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  margin-bottom: 0; /* Remove bottom margin as it's now in table-container */
}

.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding: 0 10px;
}

.entries-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
}

.entries-dropdown select {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-family: 'Montserrat', sans-serif;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
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

/* Remove the old pagination-controls styles or update them accordingly */
.pagination-controls {
  display: none; /* Hide the old controls */
}

/* Search styles */
.search-container {
  position: relative;
  flex: 1;
  max-width: 400px;
  margin: 0 15px;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #02163b;
  box-shadow: 0 0 0 2px rgba(2, 22, 59, 0.1);
  outline: none;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 1rem;
}

/* Highlight style */
.highlight {
  background-color: #ffee9c;
  font-weight: 500;
  padding: 0 1px;
  border-radius: 2px;
}

/* Update order-controls for better layout */
.order-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .order-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container {
    max-width: 100%;
    margin: 10px 0;
  }
}
</style>
