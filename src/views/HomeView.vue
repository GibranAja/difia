<template>
  <VoucherNotification />
  <header id="home">
    <HeroSwiper :sliderItems="sliderStore.sliderItems" />
  </header>
  <NavigationBar :showLogout="isLoggedIn" @logout="handleLogout"></NavigationBar>
  <main>
    <section class="tentang-kami" id="about">
      <div class="about">
        <div class="gambar">
          <span class="kotak"></span>
          <span class="bulet"></span>
          <img
            src="../assets/Logo Difia Haki.PNG"
            alt="foto-tentang-kami"
            class="foto-tentang-kami"
          />
        </div>
        <div class="text">
          <h1><b>TENTANG KAMI</b></h1>
          <br />
          <p>
            Difia sebuah brand lokal yang berdiri sejak 20 Agustus 2020.Pada saat Puncak pandemi
            covid-19,Perusahaan ini berbasis perorangan tergolong UMKM Home Industry di bidang
            fashion berbahan baku kulit sintetis diolah menjadi sendal dan tas terletak di kota
            Bogor
          </p>
        </div>
      </div>
      <AchievementSection />
    </section>
    <section class="katalog" id="catalog">
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
      <CardBlog></CardBlog>
    </section>
    <section class="partner">
      <div class="b-log">
        <span class="line"></span>
        <h1><b>Client</b></h1>
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

import CardCatalog from '@/components/CardCatalog.vue'
import CardBlog from '@/components/CardBlog.vue'
import NavigationBar from '@/components/NavigationBar.vue'
import VoucherNotification from '@/components/VoucherNotification.vue'
import FooterComponent from '@/components/FooterComponent.vue'
import CardUlasan from '@/components/CardUlasan.vue'
import CardMitra from '@/components/CardMitra.vue'
import HeroSwiper from '@/components/HeroSwiper.vue' // Import the new component
import AchievementSection from '@/components/AchievementSection.vue'

const authStore = useAuthStore()
const router = useRouter()
const isLoggedIn = computed(() => authStore.isLoggedIn)
const katalogStore = useKatalogStore()
const partnerStore = usePartnerStore()
const sliderStore = useSliderStore()

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

onMounted(async () => {
  await katalogStore.fetchKatalog()
  await partnerStore.fetchPartners()
  await sliderStore.fetchSliders()

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

// Bersihkan animation frame saat komponen diunmount
onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})

const ITEMS_PER_PAGE = 6
const displayCount = ref(ITEMS_PER_PAGE)

const visibleKatalog = computed(() => {
  return katalogStore.katalogItems.slice(0, displayCount.value)
})

const loadMore = () => {
  displayCount.value += ITEMS_PER_PAGE
}

const hasMoreItems = computed(() => {
  return displayCount.value < katalogStore.katalogItems.length
})
</script>

<style scoped>
header {
  margin-top: 0;
  height: 120vh;
  position: relative;
  margin-top: -64px; /* Adjust based on your navbar height */
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  position: relative;
  width: 100%;
}

.tentang-kami {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  row-gap: 50px;
  align-items: center;
  flex-wrap: wrap;
}

.about {
  padding: 150px;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  row-gap: 50px;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
}

.tentang-kami .gambar {
  width: 30%;
  height: auto;
  background-color: #d3d3d3;
  padding: 19px;
  text-align: center;
  position: relative;
}

.tentang-kami .text {
  width: 50%;
  text-align: justify;
}

.tentang-kami .gambar .kotak {
  position: absolute;
  width: 5px;
  left: -100px;
  top: -100px;
  background-color: black;
  border: 100px solid #e8ba38;
  z-index: -10;
}

.tentang-kami .swipper p {
  color: white;
  text-align: center;
  transform: rotate(-90deg);
  position: absolute;
  left: -30px;
  font-size: 1.5rem;
}

.tentang-kami .gambar .bulet {
  position: absolute;
  width: 5px;
  right: -100px;
  bottom: -100px;
  background-color: black;
  border: 100px solid #02163b;
  z-index: -10;
  border-radius: 100px;
}

.tentang-kami h1 {
  font-size: 3rem;
  line-height: 1rem;
  color: #02163b;
  text-align: center;
}

.swipper {
  width: 100%;
  position: relative;
  display: flex;
  flex-wrap: wrap;
  justify-content: right;
  align-items: center;
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

.tentang-kami .swipper .bg-scroll {
  position: absolute;
  width: 92%;
  height: 200px;
  background-color: #ffffff;
  z-index: -9;
  right: 0;
  border-radius: 10px 0 0 10px;
}

.tentang-kami .swipper .side-color {
  position: absolute;
  width: 200px;
  height: 300px;
  left: 0;
  background-color: #000000;
  box-shadow: 10px 0 150px black;
  border-radius: 0 20px 20px 0;
  z-index: -10;
}

.tentang-kami .swipper .ring {
  position: absolute;
  width: 450px;
  height: 450px;
  border: 1px solid #000000;
  border-radius: 50%;
  z-index: -10;
  left: -190px;
}

.foto-tentang-kami {
  width: 100%;
  height: 100%;
}

.katalog {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  padding: 100px;
  /* font-family: 'Times New Roman', Times, serif; */
}

.katalog h1 {
  font-size: 4rem;
  width: 33.3%;
  text-align: center;
}

.katalog .dot {
  width: 30%;
  border: 2px dotted #e8ba38;
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

.blog {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  padding: 100px;
  /* font-family: 'Times New Roman', Times, serif; */
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

/* Add this to ensure the navbar appears over other content */
.navigation-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
}

/* Add these responsive styles to your <style> section */

/* General responsive adjustments */
@media (max-width: 1200px) {
  .about {
    padding: 80px 50px;
  }

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
  .tentang-kami .gambar,
  .tentang-kami .text {
    width: 80%;
  }

  .catalog-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .about {
    padding: 60px 30px;
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

  .tentang-kami h1 {
    font-size: 2rem;
  }

  .tentang-kami .swipper p {
    position: static;
    transform: rotate(0); /* Reset rotation */
    margin-bottom: 1.5rem;
    color: #02163b;
    /* Add these new properties for proper centering */
    text-align: center;
    width: 100%;
    left: auto;
    font-weight: bold;
    font-size: 1.8rem;
    display: block;
  }

  /* This fixes the container layout to support centered text */
  .swipper {
    justify-content: center;
    flex-direction: column;
    padding: 0 15px;
  }

  .catalog-grid {
    gap: 2rem;
  }

  .line {
    width: 30%;
  }

  .tentang-kami .gambar .kotak,
  .tentang-kami .gambar .bulet {
    display: none;
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

  .about {
    padding: 40px 20px;
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

  .tentang-kami .swipper .bg-scroll,
  .tentang-kami .swipper .side-color,
  .tentang-kami .swipper .ring {
    display: none;
  }
}

/* Fix specific responsive issues */
/* .tentang-kami {
} */

.tentang-kami .text {
  padding: 20px;
}

/* Make heights relative instead of fixed */
header {
  height: 100vh;
}

/* Make font sizes more responsive */
.tentang-kami h1 {
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.2;
}

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
</style>
