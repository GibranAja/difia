<template>
  <div class="hero-section">
    <!-- Decorative elements -->
    <div class="geometric-shape shape-1"></div>
    <div class="geometric-shape shape-2"></div>
    <div class="geometric-shape shape-3"></div>

    <!-- Content overlay that stays fixed while slides change -->
    <div class="hero-content">
      <div class="content-container">
        <div class="headline-container">
          <div class="headline-line"></div>
          <h1 class="hero-title">Souvenir Berkualitas Untuk Setiap Momen</h1>
        </div>
        <p class="hero-subtitle">Buat kenangan abadi dengan produk premium dan desain eksklusif</p>
        <div class="hero-buttons">
          <button class="primary-btn" @click="scrollToSection('catalog')">
            <span>Lihat Katalog</span>
            <i class="fas fa-arrow-right"></i>
          </button>
          <button class="secondary-btn" @click="scrollToSection('custom')">
            <span>Chat Kami</span>
            <!-- <i class="fas fa-palette"></i> -->
          </button>
        </div>
      </div>
    </div>

    <!-- Swiper component -->
    <Swiper
      :spaceBetween="0"
      :centeredSlides="true"
      :autoplay="{
        delay: 5000,
        disableOnInteraction: false,
      }"
      :pagination="{
        clickable: true,
        dynamicBullets: true,
      }"
      :navigation="{
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
        disableEl: null,
        hideOnClick: false,
      }"
      :modules="modules"
      :allowTouchMove="true"
      :speed="1000"
      :loop="cachedSliders.length > 1"
      :effect="'fade'"
      :fadeEffect="{ crossFade: true }"
      class="hero-swiper"
      @slideChange="onSlideChange"
    >
      <SwiperSlide v-for="slide in cachedSliders" :key="slide.id" class="swiper-slide">
        <div class="slide-wrapper">
          <div class="slide-gradient-overlay"></div>
          <div class="loading-indicator" v-if="!slide.loaded">
            <div class="spinner"></div>
          </div>
          <!-- Add low-quality placeholder image -->
          <img
            v-if="slide.thumbnailUrl && !slide.loaded"
            :src="slide.thumbnailUrl"
            :alt="`Slider ${slide.id} thumbnail`"
            class="slide-image placeholder-image"
          />
          <img
            :src="slide.optimizedImage || slide.image"
            :alt="`Slider ${slide.id}`"
            class="slide-image"
            :class="{ loaded: slide.loaded }"
            loading="eager"
            fetchpriority="high"
            @load="handleImageLoaded(slide)"
          />
        </div>
      </SwiperSlide>

      <!-- Fallback slide -->
      <SwiperSlide v-if="!cachedSliders.length">
        <div class="slide-wrapper">
          <div class="slide-gradient-overlay"></div>
          <img :src="defaultImage" alt="Default Slider" class="slide-image loaded" />
        </div>
      </SwiperSlide>

      <!-- Custom navigation buttons -->
      <div class="swiper-nav-buttons">
        <button class="swiper-button-prev">
          <div class="nav-button-inner">
            <i class="fas fa-chevron-left"></i>
          </div>
        </button>
        <button class="swiper-button-next">
          <div class="nav-button-inner">
            <i class="fas fa-chevron-right"></i>
          </div>
        </button>
      </div>
    </Swiper>

    <!-- Progress bar -->
    <div class="progress-container">
      <div class="slide-count">
        <span class="current">{{ (activeIndex + 1).toString().padStart(2, '0') }}</span>
        <span class="separator">/</span>
        <span class="total">{{ cachedSliders.length.toString().padStart(2, '0') || '01' }}</span>
      </div>
    </div>

    <!-- Enhanced scroll indicator -->
    <div class="scroll-indicator" @click="scrollDown">
      <div class="scroll-line"></div>
      <span class="scroll-text">Jelajahi</span>
      <div class="scroll-icon">
        <i class="fas fa-chevron-down"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import 'swiper/css/effect-fade'
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules'
import defaultLogo from '@/assets/Logo Difia Haki.png'
import { db } from '@/config/firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'

// Props for flexibility
const props = defineProps({
  sliderItems: {
    type: Array,
    default: () => [],
  },
  defaultImage: {
    type: String,
    default: () => defaultLogo,
  },
  useFirestore: {
    type: Boolean,
    default: true,
  },
})

const cachedSliders = ref([])
let unsubscribe = null
const modules = [Autoplay, Pagination, Navigation, EffectFade]

// Add this after other ref declarations
const activeIndex = ref(0)

// Add this function to handle slide changes
const onSlideChange = (swiper) => {
  activeIndex.value = swiper.realIndex
}

