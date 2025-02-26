<template>
  <div class="detail-view">
    <div class="gambar-detail">
      <router-link to="/" class="back">
        <i class="fas fa-arrow-left"></i>
      </router-link>

      <h1>
        <b>{{ katalog?.nama || 'Produk Kami' }}</b>
      </h1>

      <div v-if="katalog" class="content-wrapper">
        <!-- Replace single image with carousel -->
        <div
          class="carousel-container"
          @mousemove="handleMouseMove"
          @mouseenter="stopAutoplay"
          @mouseleave="startAutoplay"
        >
          <div class="carousel-wrapper" :style="carouselStyle">
            <!-- Duplicate first and last images for smooth transition -->
            <img
              v-if="katalog.images.length > 0"
              :src="katalog.images[katalog.images.length - 1]"
              :alt="katalog.nama"
              class="carousel-image"
            />
            <img
              v-for="(image, index) in katalog.images"
              :key="index"
              :src="image"
              :alt="katalog.nama"
              class="carousel-image"
            />
            <img
              v-if="katalog.images.length > 0"
              :src="katalog.images[0]"
              :alt="katalog.nama"
              class="carousel-image"
            />
          </div>

          <!-- Navigation buttons -->
          <button class="carousel-btn prev" @click="prevSlide">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="carousel-btn next" @click="nextSlide">
            <i class="fas fa-chevron-right"></i>
          </button>

          <!-- Indicators -->
          <div class="carousel-indicators">
            <span
              v-for="(_, index) in katalog.images"
              :key="index"
              :class="['indicator', { active: currentIndex === index }]"
              @click="goToSlide(index)"
            ></span>
          </div>
        </div>

        <button class="hub">Pesan Sekarang</button>

        <div class="toko-section">
          <h2>Kunjungi Toko Kami :</h2>
          <div class="sosmed-link">
            <a href="#" class="sosmed">
              <i class="fas fa-brands fa-instagram"></i>
              <b>DIFIA.ID</b>
            </a>
            <a href="#" class="sosmed">
              <i class="fas fa-bag-shopping"></i>
              <b>DIFIA OFFICIAL SHOP</b>
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-keterangan" v-if="katalog">
      <section>
        <h2><b>HARGA / PCS</b></h2>
        <div class="info-content">
          <p>Standard : {{ katalog.harga.standar.toLocaleString() }}</p>
          <p>Premium : {{ katalog.harga.premium.toLocaleString() }}</p>
          <p>Budgeting : {{ katalog.harga.budgetting }}</p>
        </div>
      </section>

      <section>
        <h2><b>DETAIL</b></h2>
        <div class="info-content">
          <p>
            Ukuran : P {{ katalog.detail.ukuran.panjang }} x L {{ katalog.detail.ukuran.lebar }} x T
            {{ katalog.detail.ukuran.tinggi }} cm
          </p>
          <p>Bahan Luar : {{ katalog.detail.bahanLuar }}</p>
          <p>Bahan Dalam : {{ katalog.detail.bahanDalam }}</p>
          <p>Aksesoris : {{ katalog.detail.aksesoris }}</p>
          <p>Warna : {{ katalog.detail.warna }}</p>
        </div>
      </section>

      <section>
        <h2><b>WAKTU PENGERJAAN</b></h2>
        <div class="info-content">
          <p>50-100 pcs : {{ katalog.waktuPengerjaan.pcs50_100 }} hari</p>
          <p>200 pcs : {{ katalog.waktuPengerjaan.pcs200 }} hari</p>
          <p>300 pcs : {{ katalog.waktuPengerjaan.pcs300 }} hari</p>
          <p>>300 pcs : {{ katalog.waktuPengerjaan.pcsAbove300 }} hari</p>
          <p>Express : {{ katalog.waktuPengerjaan.express }} hari</p>
        </div>
      </section>

      <!-- Reviews section -->
      <section class="review-section">
        <h2><b>ULASAN PEMBELI</b></h2>

        <!-- Summary section with star rating -->
        <div class="review-summary">
          <div class="rating-average">
            <div class="average-score">{{ averageRating }}</div>
            <div class="star-display">
              <i
                v-for="i in 5"
                :key="i"
                class="fas"
                :class="i <= Math.round(averageRating) ? 'fa-star' : 'fa-star-o'"
                :style="{ color: i <= Math.round(averageRating) ? '#E8BA38' : '#d9d9d9' }"
              >
              </i>
            </div>
            <div class="total-reviews">{{ reviews.length }} ulasan</div>
          </div>

          <div class="rating-bars">
            <div v-for="star in 5" :key="star" class="rating-bar-container">
              <span class="rating-label">{{ 6 - star }}</span>
              <div class="rating-bar-wrapper">
                <div
                  class="rating-bar"
                  :style="{ width: `${getPercentageForStar(6 - star)}%` }"
                ></div>
              </div>
              <span class="rating-count">{{ getCountForStar(6 - star) }}</span>
            </div>
          </div>
        </div>

        <!-- Filter section -->
        <div class="review-filters">
          <div class="filter-label">Filter:</div>
          <div
            :class="['filter-chip', { active: selectedFilter === 'all' }]"
            @click="setFilter('all')"
          >
            Semua
          </div>
          <div
            :class="['filter-chip', { active: selectedFilter === 'withPhotos' }]"
            @click="setFilter('withPhotos')"
          >
            Dengan Foto
          </div>
          <div
            :class="['filter-chip', { active: selectedFilter === '5star' }]"
            @click="setFilter('5star')"
          >
            5 Bintang
          </div>
          <div
            :class="['filter-chip', { active: selectedFilter === '4star' }]"
            @click="setFilter('4star')"
          >
            4 Bintang
          </div>
          <div
            :class="['filter-chip', { active: selectedFilter === '3below' }]"
            @click="setFilter('3below')"
          >
            3 Bintang & Kurang
          </div>
        </div>

        <!-- Reviews list -->
        <div v-if="reviewsLoading" class="reviews-loading">Loading reviews...</div>

        <div v-else class="reviews-container">
          <div v-if="reviews.length === 0" class="no-reviews">No reviews yet</div>

          <div v-for="(review, index) in filteredReviews" :key="index" class="review-card">
            <div class="review-header">
              <div class="reviewer-avatar">
                <img
                  :src="review.avatarUrl"
                  :alt="review.name"
                  @error="$event.target.src = defaultAvatar"
                />
              </div>
              <div class="reviewer-info">
                <div class="reviewer-name">{{ review.name }}</div>
                <div class="review-date">{{ formatDate(review.date) }}</div>
              </div>
              <div class="review-rating">
                <i
                  v-for="i in 5"
                  :key="i"
                  class="fas"
                  :class="i <= review.rating ? 'fa-star' : 'fa-star-o'"
                  :style="{ color: i <= review.rating ? '#E8BA38' : '#d9d9d9' }"
                >
                </i>
              </div>
            </div>

            <div class="review-content">
              <p>{{ review.content }}</p>
            </div>

            <div v-if="review.images && review.images.length > 0" class="review-images">
              <img
                v-for="(img, imgIndex) in review.images"
                :key="imgIndex"
                :src="img"
                alt="Review photo"
                @click="openImageModal(review.images, imgIndex)"
              />
            </div>

            <div class="review-footer">
              <div class="review-helpful">
                <button
                  :class="['helpful-btn', { active: review.userFoundHelpful }]"
                  @click="toggleHelpful(index)"
                >
                  <i class="fas fa-thumbs-up"></i> Membantu ({{ review.helpfulCount }})
                </button>
              </div>
              <div class="review-timestamp">{{ timeAgo(review.date) }}</div>
            </div>
          </div>

          <!-- Show more button -->
          <div v-if="hasMoreReviews" class="load-more">
            <button @click="loadMoreReviews" class="load-more-btn">
              Lihat Lebih Banyak Ulasan
            </button>
          </div>
        </div>
      </section>
    </div>

    <!-- Image modal -->
    <div v-if="showImageModal" class="image-modal" @click="closeImageModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeImageModal">
          <i class="fas fa-times"></i>
        </button>

        <div class="modal-image-container">
          <button v-if="modalImages.length > 1" class="modal-nav prev" @click="prevModalImage">
            <i class="fas fa-chevron-left"></i>
          </button>

          <img :src="modalImages[currentModalImageIndex]" alt="Review photo full size" />

          <button v-if="modalImages.length > 1" class="modal-nav next" @click="nextModalImage">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <div v-if="modalImages.length > 1" class="modal-thumbnails">
          <div
            v-for="(img, index) in modalImages"
            :key="index"
            :class="['modal-thumbnail', { active: currentModalImageIndex === index }]"
            @click="goToModalImage(index)"
          >
            <img :src="img" alt="thumbnail" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useKatalogStore } from '@/stores/KatalogStore'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  getDocs,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import defaultAvatar from '@/assets/default-avatar-wm14gXiP.png'

