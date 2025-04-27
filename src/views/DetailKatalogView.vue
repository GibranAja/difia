<template>
  <div class="detail-container">
    <!-- Include your existing navbar component here -->
    <VoucherNotification />
    <Navbar />

    <div class="content-wrapper" :class="{ 'has-voucher': hasActiveVouchers }">
      <!-- Breadcrumbs -->
      <div class="breadcrumbs">
        <router-link to="/">Beranda</router-link> &gt; <router-link to="/">Produk</router-link> &gt;
        <span>{{ katalog?.nama || 'Detail Produk' }}</span>
      </div>

      <!-- Product Title and Rating -->
      <div class="product-header">
        <h1>{{ katalog?.nama || 'Detail Produk' }}</h1>
        <div class="rating-display">
          <div class="stars">
            <i v-for="i in 5" :key="i" class="fas fa-star" :style="{ color: '#e8ba38' }"></i>
          </div>
          <span class="review-count">({{ reviews.length }} ulasan)</span>
        </div>
        <div class="badges">
          <span class="bestseller-badge">BESTSELLER</span>
        </div>
      </div>

      <div class="product-main">
        <!-- Left Side: Product Images -->
        <div class="product-images">
          <ProductCarousel
            :images="katalog?.images || []"
            :alt-text="katalog?.nama || 'Produk Kami'"
            :autoplay="true"
          />
          <!-- Removed View 360° button as requested -->
        </div>

        <!-- Right Side: Product Details -->
        <div class="product-details">
          <div class="price-section">
            <h2>HARGA / PCS</h2>
            <div class="price-info">
              <div class="price-tier">
                <h3>Standard: Rp {{ formatPrice(katalog?.harga?.standar) }}</h3>
                <ul class="price-features">
                  <li>Bahan standar, hasil cetakan baik</li>
                  <li>Gratis kemasan basic</li>
                </ul>
              </div>

              <div class="price-tier">
                <h3>Premium: Rp {{ formatPrice(katalog?.harga?.premium) }}</h3>
                <ul class="price-features">
                  <li>Bahan premium, hasil cetakan tajam</li>
                  <li>Gratis kemasan exclusive</li>
                </ul>
              </div>

              <div class="price-tier">
                <h3>Budgeting: {{ katalog?.harga?.budgetting }}</h3>
                <ul class="price-features">
                  <li>Dapat disesuaikan dengan budget</li>
                  <li>Untuk minimal budget itu dari harga Satuan</li>
                </ul>
              </div>
            </div>

            <button class="order-now-btn" @click="navigateToCustom">PESAN SEKARANG</button>
          </div>
        </div>
      </div>

      <!-- SPECIFICATIONS SECTION -->
      <div class="specs-section">
        <h2>SPESIFIKASI PRODUK</h2>
        <div class="specs-content">
          <div class="specs-column">
            <h3>Dimensi & Material</h3>
            <ul>
              <li>
                Ukuran: P {{ katalog?.detail?.ukuran?.panjang || 0 }} x L
                {{ katalog?.detail?.ukuran?.lebar || 0 }} x T
                {{ katalog?.detail?.ukuran?.tinggi || 0 }} cm
              </li>
              <li>Bahan Luar: {{ katalog?.detail?.bahanLuar || '-' }}</li>
              <li>Bahan Dalam: {{ katalog?.detail?.bahanDalam || '-' }}</li>
              <li>Berat: {{ katalog?.detail?.berat + ' Gram' || '0 gram' }}</li>
            </ul>
          </div>
          <div class="specs-column">
            <h3>Aksesoris & Tampilan</h3>
            <ul>
              <li>Aksesoris: {{ katalog?.detail?.aksesoris || '-' }}</li>
              <li>Warna: {{ katalog?.detail?.warna || '-' }}</li>
              <li>Cetak Logo: Tersedia (Khusus untuk pembelian souvenir)</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- MATERIALS SECTION -->
      <div class="materials-section">
        <h2>DETAIL BAHAN & AKSESORIS</h2>
        <div class="materials-content">
          <!-- Bahan Luar -->
          <div class="material-type">
            <h3>Bahan Luar</h3>
            <div class="material-samples">
              <div class="material-sample">
                <div class="material-image">
                  <img
                    :src="
                      katalog?.detail?.bahanLuarImage || 'https://via.placeholder.com/120x90/755c48'
                    "
                    alt="Bahan Luar"
                  />
                </div>
                <span class="material-name">{{ katalog?.detail?.bahanLuar || 'Bahan Luar' }}</span>
              </div>
            </div>
          </div>

          <!-- Bahan Dalam -->
          <div class="material-type">
            <h3>Bahan Dalam</h3>
            <div class="material-samples">
              <div class="material-sample">
                <div class="material-image">
                  <img
                    :src="
                      katalog?.detail?.bahanDalamImage ||
                      'https://via.placeholder.com/120x90/d8c9b9'
                    "
                    alt="Bahan Dalam"
                  />
                </div>
                <span class="material-name">{{
                  katalog?.detail?.bahanDalam || 'Bahan Dalam'
                }}</span>
              </div>
            </div>
          </div>

          <!-- Aksesoris -->
          <div class="material-type">
            <h3>Aksesoris</h3>
            <div class="material-samples">
              <div class="material-sample">
                <div class="material-image accessory-image">
                  <!-- Placeholder for aksesoris -->
                </div>
                <span class="material-name">{{ katalog?.detail?.aksesoris || 'Aksesoris' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="material-info">
          <h3>Informasi Bahan:</h3>
          <ul>
            <li>
              {{ katalog?.detail?.bahanLuar || 'Bahan Luar' }}:
              {{ katalog?.detail?.bahanLuarDesc || 'Deskripsi tidak tersedia' }}
            </li>
            <li>
              {{ katalog?.detail?.bahanDalam || 'Bahan Dalam' }}:
              {{ katalog?.detail?.bahanDalamDesc || 'Deskripsi tidak tersedia' }}
            </li>
          </ul>
        </div>
      </div>

      <!-- PROCESSING TIME SECTION -->
      <div class="processing-section">
        <h2>WAKTU PENGERJAAN</h2>
        <div class="timeline">
          <div class="timeline-track"></div>
          <div class="timeline-points">
            <div class="timeline-point">
              <div class="point-label">50-100 pcs</div>
              <div class="point-marker"></div>
              <div class="point-time">{{ katalog?.waktuPengerjaan?.pcs50_100 || '-' }} hari</div>
            </div>
            <div class="timeline-point">
              <div class="point-label">200 pcs</div>
              <div class="point-marker"></div>
              <div class="point-time">{{ katalog?.waktuPengerjaan?.pcs200 || '-' }} hari</div>
            </div>
            <div class="timeline-point">
              <div class="point-label">300 pcs</div>
              <div class="point-marker"></div>
              <div class="point-time">{{ katalog?.waktuPengerjaan?.pcs300 || '-' }} hari</div>
            </div>
            <div class="timeline-point">
              <div class="point-label">>300 pcs</div>
              <div class="point-marker"></div>
              <div class="point-time">{{ katalog?.waktuPengerjaan?.pcsAbove300 || '-' }} hari</div>
            </div>
          </div>
        </div>
        <div class="timeline-notes">
          <p>
            * Express: {{ katalog?.waktuPengerjaan?.express || 'Additional 5% dari total hari' }}
          </p>
          <p>* Pengiriman dilakukan setelah proses produksi selesai</p>
        </div>
      </div>

      <!-- REVIEWS SECTION -->
      <div class="reviews-section">
        <h2>ULASAN PEMBELI</h2>
        <div class="reviews-summary">
          <div class="average-rating">
            <div class="average-score">{{ averageRating }}</div>
            <div class="total-reviews">{{ reviews.length }} ulasan</div>
          </div>
          <div class="rating-stars">
            <i v-for="i in 5" :key="`star-${i}`" class="fas fa-star"></i>
          </div>
          <div class="rating-bars">
            <div class="rating-bar-row">
              <span class="bar-label">5 ★</span>
              <div class="bar-background">
                <div class="bar-fill" :style="{ width: `${getPercentageForStar(5)}%` }"></div>
              </div>
              <span class="bar-count">{{ getCountForStar(5) }}</span>
            </div>
            <div class="rating-bar-row">
              <span class="bar-label">4 ★</span>
              <div class="bar-background">
                <div class="bar-fill" :style="{ width: `${getPercentageForStar(4)}%` }"></div>
              </div>
              <span class="bar-count">{{ getCountForStar(4) }}</span>
            </div>
            <div class="rating-bar-row">
              <span class="bar-label">≤ 3 ★</span>
              <div class="bar-background">
                <div
                  class="bar-fill"
                  :style="{
                    width: `${getPercentageForStar(3) + getPercentageForStar(2) + getPercentageForStar(1)}%`,
                  }"
                ></div>
              </div>
              <span class="bar-count">{{
                getCountForStar(3) + getCountForStar(2) + getCountForStar(1)
              }}</span>
            </div>
          </div>
        </div>

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

        <div v-if="reviewsLoading" class="reviews-loading">Loading reviews...</div>

        <div v-else class="review-cards">
          <div v-if="reviews.length === 0" class="no-reviews">Belum ada ulasan</div>

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
                  class="fas fa-star"
                  :style="{ color: i <= review.rating ? '#E8BA38' : '#d9d9d9' }"
                ></i>
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
                  :disabled="!authStore.isLoggedIn || review.userFoundHelpful"
                >
                  <i class="fas fa-thumbs-up"></i>
                  Membantu ({{ review.helpfulCount }})
                </button>
              </div>
              <div class="review-timestamp">{{ timeAgo(review.date) }}</div>
            </div>
          </div>

          <div v-if="hasMoreReviews" class="load-more">
            <button @click="loadMoreReviews" class="load-more-btn">
              Lihat Lebih Banyak Ulasan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Image modal (keeping existing implementation) -->
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

    <!-- Include your existing footer component here -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import { useToast } from 'vue-toastification'
import { useKatalogStore } from '@/stores/KatalogStore'
import { useVoucherStore } from '@/stores/VoucherStore' // Add this import
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
import ProductCarousel from '@/components/ProductCarousel.vue'
import Navbar from '@/components/NavigationBar.vue'
import Footer from '@/components/FooterComponent.vue'
import VoucherNotification from '@/components/VoucherNotification.vue' // Add this import

// Initialize router and route
const router = useRouter()
const route = useRoute()
const toast = useToast()
const katalogStore = useKatalogStore()
const authStore = useAuthStore()
const voucherStore = useVoucherStore() // Add this store
const katalog = ref(null)
const voucherListener = ref(null) // Add this for cleanup

// Compute if there are active vouchers
const hasActiveVouchers = computed(() => {
  return voucherStore.voucherItems.some((voucher) => {
    const now = new Date()
    const validUntilDate = new Date(voucher.validUntil)
    const isNotExpired = validUntilDate > now
    const hasRemainingUses = voucher.currentUses < voucher.maxUses
    return voucher.isActive && isNotExpired && hasRemainingUses
  })
})

// Set up real-time listener for vouchers
const setupVoucherListener = () => {
  try {
    const vouchersRef = collection(db, 'vouchers')
    const vouchersQuery = query(vouchersRef, where('isActive', '==', true))

    voucherListener.value = onSnapshot(
      vouchersQuery,
      (snapshot) => {
        const vouchers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        voucherStore.voucherItems = vouchers
      },
      (error) => {
        console.error('Error in voucher listener:', error)
      },
    )
  } catch (error) {
    console.error('Error setting up voucher listener:', error)
  }
}

// Function to format price with comma as thousand separator
const formatPrice = (price) => {
  return price ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '0'
}

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

// Load data on component mount
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

  // Set up real-time reviews listener
  const productId = route.params.id
  if (productId) {
    loadReviewsFromFirestore(productId)
  }

  // Fetch vouchers and setup real-time listener
  await voucherStore.fetchVouchers()
  setupVoucherListener()
})