// Load images from cache first for instant display
const loadFromCache = () => {
  try {
    const cached = localStorage.getItem('slider_cache')
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp <= 30 * 60 * 1000) {
        // 30 min cache validity
        cachedSliders.value = data
        return true
      }
    }
  } catch (e) {
    console.warn('Error loading from cache:', e)
  }
  return false
}

// Setup real-time listener from Firestore
const setupFirestoreListener = () => {
  const slidersQuery = query(collection(db, 'sliders'), orderBy('createdAt', 'desc'))

  unsubscribe = onSnapshot(
    slidersQuery,
    async (snapshot) => {
      const sliders = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data()

          // Generate thumbnail URL for quick loading
          const thumbnailUrl = await generateThumbnail(data.image)

          // Generate optimized version
          const optimizedImage = await optimizeImage(data.image)

          return {
            id: doc.id,
            image: data.image,
            thumbnailUrl: thumbnailUrl,
            optimizedImage: optimizedImage,
            createdAt: data.createdAt?.toDate().toISOString(),
            loaded: false,
          }
        }),
      )

      // Update cache with optimized data
      try {
        localStorage.setItem(
          'slider_cache',
          JSON.stringify({
            data: sliders,
            timestamp: Date.now(),
          }),
        )
      } catch (e) {
        console.warn('Error saving to cache:', e)
      }

      cachedSliders.value = sliders
    },
    (error) => {
      console.error('Error fetching sliders:', error)
    },
  )
}

// Handle image loaded - preload next images for faster switching
const handleImageLoaded = (slide) => {
  slide.loaded = true

  // Preload next image with high priority
  const index = cachedSliders.value.findIndex((s) => s.id === slide.id)
  if (index < cachedSliders.value.length - 1) {
    const nextSlide = cachedSliders.value[index + 1]
    if (!nextSlide.loaded) {
      const img = new Image()
      img.importance = 'high' // Signal browser this is high priority
      img.src = nextSlide.optimizedImage || nextSlide.image
    }
  }

  // Preload remaining images with low priority
  cachedSliders.value.forEach((otherSlide) => {
    if (!otherSlide.loaded && otherSlide.id !== slide.id) {
      const img = new Image()
      img.loading = 'lazy'
      img.importance = 'low'
      img.src = otherSlide.optimizedImage || otherSlide.image
    }
  })
}

// Smooth scroll to section function
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}

// Scroll down function
const scrollDown = () => {
  const heroHeight = document.querySelector('.hero-section').offsetHeight
  window.scrollTo({
    top: heroHeight,
    behavior: 'smooth',
  })
}

onMounted(async () => {
  // First try to load from cache for instant display
  const hasCachedData = loadFromCache()

  if (props.useFirestore) {
    // Setup real-time listener
    setupFirestoreListener()
  } else if (!hasCachedData) {
    // If not using Firestore and no cache, use provided props
    cachedSliders.value = props.sliderItems
  }
})

onUnmounted(() => {
  // Clean up listener when component is destroyed
  if (unsubscribe) {
    unsubscribe()
  }
})

// Create low-quality thumbnail for immediate display
const generateThumbnail = async (imageUrl) => {
  try {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // Increase thumbnail size for better quality
        canvas.width = 60 // Increase from 20
        canvas.height = 40 // New proportional height

        ctx.drawImage(img, 0, 0, 60, 40)
        resolve(canvas.toDataURL('image/jpeg', 0.3)) // Slightly better quality
      }
      img.onerror = () => {
        resolve(null)
      }
      img.src = imageUrl
    })
  } catch (error) {
    console.error('Error generating thumbnail:', error)
    return null
  }
}

// Optimize image for faster loading
const optimizeImage = async (imageUrl) => {
  try {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // Increase resolution while maintaining aspect ratio
        const maxWidth = 1600 // Increase from 1200
        const maxHeight = 900 // Increase from 800
        let width = img.width
        let height = img.height

        // Maintain aspect ratio while resizing
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        // Use better quality settings for drawing
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        // Increase quality slightly but keep file size reasonable
        resolve(canvas.toDataURL('image/jpeg', 0.85)) // Increase from 0.8
      }
      img.onerror = () => {
        resolve(null)
      }
      img.src = imageUrl
    })
  } catch (error) {
    console.error('Error optimizing image:', error)
    return null
  }
}
</script>

<style scoped>
/* Main container - changing to a softer navy blue */
.hero-section {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #12284b; /* Changed from #02163b to a softer blue tone */
}

/* Decorative geometric shapes */
.geometric-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.05;
  z-index: 1;
}

