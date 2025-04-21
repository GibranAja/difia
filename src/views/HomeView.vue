<template>
  <VoucherNotification />
  <NavigationBar :showLogout="isLoggedIn" @logout="handleLogout" class="navbar"></NavigationBar>
  <header id="home" :class="{ 'header-at-top': isAtTop }">
    <HeroSwiper :sliderItems="sliderStore.sliderItems" />
  </header>
  <main>
    <!-- <TentangKamiSection /> -->
    <!-- <section class="top-seller">
      <div class="video-ad">
        <video src=""></video>
      </div>
      <div class="top-product">
        <CardCatalog></CardCatalog>
      </div>
    </section> -->
    <section class="katalog" id="catalog">
      <span class="box"></span>
      <span class="rounded"></span>
      <span class="rounded-left"></span>
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
import { useBlogStore } from '@/stores/BlogStore' // Add this import

import CardCatalog from '@/components/CardCatalog.vue'
import CardBlog from '@/components/CardBlog.vue'
import NavigationBar from '@/components/NavigationBar.vue'
import VoucherNotification from '@/components/VoucherNotification.vue'
import FooterComponent from '@/components/FooterComponent.vue'
import CardUlasan from '@/components/CardUlasan.vue'
import CardMitra from '@/components/CardMitra.vue'
import HeroSwiper from '@/components/HeroSwiper.vue'
// import TentangKamiSection from '@/components/TentangKamiSection.vue'

const authStore = useAuthStore()
const router = useRouter()
const isLoggedIn = computed(() => authStore.isLoggedIn)
const katalogStore = useKatalogStore()
const partnerStore = usePartnerStore()
const sliderStore = useSliderStore()
const voucherStore = useVoucherStore()
const blogStore = useBlogStore() // Add this line

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
  await katalogStore.fetchKatalog()
  await partnerStore.fetchPartners()
  await sliderStore.fetchSliders()
  await voucherStore.fetchVouchers()
  await blogStore.fetchBlogs() // Add this line to fetch blog data

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
  transform: translateY(100px); /* Adjust this value to match your navbar height */
}

.navbar {
  position: fixed;
  top: 40px; /* Account for VoucherNotification */
  left: 0;
  width: 100%;
  z-index: 100;
}

@media (max-width: 768px) {
  .header-at-top {
    transform: translateY(60px); /* Smaller offset for mobile */
  }
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
  transition: none; /* Remove transition untuk animasi yang lebih smooth */
  will-change: transform; /* Optimize performance */
}

.carousel-item {
  flex: 0 0 25%; /* 4 items in view */
  padding: 0 25px; /* Increased padding from 15px to 25px */
  box-sizing: border-box;
  opacity: 1;
}

/* Optional: Add margin for extra separation */
.card {
  margin: 10px 0;
}

/* Responsive settings */
@media (max-width: 1200px) {
  .carousel-item {
    flex: 0 0 33.33%;
  }
}

@media (max-width: 992px) {
  .carousel-item {
    flex: 0 0 50%;
  }
}

@media (max-width: 576px) {
  .carousel-item {
    flex: 0 0 100%;
  }
}
/* END OF CAROUSEL STYLES */

.foto-tentang-kami {
  width: 100%;
  height: 100%;
}

.top-seller {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  padding: 100px;
  position: relative;
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
  height: 150px;
  width: 150px;
  z-index: -1;
  bottom: 100px;
  rotate: 50deg;
  background-color: #ffbb00;
}
.katalog .rounded {
  position: absolute;
  right: 20px;
  height: 150px;
  width: 150px;
  z-index: -1;
  top: 100px;
  /* rotate: 50deg; */
  /* background-color: #ffbb00; */
  border-radius: 100px;
  border: 15px solid #ffbb00;
}
.katalog .rounded-left {
  position: absolute;
  left: 20px;
  height: 150px;
  width: 150px;
  z-index: -1;
  top: 100px;
  /* rotate: 50deg; */
  /* background-color: #ffbb00; */
  border-radius: 100px;
  border: 15px solid #ffbb00;
}

.katalog .dot {
  width: 30%;
  border: 1px solid #e8ba38;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
  padding: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  /* Tambahkan properti berikut */
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
  padding: 70px 100px 100px; /* Reduced top padding from 100px to 70px */
  margin-top: -150px; /* Add negative margin to bring it closer to the catalog section */
}

.blog h1 {
  font-size: 4rem;
  width: 100%;
  text-align: center;
  color: #02163b;
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
  color: #02163b;
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
  color: #02163b;
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

/* Add these responsive styles to your <style> section */

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

@media (max-width: 768px) {
  .katalog,
  .blog,
  .partner,
  .ulasan {
    padding: 40px 20px;
  }

  .catalog-grid {
    gap: 2rem;
  }

  .line {
    width: 30%;
  }

  .carousel-container {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .catalog-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
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
}

/* Make heights relative instead of fixed */
header {
  height: 100vh;
}

/* Make font sizes more responsive */
.katalog h1,
.blog h1,
.partner h1,
.ulasan h1 {
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .blog-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
