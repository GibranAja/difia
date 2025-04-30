<template>
  <div class="card" v-if="item">
    <!-- Image Section - Full width for mobile -->
    <div class="image-wrapper">
      <router-link :to="`/detail/${item.id}`" class="image-container">
        <img
          :src="item.images[0]"
          alt="foto-produk"
          v-if="item.images && item.images.length > 0"
        />
        <div class="rating-badge">
          <i class="fas fa-star"></i>
          <span>{{ averageRating.toFixed(1) }}</span>
        </div>
      </router-link>
    </div>

    <!-- Content Section -->
    <div class="card-content">
      <div class="product-info">
        <h1 class="product-name">{{ item.nama }}</h1>
        
        <!-- Combined Product Stats Row -->
        <div class="product-stats">
          <div class="sold-count">
            <i class="fas fa-shopping-bag"></i>
            <span>{{ soldCount }} terjual</span>
          </div>
          <div class="reviews">
            <span>{{ reviewsCount }} ulasan</span>
          </div>
        </div>

        <!-- Price and CTA Row -->
        <div class="action-row">
          <div class="price-section">
            <span class="price-label">Mulai dari</span>
            <p class="price">Rp {{ formatPrice(item.harga.standar) }}</p>
          </div>
          
          <button @click="handleBuyClick" class="order-btn">
            <i class="fas fa-shopping-cart"></i>
          </button>
        </div>
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
/* Desktop styles (default) */
.card {
  width: 300px;
  background-color: #fafafa;
  border-radius: 16px;
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 240px;
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: block;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-name {
  font-size: 1.25rem;
  color: #02163b;
  font-weight: 600;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #666;
}

.rating-badge {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating-badge i {
  color: #e8ba38;
}

.sold-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.reviews {
  font-size: 0.8rem;
}

.price-label {
  display: block;
  color: #666;
  font-size: 0.75rem;
  margin-bottom: 2px;
}

.price {
  color: #02163b;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
}

.order-btn {
  background-color: #e8ba38;
  color: #02163b;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.order-btn:hover {
  background-color: #02163b;
  color: #e8ba38;
}

.action-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 5px;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .card {
    width: 160px;
    border-radius: 12px;
    margin-bottom: 10px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
  }
  
  /* Full-width image on mobile */
  .image-wrapper {
    position: relative;
    width: calc(100% + 0px);
    height: 180px;
    margin: 0;
    border-radius: 12px 12px 0 0;
    overflow: hidden;
  }
  
  .image-container {
    height: 100%;
    width: 100%;
  }
  
  .image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .rating-badge {
    bottom: 8px;
    right: 8px;
    padding: 3px 8px;
    font-size: 0.7rem;
    border-radius: 8px;
  }
  
  .card-content {
    padding: 10px;
  }
  
  .product-info {
    gap: 6px;
  }
  
  .product-name {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 4px;
    -webkit-line-clamp: 2;
  }
  
  .product-stats {
    font-size: 0.7rem;
  }
  
  .sold-count i, .reviews i {
    font-size: 0.7rem;
  }
  
  .action-row {
    margin-top: 6px;
  }
  
  .price-section {
    display: flex;
    flex-direction: column;
  }
  
  .price-label {
    font-size: 0.65rem;
    color: #888;
  }
  
  .price {
    font-size: 0.95rem;
    font-weight: 700;
  }
  
  .order-btn {
    width: 32px;
    height: 32px;
    font-size: 0.75rem;
  }
}
</style>