const route = useRoute()
const toast = useToast()
const katalogStore = useKatalogStore()
const katalog = ref(null)

// Function to save catalog to localStorage
const saveCatalogToCache = (catalogData) => {
  if (catalogData) {
    localStorage.setItem(`catalog-${catalogData.id}`, JSON.stringify(catalogData))
  }
}

// Function to get catalog from localStorage
const getCatalogFromCache = (id) => {
  const cached = localStorage.getItem(`catalog-${id}`)
  return cached ? JSON.parse(cached) : null
}

onMounted(async () => {
  const id = route.params.id

  // First try to get from cache
  const cachedItem = getCatalogFromCache(id)
  if (cachedItem) {
    katalog.value = cachedItem
  }

  // Then try to find in existing store items
  let item = katalogStore.katalogItems.find((k) => k.id === id)

  if (!item) {
    // If not found in existing items, fetch from store
    await katalogStore.fetchKatalog()
    item = katalogStore.katalogItems.find((k) => k.id === id)
  }

  if (item) {
    katalog.value = item
    // Save to cache for future use
    saveCatalogToCache(item)
  }

  // Start autoplay
  startAutoplay()

  // Set up real-time reviews listener
  const productId = route.params.id
  if (productId) {
    loadReviewsFromFirestore(productId)
  }
})