.shape-1 {
  top: -150px;
  right: -150px;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #e8ba38 0%, transparent 70%);
}

.shape-2 {
  bottom: -100px;
  left: -50px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, #e8ba38 0%, transparent 70%);
}

.shape-3 {
  top: 60%;
  right: 5%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, #e8ba38 0%, transparent 70%);
  animation: pulse 8s infinite alternate ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.03;
  }
  100% {
    transform: scale(1.05);
    opacity: 0.07;
  }
}

/* Hero content */
.hero-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  z-index: 10;
  pointer-events: none;
}

.content-container {
  position: relative;
  max-width: 650px;
  margin-left: 8%;
  color: #ffffff;
  animation:
    fadeIn 1.4s ease-out,
    slideIn 1.4s ease-out;
  padding: 2.5rem 0;
}

.headline-container {
  position: relative;
  margin-bottom: 1.5rem;
}

.headline-line {
  position: absolute;
  left: -40px;
  top: 0.8em;
  width: 25px;
  height: 3px;
  /* background-color: #e8ba38; */
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  margin: 0 0 1rem;
  line-height: 1.1;
  color: #ffffff;
  position: relative;
}

.hero-subtitle {
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  line-height: 1.8;
  opacity: 0.9;
  margin-bottom: 2rem;
  max-width: 90%;
}

.hero-buttons {
  display: flex;
  gap: 1.5rem;
  pointer-events: auto;
}

.primary-btn,
.secondary-btn {
  position: relative;
  padding: 1rem 2rem;
  border-radius: 60px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  display: flex;
  align-items: center;
  gap: 0.8rem;
  border: none;
  overflow: hidden;
}

.primary-btn::after,
.secondary-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  transition: width 0.4s ease;
  z-index: -1;
}

.primary-btn:hover::after,
.secondary-btn:hover::after {
  width: 100%;
}

.primary-btn {
  background-color: #e8ba38;
  color: #12284b; /* Changed from #02163b */
  box-shadow: 0 6px 15px rgba(232, 186, 56, 0.3);
}

.primary-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(232, 186, 56, 0.4);
}

.secondary-btn {
  background-color: transparent;
  color: #ffffff;
  border: 2px solid #e8ba38;
}

.secondary-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(232, 186, 56, 0.15);
}

.primary-btn i,
.secondary-btn i {
  transition: transform 0.3s ease;
}

.primary-btn:hover i,
.secondary-btn:hover i {
  transform: translateX(4px);
}

/* Swiper styles */
.hero-swiper {
  width: 100%;
  height: 100%;
}

.swiper-slide {
  width: 100%;
  height: 100%;
}

.slide-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition:
    transform 2s ease,
    opacity 1s ease;
  opacity: 0;
  transform: scale(1.05);
  filter: brightness(0.85); /* Slightly brighter than before */
  image-rendering: -webkit-optimize-contrast; /* Sharper images on Chrome/Safari */
  backface-visibility: hidden; /* Helps with certain rendering issues */
}

.slide-image.loaded {
  opacity: 1;
  transform: scale(1);
}

/* Gradient overlay - adjusted for more harmony */
.slide-gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to right,
    rgba(18, 40, 75, 0.85) 0%,
    /* Changed from rgba(2, 22, 59, 0.9) */ rgba(18, 40, 75, 0.65) 35%,
    /* Changed from rgba(2, 22, 59, 0.75) */ rgba(18, 40, 75, 0.35) 100%
      /* Changed from rgba(2, 22, 59, 0.4) */
  );
  z-index: 1;
}

/* Loading indicator */
.loading-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #e8ba38;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Navigation buttons */
.swiper-nav-buttons {
  position: absolute;
  bottom: 15%;
  right: 8%;
  display: flex;
  gap: 15px;
  z-index: 10;
  pointer-events: none;
}

