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
      </div>

      <!-- Regular Orders Section -->
      <div class="order-section" v-if="activeOrderType === 'regular'">
        <h2>Regular Orders</h2>
        <div class="table-responsive">
          <table class="order-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Total Amount</th>
                <th>Payment Proof</th>
                <!-- Add this -->
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in regularOrders" :key="order.id">
                <td>{{ order.id }}</td>
                <td>
                  <div class="customer-info">
                    <div>{{ order.shippingDetails.name }}</div>
                    <div class="customer-email">{{ order.shippingDetails.email }}</div>
                  </div>
                </td>
                <td>{{ order.productName }}</td>
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
      </div>

      <!-- Souvenir Orders Section -->
      <div class="order-section" v-if="activeOrderType === 'souvenir'">
        <h2>Souvenir Orders</h2>
        <div class="table-responsive">
          <table class="order-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Total Amount</th>
                <th>Payment Proof</th>
                <!-- Add this -->
                <th>Design</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in souvenirOrders" :key="order.id">
                <td>{{ order.id }}</td>
                <td>
                  <div class="customer-info">
                    <div>{{ order.shippingDetails.name }}</div>
                    <div class="customer-email">{{ order.shippingDetails.email }}</div>
                  </div>
                </td>
                <td>{{ order.productName }}</td>
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
                    class="design-preview"
                    @click="openImagePreview(order.customOptions.designImage)"
                  >
                    <img :src="order.customOptions.designImage" alt="Design preview" />
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
import { ref, computed, onMounted } from 'vue'
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

const statusFlow = {
  pending: ['process', 'cancelled'],
  process: ['delivery', 'cancelled'],
  delivery: ['cancelled'], // complete hanya bisa dari user
  complete: [], // tidak bisa diubah
  cancelled: [], // tidak bisa diubah
}

defineProps({
  isSidebarOpen: {
    type: Boolean,
    default: true,
  },
})

// Computed properties for filtered orders
const regularOrders = computed(() => orders.value.filter((order) => !order.isBulkOrder))

const souvenirOrders = computed(() => orders.value.filter((order) => order.isBulkOrder))

const availableStatuses = computed(() => {
  if (!selectedOrder.value) return []

  return statusFlow[selectedOrder.value.status] || []
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
</script>

<style scoped>
/* Add this at the top of your <style> section */
.order-container {
  font-family: 'Montserrat', sans-serif;
  padding: 20px;
  width: 100%;
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
  overflow-x: auto;
  margin-bottom: 20px;
  width: 100%;
}

.order-table {
  width: 100%;
  min-width: 1000px;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

.status-badge.delivery {
  background-color: #d4edda;
  color: #155724;
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
</style>
