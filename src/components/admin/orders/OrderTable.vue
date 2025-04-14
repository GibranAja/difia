<template>
  <div class="table-container" v-if="orders.length">
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
            <th v-if="showEmbossColumn">Emboss</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
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
                  <span v-html="highlightMatch(order.shippingDetails.city, searchQuery)"></span>,
                  <span v-html="highlightMatch(order.shippingDetails.province, searchQuery)"></span>
                </div>
                <div
                  class="postal-code"
                  v-html="highlightMatch(order.shippingDetails.zip, searchQuery)"
                ></div>
              </div>
            </td>
            <td>
              <!-- For single product orders (legacy format) -->
              <ProductTooltip v-if="!order.products" :order="order" :searchQuery="searchQuery" />

              <!-- For multiple product orders -->
              <div v-else class="multiple-products">
                <ProductTooltip :order="order" :searchQuery="searchQuery" />

                <!-- If more than one product, show indicator -->
                <div v-if="order.products.length > 1" class="product-count">
                  +{{ order.products.length - 1 }} more
                </div>
              </div>
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
              <div v-else class="no-design">Tidak ada emboss</div>
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

// Add this computed property
const getOrderType = (order) => {
  // For legacy orders
  if (!order.products) {
    return order.isBulkOrder ? 'souvenir' : 'regular'
  }

  // For multiple product orders
  if (order.products.length === 1) {
    return order.products[0].isBulkOrder ? 'souvenir' : 'regular'
  }

  // Check if order has mixed types
  const hasSouvenir = order.products.some(
    (p) => p.isBulkOrder || p.customOptions?.purchaseType === 'Souvenir',
  )
  const hasRegular = order.products.some(
    (p) => !p.isBulkOrder || p.customOptions?.purchaseType === 'Satuan',
  )

  if (hasSouvenir && hasRegular) {
    return 'mixed'
  }

  return hasSouvenir ? 'souvenir' : 'regular'
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

.location {
  color: #666;
  font-size: 0.9em;
}

.postal-code {
  color: #666;
  font-size: 0.85em;
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

.multiple-products {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.product-count {
  font-size: 0.8rem;
  color: #666;
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 12px;
  display: inline-block;
  align-self: flex-start;
}

/* Add these new styles to fix tooltip positioning */
:deep(.product-details-tooltip) {
  z-index: 1000 !important; /* Ensure tooltip is above other elements */
  position: absolute;
}

:deep(.product-name-wrapper) {
  position: relative;
  display: inline-block;
}

/* Improve tooltip position consistency */
:deep(.product-name-wrapper:hover .product-details-tooltip) {
  opacity: 1 !important;
  visibility: visible !important;
}

/* Fix for mixed table specifically */
.order-table tr:hover :deep(.product-details-tooltip) {
  z-index: 1000 !important;
}

/* Improved tooltip positioning fixes */
:deep(.product-details-tooltip) {
  z-index: 1000 !important;
  position: absolute !important;
  pointer-events: auto !important; /* Allow interaction with tooltip */
  transform: none !important; /* Prevent transform issues */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important; /* Stronger shadow for better visibility */
}

:deep(.product-name-wrapper) {
  position: relative !important;
  display: inline-block !important;
  z-index: 2; /* Ensure wrapper has a z-index to create stacking context */
}

/* Force tooltip visibility on hover */
:deep(.product-name-wrapper:hover .product-details-tooltip) {
  opacity: 1 !important;
  visibility: visible !important;
  display: block !important;
}

/* Ensure the table doesn't clip the tooltips */
.table-responsive {
  overflow: visible !important; /* Allow tooltips to overflow */
  z-index: 1; /* Create proper stacking context */
}

/* Make sure the table headers don't overlap tooltips */
.order-table thead th {
  z-index: 5; /* Lower than tooltip but higher than regular cells */
}

/* Elevate the tooltip when a table row is hovered */
.order-table tr:hover {
  position: relative;
  z-index: 3; /* Higher than normal but lower than the tooltip */
}

/* Hack to fix tooltip in mixed table */
.order-table tr:hover td {
  position: relative;
}

/* Empty state and other existing styles... */
</style>