.swiper-button-prev,
.swiper-button-next {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: auto;
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.nav-button-inner {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.swiper-button-prev::before,
.swiper-button-next::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #e8ba38;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  z-index: 1;
}

.swiper-button-prev:hover::before,
.swiper-button-next:hover::before {
  transform: translateY(0);
}

.swiper-button-prev i,
.swiper-button-next i {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.swiper-button-prev:hover i,
.swiper-button-next:hover i {
  transform: scale(1.2);
}

/* Progress indicator */
.progress-container {
  position: absolute;
  bottom: 15%;
  left: 8%;
  z-index: 10;
  display: flex;
  align-items: center;
  color: white;
}

.slide-count {
  font-family: 'Montserrat', sans-serif;
  display: flex;
  align-items: baseline;
}

.current {
  font-size: 2rem;
  font-weight: bold;
  color: #e8ba38;
}

.separator {
  margin: 0 8px;
  opacity: 0.5;
}

.total {
  font-size: 1.2rem;
  opacity: 0.7;
}

/* Custom pagination */
:deep(.swiper-pagination) {
  bottom: 35px !important; /* Move much lower to be below scroll indicator */
  z-index: 9; /* Ensure it's below the scroll indicator in z-index */
}

:deep(.swiper-pagination-bullet) {
  width: 30px;
  height: 3px;
  border-radius: 0;
  background: rgba(255, 255, 255, 0.4);
  opacity: 1;
  transition: all 0.3s ease;
}

:deep(.swiper-pagination-bullet-active) {
  background: #e8ba38;
  width: 50px;
}

/* Scroll indicator */
.scroll-indicator {
  position: absolute;
  bottom: 60px; /* Increase to make room for pagination below */
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.scroll-line {
  width: 1px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.3);
  margin-bottom: 10px;
  position: relative;
  overflow: hidden;
}

.scroll-line::after {
  content: '';
  position: absolute;
  top: -100%;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #e8ba38;
  animation: lineDrop 2s infinite ease-out;
}

@keyframes lineDrop {
  0% {
    top: -100%;
  }
  50%,
  100% {
    top: 100%;
  }
}

.scroll-text {
  font-size: 0.875rem;
  margin-bottom: 8px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.8;
}

.scroll-icon {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.scroll-icon i {
  font-size: 1.2rem;
  animation: bounce 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
}

.scroll-indicator:hover .scroll-icon {
  background-color: #e8ba38;
  border-color: #e8ba38;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateX(-30px);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

/* Responsive styles */
@media (max-width: 1200px) {
  .content-container {
    max-width: 550px;
  }

  .swiper-nav-buttons {
    bottom: 10%;
    right: 5%;
  }

  .progress-container {
    bottom: 10%;
    left: 5%;
  }
}

@media (max-width: 992px) {
  .content-container {
    margin-left: 5%;
    max-width: 500px;
  }

  .headline-line {
    left: -30px;
  }

  .swiper-nav-buttons {
    bottom: 20%;
    right: 5%;
  }

  .progress-container {
    bottom: 25%;
    left: 5%;
  }
}

@media (max-width: 768px) {
  .content-container {
    margin: 0 auto;
    text-align: center;
    max-width: 90%;
    padding: 2rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .headline-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .headline-line {
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    top: -15px;
  }

  .hero-subtitle {
    max-width: 100%;
  }

  .hero-buttons {
    justify-content: center;
  }

  .swiper-nav-buttons {
    bottom: 30%;
    right: 50%;
    transform: translateX(50%);
  }

  .progress-container {
    display: none;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  /* Updated gradient for mobile */
  .slide-gradient-overlay {
    background: linear-gradient(
      to bottom,
      rgba(18, 40, 75, 0.45) 0%,
      /* Changed from rgba(2, 22, 59, 0.5) */ rgba(18, 40, 75, 0.65) 50%,
      /* Changed from rgba(2, 22, 59, 0.7) */ rgba(18, 40, 75, 0.8) 100%
        /* Changed from rgba(2, 22, 59, 0.9) */
    );
  }

  /* Update pagination position for mobile */
  :deep(.swiper-pagination) {
    bottom: 10px !important;
  }

  .scroll-indicator {
    bottom: 50px;
  }
}

@media (max-width: 576px) {
  .hero-section {
    height: 90vh;
  }

  .hero-buttons {
    flex-direction: column;
    width: 100%;
    max-width: 240px;
    gap: 1rem;
  }

  .primary-btn,
  .secondary-btn {
    width: 100%;
    justify-content: center;
    padding: 0.875rem 1.5rem;
  }

  .swiper-nav-buttons {
    bottom: 25%;
  }

  .swiper-button-prev,
  .swiper-button-next {
    width: 45px;
    height: 45px;
  }

  :deep(.swiper-pagination) {
    bottom: 5px !important;
  }

  .scroll-indicator {
    bottom: 30px;
  }

  .scroll-text {
    font-size: 0.75rem;
  }

  .scroll-icon {
    width: 36px;
    height: 36px;
  }

  .shape-1,
  .shape-2,
  .shape-3 {
    opacity: 0.03;
  }
}

/* Add styles for placeholder image */
.placeholder-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  filter: blur(15px); /* Reduced blur for better appearance */
  transform: scale(1.1);
  opacity: 0.8; /* Slightly more transparent */
  z-index: 1;
}

/* Add this to your <style> section */
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  display: none !important;
}
</style>
