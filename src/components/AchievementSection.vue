<template>
  <div class="swipper">
    <p><b>PENGHARGAAN</b></p>
    <span class="ring"></span>
    <span class="bg-scroll"></span>
    <span class="side-color"> </span>
    <div class="carousel-container">
      <div class="carousel-track" ref="carouselTrack">
        <!-- Use cardIndex prop to manage achievement cycling -->
        <div
          v-for="(item, index) in achievementItems"
          :key="`achievement-${index}`"
          class="carousel-item"
        >
          <CardAchivement :card-index="index" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import CardAchivement from '@/components/CardAchivement.vue'

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

onMounted(() => {
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
</script>

<style scoped>
/* STYLE UNTUK CAROUSEL PENGHARGAAN */
.swipper {
  width: 100%;
  position: relative;
  display: flex;
  flex-wrap: wrap;
  justify-content: right;
  align-items: center;
}

.swipper p {
  color: white;
  text-align: center;
  transform: rotate(-90deg);
  position: absolute;
  left: -30px;
  font-size: 1.5rem;
}

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

.swipper .bg-scroll {
  position: absolute;
  width: 92%;
  height: 200px;
  background-color: #ffffff;
  z-index: -9;
  right: 0;
  border-radius: 10px 0 0 10px;
}

.swipper .side-color {
  position: absolute;
  width: 200px;
  height: 300px;
  left: 0;
  background-color: #000000;
  box-shadow: 10px 0 150px black;
  border-radius: 0 20px 20px 0;
  z-index: -10;
}

.swipper .ring {
  position: absolute;
  width: 450px;
  height: 450px;
  border: 1px solid #000000;
  border-radius: 50%;
  z-index: -10;
  left: -190px;
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

@media (max-width: 768px) {
  .swipper p {
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

  .carousel-container {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .swipper .bg-scroll,
  .swipper .side-color,
  .swipper .ring {
    display: none;
  }
}
</style>