// Add cleanup on component unmount
onBeforeUnmount(() => {
  stopAutoplay()
  if (unsubscribe.value) {
    unsubscribe.value()
  }
})

// Carousel functionality
const currentIndex = ref(0)

const carouselStyle = computed(() => ({
  transform: `translateX(-${(currentIndex.value + 1) * 100}%)`,
  transition: 'transform 0.5s ease-in-out',
}))

const prevSlide = () => {
  // stopAutoplay()
  if (currentIndex.value === 0) {
    currentIndex.value = katalog.value.images.length - 1
  } else {
    currentIndex.value--
  }
}

const nextSlide = () => {
  // stopAutoplay()
  if (currentIndex.value === katalog.value.images.length - 1) {
    currentIndex.value = 0
  } else {
    currentIndex.value++
  }
}

const goToSlide = (index) => {
  // stopAutoplay()
  currentIndex.value = index
}

// Add autoplay functionality
let autoplayInterval
const AUTOPLAY_DELAY = 3000 // 3 seconds

const startAutoplay = () => {
  // Clear any existing interval first
  stopAutoplay()
  autoplayInterval = setInterval(() => {
    nextSlide()
  }, AUTOPLAY_DELAY)
}

const stopAutoplay = () => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
    autoplayInterval = null
  }
}

// Handle mouse move for zoom effect
const handleMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  e.currentTarget.style.setProperty('--x', `${x}%`)
  e.currentTarget.style.setProperty('--y', `${y}%`)
}

// Reviews functionality
const reviews = ref([])
const selectedFilter = ref('all')
const displayLimit = ref(3)
const reviewsLoading = ref(false)
const unsubscribe = ref(null)

// Update the loadReviewsFromFirestore function
const loadReviewsFromFirestore = (productId) => {
  reviewsLoading.value = true

  const reviewsRef = collection(db, 'reviews')
  const q = query(reviewsRef, where('productId', '==', productId), orderBy('createdAt', 'desc'))

  unsubscribe.value = onSnapshot(
    q,
    async (snapshot) => {
      const reviewsPromises = snapshot.docs.map(async (doc) => {
        const reviewData = doc.data()
        const userData = await getUserData(reviewData.userId)

        return {
          id: doc.id,
          name: userData?.name || 'Anonymous',
          avatarUrl: userData?.profilePhoto || defaultAvatar, // Update this line
          date: reviewData.createdAt?.toDate() || new Date(),
          rating: reviewData.rating,
          content: reviewData.review,
          images: reviewData.images || [],
          helpfulCount: reviewData.helpfulCount || 0,
          userFoundHelpful: false,
        }
      })

      reviews.value = await Promise.all(reviewsPromises)
      reviewsLoading.value = false
    },
    (error) => {
      console.error('Error fetching reviews:', error)
      reviewsLoading.value = false
    },
  )
}

