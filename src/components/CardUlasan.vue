<template>
  <div class="card" v-if="review">
    <div class="card-header">
      <div class="avatar">
        <img :src="review.avatarUrl || defaultAvatar" alt="avatar" @error="handleAvatarError" />
      </div>
      <div class="user-info">
        <h3 class="username">{{ review.name || 'User' }}</h3>
        <div class="rating">
          <i v-for="star in 5" :key="star" class="fas fa-star"></i>
        </div>
      </div>
      <div class="review-date">{{ formatDate(review.createdAt) }}</div>
    </div>

    <div class="review-content">
      <p>{{ review.review || 'No review content' }}</p>
    </div>

    <div class="review-images" v-if="review.images && review.images.length > 0">
      <img
        v-for="(image, index) in review.images"
        :key="index"
        :src="image"
        alt="Review image"
        @error="handleReviewImageError"
      />
    </div>

    <div class="product-info">
      <img
        :src="review.productImage || defaultLogo"
        alt="Product"
        @error="handleProductImageError"
      />
      <div class="product-details">
        <h4>{{ review.productName || 'Product' }}</h4>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit as limitQuery,
  getDoc,
  doc,
  getDocs,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import defaultAvatar from '@/assets/default-avatar-wm14gXiP.png'
import defaultLogo from '@/assets/Logo Difia Haki.PNG'

const props = defineProps({
  productId: {
    type: String,
    default: null,
  },
  limit: {
    type: Number,
    default: 1,
  },
})

const review = ref(null)
const unsubscribe = ref(null)

// Separate error handlers for different image types
const handleAvatarError = (e) => {
  console.log('Avatar image error, using default')
  e.target.src = defaultAvatar
}

const handleProductImageError = (e) => {
  console.log('Product image error, using default logo')
  e.target.src = defaultLogo
}

const handleReviewImageError = (e) => {
  console.log('Review image error, hiding image')
  e.target.style.display = 'none'
}

// Format date for display
const formatDate = (timestamp) => {
  if (!timestamp) return 'Recent'

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

// Improved function to get user data for a review
const fetchUserData = async (userId) => {
  try {
    if (!userId) {
      console.log('No userId provided for fetchUserData')
      return null
    }

    console.log('Fetching user data for userId:', userId)

    // Try both methods to get user data - direct document lookup and query
    // Method 1: Direct document lookup
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      console.log('User found by direct ID lookup:', userDoc.data())
      return userDoc.data()
    }

    // Method 2: Query by uid field (in case userId is auth uid)
    const usersQuery = query(collection(db, 'users'), where('uid', '==', userId))
    const querySnapshot = await getDocs(usersQuery)

    if (!querySnapshot.empty) {
      console.log('User found by uid query:', querySnapshot.docs[0].data())
      return querySnapshot.docs[0].data()
    }

    console.log('No user found with ID or uid:', userId)
    return null
  } catch (error) {
    console.error('Error fetching user data:', error)
    return null
  }
}

// New function to get product data
const fetchProductData = async (productId) => {
  try {
    if (!productId) {
      console.log('No productId provided for fetchProductData')
      return null
    }

    console.log('Fetching product data for productId:', productId)
    const productRef = doc(db, 'katalog', productId)
    const productDoc = await getDoc(productRef)

    if (productDoc.exists()) {
      console.log('Product data found:', productDoc.data().nama)
      return productDoc.data()
    }

    console.log('No product found with ID:', productId)
    return null
  } catch (error) {
    console.error('Error fetching product data:', error)
    return null
  }
}

// Set up real-time listener for reviews
onMounted(() => {
  console.log('CardUlasan mounted, fetching reviews...')
  console.log('productId:', props.productId)

  let reviewsQuery

  if (props.productId) {
    // If productId is provided, get reviews for that product
    reviewsQuery = query(
      collection(db, 'reviews'),
      where('productId', '==', props.productId),
      where('rating', '==', 5),
      orderBy('createdAt', 'desc'),
      limitQuery(props.limit),
    )
  } else {
    // Otherwise get all 5-star reviews
    reviewsQuery = query(
      collection(db, 'reviews'),
      where('rating', '==', 5),
      orderBy('createdAt', 'desc'),
      limitQuery(props.limit),
    )
  }

  unsubscribe.value = onSnapshot(
    reviewsQuery,
    async (snapshot) => {
      if (!snapshot.empty) {
        const reviewData = snapshot.docs[0].data()
        console.log('Found review data:', reviewData)

        // Log the userId for debugging
        console.log('Review userId:', reviewData.userId)

        // Fetch user data to get avatar and name
        const userData = await fetchUserData(reviewData.userId)
        console.log('Fetched user data:', userData)

        // Fetch product data to get product image
        const productData = await fetchProductData(reviewData.productId)

        review.value = {
          id: snapshot.docs[0].id,
          ...reviewData,
          name: userData?.name || reviewData.name || 'User',
          avatarUrl: userData?.profilePhoto || userData?.photoURL || reviewData.avatarUrl || null,
          productName: reviewData.productName || productData?.nama || 'Product',
          productImage: reviewData.productImage || productData?.images?.[0] || null,
        }

        console.log('Final review data constructed:', review.value)
      } else {
        console.log('No reviews found matching the criteria')
      }
    },
    (error) => {
      console.error('Error fetching reviews:', error)
    },
  )
})

// Clean up listener when component unmounts
onUnmounted(() => {
  if (unsubscribe.value) {
    unsubscribe.value()
  }
})
</script>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 450px;
  border-radius: 16px;
  background-color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin: 1rem;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  position: relative;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 1rem;
  border: 2px solid #e8ba38;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.username {
  margin: 0;
  font-size: 1.1rem;
  color: #02163b;
  font-weight: 600;
}

.rating {
  display: flex;
  margin-top: 0.25rem;
}

.rating i {
  color: #e8ba38;
  margin-right: 0.2rem;
  font-size: 0.9rem;
}

.review-date {
  font-size: 0.8rem;
  color: #999;
  position: absolute;
  right: 0;
  top: 0;
}

.review-content {
  margin-bottom: 1rem;
  color: #444;
  line-height: 1.6;
}

.review-images {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.review-images img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #eee;
  transition: transform 0.2s ease;
}

.review-images img:hover {
  transform: scale(1.05);
  cursor: pointer;
}

.product-info {
  display: flex;
  align-items: center;
  background-color: #f8f8f8;
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 0.5rem;
}

.product-info img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 6px;
  margin-right: 0.75rem;
}

.product-details h4 {
  margin: 0;
  font-size: 0.9rem;
  color: #555;
}

@media (max-width: 768px) {
  .card {
    max-width: 100%;
    margin: 1rem 0;
  }
}
</style>
