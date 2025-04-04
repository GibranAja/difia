<template>
  <div class="hero-swiper-container">
    <Swiper
      :spaceBetween="30"
      :centeredSlides="true"
      :autoplay="{
        delay: 2500,
        disableOnInteraction: false,
      }"
      :pagination="{
        clickable: true,
      }"
      :navigation="false"
      :modules="modules"
      :allowTouchMove="false"
      :speed="800"
      :loop="cachedSliders.length > 1"
      :loopedSlides="2"
      class="mySwiper"
    >
      <SwiperSlide v-for="slide in cachedSliders" :key="slide.id" class="swiper-slide">
        <div class="slide-wrapper">
          <div class="slide-overlay"></div>
          <!-- Progressive image loading with blurry placeholder -->
          <img
            :src="slide.optimizedImage || slide.image"
            :alt="`Slider ${slide.id}`"
            class="slide-image"
            loading="eager"
            @load="handleImageLoaded(slide)"
          />
        </div>
      </SwiperSlide>
      <!-- Fallback slide if no sliders available -->
      <SwiperSlide v-if="!cachedSliders.length">
        <div class="slide-wrapper">
          <div class="slide-overlay"></div>
          <img :src="defaultImage" alt="Default Slider" class="slide-image" />
        </div>
      </SwiperSlide>
    </Swiper>
    <div class="scroll-indicator">
      <i class="fas fa-chevron-down"></i>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
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
const modules = [Autoplay, Pagination, Navigation]

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
    (snapshot) => {
      const sliders = snapshot.docs.map((doc) => ({
        id: doc.id,
        image: doc.data().image,
        optimizedImage: null, // Will hold optimized version
        createdAt: doc.data().createdAt?.toDate().toISOString(),
        loaded: false,
      }))

      // Update cache with new data
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

  // After current image loads, preload the next one
  const index = cachedSliders.value.findIndex((s) => s.id === slide.id)
  if (index < cachedSliders.value.length - 1) {
    const nextSlide = cachedSliders.value[index + 1]
    if (!nextSlide.loaded) {
      const img = new Image()
      img.src = nextSlide.image
    }
  }
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
</script>

<style scoped>
.hero-swiper-container {
  position: relative;
  width: 100%;
  height: 105vh; /* Set to full viewport height */
  will-change: transform; /* Performance optimization */
  overflow: hidden;
}

.mySwiper {
  width: 100%;
  height: 100%; /* 100% of the container's height */
}

.swiper-slide {
  width: 100%;
  height: 100%;
  text-align: center;
  contain: content; /* Performance optimization */
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
  will-change: transform; /* Performance optimization */
  transform: translateZ(0); /* Hardware acceleration */
  backface-visibility: hidden; /* Performance optimization */
}

/* Dark overlay */
.slide-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

/* Scroll indicator */
.scroll-indicator {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  z-index: 10;
}

.scroll-indicator i {
  font-size: 2rem;
  animation: bounce 2s infinite;
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
    transform: translateY(-30px);
  }

  60% {
    transform: translateY(-15px);
  }
}
</style>
