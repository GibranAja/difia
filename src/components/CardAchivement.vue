<template>
  <div class="card">
    <div class="picture">
      <img :src="achievement.image || defaultImage" :alt="achievement.title" />
    </div>
    <div class="text">
      <h1>{{ achievement.title || 'Loading...' }}</h1>
      <p>{{ truncateDescription(achievement.description) || 'Loading description...' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps } from 'vue'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import { db } from '@/config/firebase'
import defaultImage from '@/assets/Logo_Difia_Haki.PNG'

const props = defineProps({
  achievementId: {
    type: String,
    default: null,
  },
  cardIndex: {
    type: Number,
    required: true,
  },
})

const achievement = ref({
  title: '',
  description: '',
  image: '',
})

const achievements = ref([])

const fetchAchievements = async () => {
  try {
    const achievementsRef = collection(db, 'achievements')
    const q = query(achievementsRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      achievements.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      // Set initial achievement based on index
      updateAchievement()
    }
  } catch (error) {
    console.error('Error fetching achievements:', error)
  }
}

const updateAchievement = () => {
  if (achievements.value.length > 0) {
    // Use modulo to cycle through achievements
    const index = props.cardIndex % achievements.value.length
    achievement.value = achievements.value[index]
  }
}

// Watch for changes in cardIndex
watch(() => props.cardIndex, updateAchievement)

onMounted(() => {
  fetchAchievements()
})

// Helper to truncate description for card display
const truncateDescription = (text) => {
  if (!text) return ''
  return text.length > 60 ? text.substring(0, 60) + '...' : text
}
</script>

<style scoped>
.card {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 140px;
  background-color: white;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
}

.card .picture {
  width: 30%;
  min-width: 80px;
  padding-right: 15px;
}

.card .picture img {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.card .text {
  width: 70%;
  text-align: left;
}

.card .text h1 {
  font-size: 1rem;
  margin: 0 0 8px 0;
  color: #02163b;
}

.card .text p {
  font-size: 0.85rem;
  margin: 0;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
