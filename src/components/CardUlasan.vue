<template>
  <div class="reviews-carousel">
    <div class="carousel-container">
      <div class="carousel-track" ref="carouselTrack">
        <div v-for="(item, index) in reviews" :key="`review-${index}`" class="carousel-item">
          <div class="card" :class="{'card-mini': isMobileOrTablet}">
            <div class="card-header">
              <div class="avatar">
                <img
                  :src="item.avatarUrl || defaultAvatar"
                  alt="avatar"
                  @error="handleAvatarError"
                />
              </div>
              <div class="user-info">
                <h3 class="username">{{ item.name || 'User' }}</h3>
                <div class="rating">
                  <i v-for="star in 5" :key="star" class="fas fa-star"></i>
                </div>
              </div>
              <div class="review-date" v-if="!isMobileOrTablet">{{ formatDate(item.createdAt) }}</div>
            </div>

            <div class="review-content">
              <p>{{ isMobileOrTablet ? truncateText(item.review || 'No review content', 80) : (item.review || 'No review content') }}</p>
            </div>

            <div class="review-images" v-if="!isMobileOrTablet && item.images && item.images.length > 0">
              <img
                v-for="(image, imgIndex) in item.images"
                :key="imgIndex"
                :src="image"
                alt="Review image"
                @error="handleReviewImageError"
              />
            </div>

            <div class="product-info">
              <img
                :src="item.productImage || defaultLogo"
                alt="Product"
                @error="handleProductImageError"
              />
              <div class="product-details">
                <h4>{{ isMobileOrTablet ? truncateText(item.productName || 'Product', 25) : (item.productName || 'Product') }}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="loading-indicator">
      <i class="fas fa-spinner fa-spin"></i> Memuat ulasan...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDoc,
  doc,
  getDocs,
  limit,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import defaultAvatar from '@/assets/default-avatar-wm14gXiP.png'
import defaultLogo from '@/assets/Logo Difia Haki.PNG'

const props = defineProps({
  productId: {
    type: String,
    default: null,
  },
})

const reviews = ref([])
const unsubscribe = ref(null)
const carouselTrack = ref(null)
const isLoading = ref(true)
const windowWidth = ref(window.innerWidth)
let animationId = null
let position = 0
const speed = 0.8 // Increased speed for faster scrolling

// Responsive breakpoints
const MOBILE_BREAKPOINT = 482
const TABLET_BREAKPOINT = 900

// Compute whether the current device is mobile or tablet
const isMobileOrTablet = computed(() => {
  return windowWidth.value <= TABLET_BREAKPOINT
})

// Helper function to truncate text for mobile/tablet
const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// Update window width on resize
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

// Caching mechanism to improve performance
const reviewCache = new Map()

// Carousel animation function with optimized performance
const animateCarousel = () => {
  if (!carouselTrack.value || reviews.value.length <= 1) return

  position -= speed

  // Get first item width (with improved handling)
  const firstItem = carouselTrack.value.querySelector('.carousel-item')
  if (!firstItem) return

  const firstItemWidth = firstItem.offsetWidth

  if (firstItemWidth > 0) {
    // Check if first item has moved completely out of view
    if (-position >= firstItemWidth) {
      // Move first item to end (optimized DOM operations)
      const firstItemClone = firstItem.cloneNode(true)
      carouselTrack.value.appendChild(firstItemClone)
      carouselTrack.value.removeChild(firstItem)

      // Reset position by first item width to create seamless effect
      position += firstItemWidth
    }
  }

  // Use transform3d for hardware acceleration
  carouselTrack.value.style.transform = `translate3d(${position}px, 0, 0)`
  animationId = requestAnimationFrame(animateCarousel)
}

// Error handlers for images
const handleAvatarError = (e) => {
  e.target.src = defaultAvatar
}

const handleProductImageError = (e) => {
  e.target.src = defaultLogo
}

const handleReviewImageError = (e) => {
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

// Filter out reviews with images for mobile/tablet
const filterReviews = (reviewsList) => {
  if (isMobileOrTablet.value) {
    return reviewsList.filter(review => !review.images || review.images.length === 0)
  }
  return reviewsList
}

// Optimized function to get user data with caching
const fetchUserData = async (userId) => {
  if (!userId) return null

  // Check cache first
  const cacheKey = `user-${userId}`
  if (reviewCache.has(cacheKey)) {
    return reviewCache.get(cacheKey)
  }

  try {
    // Method 1: Direct document lookup
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      const userData = userDoc.data()
      reviewCache.set(cacheKey, userData)
      return userData
    }

    // Method 2: Query by uid field (in case userId is auth uid)
    const usersQuery = query(collection(db, 'users'), where('uid', '==', userId))
    const querySnapshot = await getDocs(usersQuery)

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data()
      reviewCache.set(cacheKey, userData)
      return userData
    }

    reviewCache.set(cacheKey, null)
    return null
  } catch (error) {
    console.error('Error fetching user data:', error)
    return null
  }
}

