<template>
  <!-- Loading component dengan z-index tinggi saat data masih di-load -->
  <LoadComponent v-if="isLoading" />

  <VoucherNotification />
  <NavigationBar :showLogout="isLoggedIn" @logout="handleLogout" class="navbar" />
  <header id="home" :class="{ 'header-at-top': isAtTop }">
    <HeroSwiper :sliderItems="sliderStore.sliderItems" />
  </header>
  <main>
    <section class="popular">
      <div class="product-card">
        <i class="fas fa-solid fa-trophy right"></i>
        <i class="fas fa-solid fa-trophy left"></i>
        <span class="straight"></span>
        <div class="popular-section-header">
          <h1>
            <b>PRODUK P<i class="fas fa-crown"></i>PULER</b>
          </h1>
        </div>
        <CardPopuler />
      </div>
    </section>
    <section class="katalog" id="catalog">
      <span class="box"></span>
      <span class="box-left"></span>
      <span class="dot"></span>
      <h1><b>KATALOG</b></h1>
      <span class="dot"></span>
      <div class="catalog-grid">
        <CardCatalog
          v-for="(katalog, index) in visibleKatalog"
          :key="katalog.id"
          :item="katalog"
          :index="index"
        />
      </div>
      <div class="load-more-container" v-if="hasMoreItems">
        <button @click="loadMore" class="load-more-btn">See More</button>
      </div>
    </section>
    <section class="blog" id="articel">
      <div class="b-log">
        <span class="line"></span>
        <h1><b>ARTIKEL</b></h1>
        <span class="line"></span>
      </div>
      <div class="blog-grid">
        <CardBlog v-for="blog in visibleBlogItems" :key="blog.id" :blog="blog" />
      </div>
      <div class="load-more-container" v-if="hasMoreBlogItems">
        <button @click="loadMoreBlogs" class="load-more-btn">See More</button>
      </div>
    </section>
    <section class="partner">
      <div class="b-log">
        <span class="line"></span>
        <h1><b>CLIENT</b></h1>
        <span class="line"></span>
      </div>
      <CardMitra></CardMitra>
    </section>
    <section class="ulasan">
      <div class="b-log">
        <span class="line"></span>
        <h1><b>ULASAN</b></h1>
        <span class="line"></span>
      </div>
      <CardUlasan></CardUlasan>
    </section>
  </main>
  <FooterComponent />
</template>

<script setup>
import { computed, onMounted, ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useKatalogStore } from '@/stores/KatalogStore'
import { usePartnerStore } from '@/stores/PartnerStore'
import { useSliderStore } from '@/stores/SliderStore'
import { useAuthStore } from '@/stores/AuthStore'
import { useVoucherStore } from '@/stores/VoucherStore'
import { useBlogStore } from '@/stores/BlogStore'
import LoadComponent from '@/components/LoadComponent.vue' // Import LoadComponent

import CardCatalog from '@/components/CardCatalog.vue'
import CardBlog from '@/components/CardBlog.vue'
import NavigationBar from '@/components/NavigationBar.vue'
import VoucherNotification from '@/components/VoucherNotification.vue'
import FooterComponent from '@/components/FooterComponent.vue'
import CardUlasan from '@/components/CardUlasan.vue'
import CardMitra from '@/components/CardMitra.vue'
import HeroSwiper from '@/components/HeroSwiper.vue'
import CardPopuler from '@/components/CardPopuler.vue'

const authStore = useAuthStore()
const router = useRouter()
const isLoggedIn = computed(() => authStore.isLoggedIn)
const katalogStore = useKatalogStore()
const partnerStore = usePartnerStore()
const sliderStore = useSliderStore()
const voucherStore = useVoucherStore()
const blogStore = useBlogStore()

// Add loading state to track data loading
const isLoading = ref(true)

