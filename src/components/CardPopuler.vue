<template>
  <div v-if="loading" class="loading">
    <i class="fas fa-spinner fa-spin"></i> Memuat katalog populer...
  </div>

  <div v-else class="popular-cards-container">
    <div
      v-for="(product, index) in popularProducts"
      :key="product.id"
      :class="['card-seller', `rank-${index + 1}`, getSoldCountClass(product.soldCount)]"
      @click="goToDetail(product.id)"
    >
      <div class="rank-badge">
        <i :class="['fas', 'fa-crown', `rank-color-${index + 1}`]"></i>{{ index + 1 }}
      </div>
      <div class="card-seller__image">
        <img :src="product.image" alt="Card Image" />
        <div class="bestseller-tag">BESTSELLER</div>
      </div>
      <div class="card-seller__content">
        <h3 class="card-seller__title">{{ product.title }}</h3>
        <div class="card-seller__stats">
          <div class="sales">
            <i class="fas fa-shopping-cart"></i>
            <span>{{ product.soldCount }}</span>
          </div>
          <div class="rating">
            <i class="fas fa-star"></i>
            <span>{{ product.rating.toFixed(1) }}</span>
            <span class="review-count">({{ product.reviewCount }})</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { collection, query, getDocs, doc, getDoc, orderBy, where } from 'firebase/firestore'
import { db } from '@/config/firebase'

const router = useRouter()
const popularProducts = ref([])
const loading = ref(true)

// Fetch top selling products based on orders
const fetchPopularProducts = async () => {
  try {
    loading.value = true

    const ordersRef = collection(db, 'orders')
    const q = query(ordersRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)

    const productSales = {}

    snapshot.docs.forEach((doc) => {
      const order = doc.data()
      const productId = order.productId
      const quantity = order.quantity || 1

      if (productId) {
        productSales[productId] = (productSales[productId] || 0) + quantity
      }
    })

    const sortedProducts = Object.entries(productSales)
      .map(([id, count]) => ({ id, soldCount: count }))
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 3)

    const productDetailsPromises = sortedProducts.map(async (product) => {
      const productRef = doc(db, 'katalog', product.id)
      const productDoc = await getDoc(productRef)

      if (productDoc.exists()) {
        const data = productDoc.data()

        const reviewsRef = collection(db, 'reviews')
        const reviewsQuery = query(reviewsRef, where('productId', '==', product.id))
        const reviewsSnapshot = await getDocs(reviewsQuery)

        let averageRating = 0
        const reviews = reviewsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        if (reviews.length > 0) {
          const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0)
          averageRating = sum / reviews.length
        }

        return {
          id: product.id,
          title: data.nama,
          image: data.images && data.images.length > 0 ? data.images[0] : null,
          soldCount: product.soldCount,
          price: data.harga?.standar || 0,
          rating: averageRating,
          reviewCount: reviews.length,
        }
      }
      return null
    })

    const productDetails = await Promise.all(productDetailsPromises)
    popularProducts.value = productDetails.filter((product) => product !== null)
  } catch (error) {
    console.error('Error fetching popular products:', error)
  } finally {
    loading.value = false
  }
}

// Determine CSS class based on sold count
const getSoldCountClass = (soldCount) => {
  if (soldCount > 50) return 'high-sales'
  if (soldCount > 40) return 'medium-sales'
  return 'low-sales'
}

const goToDetail = (productId) => {
  router.push(`/detail/${productId}`)
}

onMounted(() => {
  fetchPopularProducts()
})
</script>

<style scoped>
.popular-cards-container {
  position: relative;
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.card-seller {
  width: 300px;
  border-radius: 10px;
  overflow: hidden;
  background-color: white;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  cursor: pointer;
  position: relative;
  margin-bottom: 0px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-seller:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.card-seller__image {
  height: 200px;
  position: relative;
  overflow: hidden;
}

.card-seller__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.card-seller:hover .card-seller__image img {
  transform: scale(1.05);
}

.bestseller-tag {
  position: absolute;
  top: 10px;
  left: 0;
  background-color: #e8ba38;
  color: #02163b;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: bold;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}

.card-seller__content {
  padding: 15px;
}

.card-seller__title {
  font-size: 16px;
  margin-bottom: 10px;
  color: #02163b;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 40px;
}

.card-seller__stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  margin-bottom: 8px;
}

.sales {
  font-size: 20px;
  color: #666;
}

.sales i {
  margin-right: 4px;
  color: #e8ba38;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 20px;
  color: #666;
}

.rating i {
  color: #e8ba38;
}

.review-count {
  font-size: 12px;
  color: #888;
}

.price {
  font-weight: 700;
  color: #e8ba38;
  font-size: 16px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
  color: #02163b;
  font-weight: 500;
}

.loading i {
  margin-right: 8px;
  color: #e8ba38;
}

.rank-badge {
  position: absolute;
  top: 0px;
  right: 0;
  padding: 5px;
  background-color: #e8ba38;
  color: #02163b;
  font-size: 20px;
  font-weight: bold;
  z-index: 1;
  word-spacing: 10rem;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  width: 40px;
}

.rank-color-1 {
  color: #ffd700; /* Emas */
}

.rank-color-2 {
  color: #c0c0c0; /* Perak */
}

.rank-color-3 {
  color: #cd7f32; /* Perunggu */
}

/* Mobile styles - horizontal scrolling */
@media (max-width: 768px) {
  .popular-cards-container {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding: 12px 0;
    margin: 0 -20px;
    padding-left: 20px;
    padding-right: 40px;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity; /* Changed from mandatory to proximity for smoother scrolling */
    gap: 15px;
    position: relative;
    justify-content: flex-start;
    /* Hide scrollbar for clean look */
    scrollbar-width: none;
    -ms-overflow-style: none;
    mask-image: linear-gradient(to right, black 85%, transparent 100%);
    -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
  }

  /* Add margin to first card */
  .popular-cards-container > .card-seller:first-child {
    margin-left: 10px; /* Increased from 1rem for better spacing */
  }

  /* Add margin to last card */
  .popular-cards-container > .card-seller:last-child {
    margin-right: 30px;
  }

  .popular-cards-container::-webkit-scrollbar {
    display: none;
  }

  .card-seller {
    flex: 0 0 auto;
    width: 180px; /* Mini cards for mobile */
    scroll-snap-align: center; /* Changed from start to center for better scroll behavior */
    margin-bottom: 0;
    transform: none;
    margin-right: 0;
  }

  .card-seller:hover {
    transform: translateY(-3px); /* Reduced hover effect for touch */
  }

  .card-seller__image {
    height: 120px; /* Smaller image height for mobile */
  }

  .bestseller-tag {
    font-size: 10px;
    padding: 3px 8px;
  }

  .card-seller__content {
    padding: 10px;
  }

  .card-seller__title {
    font-size: 14px;
    height: 32px;
    -webkit-line-clamp: 2;
    margin-bottom: 5px;
  }

  .card-seller__stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
  }

  .sales,
  .rating {
    font-size: 14px;
  }

  .review-count {
    font-size: 10px;
  }

  .rank-badge {
    font-size: 16px;
    width: 30px;
    padding: 3px;
  }
}
</style>