// Add helper function to get user data
const getUserData = async (userId) => {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('uid', '==', userId))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data()
    }
    return null
  } catch (error) {
    console.error('Error fetching user data:', error)
    return null
  }
}

// Filter reviews based on selected filter
const filteredReviews = computed(() => {
  let result = [...reviews.value]

  switch (selectedFilter.value) {
    case 'withPhotos':
      result = result.filter((r) => r.images && r.images.length > 0)
      break
    case '5star':
      result = result.filter((r) => r.rating === 5)
      break
    case '4star':
      result = result.filter((r) => r.rating === 4)
      break
    case '3below':
      result = result.filter((r) => r.rating <= 3)
      break
    // default is 'all', no filtering needed
  }

  return result
})

// Calculate average rating
const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((acc, review) => acc + review.rating, 0)
  return (sum / reviews.value.length).toFixed(1)
})

// Load more reviews
const loadMoreReviews = () => {
  displayLimit.value += 3
}

// Set filter
const setFilter = (filter) => {
  selectedFilter.value = filter
  displayLimit.value = 3 // Reset display limit when changing filters
}

// Get percentage for star rating bar
const getPercentageForStar = (star) => {
  if (reviews.value.length === 0) return 0
  const count = reviews.value.filter((r) => r.rating === star).length
  return Math.round((count / reviews.value.length) * 100)
}

// Get count for star rating
const getCountForStar = (star) => {
  return reviews.value.filter((r) => r.rating === star).length
}

// Toggle helpful button
const toggleHelpful = async (index) => {
  const review = filteredReviews.value[index]
  if (!review || !review.id) return

  try {
    const reviewRef = doc(db, 'reviews', review.id)
    await updateDoc(reviewRef, {
      helpfulCount: review.userFoundHelpful ? increment(-1) : increment(1),
    })

    // Toggle local state
    review.userFoundHelpful = !review.userFoundHelpful
  } catch (error) {
    console.error('Error updating helpful count:', error)
    toast.error('Failed to update helpful count')
  }
}

// Format date to Indonesian format
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return date.toLocaleDateString('id-ID', options)
}

// Time ago formatter
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000)

  let interval = Math.floor(seconds / 31536000)
  if (interval >= 1) {
    return `${interval} tahun yang lalu`
  }

  interval = Math.floor(seconds / 2592000)
  if (interval >= 1) {
    return `${interval} bulan yang lalu`
  }

  interval = Math.floor(seconds / 86400)
  if (interval >= 1) {
    return `${interval} hari yang lalu`
  }

  interval = Math.floor(seconds / 3600)
  if (interval >= 1) {
    return `${interval} jam yang lalu`
  }

  interval = Math.floor(seconds / 60)
  if (interval >= 1) {
    return `${interval} menit yang lalu`
  }

  return 'Baru saja'
}

// Image modal functionality
const showImageModal = ref(false)
const modalImages = ref([])
const currentModalImageIndex = ref(0)

const openImageModal = (images, index) => {
  modalImages.value = images
  currentModalImageIndex.value = index
  showImageModal.value = true
  document.body.style.overflow = 'hidden' // Prevent background scrolling
}

const closeImageModal = () => {
  showImageModal.value = false
  document.body.style.overflow = '' // Restore background scrolling
}

const prevModalImage = () => {
  currentModalImageIndex.value =
    (currentModalImageIndex.value - 1 + modalImages.value.length) % modalImages.value.length
}

const nextModalImage = () => {
  currentModalImageIndex.value = (currentModalImageIndex.value + 1) % modalImages.value.length
}

const goToModalImage = (index) => {
  currentModalImageIndex.value = index
}
</script>

<style scoped>
.detail-view {
  display: flex;
  height: 100vh;
  background-color: #d9d9d9;
  font-family: 'Montserrat', sans-serif;
  overflow: hidden;
}