// Array untuk endless carousel penghargaan (minimal 8 item)
const achievementItems = ref([])
const carouselTrack = ref(null)
let animationId = null
let position = 0
const speed = 0.5 // Kecepatan scroll

// Modifikasi bagian script untuk carousel
const animateCarousel = () => {
  if (!carouselTrack.value) return

  position -= speed

  // Get first item width
  const firstItemWidth = carouselTrack.value.querySelector('.carousel-item')?.offsetWidth || 0

  if (firstItemWidth > 0) {
    // Check if first item has moved completely out of view
    if (-position >= firstItemWidth) {
      // Move first item to end
      const firstItem = carouselTrack.value.firstElementChild
      carouselTrack.value.appendChild(firstItem.cloneNode(true))
      carouselTrack.value.removeChild(firstItem)

      // Reset position by first item width to create seamless effect
      position += firstItemWidth
    }
  }

  carouselTrack.value.style.transform = `translateX(${position}px)`
  animationId = requestAnimationFrame(animateCarousel)
}

const handleLogout = async () => {
  try {
    await authStore.logoutUser(router)
  } catch (error) {
    console.error('Logout error:', error)
  }
}

const hasActiveVouchers = computed(() => {
  // Filter active, non-expired vouchers with remaining uses
  const activeVouchers = voucherStore.voucherItems.filter((voucher) => {
    const now = new Date()
    const isNotExpired = new Date(voucher.validUntil) > now
    const hasRemainingUses = voucher.currentUses < voucher.maxUses
    return voucher.isActive && isNotExpired && hasRemainingUses
  })

  return activeVouchers.length > 0
})

const isAtTop = computed(() => {
  return window.scrollY === 0 && hasActiveVouchers.value
})

const checkScrollPosition = () => {
  // We don't need to set isAtTop directly as it's now a computed property
  // Just trigger a reactivity update
  window.scrollY // reference to trigger computed property update
}

onMounted(async () => {
  isLoading.value = true

  try {
    // Optimasi: load semua data secara paralel dengan Promise.all
    // untuk mempercepat proses loading tanpa menunggu satu-persatu
    await Promise.all([
      katalogStore.fetchKatalog(),
      partnerStore.fetchPartners(),
      sliderStore.fetchSliders(),
      voucherStore.fetchVouchers(),
      blogStore.fetchBlogs(),
    ])
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    // Sembunyikan loading setelah data dimuat
    isLoading.value = false
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        checkScrollPosition()
        ticking = false
      })
      ticking = true
    }
  })

  checkScrollPosition()

  // Membuat array achievements untuk endless carousel
  // Duplikasi item agar endless bahkan dengan sedikit data
  achievementItems.value = Array(12)
    .fill(null)
    .map((_, index) => ({ id: index }))

  // Mulai animasi carousel setelah DOM dirender sepenuhnya
  setTimeout(() => {
    animationId = requestAnimationFrame(animateCarousel)
  }, 500)
})

let ticking = false

// Bersihkan animation frame saat komponen diunmount
onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }

  window.removeEventListener('scroll', checkScrollPosition)
})

// Constants for pagination
const ITEMS_PER_PAGE = 6
const BLOG_ITEMS_PER_PAGE = 4 // Show 4 blog items initially
const displayCount = ref(ITEMS_PER_PAGE)
const blogDisplayCount = ref(BLOG_ITEMS_PER_PAGE) // New ref for blog pagination

// For catalog items
const visibleKatalog = computed(() => {
  return katalogStore.katalogItems.slice(0, displayCount.value)
})

const loadMore = () => {
  displayCount.value += ITEMS_PER_PAGE
}

const hasMoreItems = computed(() => {
  return displayCount.value < katalogStore.katalogItems.length
})

// For blog items - add these new functions
const visibleBlogItems = computed(() => {
  return blogStore.blogItems.slice(0, blogDisplayCount.value)
})

const loadMoreBlogs = () => {
  blogDisplayCount.value += BLOG_ITEMS_PER_PAGE
}

