<template>
  <div class="product-name-wrapper">
    <span class="product-name" v-html="highlightedName"></span>
    <div class="product-details-tooltip">
      <div class="tooltip-content">
        <!-- Main product info -->
        <div class="product-header">
          <h4>{{ order.productName }}</h4>
          <!-- Add conditional checks for customOptions -->
          <span
            v-if="order.customOptions?.priceType"
            class="price-type-badge"
            :class="order.customOptions.priceType.toLowerCase()"
          >
            {{ order.customOptions.priceType }}
          </span>
          <span v-else class="price-type-badge standard">Standard</span>
        </div>

        <!-- Materials section -->
        <div class="details-section" v-if="order.customOptions">
          <h5>Material</h5>
          <div class="detail-row">
            <span class="detail-label">Luar:</span>
            <span class="detail-value">{{ order.customOptions?.bahanLuar || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Dalam:</span>
            <span class="detail-value">{{ order.customOptions?.bahanDalam || '-' }}</span>
          </div>
        </div>

        <!-- Accessories section -->
        <div class="details-section" v-if="order.customOptions?.aksesoris">
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
        <div v-if="order.customOptions?.note" class="details-section notes">
          <h5>Catatan</h5>
          <p class="note-text">{{ order.customOptions.note }}</p>
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

const highlightedName = computed(() => {
  if (!props.searchQuery.trim() || !props.order.productName) return props.order.productName
  const regex = new RegExp(`(${props.searchQuery.trim()})`, 'gi')
  return props.order.productName.toString().replace(regex, '<span class="highlight">$1</span>')
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
</style>
