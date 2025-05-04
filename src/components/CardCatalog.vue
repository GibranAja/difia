<template>
  <div class="card" v-if="item">
    <div class="card-content">
      <div class="image-wrapper">
        <router-link :to="`/detail/${item.id}`" class="image-container">
          <img
            :src="item.images[0]"
            alt="foto-produk"
            v-if="item.images && item.images.length > 0"
          />
          <div class="overlay">
            <div class="overlay-content">
              <span class="view-details">Lihat Detail</span>
              <p class="hover-desc">Klik untuk melihat informasi lengkap produk</p>
            </div>
          </div>
        </router-link>
      </div>

      <div class="product-info">
        <h1 class="product-name">{{ item.nama }}</h1>

        <!-- Product Stats: Sold count and Rating -->
        <div class="product-stats">
          <div class="sold-count">
            <span>Terjual {{ soldCount }}</span>
          </div>
          <div class="rating">
            <i class="fas fa-star"></i>
            <span>{{ averageRating.toFixed(1) }}</span>
            <span class="review-count">({{ reviewsCount }})</span>
          </div>
        </div>

        <div class="price-section">
          <span class="price-label">Harga Mulai Dari</span>
          <p class="price">Rp {{ formatPrice(item.harga.standar) }}</p>
        </div>

        <button @click="handleBuyClick" class="order-btn">
          <span>Pesan Sekarang</span>
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import { useToast } from 'vue-toastification'
import { db } from '@/config/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

// Reactive state for product stats
const soldCount = ref(0)
const reviews = ref([])
const reviewsCount = ref(0)
const unsubscribeOrders = ref(null)
const unsubscribeReviews = ref(null)

// Calculate average rating
const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((acc, review) => acc + review.rating, 0)
  return sum / reviews.value.length
})

// Set up real-time listeners
onMounted(() => {
  // Listen for orders to count sold items
  const ordersQuery = query(collection(db, 'orders'), where('productId', '==', props.item.id))

  unsubscribeOrders.value = onSnapshot(ordersQuery, (snapshot) => {
    // Calculate total quantity sold from all orders
    soldCount.value = snapshot.docs.reduce((total, doc) => {
      const order = doc.data()
      return total + (order.quantity || 1)
    }, 0)
  })

  // Listen for reviews
  const reviewsQuery = query(collection(db, 'reviews'), where('productId', '==', props.item.id))

  unsubscribeReviews.value = onSnapshot(reviewsQuery, (snapshot) => {
    reviews.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    reviewsCount.value = snapshot.docs.length
  })
})

// Clean up listeners when component unmounts
onUnmounted(() => {
  if (unsubscribeOrders.value) {
    unsubscribeOrders.value()
  }
  if (unsubscribeReviews.value) {
    unsubscribeReviews.value()
  }
})

const handleBuyClick = () => {
  if (!authStore.isLoggedIn) {
    toast.warning('Silakan login terlebih dahulu')
    router.push('/login')
    return
  }
  router.push(`/custom/${props.item.id}`)
}

const formatPrice = (price) => {
  return price.toLocaleString('id-ID')
}
</script>

<style scoped>
.card {
  width: 300px;
  background-color: #fafafa;
  border-radius: 16px;
  padding: 20px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.image-wrapper {
  padding: 10px;
  background-color: white;
  border-radius: 12px;
  box-shadow: inset 0 0 10px rgba(2, 22, 59, 0.05);
}

.image-container {
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;
  border-radius: 8px;
  display: block;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(2, 22, 59, 0.7), rgba(232, 186, 56, 0.7));
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.overlay-content {
  text-align: center;
  transform: translateY(20px);
  transition: transform 0.3s ease;
}

.view-details {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
}

.hover-desc {
  color: white;
  font-size: 0.9rem;
  opacity: 0.9;
}

.image-container:hover .overlay {
  opacity: 1;
}

.image-container:hover img {
  transform: scale(1.1);
}

.image-container:hover .overlay-content {
  transform: translateY(0);
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.product-name {
  font-size: 1.25rem;
  color: #02163b;
  font-weight: 600;
  line-height: 1.4;
  margin: 0;
}

/* New styles for product stats */
.product-stats {
  display: flex;
  justify-content: flex-start; /* Changed from space-between to flex-start */
  align-items: center;
  font-size: 0.85rem;
  color: #666;
  gap: 8px; /* Add a small controlled gap */
}

.sold-count {
  background-color: rgba(2, 22, 59, 0.05);
  padding: 4px 8px;
  border-radius: 4px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating i {
  color: #e8ba38; /* This makes the star icon yellow/gold */
}

.review-count {
  color: #888;
}

.price-section {
  background-color: white;
  border: 2px solid #e8ba38;
  border-radius: 12px;
  padding: 12px 16px;
  position: relative;
  overflow: hidden;
}

.price-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background-color: #e8ba38;
}

.price-label {
  display: block;
  color: #02163b;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 4px;
  opacity: 0.8;
}

.price {
  color: #02163b;
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.order-btn {
  background-color: #e8ba38;
  color: #02163b;
  border: none;
  border-radius: 100px;
  padding: 14px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 5px;
}

.order-btn:hover {
  background-color: #02163b;
  color: #e8ba38;
  transform: translateX(5px);
}

.order-btn i {
  transition: transform 0.3s ease;
}

.order-btn:hover i {
  transform: translateX(5px);
}

/* MOBILE OPTIMIZATION STYLES */
@media (max-width: 768px) {
  .card {
    width: 100%;
    padding: 0;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .card-content {
    gap: 10px;
  }

  .image-wrapper {
    padding: 0;
    border-radius: 8px 8px 0 0;
    box-shadow: none;
  }

  .image-container {
    height: 180px;
    border-radius: 8px 8px 0 0;
  }

  .product-info {
    padding: 10px;
    gap: 8px;
  }

  .product-name {
    font-size: 0.95rem;
    line-height: 1.3;
    margin-bottom: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .product-stats {
    font-size: 0.7rem;
    margin-top: -2px;
  }

  .sold-count {
    padding: 2px 6px;
  }

  .price-section {
    padding: 6px 10px;
    border-width: 1px;
    border-radius: 6px;
  }

  .price-section::before {
    width: 2px;
  }

  .price-label {
    font-size: 0.65rem;
    margin-bottom: 0;
  }

  .price {
    font-size: 0.9rem;
  }

  .order-btn {
    padding: 6px 12px;
    font-size: 0.75rem;
    border-radius: 6px;
    margin-top: 0;
  }

  .order-btn i {
    font-size: 0.7rem;
  }
}

/* Additional tweaks for very small screens */
@media (max-width: 480px) {
  .card {
    min-width: 140px; /* Ensure minimum width */
  }

  .image-container {
    height: 140px;
  }

  .product-stats {
    display: none; /* Hide stats completely on very small screens */
  }
}
</style>