// Clean up on component unmount
onBeforeUnmount(() => {
  if (unsubscribe.value) {
    unsubscribe.value()
  }
  if (voucherListener.value) {
    voucherListener.value()
  }
})

// Reviews functionality
const reviews = ref([])
const selectedFilter = ref('all')
const displayLimit = ref(3)
const reviewsLoading = ref(false)
const unsubscribe = ref(null)

// Check if there are more reviews to show
const hasMoreReviews = computed(() => {
  return filteredReviews.value.length > displayLimit.value
})

// Get filtered reviews with pagination
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

  return result.slice(0, displayLimit.value)
})

// Calculate average rating
const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((acc, review) => acc + review.rating, 0)
  return (sum / reviews.value.length).toFixed(1)
})

// Fetch reviews from Firestore
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
          avatarUrl: userData?.profilePhoto || defaultAvatar,
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

// Get user data from Firestore
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
  // Check if user is logged in
  if (!authStore.isLoggedIn) {
    toast.error('Silakan login untuk memberikan umpan balik')
    return
  }

  const review = filteredReviews.value[index]
  if (!review || !review.id) return

  // Check if user has already marked this review as helpful
  const helpfulKey = `helpful_${review.id}_${authStore.currentUser.id}`
  if (localStorage.getItem(helpfulKey)) {
    toast.info('Anda sudah memberikan umpan balik untuk ulasan ini')
    return
  }

  try {
    const reviewRef = doc(db, 'reviews', review.id)
    await updateDoc(reviewRef, {
      helpfulCount: increment(1),
    })

    // Save to localStorage to prevent multiple clicks
    localStorage.setItem(helpfulKey, 'true')

    // Update local state
    review.userFoundHelpful = true
    review.helpfulCount++

    toast.success('Terima kasih atas umpan balik Anda')
  } catch (error) {
    console.error('Error updating helpful count:', error)
    toast.error('Gagal memberikan umpan balik')
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

// Navigation method to custom page
const navigateToCustom = () => {
  if (katalog.value && katalog.value.id) {
    router.push(`/custom/${katalog.value.id}`)
  }
}
</script>

<style scoped>
/* Base styles */
.detail-container {
  font-family: 'Montserrat', sans-serif;
  color: #333;
  background-color: #f5f5f7;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  padding-top: 75px;
  transition: padding-top 0.3s ease;
}

.content-wrapper.has-voucher {
  padding-top: 115px; 
}

/* Breadcrumbs */
.breadcrumbs {
  font-size: 13px;
  color: #666;
  margin: 20px 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.breadcrumbs a {
  color: #666;
  text-decoration: none;
}

.breadcrumbs a:hover {
  text-decoration: underline;
}

.product-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 20px;
}

.product-header h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  margin-right: 20px;
}