const hasMoreBlogItems = computed(() => {
  return blogDisplayCount.value < blogStore.blogItems.length
})
</script>

<style scoped>
header {
  margin-top: 0;
  height: 100vh;
  position: relative;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  width: 100%;
  transition: transform 0.3s ease;
}

.header-at-top {
  transform: translateY(100px);
  /* Adjust this value to match your navbar height */
}

.navbar {
  position: fixed;
  top: 40px;
  /* Account for VoucherNotification */
  left: 0;
  width: 100%;
  z-index: 100;
}

/* STYLE UNTUK CAROUSEL PENGHARGAAN */
.carousel-container {
  width: 91%;
  overflow: hidden;
  position: relative;
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 5%, #000 95%, transparent 100%);
  mask-image: linear-gradient(90deg, transparent 0%, #000 5%, #000 95%, transparent 100%);
}

.carousel-track {
  display: flex;
  transition: none;
  /* Remove transition untuk animasi yang lebih smooth */
  will-change: transform;
  /* Optimize performance */
}

.carousel-item {
  flex: 0 0 25%;
  /* 4 items in view */
  padding: 0 25px;
  /* Increased padding from 15px to 25px */
  box-sizing: border-box;
  opacity: 1;
}

/* Optional: Add margin for extra separation */
.card {
  margin: 10px 0;
}

.foto-tentang-kami {
  width: 100%;
  height: 100%;
}

.popular {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  width: 100%;
  padding: 30px 0;
}

.popular .right {
  position: absolute;
  left: -25%;
  color: #ffd700;
  top: 10px;
  font-size: 35rem;
  z-index: -1;
  text-shadow: 0 10px 20px #ffd700;
}

.popular .left {
  position: absolute;
  right: -25%;
  color: #c0c0c0;
  top: 10px;
  font-size: 35rem;
  z-index: -1;
  text-shadow: 0 10px 20px #c0c0c0;
}

.product-card {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  position: relative;
}

.popular-section-header {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
}

.product-card h1 {
  font-size: 4rem;
  text-align: center;
  color: black;
}

.product-card h1 i {
  color: #e8ba38;
}

.product-card .straight {
  width: 90%;
  height: 150px;
  top: 50%;
  left: 0;
  background-color: #02163b;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  position: absolute;
}

/* Mobile scroll indicator */
.scroll-indicator {
  display: none;
  align-items: center;
  gap: 5px;
  background-color: rgba(232, 186, 56, 0.12);
  padding: 6px 12px;
  border-radius: 20px;
  position: absolute;
  right: 20px;
  font-size: 14px;
  color: #02163b;
}

.scroll-indicator i {
  font-size: 12px;
  color: #e8ba38;
}

.katalog {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  padding: 100px;
  position: relative;
  /* font-family: 'Times New Roman', Times, serif; */
}

.katalog h1 {
  font-size: 4rem;
  width: 33.3%;
  text-align: center;
}

.katalog .box {
  position: absolute;
  left: -70px;
  height: 50%;
  width: 100px;
  z-index: -1;
  bottom: 100px;
  background-color: #ffbb00;
}

.katalog .box-left {
  position: absolute;
  right: -70px;
  height: 50%;
  width: 100px;
  z-index: -1;
  top: 100px;
  background-color: #02163b;
}

.katalog .dot {
  width: 30%;
  border: 1px solid #e8ba38;
}

/* CATALOG GRID - UPDATED FOR BETTER MOBILE EXPERIENCE */
.catalog-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
  padding: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  justify-items: center;
}

/* Tambahkan style baru untuk card terakhir ketika jumlah item tidak habis dibagi 3 */
.catalog-grid > *:last-child:nth-child(3n - 2) {
  grid-column: 2;
}

/* Adjust the blog section spacing */
.blog {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  padding: 70px 100px 100px;
  /* Reduced top padding from 100px to 70px */
  margin-top: -150px;
  /* Add negative margin to bring it closer to the catalog section */
}

