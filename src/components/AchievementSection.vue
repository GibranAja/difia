<template>
  <div class="swipper">
    <p><b>PENGHARGAAN</b></p>
    <!-- <span class="ring"></span>
    <span class="ring-left"></span> -->
    <span class="bg-scroll"></span>
    <span class="side-color"> </span>
    <span class="wave-section"></span>
    <div class="carousel-container">
      <div class="carousel-track" ref="carouselTrack">
        <!-- Add hover events to each carousel item and track position -->
        <div
          v-for="(item, index) in achievements"
          :key="`achievement-${index}`"
          class="carousel-item"
          @mouseenter="pauseCarousel($event, item.id)"
          @mouseleave="resumeCarousel"
        >
          <CardAchivement :card-index="index" :achievement="item" />
        </div>
      </div>
    </div>

    <!-- Move tooltip to the root level so it can float freely -->
    <div class="floating-tooltip-container">
      <AchievementTooltip
        v-if="activeTooltipId"
        :achievement="getActiveAchievement()"
        :style="tooltipStyle"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import CardAchivement from '@/components/CardAchivement.vue'
import AchievementTooltip from '@/components/AchievementTooltip.vue'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/config/firebase'

// Add data refs
const achievements = ref([])
const carouselTrack = ref(null)
let animationId = null
let position = 0
const speed = 0.5 // Kecepatan scroll
const isPaused = ref(false)
const activeTooltipId = ref(null)
let unsubscribe = null

// Add tooltip positioning
const tooltipPosition = ref({ top: 0, left: 0 })

// Tooltip style computed property
const tooltipStyle = computed(() => {
  return {
    position: 'absolute', // Change from 'fixed' to 'absolute'
    top: `${tooltipPosition.value.top}px`,
    left: `${tooltipPosition.value.left}px`,
    zIndex: 1000,
  }
})

// Modifikasi bagian script untuk carousel
const animateCarousel = () => {
  if (!carouselTrack.value || isPaused.value) return // Check if paused

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

// Update pause function to track mouse position and decide tooltip position
const pauseCarousel = (event, id) => {
  isPaused.value = true
  activeTooltipId.value = id // Show tooltip for this item

  // Calculate tooltip position
  const cardElement = event.currentTarget
  const rect = cardElement.getBoundingClientRect()
  const tooltipContainer = document.querySelector('.floating-tooltip-container')

  if (tooltipContainer) {
    // Get the container's position relative to the page
    const containerRect = tooltipContainer.getBoundingClientRect()

    // Check if the card is in the top half of the viewport
    const viewportHeight = window.innerHeight
    const isInTopHalf = rect.top < viewportHeight / 2

    // Calculate tooltip position based on viewport position
    tooltipPosition.value = {
      // If in top half, show below the card but closer to it (reduced from 20px to 10px)
      top: isInTopHalf
        ? rect.top - containerRect.top + rect.height + -90 // Reduced gap to 10px (was 20px)
        : rect.top - containerRect.top - 345, // Above card (unchanged)
      // Center horizontally
      left: rect.left - containerRect.left + rect.width / 2,
      // Add a position flag to tell the tooltip which arrow to show
      position: isInTopHalf ? 'below' : 'above',
    }
  }
}

// Helper function to get active achievement
const getActiveAchievement = () => {
  const achievement = achievements.value.find((item) => item.id === activeTooltipId.value) || {}
  // Add position information to the achievement object
  return {
    ...achievement,
    tooltipPosition: tooltipPosition.value.position,
  }
}

// Update the resumeCarousel function to always restart animation
const resumeCarousel = () => {
  isPaused.value = false
  activeTooltipId.value = null // Hide tooltip

  // Cancel any existing animation frame
  if (animationId) {
    cancelAnimationFrame(animationId)
  }

  // Always request a new animation frame to ensure it restarts
  animationId = requestAnimationFrame(animateCarousel)
}

// Fetch real achievements data from Firestore
const fetchAchievements = () => {
  const achievementsRef = collection(db, 'achievements')
  const achievementsQuery = query(achievementsRef, orderBy('createdAt', 'desc'))

  unsubscribe = onSnapshot(achievementsQuery, (snapshot) => {
    const achievementsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // If not enough achievements, duplicate to ensure smooth carousel
    if (achievementsData.length < 8) {
      let duplicated = [...achievementsData]
      while (duplicated.length < 12) {
        duplicated = [...duplicated, ...achievementsData]
      }
      achievements.value = duplicated.slice(0, 12)
    } else {
      achievements.value = achievementsData
    }
  })
}

onMounted(() => {
  // Fetch real achievements data
  fetchAchievements()

  // Mulai animasi carousel setelah DOM dirender sepenuhnya
  setTimeout(() => {
    animationId = requestAnimationFrame(animateCarousel)
  }, 500)
})

// Bersihkan animation frame dan Firestore listener saat komponen diunmount
onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (unsubscribe) {
    unsubscribe()
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
  position: relative; /* Added for tooltip positioning */
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
  background-color: #FEBA17;
  /* box-shadow: 10px 0 500px black; */
  border-radius: 0 20px 20px 0;
  z-index: -10;
}

/* .swipper .ring {
  position: absolute;
  width: 150px;
  height: 150px;
  border: 1px solid #000000;
  border-radius: 50%;
  z-index: -1;
  left: 110px;
}
.swipper .ring-left {
  position: absolute;
  width: 450px;
  height: 450px;
  border: 1px solid #000000;
  border-radius: 50%;
  z-index: -10;
  right: -190px;
} */


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

/* Add floating tooltip container */
.floating-tooltip-container {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none; /* Makes sure mouse events pass through */
  z-index: 1000;
  width: 100%;
  height: 100%; /* Change from 0 to 100% to span the entire height */
}
</style>
