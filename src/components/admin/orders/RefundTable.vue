<template>
  <div class="table-container" v-if="orders.length">
    <!-- Scrollable table wrapper -->
    <div class="table-responsive">
      <table class="order-table">
        <thead>
          <tr>
            <th style="width: 50px">No.</th>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Alasan Pembatalan</th>
            <th>Dana Refund</th>
            <th>No Rekening</th>
            <th>Nama Pemilik</th>
            <th>Bank</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(order, index) in orders"
            :key="order.id"
            :class="{ 'processed-row': order.refundRequest?.status === 'processed' }"
          >
            <td class="text-center">{{ index + 1 }}</td>
            <td v-html="highlightMatch(order.id, searchQuery)"></td>
            <td>
              <div class="customer-info">
                <span class="customer-name">{{ order.shippingDetails?.name }}</span>
                <span class="customer-email">{{ order.shippingDetails?.email }}</span>
              </div>
            </td>
            <td>
              <div class="cancel-info">
                <span>{{ order.cancelReason || 'Tidak ada alasan' }}</span>
                <span class="canceller-tag" :class="getCancellerClass(order)">
                  {{ getCancellerLabel(order) }}
                </span>
              </div>
            </td>
            <td>{{ formatPrice(order.totalAmount) }}</td>
            <td>{{ order.refundRequest?.accountNumber || '-' }}</td>
            <td>{{ order.refundRequest?.accountName || '-' }}</td>
            <td>{{ order.refundRequest?.bankName || '-' }}</td>
            <td>
              <div class="status-container">
                <StatusBadge
                  :status="getRefundStatusDisplay(order)"
                  :custom-text="getRefundStatusLabel(order)"
                />
                <small v-if="order.refundRequest?.processedAt" class="processed-date">
                  {{ formatDate(order.refundRequest.processedAt) }}
                </small>
              </div>
            </td>
            <td>
              <button
                v-if="order.refundRequest?.status !== 'processed'"
                class="action-btn"
                @click="$emit('process-refund', order)"
              >
                Proses Refund
              </button>
              <button
                v-else
                class="action-btn view-btn"
                @click="$emit('view-proof', order.refundRequest?.proof)"
              >
                <i class="fas fa-eye"></i> Lihat Bukti
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Empty state for no refund requests -->
  <div v-else class="empty-state">
    <div class="empty-state-content">
      <i class="fas fa-money-bill-wave empty-state-icon"></i>
      <h3>{{ emptyStateTitle }}</h3>
      <p>{{ emptyStateMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import StatusBadge from './StatusBadge.vue'

defineProps({
  orders: {
    type: Array,
    required: true,
  },
  searchQuery: {
    type: String,
    default: '',
  },
  emptyStateTitle: {
    type: String,
    default: 'Tidak ada permintaan refund',
  },
  emptyStateMessage: {
    type: String,
    default: 'Tidak ditemukan permintaan refund dengan filter yang dipilih',
  },
})

defineEmits(['process-refund', 'view-proof'])

// Helper functions
const highlightMatch = (text, query) => {
  if (!query.trim() || !text) return text

  const regex = new RegExp(`(${query.trim()})`, 'gi')
  return text.replace(regex, '<span class="highlight">$1</span>')
}

const formatPrice = (price) => {
  if (!price) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}

const formatDate = (timestamp) => {
  if (!timestamp) return ''

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// Determine who cancelled the order
const getCancellerLabel = (order) => {
  if (!order.cancelledBy || order.cancelledBy === '') {
    return 'Customer' // Default if cancelledBy is missing
  }

  switch (order.cancelledBy) {
    case 'admin':
      return 'Admin'
    case 'system':
      return 'System'
    case 'user':
      return 'Customer'
    default:
      return order.cancelledBy // For any other value
  }
}

const getCancellerClass = (order) => {
  return {
    admin: order.cancelledBy === 'admin',
    system: order.cancelledBy === 'system',
    customer: order.cancelledBy === 'user' || !order.cancelledBy,
  }
}

const getRefundStatusDisplay = (order) => {
  if (!order.refundRequest) {
    return 'cancel'
  }

  if (order.refundRequest.status === 'processed') {
    return 'completed'
  }

  return 'pending'
}

const getRefundStatusLabel = (order) => {
  if (!order.refundRequest) {
    return 'Dibatalkan'
  }

  if (order.refundRequest.status === 'processed') {
    return 'Refund Selesai'
  }

  return 'Menunggu Refund'
}
</script>

<style scoped>
.table-container {
  overflow: hidden;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
  max-height: 70vh;
  overflow-y: auto;
}

.order-table {
  width: 100%;
  border-collapse: collapse;
}

.order-table thead th {
  position: sticky;
  top: 0;
  background-color: #02163b;
  z-index: 10;
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

/* Mark processed refunds with a subtle background */
.processed-row {
  background-color: #f8f9fa;
}

/* Customer info styles */
.customer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.customer-email {
  color: #666;
  font-size: 0.9em;
}

/* Cancel info styles */
.cancel-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.canceller-tag {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  width: fit-content;
}

.canceller-tag.admin {
  background-color: #fee2e2;
  color: #991b1b;
}

.canceller-tag.system {
  background-color: #e5e7eb;
  color: #4b5563;
}

.canceller-tag.customer {
  background-color: #e0f2fe;
  color: #0369a1;
}

/* Status container */
.status-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.processed-date {
  color: #6b7280;
  font-size: 0.8rem;
}

.text-center {
  text-align: center;
}

/* Action button styles */
.action-btn {
  background-color: #02163b;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.action-btn.view-btn {
  background-color: #047857;
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.action-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.highlight {
  background-color: rgba(255, 242, 0, 0.5);
  padding: 0 2px;
  border-radius: 2px;
}

/* Empty state styles */
.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin: 1rem 0;
}

.empty-state-content {
  max-width: 500px;
  margin: 0 auto;
}

.empty-state-icon {
  font-size: 3rem;
  color: #ccc;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
  color: #333;
}

.empty-state p {
  color: #666;
  margin: 0;
}

/* Additional status badge styles */
:deep(.status-badge.completed) {
  background-color: #d1fae5;
  color: #047857;
}

:deep(.status-badge.cancel) {
  background-color: #fee2e2;
  color: #b91c1c;
}

:deep(.status-badge.pending) {
  background-color: #fef3c7;
  color: #92400e;
}
</style>
