<template>
  <div v-if="loading" class="loading">
    <i class="fas fa-spinner fa-spin"></i> Memuat katalog populer...
  </div>

  <div v-else class="popular-cards-container">
    <div
      v-for="product in popularProducts"
      :key="product.id"
      class="card-seller"
      @click="goToDetail(product.id)"
    >
      <div class="card-seller__image">
        <img :src="product.image" alt="Card Image" />
        <div class="bestseller-tag">BESTSELLER</div>
      </div>
      <div class="card-seller__content">
        <h3 class="card-seller__title">{{ product.title }}</h3>
        <div class="card-seller__stats">
          <div class="sales">
            <i class="fas fa-shopping-cart"></i>
            <span>Terjual {{ product.soldCount }}</span>
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
import { ref, onMounted, onUnmounted } from 'vue'
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

    // First, get all orders
    const ordersRef = collection(db, 'orders')
    const q = query(ordersRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)

    // Count sales per productId
    const productSales = {}

    snapshot.docs.forEach((doc) => {
      const order = doc.data()
      const productId = order.productId
      const quantity = order.quantity || 1

      if (productId) {
        productSales[productId] = (productSales[productId] || 0) + quantity
      }
    })

    // Convert to array and sort by sales count
    const sortedProducts = Object.entries(productSales)
      .map(([id, count]) => ({ id, soldCount: count }))
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 3) // Get top 3

    // Fetch product details and reviews for each popular product
    const productDetailsPromises = sortedProducts.map(async (product) => {
      const productRef = doc(db, 'katalog', product.id)
      const productDoc = await getDoc(productRef)

      if (productDoc.exists()) {
        const data = productDoc.data()

        // Fetch reviews for this product
        const reviewsRef = collection(db, 'reviews')
        const reviewsQuery = query(reviewsRef, where('productId', '==', product.id))
        const reviewsSnapshot = await getDocs(reviewsQuery)

        // Calculate average rating
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

// Format price with thousand separator
const formatPrice = (price) => {
  return price.toLocaleString('id-ID')
}

// Navigate to product detail
const goToDetail = (productId) => {
  router.push(`/detail/${productId}`)
}

onMounted(() => {
  fetchPopularProducts()
})
</script>

<style scoped>
.popular-cards-container {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.card-seller {
  width: 250px;
  border-radius: 12px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  cursor: pointer;
}

.card-seller:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
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
  font-size: 13px;
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
  font-size: 13px;
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
</style>
