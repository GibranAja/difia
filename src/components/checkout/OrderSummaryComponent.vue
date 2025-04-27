<template>
  <section class="checkout-section order-details">
    <h2 class="section-title">Ringkasan Order ({{ totalItems }} item)</h2>

    <!-- First one or two items always visible -->
    <div v-for="(item, index) in visibleItems" :key="item.id" class="order-card">
      <img :src="item.image" :alt="item.name" class="order-image" />
      <div class="order-info">
        <div class="order-header">
          <h3>{{ item.name }}</h3>
          <p class="order-price">{{ item.quantity }}x Rp {{ formatPrice(item.price) }}</p>
        </div>
        <div class="order-specs">
          <div class="spec-item">
            <span class="spec-label">Tipe:</span>
            <span>{{ item.customOptions.purchaseType }}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Harga:</span>
            <span>{{ item.customOptions.priceType }}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Berat produk:</span>
            <span>{{ getItemWeight(item) }} gram</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Bahan Luar:</span>
            <span>{{ item.customOptions.bahanLuar }}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Bahan Dalam:</span>
            <span>{{ item.customOptions.bahanDalam }}</span>
          </div>
          <div class="spec-item full-width">
            <span class="spec-label">Aksesoris:</span>
            <span>{{ item.customOptions.aksesoris.join(', ') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Show more button if > 2 items -->
    <button v-if="hasMoreItems" @click="toggleShowMore" class="show-more-btn">
      {{
        showingMore
          ? 'Lihat Lebih Sedikit'
          : `Lihat ${checkoutItems.length - visibleItems.length} Produk Lainnya`
      }}
    </button>

    <!-- Hidden items (only shown when button clicked) -->
    <div v-if="showingMore" class="additional-items">
      <div v-for="item in hiddenItems" :key="item.id" class="order-card">
        <img :src="item.image" :alt="item.name" class="order-image" />
        <div class="order-info">
          <div class="order-header">
            <h3>{{ item.name }}</h3>
            <p class="order-price">{{ item.quantity }}x Rp {{ formatPrice(item.price) }}</p>
          </div>
          <div class="order-specs">
            <div class="spec-item">
              <span class="spec-label">Tipe:</span>
              <span>{{ item.customOptions.purchaseType }}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Harga:</span>
              <span>{{ item.customOptions.priceType }}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Berat:</span>
              <span>{{ getItemWeight(item) }} gram</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Bahan Luar:</span>
              <span>{{ item.customOptions.bahanLuar }}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Bahan Dalam:</span>
              <span>{{ item.customOptions.bahanDalam }}</span>
            </div>
            <div class="spec-item full-width">
              <span class="spec-label">Aksesoris:</span>
              <span>{{ item.customOptions.aksesoris.join(', ') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useKatalogStore } from '@/stores/KatalogStore'

const katalogStore = useKatalogStore()

const props = defineProps({
  checkoutItems: {
    type: Array,
    required: true,
  },
})

// Local state
const showingMore = ref(false)
const VISIBLE_ITEMS_COUNT = 2

// Computed properties
const totalItems = computed(() => props.checkoutItems.length)

const visibleItems = computed(() => {
  return props.checkoutItems.slice(0, VISIBLE_ITEMS_COUNT)
})

const hiddenItems = computed(() => {
  return props.checkoutItems.slice(VISIBLE_ITEMS_COUNT)
})

const hasMoreItems = computed(() => {
  return props.checkoutItems.length > VISIBLE_ITEMS_COUNT
})

// Methods
const toggleShowMore = () => {
  showingMore.value = !showingMore.value
}

const formatPrice = (price) => {
  return price.toLocaleString('id-ID')
}

// Helper function to get item weight from catalog
const getItemWeight = (item) => {
  // Try to get weight from the item itself first
  if (item.detail?.berat) return item.detail.berat
  if (item.customOptions?.weight) return item.customOptions.weight
  if (item.weight) return item.weight

  // If not found, try to find the original katalog item
  const katalogItem = katalogStore.katalogItems.find((k) => k.id === item.productId)
  if (katalogItem?.detail?.berat) return katalogItem.detail.berat

  // Default fallback
  return 0
}

// Load katalog data if needed
onMounted(async () => {
  // If the katalog store is empty, fetch the data
  if (katalogStore.katalogItems.length === 0) {
    await katalogStore.fetchKatalog()
  }
})
</script>

<style scoped>
/* Section Styling */
.checkout-section {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  margin-bottom: 2rem;
  transition: transform 0.3s ease;
}

.checkout-section:hover {
  transform: translateY(-3px);
}

.section-title {
  color: #02163b;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid rgba(232, 186, 56, 0.3);
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background-color: #e8ba38;
}

/* Order Card Styling */
.order-card {
  display: flex;
  border-radius: 10px;
  overflow: hidden;
  background: #f9f9f9;
  transition: all 0.3s;
  margin-bottom: 1rem;
}

.order-card:hover {
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.07);
}

.order-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
}

.order-info {
  padding: 1rem;
  flex: 1;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.order-header h3 {
  margin: 0 0 0.25rem;
  color: #02163b;
  font-size: 1.1rem;
}

.order-price {
  font-weight: 600;
  color: #e8ba38;
  margin: 0;
}

.order-specs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  font-size: 0.9rem;
}

.spec-item {
  display: flex;
  flex-direction: column;
}

.spec-item.full-width {
  grid-column: 1 / -1;
}

.spec-label {
  font-weight: 500;
  color: #666;
  margin-bottom: 0.25rem;
}

/* Show more button */
.show-more-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #f5f5f5;
  border: 1px dashed #ddd;
  border-radius: 8px;
  color: #02163b;
  font-weight: 500;
  cursor: pointer;
  margin: 1rem 0;
  transition: all 0.2s ease;
}

.show-more-btn:hover {
  background-color: #eee;
  border-color: #ccc;
}

.additional-items {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #ddd;
  animation: fadeIn 0.3s ease;
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

/* Responsive Design */
@media (max-width: 768px) {
  .order-card {
    flex-direction: column;
  }

  .order-image {
    width: 100%;
    height: 200px;
  }

  .order-specs {
    grid-template-columns: 1fr;
  }

  .spec-item.full-width {
    grid-column: auto;
  }
}
</style>
