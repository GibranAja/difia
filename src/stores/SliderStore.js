// stores/SliderStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/config/firebase'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { useToast } from 'vue-toastification'

export const useSliderStore = defineStore('slider', () => {
  const sliderItems = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const toast = useToast()

  // Cache mechanism for performance
  const cache = {
    data: new Map(),
    timestamp: new Map(),
    maxAge: 30 * 60 * 1000, // 30 minutes cache

    set(key, value) {
      this.data.set(key, value)
      this.timestamp.set(key, Date.now())
      try {
        localStorage.setItem(
          'slider_cache',
          JSON.stringify({
            data: value,
            timestamp: Date.now(),
          }),
        )
      } catch (e) {
        console.warn('LocalStorage write failed:', e)
      }
    },

    get(key) {
      if (this.data.size === 0) {
        try {
          const cached = localStorage.getItem('slider_cache')
          if (cached) {
            const { data, timestamp } = JSON.parse(cached)
            if (Date.now() - timestamp <= this.maxAge) {
              this.data.set(key, data)
              this.timestamp.set(key, timestamp)
            }
          }
        } catch (e) {
          console.warn('LocalStorage read failed:', e)
        }
      }

      const timestamp = this.timestamp.get(key)
      if (!timestamp) return null

      if (Date.now() - timestamp > this.maxAge) {
        this.clear(key)
        return null
      }

      return this.data.get(key)
    },

    clear(key) {
      this.data.delete(key)
      this.timestamp.delete(key)
      localStorage.removeItem('slider_cache')
    },
  }

  // Optimized image processing
  const processImage = async (file) => {
    const url = URL.createObjectURL(file)

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // Optimize for slider dimensions
        const maxWidth = 1920
        const maxHeight = 1080
        let width = img.width
        let height = img.height

        // Calculate aspect ratio
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        URL.revokeObjectURL(url)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Image processing failed'))
      }
      img.src = url
    })
  }

  // Fetch sliders with caching
  const fetchSliders = async (forceFetch = false) => {
    try {
      if (!forceFetch) {
        const cachedSliders = cache.get('sliders')
        if (cachedSliders) {
          sliderItems.value = cachedSliders
          return
        }
      }

      isLoading.value = true
      error.value = null

      const slidersQuery = query(collection(db, 'sliders'), orderBy('createdAt', 'desc'))

      const snapshot = await getDocs(slidersQuery)
      const sliders = snapshot.docs.map((doc) => ({
        id: doc.id,
        image: doc.data().image,
        createdAt: doc.data().createdAt?.toDate().toISOString(),
      }))

      sliderItems.value = sliders
      cache.set('sliders', sliders)
    } catch (err) {
      error.value = err.message
      toast.error('Failed to fetch sliders')
    } finally {
      isLoading.value = false
    }
  }

  // Add new slider
  const addSlider = async (file) => {
    try {
      isLoading.value = true
      error.value = null

      const base64Image = await processImage(file)

      const newSlider = {
        image: base64Image,
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, 'sliders'), newSlider)

      const sliderWithId = {
        id: docRef.id,
        ...newSlider,
        createdAt: new Date().toISOString(),
      }

      sliderItems.value.unshift(sliderWithId)
      cache.set('sliders', sliderItems.value)

      return { success: true, id: docRef.id }
    } catch (err) {
      error.value = err.message
      toast.error('Failed to add slider')
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Delete slider
  const deleteSlider = async (id) => {
    try {
      isLoading.value = true
      error.value = null

      await deleteDoc(doc(db, 'sliders', id))

      sliderItems.value = sliderItems.value.filter((item) => item.id !== id)
      cache.set('sliders', sliderItems.value)

      toast.success('Slider deleted successfully')
      return { success: true }
    } catch (err) {
      error.value = err.message
      toast.error('Failed to delete slider')
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Clear store
  const clearStore = () => {
    sliderItems.value = []
    error.value = null
    cache.clear('sliders')
  }

  return {
    sliderItems,
    isLoading,
    error,
    fetchSliders,
    addSlider,
    deleteSlider,
    clearStore,
  }
})
