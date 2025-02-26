// src/stores/ReviewStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/config/firebase'
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore'

export const useReviewStore = defineStore('review', () => {
  const reviews = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Suggested reviews to help users
  const reviewSuggestions = [
    "Kualitas produk sangat bagus",
    "Jahitan rapi dan kuat",
    "Bahan sesuai dengan deskripsi",
    "Pengiriman cepat dan aman",
    "Pelayanan ramah dan responsif",
    "Desain sesuai dengan pesanan"
  ]

  const addReview = async (reviewData) => {
    try {
      isLoading.value = true
      error.value = null

      const newReview = {
        orderId: reviewData.orderId,
        productId: reviewData.productId,
        userId: reviewData.userId,
        rating: reviewData.rating,
        review: reviewData.review,
        images: reviewData.images || [],
        createdAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'reviews'), newReview)
      reviews.value.unshift({ id: docRef.id, ...newReview })

      return { success: true, id: docRef.id }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  const getReviewsByProductId = async (productId) => {
    try {
      isLoading.value = true
      error.value = null

      const q = query(
        collection(db, 'reviews'),
        where('productId', '==', productId),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)
      reviews.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      return { success: true, reviews: reviews.value }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  return {
    reviews,
    isLoading,
    error,
    addReview,
    getReviewsByProductId,
    reviewSuggestions
  }
})