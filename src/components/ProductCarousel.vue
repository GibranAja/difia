<template>
  <div 
    class="carousel-container" 
    @mousemove="handleMouseMove" 
    @mouseenter="stopAutoplay" 
    @mouseleave="startAutoplay"
  >
    <div class="carousel-wrapper" :style="carouselStyle">
      <!-- Duplicate first and last images for smooth transition -->
      <img
        v-if="images.length > 0"
        :src="images[images.length - 1]"
        :alt="altText"
        class="carousel-image"
      />
      <img
        v-for="(image, index) in images"
        :key="index"
        :src="image"
        :alt="altText"
        class="carousel-image"
      />
      <img
        v-if="images.length > 0"
        :src="images[0]"
        :alt="altText"
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
        v-for="(_, index) in images"
        :key="index"
        :class="['indicator', { active: currentIndex === index }]"
        @click="goToSlide(index)"
      ></span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  altText: {
    type: String,
    default: 'Product image'
  },
  autoplay: {
    type: Boolean,
    default: true
  },
  autoplayDelay: {
    type: Number,
    default: 3000
  }
})

// Carousel functionality
const currentIndex = ref(0)

const carouselStyle = computed(() => ({
  transform: `translateX(-${(currentIndex.value + 1) * 100}%)`,
  transition: 'transform 0.5s ease-in-out',
}))

const prevSlide = () => {
  if (currentIndex.value === 0) {
    currentIndex.value = props.images.length - 1
  } else {
    currentIndex.value--
  }
}

const nextSlide = () => {
  if (currentIndex.value === props.images.length - 1) {
    currentIndex.value = 0
  } else {
    currentIndex.value++
  }
}

const goToSlide = (index) => {
  currentIndex.value = index
}

// Autoplay functionality
let autoplayInterval
const AUTOPLAY_DELAY = props.autoplayDelay

const startAutoplay = () => {
  if (!props.autoplay) return
  
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

onMounted(() => {
  if (props.autoplay) {
    startAutoplay()
  }
})

onBeforeUnmount(() => {
  stopAutoplay()
})
</script>

<style scoped>
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

/* Responsive styles */
@media (max-width: 992px) {
  .carousel-container {
    max-width: 100%;
    height: auto;
    aspect-ratio: 4/3;
  }

  .carousel-image {
    width: 100%;
    height: auto;
  }
}

@media (max-width: 768px) {
  .carousel-container {
    height: 280px;
  }
}
</style>