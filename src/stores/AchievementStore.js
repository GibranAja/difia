// src/stores/AchievementStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/config/firebase'
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp,
  query,
  orderBy 
} from 'firebase/firestore'
import { useToast } from 'vue-toastification'

export const useAchievementStore = defineStore('achievement', () => {
  const achievements = ref([])
  const loading = ref(false)
  const error = ref(null)
  const toast = useToast()

  // Convert image file to base64
  const convertImageToBase64 = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  // Fetch achievements
  const fetchAchievements = async () => {
    try {
      loading.value = true
      const achievementsRef = collection(db, 'achievements')
      const q = query(achievementsRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)

      achievements.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      return { success: true }
    } catch (err) {
      error.value = err.message
      toast.error('Failed to fetch achievements')
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Add achievement
  const addAchievement = async (achievementData) => {
    try {
      loading.value = true

      let imageUrl = ''
      if (achievementData.imageFile) {
        imageUrl = await convertImageToBase64(achievementData.imageFile)
      }

      const newAchievement = {
        title: achievementData.title,
        description: achievementData.description,
        image: imageUrl,
        createdAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'achievements'), newAchievement)
      
      // Update local state for real-time update
      achievements.value.unshift({
        id: docRef.id,
        ...newAchievement,
        createdAt: new Date()
      })

      toast.success('Achievement added successfully')
      return { success: true, id: docRef.id }
    } catch (err) {
      error.value = err.message
      toast.error('Failed to add achievement')
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Update achievement
  const updateAchievement = async (id, achievementData) => {
    try {
      loading.value = true

      const updateData = {
        title: achievementData.title,
        description: achievementData.description,
        updatedAt: serverTimestamp()
      }

      if (achievementData.imageFile) {
        updateData.image = await convertImageToBase64(achievementData.imageFile)
      }

      await updateDoc(doc(db, 'achievements', id), updateData)

      // Update local state for real-time update
      const index = achievements.value.findIndex(item => item.id === id)
      if (index !== -1) {
        achievements.value[index] = {
          ...achievements.value[index],
          ...updateData,
          updatedAt: new Date()
        }
      }

      toast.success('Achievement updated successfully')
      return { success: true }
    } catch (err) {
      error.value = err.message
      toast.error('Failed to update achievement')
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Delete achievement
  const deleteAchievement = async (id) => {
    try {
      loading.value = true

      await deleteDoc(doc(db, 'achievements', id))
      
      // Update local state for real-time update
      achievements.value = achievements.value.filter(item => item.id !== id)

      toast.success('Achievement deleted successfully')
      return { success: true }
    } catch (err) {
      error.value = err.message
      toast.error('Failed to delete achievement')
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  return {
    achievements,
    loading,
    error,
    fetchAchievements,
    addAchievement,
    updateAchievement,
    deleteAchievement
  }
})