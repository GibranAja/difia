<template>
  <div class="product-name-wrapper" @click.stop="handleProductClick">
    <span class="product-name" v-html="highlightedName"></span>
    <div class="product-details-tooltip">
      <div class="tooltip-content">
        <!-- Information badge for multiple products -->
        <div v-if="hasMultipleProducts" class="multiple-products-badge">
          <i class="fas fa-shopping-basket"></i> {{ order.products.length }} produk
        </div>

        <!-- Main product info -->
        <div class="product-header">
          <h4>{{ getProductName() }}</h4>
          <span
            v-if="getCustomOptions() && getCustomOptions().priceType"
            class="price-type-badge"
            :class="getCustomOptions().priceType.toLowerCase()"
          >
            {{ getCustomOptions().priceType }}
          </span>
        </div>

        <!-- Product type indicator -->
        <div class="product-type-indicator">
          <span
            class="type-tag"
            :class="isProductSouvenir(getFirstProduct()) ? 'souvenir' : 'satuan'"
          >
            {{ isProductSouvenir(getFirstProduct()) ? 'Souvenir' : 'Satuan' }}
          </span>
          <span class="quantity-tag">{{ getProductQuantity() }} pcs</span>
        </div>

        <!-- Materials section -->
        <div class="details-section" v-if="getCustomOptions()">
          <h5>Material</h5>
          <div class="detail-row">
            <span class="detail-label">Luar:</span>
            <span class="detail-value">{{ getCustomOptions().bahanLuar || 'N/A' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Dalam:</span>
            <span class="detail-value">{{ getCustomOptions().bahanDalam || 'N/A' }}</span>
          </div>
        </div>

        <!-- Accessories section -->
        <div class="details-section" v-if="getCustomOptions() && getCustomOptions().aksesoris">
          <h5>Aksesoris</h5>
          <div class="accessories-tags">
            <span v-for="(acc, index) in getAccessories()" :key="index" class="acc-tag">
              {{ acc }}
            </span>
          </div>
        </div>

        <!-- Notes if exists -->
        <div v-if="getCustomOptions() && getCustomOptions().note" class="details-section notes">
          <h5>Catatan</h5>
          <p class="note-text">{{ getCustomOptions().note }}</p>
        </div>

        <!-- Show multiple products indicator if applicable -->
        <div v-if="hasMultipleProducts" class="multiple-products-info">
          <div class="more-products-row">
            <i class="fas fa-ellipsis-h"></i>
            <span>{{ order.products.length - 1 }} produk lainnya</span>
          </div>
          <div class="product-types-summary">
            {{ getProductTypesSummary() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
  searchQuery: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['view-product-details'])

// Add this function to handle click event
const handleProductClick = () => {
  emit('view-product-details', props.order)
}

const hasMultipleProducts = computed(() => {
  return props.order.products && props.order.products.length > 1
})

// Get first product - handles both legacy and new order format
const getFirstProduct = () => {
  if (props.order.products && props.order.products.length > 0) {
    return props.order.products[0]
  }
  return props.order // Legacy format
}

// Handle product data retrieval for both single and multiple product structures
const getProductName = () => {
  const product = getFirstProduct()
  return product.productName || 'N/A'
}

const getProductQuantity = () => {
  const product = getFirstProduct()
  return product.quantity || 1
}

const getCustomOptions = () => {
  const product = getFirstProduct()
  return product.customOptions || {}
}

const isProductSouvenir = (product) => {
  return (
    product.isBulkOrder ||
    (product.customOptions && product.customOptions.purchaseType === 'Souvenir')
  )
}

const getAccessories = () => {
  const customOptions = getCustomOptions()
  if (!customOptions || !customOptions.aksesoris) return []

  return Array.isArray(customOptions.aksesoris)
    ? customOptions.aksesoris
    : [customOptions.aksesoris]
}

const getProductTypesSummary = () => {
  if (!props.order.products) return ''

  const souvenirCount = props.order.products.filter((p) => isProductSouvenir(p)).length
  const satuanCount = props.order.products.length - souvenirCount

  let summary = []
  if (satuanCount > 0) summary.push(`${satuanCount} Satuan`)
  if (souvenirCount > 0) summary.push(`${souvenirCount} Souvenir`)

  return summary.join(' & ')
}

const highlightedName = computed(() => {
  const productName = getProductName()
  if (!props.searchQuery.trim() || !productName) return productName
  const regex = new RegExp(`(${props.searchQuery.trim()})`, 'gi')
  return productName.toString().replace(regex, '<span class="highlight">$1</span>')
})
</script>

<style scoped>
/* Product details tooltip styling */
.product-name-wrapper {
  position: relative;
  cursor: pointer;
}

.product-name {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer; /* Change cursor to pointer to indicate it's clickable */
  transition: all 0.2s ease;
  background-color: #f0f0f0;
  color: #02163b;
  font-weight: 500;
  position: relative;
}

/* Add a subtle indicator that product is clickable */
.product-name::after {
  content: '🔍';
  opacity: 0;
  margin-left: 5px;
  font-size: 0.85em;
  transition: opacity 0.2s;
}

.product-name:hover::after {
  opacity: 1;
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
  z-index: 1050 !important;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  pointer-events: none;
  margin-top: 5px;
  border: 2px solid #02163b;
  pointer-events: auto !important;
}

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
  pointer-events: auto;
}

/* Tooltip positioning for last row */
:deep(.order-table tr:last-child) .product-details-tooltip {
  bottom: 100%;
  top: auto;
  margin-top: 0;
  margin-bottom: 10px;
}

:deep(.order-table tr:last-child) .product-details-tooltip::before {
  top: auto;
  bottom: -8px;
  border: none;
  border-right: 2px solid #02163b;
  border-bottom: 2px solid #02163b;
  transform: rotate(45deg);
}

:deep(.order-table tr:last-child) .product-name-wrapper:hover .product-details-tooltip {
  transform: translateY(-5px);
  animation: tooltipBounceReverse 0.3s ease;
}

.tooltip-content {
  padding: 12px;
  position: relative;
  z-index: 1001;
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

/* Animations */
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

@keyframes tooltipBounceReverse {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(3px);
  }
  100% {
    transform: translateY(0);
  }
}

:deep(.highlight) {
  background-color: #ffee9c;
  font-weight: 500;
  padding: 0 1px;
  border-radius: 2px;
}

/* Add these styles */
.multiple-products-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #02163b;
  color: white;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.product-type-indicator {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.type-tag {
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
}

.type-tag.satuan {
  background: #e3f2fd;
  color: #0277bd;
}

.type-tag.souvenir {
  background: #e8f5e9;
  color: #2e7d32;
}

.quantity-tag {
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
  background: #eeeeee;
  color: #424242;
}

.multiple-products-info {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #ddd;
  font-size: 0.85rem;
  color: #666;
}

.more-products-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.product-types-summary {
  font-size: 0.8rem;
  margin-top: 4px;
  color: #777;
}

/* Improve tooltip visibility and positioning */
.product-details-tooltip {
  z-index: 1000;
  pointer-events: auto; /* Allow interaction with tooltip */
}

/* Ensure tooltip stays on top even in different contexts */
.product-name-wrapper:hover .product-details-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(5px);
  animation: tooltipBounce 0.3s ease;
  pointer-events: auto;
}

/* Additional positioning fixes */
.tooltip-content {
  position: relative;
  z-index: 1001;
}

/* Add these existing styles at the end for better overriding */
</style>
