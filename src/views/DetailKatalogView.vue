<template>
  <div class="detail-view">
    <div class="gambar-detail">
      <router-link to="/" class="back">
        <i class="fas fa-arrow-left"></i>
      </router-link>

      <h1><b>{{ katalog?.nama || 'Produk Kami' }}</b></h1>

      <div v-if="katalog" class="content-wrapper">
        <!-- Replace single image with carousel -->
        <div class="carousel-container">
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
          <p>Ukuran : P {{ katalog.detail.ukuran.panjang }} x L {{ katalog.detail.ukuran.lebar }} x T {{ katalog.detail.ukuran.tinggi }} cm</p>
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useKatalogStore } from '@/stores/KatalogStore'

const route = useRoute()
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
  let item = katalogStore.katalogItems.find(k => k.id === id)

  if (!item) {
    // If not found in existing items, fetch from store
    await katalogStore.fetchKatalog()
    item = katalogStore.katalogItems.find(k => k.id === id)
  }

  if (item) {
    katalog.value = item
    // Save to cache for future use
    saveCatalogToCache(item)
  }

  // Start autoplay
  startAutoplay()
})

// Add cleanup on component unmount
onBeforeUnmount(() => {
  stopAutoplay()
})

// Carousel functionality
const currentIndex = ref(0)

const carouselStyle = computed(() => ({
  transform: `translateX(-${(currentIndex.value + 1) * 100}%)`,
  transition: 'transform 0.5s ease-in-out'
}))

const prevSlide = () => {
  stopAutoplay() // Stop on user interaction
  if (currentIndex.value === 0) {
    currentIndex.value = katalog.value.images.length - 1
  } else {
    currentIndex.value--
  }
  startAutoplay() // Restart autoplay
}

const nextSlide = () => {
  stopAutoplay() // Stop on user interaction
  if (currentIndex.value === katalog.value.images.length - 1) {
    currentIndex.value = 0
  } else {
    currentIndex.value++
  }
  startAutoplay() // Restart autoplay
}

const goToSlide = (index) => {
  stopAutoplay() // Stop on user interaction
  currentIndex.value = index
  startAutoplay() // Restart autoplay
}

// Add autoplay functionality
let autoplayInterval
const AUTOPLAY_DELAY = 5000 // 5 seconds

const startAutoplay = () => {
  autoplayInterval = setInterval(() => {
    nextSlide()
  }, AUTOPLAY_DELAY)
}

const stopAutoplay = () => {
  clearInterval(autoplayInterval)
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
  color: #E8BA38;
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
.gambar-detail i{
  font-size: 3rem;
}

.hub {
  background-color: #E8BA38;
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
  background-color: #E8BA38;
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
}

.detail-keterangan section {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.detail-keterangan h2 {
  background-color: #02163B;
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
  width: 100%;
  max-width: 500px; /* Changed from 500px */
  height: 360px; /* Changed from 460px */
  overflow: hidden;
  border-radius: 8px;
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
  width: 500px; /* Changed from 500px */
  height: 360px; /* Changed from 460px */
  flex-shrink: 0;
  object-fit: cover;
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
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
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
  background-color: #E8BA38;
  transform: scale(1.2);
}

/* Add responsive styles */
@media (max-width: 768px) {
  .carousel-container {
    max-width: 100%;
    height: auto;
    aspect-ratio: 270/200; /* Changed from 500/460 */
  }

  .carousel-image {
    width: 100%;
    height: 100%;
  }

  .carousel-btn {
    width: 32px;
    height: 32px;
  }

  .carousel-btn i {
    font-size: 1rem;
  }
}
</style>