.blog h1 {
  font-size: 4rem;
  width: 100%;
  text-align: center;
  color: black;
}

.line {
  border: 1px solid #e8ba38;
  width: 50%;
}

.b-log {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
}

.partner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  margin-top: -150px;
  padding: 100px;
}

.partner h1 {
  font-size: 4rem;
  width: 100%;
  text-align: center;
  color: black;
}

.ulasan {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  padding: 100px;
  margin-top: -150px;
  /* font-family: 'Times New Roman', Times, serif; */
}

.ulasan h1 {
  text-align: center;
  width: 100%;
  font-size: 4rem;
  color: black;
}

/* Add these new styles */
.load-more-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.load-more-btn {
  padding: 12px 32px;
  font-size: 1rem;
  font-weight: 600;
  /* Switch colors - make default state use dark blue */
  border: 2px solid #02163b;
  color: #02163b;
  background-color: transparent;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-more-btn:hover {
  /* Switch colors - make hover state use gold */
  background-color: #e8ba38;
  color: white;
  border-color: #e8ba38;
}

/* Mobile-only elements */
.mobile-only {
  display: none;
}

/* General responsive adjustments */
@media (max-width: 1200px) {
  .katalog h1,
  .blog h1,
  .partner h1,
  .ulasan h1 {
    font-size: 3rem;
  }

  .katalog,
  .blog,
  .partner,
  .ulasan {
    padding: 60px 40px;
  }
}

@media (max-width: 992px) {
  .catalog-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    justify-items: center;
    justify-content: center;
  }

  .katalog h1,
  .blog h1,
  .partner h1,
  .ulasan h1 {
    font-size: 2.5rem;
    width: 100%;
  }

  header {
    height: 90vh;
  }
}

/* UPDATED MOBILE STYLES FOR CATALOG SECTION */
@media (max-width: 768px) {
  .popular {
    padding: 15px 0;
  }

  .product-card h1 {
    font-size: 2.2rem;
  }

  /* Show scroll indicator on mobile */
  .mobile-only {
    display: flex;
  }

  .popular-section-header {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 0 20px;
    margin-bottom: 10px;
  }

  .katalog,
  .blog,
  .partner,
  .ulasan {
    padding: 40px 20px; /* Increased padding for better spacing */
    margin-top: 1rem;
  }

  .katalog h1 {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
  }

  .box,
  .box-left {
    display: none;
  }

  /* Improved catalog grid for mobile - 2 cards per row */
  .catalog-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px; /* Reduced gap for tighter layout on mobile */
    padding: 10px;
    width: calc(100% - 20px);
    margin: 0 auto;
  }

  /* Ensure catalog cards look good on mobile */
  .catalog-grid :deep(.card-catalog) {
    width: 100%; /* Make cards take full width of their grid cell */
    margin-bottom: 0; /* Remove any bottom margin that might be set */
  }

  /* Remove special positioning for last item on mobile */
  .catalog-grid > *:last-child:nth-child(3n - 2) {
    grid-column: auto;
  }

  .line {
    display: none;
  }

  .dot {
    display: none;
  }

  .carousel-container {
    width: 100%;
  }

  .right,
  .left {
    display: none;
  }

  .load-more-container {
    width: 100%;
    margin-top: 1.5rem;
  }

  .product-card .straight {
    height: 80px; /* Reduced height for mobile */
  }

  /* For the popular section */
  .popular {
    overflow: hidden;
    position: relative;
  }

  /* Add fade gradient for horizontal scroll indication */
  .popular:after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: 40px;
    background: linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.8));
    pointer-events: none;
    z-index: 2;
  }

  .popular .product-card :deep(.popular-cards-container) {
    padding-left: 20px; /* Add left padding to the container */
  }

  /* If the above doesn't work, you might need to target individual cards */
  .popular .product-card :deep(.popular-card) {
    margin-left: 4px; /* Add margin to individual cards */
  }

  /* For the scrollable container if it exists */
  .popular .product-card :deep(.scrollable-container) {
    padding-left: 20px;
    padding-right: 10px;
  }
}

