<template>
  <div class="table-container" v-if="orders.length">
    <!-- Scrollable table wrapper -->
    <div class="table-responsive">
      <table class="order-table">
        <thead>
          <tr>
            <th style="width: 50px">No.</th>
            <!-- New column for row numbers -->
            <th>Order ID</th>
            <th>Customer</th>
            <th>Alamat</th>
            <th>Produk</th>
            <th>Kuantitas</th>
            <th>Total Harga</th>
            <th>Bukti Pembayaran</th>
            <th v-if="showEmbossColumn">Logo</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(order, index) in orders" :key="order.id">
            <td class="text-center">{{ index + 1 }}</td>
            <!-- New cell for row number -->
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
                <!-- UPDATE: Gunakan destination.label instead of city, province, zip -->
                <div class="destination-info" v-if="order.shippingDetails.destination?.label">
                  <span v-html="highlightMatch(order.shippingDetails.destination.label, searchQuery)"></span>
                </div>
                <!-- FALLBACK: Tetap support struktur lama untuk data yang belum migrate -->
                <div v-else-if="order.shippingDetails.city || order.shippingDetails.province" class="location-fallback">
                  <div class="location">
                    <span v-if="order.shippingDetails.city" v-html="highlightMatch(order.shippingDetails.city, searchQuery)"></span>
                    <span v-if="order.shippingDetails.city && order.shippingDetails.province">, </span>
                    <span v-if="order.shippingDetails.province" v-html="highlightMatch(order.shippingDetails.province, searchQuery)"></span>
                  </div>
                  <div v-if="order.shippingDetails.zip" class="postal-code" v-html="highlightMatch(order.shippingDetails.zip, searchQuery)"></div>
                </div>
                <!-- CASE: Tidak ada data alamat sama sekali -->
                <div v-else class="no-address">
                  <span class="text-muted">Alamat tidak tersedia</span>
                </div>
              </div>
            </td>
            <td>
              <ProductTooltip :order="order" :searchQuery="searchQuery" />
            </td>
            <td>{{ order.quantity }}</td>
            <td>{{ formatPrice(order.totalAmount) }}</td>
            <td>
              <div class="payment-proof">
                <button
                  class="view-proof-btn"
                  @click="$emit('view-payment', order.paymentProof)"
                  title="View Payment Proof"
                >
                  <i class="fas fa-receipt"></i>
                  View Proof
                </button>
              </div>
            </td>
            <td v-if="showEmbossColumn">
              <div
                v-if="order.customOptions?.uploadedImage"
                class="design-preview"
                @click="$emit('view-design', order.customOptions.uploadedImage)"
              >
                <img :src="order.customOptions.uploadedImage" alt="Design preview" />
              </div>
              <!-- <div v-else class="no-design">Tidak ada emboss</div> -->

              <div v-if="order.customOptions?.uploadedLogo" class="logo-action">
                <button
                  @click="openPdfInNewTab(order.customOptions.uploadedLogo)"
                  class="view-logo-btn"
                  title="Lihat Logo"
                >
                  <i class="fas fa-file-pdf"></i> Lihat Logo
                </button>
              </div>
              <div v-else class="no-logo">Tidak ada logo</div>
            </td>
            <td>
              <StatusBadge :status="order.status" />
            </td>
            <td>
              <button
                class="action-btn"
                @click="$emit('update-status', order)"
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

  <!-- Show empty state for no orders or filtered orders -->
  <div v-else class="empty-state">
    <div class="empty-state-content">
      <i :class="['fas', emptyStateIcon, 'empty-state-icon']"></i>
      <h3>{{ emptyStateTitle }}</h3>
      <p>{{ emptyStateMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import StatusBadge from './StatusBadge.vue'
import ProductTooltip from './ProductTooltip.vue'

defineProps({
  orders: {
    type: Array,
    required: true,
  },
  searchQuery: {
    type: String,
    default: '',
  },
  orderType: {
    type: String,
    default: 'regular',
  },
  showEmbossColumn: {
    type: Boolean,
    default: false,
  },
  emptyStateIcon: {
    type: String,
    default: 'fa-box-open',
  },
  emptyStateTitle: {
    type: String,
    default: 'Tidak ada data order',
  },
  emptyStateMessage: {
    type: String,
    default: 'Tidak ditemukan pesanan dengan filter yang dipilih',
  },
})

defineEmits(['update-status', 'view-payment', 'view-design'])

// Helper functions
const highlightMatch = (text, query) => {
  if (!query.trim() || !text) return text

  const regex = new RegExp(`(${query.trim()})`, 'gi')
  return text.toString().replace(regex, '<span class="highlight">$1</span>')
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(price)
}

const openPdfInNewTab = (base64Data) => {
  try {
    // Check if it's a valid base64 data URL
    if (!base64Data || !base64Data.startsWith('data:application/pdf')) {
      console.error('Invalid PDF data format')
      alert('PDF data format is invalid or corrupted')
      return
    }

    // Open in a new tab
    const newWindow = window.open()
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>PDF Viewer</title>
            <style>
              body, html {
                margin: 0;
                padding: 0;
                height: 100%;
                overflow: hidden;
              }
              embed {
                width: 100%;
                height: 100%;
              }
            </style>
          </head>
          <body>
            <embed src="${base64Data}" type="application/pdf" width="100%" height="100%">
          </body>
        </html>
      `)
    } else {
      // If popup was blocked
      alert('Please allow popups to view the PDF')
    }
  } catch (error) {
    console.error('Error opening PDF:', error)
    alert('Error opening PDF: ' + error.message)
  }
}
</script>

<style scoped>
.table-container {
  width: 100%;
  margin-bottom: 20px;
}

.table-responsive {
  position: relative;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

.order-table {
  width: 100%;
  min-width: 1200px;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin: 0;
  font-family: 'Montserrat', sans-serif;
}

/* Sticky header */
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

/* Address info styles */
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
  word-break: break-word;
  white-space: normal;
  max-width: 250px;
}

/* UPDATE: Style untuk destination info (struktur baru) */
.destination-info {
  color: #666;
  font-size: 0.9em;
  line-height: 1.3;
  padding-left: 0.2rem;
  border-left: 2px solid rgba(232, 186, 56, 0.3);
}

/* Style untuk fallback (struktur lama) */
.location-fallback {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.location {
  color: #666;
  font-size: 0.9em;
}

.postal-code {
  color: #666;
  font-size: 0.85em;
}

/* Style untuk case tidak ada alamat */
.no-address {
  color: #999;
  font-style: italic;
  font-size: 0.85em;
}

.text-muted {
  color: #6c757d;
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

.action-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.action-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Payment proof button */
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

/* Design preview */
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

.no-design {
  color: #999;
  font-size: 0.9em;
}

.logo-action {
  text-align: center;
}

.view-logo-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #02163b;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.85rem;
  transition: background-color 0.2s;
}

.view-logo-btn:hover {
  background-color: #032155;
}

.no-logo {
  color: #999;
  font-style: italic;
  font-size: 0.85rem;
  text-align: center;
}

/* Empty state */
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

/* Table row styles */
.order-table tr:nth-child(even) {
  background-color: #f8f9fa;
}

.order-table tr:hover {
  background-color: #f2f2f2;
}

/* Highlight style */
:deep(.highlight) {
  background-color: #ffee9c;
  font-weight: 500;
  padding: 0 1px;
  border-radius: 2px;
}
</style>