.rating-display {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.stars {
  color: #ffc107;
  margin-right: 5px;
  display: flex;
}

.stars i {
  margin-right: 2px;
}

.review-count {
  color: #666;
  font-size: 14px;
}

.badges {
  display: flex;
  gap: 10px;
}

.bestseller-badge {
  background-color: #ffc107;
  color: #333;
  font-weight: bold;
  padding: 5px 15px;
  border-radius: 15px;
  font-size: 12px;
}

/* Product Main Content */
.product-main {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
  align-items: stretch;
}

.product-images {
  flex: 1;
  min-width: 300px;
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.product-details {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
}

.price-section {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.price-section h2 {
  background-color: #0a2551;
  color: white;
  margin: 0;
  padding: 15px 0;
  text-align: center;
  font-size: 22px;
}

.price-info {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.price-tier {
  margin-bottom: 24px;
}

.price-tier:last-child {
  margin-bottom: 0;
}

.price-tier h3 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.price-features {
  list-style-type: none;
  padding-left: 20px;
  margin: 0;
}

.price-features li {
  position: relative;
  padding-left: 15px;
  font-size: 14px;
  color: #555;
  margin-bottom: 8px;
}

.price-features li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #555;
}

.order-now-btn {
  display: block;
  width: calc(100% - 40px);
  margin: 0 20px 20px;
  padding: 14px 0;
  background-color: #ffc107;
  color: #333;
  border: none;
  border-radius: 20px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.order-now-btn:hover {
  background-color: #e0a800;
}

/* Specifications Section */
.specs-section {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.specs-section h2 {
  background-color: #0a2551;
  color: white;
  margin: 0;
  padding: 15px 0;
  text-align: center;
  font-size: 18px;
}

.specs-content {
  display: flex;
  flex-wrap: wrap;
  padding: 20px;
  justify-content: space-around;
}

.specs-column {
  flex: 1;
  min-width: 280px;
  padding: 0 15px;
  margin-bottom: 15px;
}

.specs-column h3 {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.specs-column ul {
  list-style-type: none;
  padding-left: 0;
}

.specs-column li {
  position: relative;
  padding-left: 15px;
  margin-bottom: 10px;
  font-size: 14px;
}

.specs-column li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #333;
}

/* Materials Section */
.materials-section {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.materials-section h2 {
  background-color: #0a2551;
  color: white;
  margin: 0;
  padding: 15px 0;
  text-align: center;
  font-size: 20px;
}

.materials-content {
  display: flex;
  flex-wrap: wrap;
  padding: 20px;
  gap: 20px;
  justify-content: center;
}

.material-type {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.material-type h3 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  text-align: center;
}

.material-samples {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.material-sample {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.material-image {
  width: 140px;
  height: 110px;
  border-radius: 5px;
  overflow: hidden;
  border: 2px solid #e0e0e0;
  margin-bottom: 12px;
}

.material-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.accessory-image {
  background-color: #e0e0e0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.material-name {
  font-size: 15px;
  text-align: center;
  font-weight: 500;
  color: #444;
}

.material-info {
  padding: 0 20px 20px;
  text-align: center;
}

.material-info h3 {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
}

.material-info ul {
  list-style-type: none;
  padding-left: 0;
  display: inline-block;
  text-align: left;
}

.material-info li {
  position: relative;
  padding-left: 15px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #555;
  line-height: 1.5;
}

.material-info li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #555;
}

/* Processing Time Section */
.processing-section {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.processing-section h2 {
  background-color: #0a2551;
  color: white;
  margin: 0;
  padding: 15px 0;
  text-align: center;
  font-size: 18px;
}

.timeline {
  position: relative;
  padding: 40px 20px;
}

.timeline-track {
  position: absolute;
  top: 50%;
  left: 10%;
  right: 10%;
  height: 4px;
  background-color: #e0e0e0;
}

.timeline-points {
  display: flex;
  justify-content: space-between;
  margin: 0 10%;
  position: relative;
}

.timeline-point {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
}

.point-label {
  text-align: center;
  font-size: 14px;
  margin-bottom: 15px;
}

.point-marker {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #ffc107;
  z-index: 1;
  margin-bottom: 15px;
}

.point-time {
  text-align: center;
  font-size: 14px;
}

.timeline-notes {
  padding: 0 20px 20px;
  display: flex;
  flex-direction: column;
  font-size: 12px;
  color: #666;
  align-items: center;
}

.timeline-notes p {
  margin: 5px 0;
}

/* Reviews Section */
.reviews-section {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.reviews-section h2 {
  background-color: #0a2551;
  color: white;
  margin: 0;
  padding: 15px 0;
  text-align: center;
  font-size: 18px;
}

.reviews-summary {
  display: flex;
  padding: 20px;
  align-items: center;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.average-rating {
  text-align: center;
  margin-right: 30px;
}

.average-score {
  font-size: 40px;
  font-weight: bold;
}

.total-reviews {
  font-size: 14px;
  color: #666;
}

.rating-stars {
  display: flex;
  margin-right: 40px;
}

.rating-stars i {
  color: #ffc107;
  font-size: 24px;
  margin-right: 5px;
}

.rating-bars {
  flex: 1;
  min-width: 250px;
}

.rating-bar-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.bar-label {
  width: 40px;
  font-size: 14px;
  color: #666;
}

.bar-background {
  flex: 1;
  height: 15px;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  margin: 0 10px;
}

.bar-fill {
  height: 100%;
  background-color: #ffc107;
  border-radius: 8px;
}

.bar-count {
  width: 30px;
  font-size: 12px;
  color: #666;
  text-align: right;
}

/* Review filters */
.review-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  margin: 1rem;
  justify-content: center;
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
  background-color: #0a2551;
  color: white;
}

/* Review cards */
.review-cards {
  padding: 20px;
}

.review-card {
  background-color: #f8f8f8;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.review-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.8rem;
  flex-wrap: wrap;
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
  min-width: 120px;
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
  display: flex;
  align-items: center;
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
  justify-content: center;
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
  flex-wrap: wrap;
  gap: 10px;
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

.helpful-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f1f1f1;
}

.helpful-btn.active:disabled {
  opacity: 1;
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
  border: 1px solid #0a2551;
  color: #0a2551;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.load-more-btn:hover {
  background-color: #f1f1f1;
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
  align-items: center;
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
  z-index: 10;
}

.modal-image-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
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
  z-index: 5;
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
  flex-wrap: wrap;
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

/* Responsive Design */
@media (max-width: 992px) {
  .timeline-points {
    margin: 0 5%;
  }

  .timeline-track {
    left: 5%;
    right: 5%;
  }
  
  .product-header {
    justify-content: center;
  }
  
  .product-header h1 {
    text-align: center;
    margin-bottom: 15px;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .reviews-summary {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .average-rating {
    margin-bottom: 20px;
    margin-right: 0;
  }

  .rating-stars {
    margin-bottom: 20px;
    margin-right: 0;
  }
  
  .rating-bars {
    width: 100%;
  }

  .timeline-point {
    width: 60px;
  }

  .point-label,
  .point-time {
    font-size: 12px;
  }

  .modal-nav.prev {
    left: 10px;
  }

  .modal-nav.next {
    right: 10px;
  }
  
  .material-type {
    width: 100%;
    margin-bottom: 20px;
  }
  
  .specs-column {
    text-align: center;
  }
  
  .specs-column ul {
    display: inline-block;
    text-align: left;
  }
}

@media (max-width: 576px) {
  .content-wrapper {
    padding: 15px;
    padding-top: 70px;
  }
  
  .content-wrapper.has-voucher {
    padding-top: 110px;
  }

  .product-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .product-header h1 {
    margin-bottom: 10px;
    margin-right: 0;
    font-size: 20px;
    text-align: center;
  }

  .rating-display {
    margin-bottom: 10px;
    margin-right: 0;
    justify-content: center;
  }
  
  .badges {
    justify-content: center;
  }

  .timeline {
    padding: 60px 10px 30px;
  }

  .timeline-points {
    margin: 0;
  }
  
  .timeline-track {
    left: 0;
    right: 0;
  }

  .timeline-point {
    width: auto;
  }

  .point-label {
    font-size: 10px;
    margin-bottom: 30px;
    white-space: nowrap;
  }

  .point-marker {
    width: 20px;
    height: 20px;
  }

  .point-time {
    font-size: 10px;
  }

  .timeline-notes {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .review-header {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .reviewer-info {
    text-align: center;
    margin-bottom: 10px;
  }

  .review-rating {
    width: 100%;
    margin-top: 0.5rem;
    justify-content: center;
  }

  .review-images img {
    width: 60px;
    height: 60px;
  }
  
  .review-content {
    text-align: center;
  }
  
  .review-footer {
    justify-content: center;
  }

  .modal-thumbnails {
    display: none;
  }
  
  .price-section h2,
  .specs-section h2,
  .materials-section h2,
  .processing-section h2,
  .reviews-section h2 {
    font-size: 16px;
    padding: 12px 0;
  }
  
  .price-tier h3 {
    font-size: 16px;
    text-align: center;
  }
  
  .price-features {
    display: inline-block;
    text-align: left;
  }
  
  .price-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .breadcrumbs {
    justify-content: center;
    text-align: center;
  }
  
  .product-images {
    padding: 10px;
  }
}

/* Extra small devices */
@media (max-width: 375px) {
  .content-wrapper {
    padding: 10px;
    padding-top: 65px;
  }
  
  .content-wrapper.has-voucher {
    padding-top: 105px;
  }
  
  .product-header h1 {
    font-size: 18px;
  }
  
  .stars i {
    font-size: 14px;
  }
  
  .review-count {
    font-size: 12px;
  }
  
  .bestseller-badge {
    font-size: 10px;
    padding: 4px 12px;
  }
  
  .order-now-btn {
    font-size: 14px;
    padding: 12px 0;
  }
  
  .timeline-point {
    transform: scale(0.8);
  }
  
  .review-images {
    gap: 5px;
  }
  
  .review-images img {
    width: 50px;
    height: 50px;
  }
  
  .filter-chip {
    padding: 0.3rem 0.6rem;
    font-size: 0.7rem;
  }
  
  .material-image {
    width: 120px;
    height: 90px;
  }
}
</style>