@media (max-width: 576px) {
  /* Keep 2 cards per row even on smaller phones */
  .catalog-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px; /* Even smaller gap for very small screens */
  }

  .katalog h1,
  .blog h1,
  .partner h1,
  .ulasan h1 {
    font-size: 2rem;
  }

  .load-more-btn {
    padding: 10px 24px;
    font-size: 0.9rem;
  }

  header {
    height: 70vh;
  }

  .product-card h1 {
    font-size: 1.8rem;
  }

  /* Add breathing room at the bottom of the last row */
  .catalog-grid > *:nth-last-child(-n + 2) {
    margin-bottom: 10px;
  }
}

/* Make heights relative instead of fixed */
header {
  height: 100vh;
}

/* Make font sizes more responsive */
.katalog h1,
.blog h1,
.partner h1,
.ulasan h1,
.product-card h1 {
  font-size: clamp(2rem, 5vw, 4rem);
}

/* Improve carousel responsiveness */
.carousel-container {
  overflow-x: hidden;
}

/* More flexible grid for wider screens */
@media (min-width: 1400px) {
  .catalog-grid {
    grid-template-columns: repeat(4, 1fr);
    max-width: 1400px;
  }
}

/* Blog grid layout */
.blog-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Make sure all cards maintain consistent height */
.blog-grid > * {
  min-height: 150px;
}

/* Responsive adjustments for blog grid */
@media (max-width: 768px) {
  .blog-grid {
    grid-template-columns: repeat(2, 1fr); /* Keep 2 columns on mobile */
    gap: 12px; /* Smaller gap for mobile */
    justify-content: center;
    width: 95%; /* Slightly smaller width to avoid overflow */
  }

  /* Target the CardBlog component to make it mini */
  .blog-grid :deep(.card) {
    padding: 8px;
    min-height: auto;
  }

  .blog-grid :deep(.card img) {
    width: 100%;
    height: 120px;
    object-fit: cover;
  }

  .blog-grid :deep(.keterangan) {
    padding: 8px 0;
  }

  .blog-grid :deep(.keterangan h1) {
    font-size: 0.9rem;
    margin-bottom: 5px;
    -webkit-line-clamp: 2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    height: 40px;
  }

  .blog-grid :deep(.keterangan p) {
    font-size: 0.8rem;
    margin-bottom: 5px;
    line-height: 1.2;
    -webkit-line-clamp: 2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .blog-grid :deep(.read-more-btn) {
    padding: 6px 10px;
    font-size: 0.7rem;
  }

  .blog-grid :deep(.creation-date) {
    font-size: 0.7rem;
  }
}

/* Smaller screens - make cards even more compact */
@media (max-width: 480px) {
  .blog-grid {
    width: 100%;
    padding: 10px;
    gap: 10px;
  }

  .blog-grid :deep(.card img) {
    height: 90px;
  }
}

/* Ensure LoadComponent appears on top of everything */
:deep(.loading-overlay) {
  z-index: 9999 !important; /* Nilai z-index tinggi untuk memastikan tampil di atas semua elemen */
  position: fixed !important; /* Fixed position untuk menutupi seluruh viewport */
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important; /* Full viewport width */
  height: 100vh !important; /* Full viewport height */
  background-color: rgba(255, 255, 255, 0.95) !important; /* Latar belakang hampir solid */
}

/* Also update the spinner to be more prominent */
:deep(.spinner) {
  width: 60px !important;
  height: 60px !important;
  border-width: 5px !important;
}

:deep(.loading-text) {
  font-size: 1.4rem !important;
  font-weight: 600 !important;
}
</style>