// Optimized function to get product data with caching
const fetchProductData = async (productId) => {
  if (!productId) return null

  // Check cache first
  const cacheKey = `product-${productId}`
  if (reviewCache.has(cacheKey)) {
    return reviewCache.get(cacheKey)
  }

  try {
    const productRef = doc(db, 'katalog', productId)
    const productDoc = await getDoc(productRef)

    if (productDoc.exists()) {
      const productData = productDoc.data()
      reviewCache.set(cacheKey, productData)
      return productData
    }

    reviewCache.set(cacheKey, null)
    return null
  } catch (error) {
    console.error('Error fetching product data:', error)
    return null
  }
}

// Process a single review with user and product data (batched for performance)
const processReview = async (reviewData, reviewId) => {
  // Return basic data immediately so we can show something fast
  const basicReview = {
    id: reviewId,
    ...reviewData,
    name: reviewData.name || 'User',
    avatarUrl: reviewData.avatarUrl || null,
    productName: reviewData.productName || 'Product',
    productImage: reviewData.productImage || null,
  }

  // In parallel, fetch the detailed data
  Promise.all([fetchUserData(reviewData.userId), fetchProductData(reviewData.productId)]).then(
    ([userData, productData]) => {
      // Find this review in the reviews array and update it
      const index = reviews.value.findIndex((r) => r.id === reviewId)
      if (index !== -1) {
        reviews.value[index] = {
          ...reviews.value[index],
          name: userData?.name || reviewData.name || 'User',
          avatarUrl: userData?.profilePhoto || userData?.photoURL || reviewData.avatarUrl || null,
          productName: reviewData.productName || productData?.nama || 'Product',
          productImage: reviewData.productImage || productData?.images?.[0] || null,
        }
      }
    },
  )

  return basicReview
}

// Optimized setup for real-time listeners
onMounted(() => {
  console.log('Mounting CardUlasan component')
  isLoading.value = true

  // Add resize event listener
  window.addEventListener('resize', handleResize)
  
  // Initialize window width
  windowWidth.value = window.innerWidth

  // Limit to 15 reviews for better performance
  const MAX_REVIEWS = 15
  let reviewsQuery

  if (props.productId) {
    // If productId is provided, get reviews for that product
    reviewsQuery = query(
      collection(db, 'reviews'),
      where('productId', '==', props.productId),
      where('rating', '==', 5),
      orderBy('createdAt', 'desc'),
      limit(MAX_REVIEWS),
    )
  } else {
    // Otherwise get all 5-star reviews
    reviewsQuery = query(
      collection(db, 'reviews'),
      where('rating', '==', 5),
      orderBy('createdAt', 'desc'),
      limit(MAX_REVIEWS),
    )
  }

  console.log('Setting up real-time listener for reviews')

  unsubscribe.value = onSnapshot(
    reviewsQuery,
    async (snapshot) => {
      console.log(`Received ${snapshot.docs.length} reviews`)

      if (snapshot.empty) {
        reviews.value = []
        isLoading.value = false
        return
      }

      // Process reviews in batches to improve UI responsiveness
      let processedReviews = []
      for (const doc of snapshot.docs) {
        const processedReview = await processReview(doc.data(), doc.id)
        processedReviews.push(processedReview)
      }

      // Filter reviews for mobile/tablet
      processedReviews = filterReviews(processedReviews)
      
      reviews.value = processedReviews

      // If not enough reviews, duplicate them to ensure smooth carousel
      if (reviews.value.length < 4 && reviews.value.length > 0) {
        let duplicated = [...reviews.value]
        while (duplicated.length < 8) {
          duplicated = [...duplicated, ...reviews.value]
        }
        reviews.value = duplicated
      }

      isLoading.value = false

      // Start animation after reviews are loaded (with a shorter delay)
      setTimeout(() => {
        console.log('Starting carousel animation')
        if (carouselTrack.value) {
          animationId = requestAnimationFrame(animateCarousel)
        }
      }, 300) // Reduced from 500ms to 300ms
    },
    (error) => {
      console.error('Error fetching reviews:', error)
      isLoading.value = false
    },
  )
})

// Watch for changes in reviews array
watch(reviews, (newReviews) => {
  console.log(`Reviews updated: ${newReviews.length} items`)
})

// Watch for changes in screen width to refilter reviews when needed
watch(isMobileOrTablet, (isMobile) => {
  if (unsubscribe.value) {
    // Re-fetch reviews when changing between desktop and mobile/tablet
    unsubscribe.value()
    onMounted()
  }
})

