// src/stores/NotificationStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/config/firebase'

export const useNotificationStore = defineStore('notification', () => {
  const notificationCount = ref(0)
  const viewedUpdates = ref(new Set())
  
  // Track new status updates
  const trackStatusUpdates = (userId) => {
    const ordersRef = collection(db, 'orders')
    const q = query(ordersRef, where('userId', '==', userId))
    
    return onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified' && !viewedUpdates.value.has(change.doc.id)) {
          notificationCount.value++
        }
      })
    })
  }

  const resetCount = () => {
    notificationCount.value = 0
    viewedUpdates.value.clear()
  }

  const markAsViewed = (orderId) => {
    viewedUpdates.value.add(orderId)
    if (notificationCount.value > 0) {
      notificationCount.value--
    }
  }

  return {
    notificationCount,
    trackStatusUpdates,
    resetCount,
    markAsViewed
  }
})