.gambar-detail {
  width: 50%;
  padding: 60px 100px; /* Reduced top padding from 100px to 60px */
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.back {
  position: absolute;
  top: 1.5rem; /* Slightly adjusted for better spacing */
  left: 1rem;
  text-decoration: none;
}

.back i {
  color: #e8ba38;
  font-size: 1.5rem;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 100%;
  align-self: center; /* Center the content wrapper itself */
}

.gambar-detail h1 {
  font-size: 2.4rem;
  margin-bottom: 1rem; /* Reduced from 1.5rem to 1rem */
  margin-left: 1.6rem; /* Reduced from 1.5rem to 1rem */
  align-self: flex-start;
  width: 100%;
}

.gambar-detail img {
  width: 100%;
  max-width: 500px;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
}
.gambar-detail i {
  font-size: 3rem;
}

.hub {
  background-color: #e8ba38;
  color: white;
  padding: 0.6rem 1.8rem;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.toko-section {
  width: 100%;
  text-align: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
}

.toko-section h2 {
  margin-bottom: 0.8rem;
  font-size: 1.5rem;
  float: left;
  text-align: left;
  width: 100%;
}

.sosmed-link {
  display: flex;
  gap: 1rem;
  width: 100%;
  float: left;
  text-align: left;
}

.sosmed {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: black;
  font-size: 0.85rem;
}

.sosmed i {
  background-color: #e8ba38;
  color: white;
  padding: 0.5rem;
  border-radius: 50%;
  margin-right: 0.4rem;
  font-size: 1.5rem;
}

.detail-keterangan {
  width: 50%;
  background-color: white;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 0;
  height: 100%;
  box-shadow: #0000 9px 9px 10px;
  overflow-y: auto; /* Allow scrolling for longer content */
}

.detail-keterangan section {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.detail-keterangan h2 {
  background-color: #02163b;
  color: white;
  padding: 0.6rem;
  text-align: center;
  font-size: 1.8rem;
  margin: 0;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.info-content p {
  font-size: 1rem;
  padding: 0.2rem 0;
  margin: 0;
}

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

* {
  box-sizing: border-box;
}

/* Carousel styles */
.carousel-container {
  position: relative;
  max-width: 500px;
  height: 360px;
  overflow: hidden;
  border-radius: 8px;
  --x: center;
  --y: center;
}

.carousel-container:hover .carousel-btn {
  opacity: 1;
}

.carousel-wrapper {
  display: flex;
  height: 100%;
  transition: transform 0.5s ease-in-out;
}

.carousel-image {
  width: 500px;
  height: 360px;
  flex-shrink: 0;
  object-fit: cover;
  transition: transform 0.3s ease-out;
  transform-origin: var(--x, center) var(--y, center);
}

.carousel-container:hover .carousel-image {
  cursor: zoom-in;
}

/* This targets only the currently visible image */
.carousel-container:hover .carousel-image:hover {
  transform: scale(2);
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 1;
  opacity: 0;
  transition: all 0.3s ease;
}

.carousel-btn:hover {
  background-color: rgba(255, 255, 255, 1);
  transform: translateY(-50%) scale(1.1);
}

.carousel-btn.prev {
  left: 16px;
}

.carousel-btn.next {
  right: 16px;
}

.carousel-btn i {
  font-size: 1.2rem;
}

.carousel-indicators {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
}

.indicator {
  width: 8px;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background-color: #e8ba38;
  transform: scale(1.2);
}

/* Reviews section styles */
.review-section {
  margin-top: 1rem;
}

.review-summary {
  display: flex;
  align-items: center;
  background-color: #f8f8f8;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.rating-average {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-right: 1.5rem;
  border-right: 1px solid #ddd;
  min-width: 120px;
}

.average-score {
  font-size: 2.5rem;
  font-weight: bold;
  color: #02163b;
}

.star-display {
  margin: 0.3rem 0;
}

.total-reviews {
  font-size: 0.8rem;
  color: #666;
}

/* Continue styling for rating bars */
.rating-bars {
  flex: 1;
  margin-left: 1.5rem;
  width: 100%;
}

.rating-bar-container {
  display: flex;
  align-items: center;
  margin-bottom: 0.4rem;
}

.rating-label {
  width: 15px;
  margin-right: 0.5rem;
  font-size: 0.85rem;
}

.rating-bar-wrapper {
  flex: 1;
  height: 8px;
  background-color: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.rating-bar {
  height: 100%;
  background-color: #e8ba38;
  border-radius: 4px;
}

.rating-count {
  margin-left: 0.5rem;
  font-size: 0.85rem;
  color: #666;
  width: 25px;
  text-align: right;
}

/* Review filters */
.review-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  margin: 1rem 0;
}

.filter-label {
  font-weight: bold;
  margin-right: 0.3rem;
}

.filter-chip {
  padding: 0.4rem 0.8rem;
  background-color: #f1f1f1;
  border-radius: 20px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-chip:hover {
  background-color: #e0e0e0;
}

.filter-chip.active {
  background-color: #02163b;
  color: white;
}

/* Reviews container */
.reviews-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-card {
  background-color: #f8f8f8;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.review-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.8rem;
}

.reviewer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 0.8rem;
}

.reviewer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reviewer-info {
  flex: 1;
}

.reviewer-name {
  font-weight: bold;
  font-size: 0.9rem;
}

.review-date {
  font-size: 0.8rem;
  color: #666;
}

.review-rating {
  font-size: 0.9rem;
}

.review-content {
  margin-bottom: 0.8rem;
  font-size: 0.9rem;
  line-height: 1.4;
}

.review-images {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 0.8rem;
}

.review-images img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.review-images img:hover {
  transform: scale(1.05);
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.6rem;
}

.helpful-btn {
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.3rem 0.8rem;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;
}

.helpful-btn:hover {
  background-color: #f1f1f1;
}

.helpful-btn.active {
  background-color: #e8ba38;
  color: white;
  border-color: #e8ba38;
}

.review-timestamp {
  font-size: 0.75rem;
  color: #888;
}

.load-more {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.load-more-btn {
  background-color: white;
  border: 1px solid #02163b;
  color: #02163b;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.load-more-btn:hover {
  background-color: #f1f1f1;
}

/* Image modal */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  max-width: 90%;
  max-height: 90%;
  position: relative;
  display: flex;
  flex-direction: column;
}

.modal-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-image-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-image-container img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.modal-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
}

.modal-nav:hover {
  background-color: rgba(255, 255, 255, 0.4);
}

.modal-nav.prev {
  left: -60px;
}

.modal-nav.next {
  right: -60px;
}

.modal-thumbnails {
  display: flex;
  justify-content: center;
  gap: 0.8rem;
  margin-top: 1rem;
}

.modal-thumbnail {
  width: 50px;
  height: 50px;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.2s;
}

.modal-thumbnail.active {
  border-color: #e8ba38;
  opacity: 1;
}

.modal-thumbnail:hover {
  opacity: 1;
}

.modal-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Responsive styles */
@media (max-width: 1200px) {
  .gambar-detail {
    padding: 40px 60px;
  }
}

@media (max-width: 992px) {
  .detail-view {
    flex-direction: column;
    height: auto;
    overflow-y: auto;
  }

  .gambar-detail,
  .detail-keterangan {
    width: 100%;
    height: auto;
  }

  .gambar-detail {
    padding: 40px;
  }

  .carousel-container {
    max-width: 100%;
    height: auto;
    aspect-ratio: 4/3;
  }

  .carousel-image {
    width: 100%;
    height: auto;
  }

  .review-summary {
    flex-direction: column;
    align-items: flex-start;
  }

  .rating-average {
    padding-right: 0;
    padding-bottom: 1rem;
    border-right: none;
    border-bottom: 1px solid #ddd;
    width: 100%;
    margin-bottom: 1rem;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .rating-bars {
    margin-left: 0;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .gambar-detail {
    padding: 30px 20px;
  }

  .gambar-detail h1 {
    font-size: 1.8rem;
  }

  .detail-keterangan h2 {
    font-size: 1.4rem;
  }

  .review-images img {
    width: 70px;
    height: 70px;
  }

  .modal-nav {
    width: 30px;
    height: 30px;
  }

  .modal-nav.prev {
    left: -40px;
  }

  .modal-nav.next {
    right: -40px;
  }
}

@media (max-width: 576px) {
  .gambar-detail h1 {
    font-size: 1.5rem;
  }

  .carousel-container {
    height: 280px;
  }

  .toko-section h2 {
    font-size: 1.2rem;
  }

  .sosmed-link {
    flex-direction: column;
    gap: 0.8rem;
  }

  .review-header {
    flex-wrap: wrap;
  }

  .review-rating {
    width: 100%;
    margin-top: 0.5rem;
  }

  .review-images img {
    width: 60px;
    height: 60px;
  }

  .modal-thumbnails {
    display: none;
  }

  .modal-nav.prev {
    left: 10px;
  }

  .modal-nav.next {
    right: 10px;
  }
}

.reviews-loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.no-reviews {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
}
</style>