// Clean up listener and animation when component unmounts
onUnmounted(() => {
  console.log('Unmounting CardUlasan component')
  if (unsubscribe.value) {
    unsubscribe.value()
  }

  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  
  // Remove resize event listener
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* Original card styles preserved for desktop */
.card {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px; /* Slightly reduced width */
  border-radius: 16px;
  background-color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin: 1rem;
  transition: 
    transform 0.3s ease,
    box-shadow 0.3s ease;
  height: calc(100% - 2rem); /* Ensure consistent height */
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
  margin-top: auto; /* Push to bottom */
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

/* New carousel styles with increased gap */
.reviews-carousel {
  width: 100%;
  position: relative;
  min-height: 200px;
}

.carousel-container {
  width: 100%;
  overflow: hidden;
  position: relative;
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 15%, #000 35%, transparent 100%);
  mask-image: linear-gradient(90deg, transparent 0%, #000 5%, #000 95%, transparent 100%);
}

.carousel-track {
  display: flex;
  transition: none;
  will-change: transform;
  padding: 10px 0; /* Added padding */
}

.carousel-item {
  flex: 0 0 auto;
  padding: 0 30px; /* Increased padding from 15px to 30px to create bigger gaps */
  box-sizing: border-box;
}

/* Loading indicator */
.loading-indicator {
  text-align: center;
  padding: 2rem;
  color: #02163b;
  font-size: 1.1rem;
}

.loading-indicator i {
  margin-right: 8px;
  color: #e8ba38;
}

/* Mini card styles for mobile and tablet */
.card-mini {
  max-width: 280px;
  padding: 1rem;
  margin: 0.5rem 0.5rem;
  border-radius: 12px;
}

.card-mini .card-header {
  margin-bottom: 0.75rem;
}

.card-mini .avatar {
  width: 40px;
  height: 40px;
  margin-right: 0.75rem;
  border-width: 1.5px;
}

.card-mini .username {
  font-size: 0.9rem;
}

.card-mini .rating i {
  font-size: 0.8rem;
}

.card-mini .review-content {
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  max-height: 60px;
  overflow: hidden;
}

.card-mini .product-info {
  padding: 0.5rem;
}

.card-mini .product-info img {
  width: 30px;
  height: 30px;
  margin-right: 0.5rem;
}

.card-mini .product-details h4 {
  font-size: 0.8rem;
}

/* Responsive adjustments */
@media (max-width: 482px) {
  .carousel-item {
    flex: 0 0 80%;
    padding: 0 8px; /* Reduced spacing for all mobile devices */
  }
  
  .carousel-container {
    -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 5%, #000 95%, transparent 100%);
    mask-image: linear-gradient(90deg, transparent 0%, #000 5%, #000 95%, transparent 100%);
  }
  
  /* Mobile-specific card styling */
  .card-mini {
    max-width: 220px; /* Reduced max width for mobile */
    padding: 0.75rem;
    margin: 0.25rem;
    min-height: 180px; /* Set minimum height */
  }
}

/* Special handling for smaller Android devices */
@media (max-width: 400px) {
  .carousel-item {
    padding: 0 12px; /* More spacing for Android devices */
  }
}

/* Special handling for iPhone devices (typically wider) */
@media (min-width: 401px) and (max-width: 482px) {
  .carousel-item {
    padding: 0; /* Reduced spacing for iPhone */
    flex: 0 0 68%; /* Slightly smaller cards on iPhone */
  }
}
  
  .card-mini .avatar {
    width: 35px;
    height: 35px;
  }
  
  .card-mini .username {
    font-size: 0.85rem;
  }
  
  .card-mini .rating i {
    font-size: 0.7rem;
  }
  
  .card-mini .review-content {
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
    max-height: 50px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
  
  .card-mini .product-info {
    padding: 0.4rem;
  }
  
  .card-mini .product-info img {
    width: 25px;
    height: 25px;
    margin-right: 0.4rem;
  }
  
  .card-mini .product-details h4 {
    font-size: 0.75rem;
  }

@media (min-width: 483px) and (max-width: 900px) {
  .carousel-item {
    flex: 0 0 45%;
    padding: 0 15px; /* Increased spacing between cards */
  }
  
  .carousel-container {
    -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%);
    mask-image: linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%);
  }
}

@media (min-width: 901px) and (max-width: 1200px) {
  .carousel-item {
    flex: 0 0 50%;
    padding: 0 25px; /* Adjusted for tablets */
  }
}

@media (min-width: 1201px) {
  .carousel-item {
    flex: 0 0 33.33%;
    padding: 0 30px; /* Maintained for desktop */
  }
}
</style>