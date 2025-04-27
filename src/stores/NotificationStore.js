// src/stores/NotificationStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  ref as dbRef,
  push,
  update,
  onValue,
  query as rtdbQuery,
  orderByChild,
  equalTo,
  serverTimestamp as rtdbServerTimestamp,
} from 'firebase/database'
import { rtdb } from '@/config/firebase'
import { useAuthStore } from './AuthStore'

export const useNotificationStore = defineStore('notification', () => {
  const authStore = useAuthStore()
  const notifications = ref([])
  const loading = ref(false)
  const error = ref(null)
  let unsubscribeListener = null

  // Listen to notifications
  const listenToNotifications = () => {
    if (unsubscribeListener) {
      unsubscribeListener()
    }

    loading.value = true
    let notificationsRef

    if (authStore.isAdmin) {
      // Admin gets notifications marked with forAdmin = true
      notificationsRef = dbRef(rtdb, 'notifications')

      // Use onValue to listen for changes
      unsubscribeListener = onValue(
        notificationsRef,
        (snapshot) => {
          const notificationsData = []

          snapshot.forEach((childSnapshot) => {
            const notification = childSnapshot.val()
            // Only include admin notifications
            if (notification.forAdmin === true) {
              notificationsData.push({
                id: childSnapshot.key,
                ...notification,
              })
            }
          })

          // Sort by timestamp in descending order (newest first)
          notifications.value = notificationsData.sort((a, b) => b.timestamp - a.timestamp)
          loading.value = false
        },
        (error) => {
          console.error('Error fetching notifications:', error)
          loading.value = false
        },
      )
    } else {
      // Regular users get their own notifications
      const userId = authStore.currentUser?.id
      if (!userId) {
        loading.value = false
        return () => {}
      }

      notificationsRef = rtdbQuery(
        dbRef(rtdb, 'notifications'),
        orderByChild('userId'),
        equalTo(userId),
      )

      unsubscribeListener = onValue(
        notificationsRef,
        (snapshot) => {
          const notificationsData = []

          snapshot.forEach((childSnapshot) => {
            notificationsData.push({
              id: childSnapshot.key,
              ...childSnapshot.val(),
            })
          })

          // Sort by timestamp in descending order (newest first)
          notifications.value = notificationsData.sort((a, b) => b.timestamp - a.timestamp)
          loading.value = false
        },
        (error) => {
          console.error('Error fetching notifications:', error)
          loading.value = false
        },
      )
    }

    return unsubscribeListener
  }

  // Create notification
  const createNotification = async (data) => {
    try {
      const notificationRef = dbRef(rtdb, 'notifications')

      const notification = {
        title: data.title,
        message: data.message,
        type: data.type, // 'order', 'voucher', 'system', etc.
        userId: data.userId || null, // null for global notifications
        orderId: data.orderId || null,
        icon: data.icon || 'fas fa-bell',
        color: data.color || '#e8ba38',
        link: data.link || null,
        forAdmin: data.forAdmin === true, // Explicitly boolean, defaults to false
        read: false,
        timestamp: rtdbServerTimestamp(),
      }

      await push(notificationRef, notification)

      // Also create admin version of notification if this is an order notification
      if (data.type === 'order' && !data.forAdmin) {
        const adminNotification = {
          ...notification,
          forAdmin: true, // Mark for admin
          userId: null, // Clear userId for admin notifications
          title: `${data.title} (#${data.orderId?.slice(-6) || 'N/A'})`,
        }
        await push(notificationRef, adminNotification)
      }

      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!notificationId) {
      console.error('Invalid notification ID')
      return { success: false, error: 'Invalid notification ID' }
    }

    try {
      // Update in the realtime database instead of Firestore
      const notificationRef = dbRef(rtdb, `notifications/${notificationId}`)

      // Update the realtime database record
      await update(notificationRef, {
        read: true,
        readAt: rtdbServerTimestamp(),
      })

      // Update local state
      const index = notifications.value.findIndex((n) => n.id === notificationId)
      if (index !== -1) {
        notifications.value[index].read = true
      }

      return { success: true }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return { success: false, error: error.message }
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const updates = {}

      // For admin, mark all admin notifications as read
      if (authStore.isAdmin) {
        notifications.value
          .filter((notification) => notification.forAdmin && !notification.read)
          .forEach((notification) => {
            updates[`notifications/${notification.id}/read`] = true
            updates[`notifications/${notification.id}/readAt`] = rtdbServerTimestamp()
          })
      }
      // For users, mark all their notifications as read
      else {
        notifications.value
          .filter((notification) => !notification.read)
          .forEach((notification) => {
            updates[`notifications/${notification.id}/read`] = true
            updates[`notifications/${notification.id}/readAt`] = rtdbServerTimestamp()
          })
      }

      // If there are updates to make
      if (Object.keys(updates).length > 0) {
        await update(dbRef(rtdb), updates)

        // Update local state
        notifications.value = notifications.value.map((notification) => ({
          ...notification,
          read: true,
        }))
      }

      return { success: true }
    } catch (error) {
      console.error('Error marking all as read:', error)
      return { success: false, error: error.message }
    }
  }

  // Delete multiple notifications
  const deleteNotifications = async (notificationIds) => {
    if (!notificationIds || !notificationIds.length) {
      return { success: false, error: 'No notification IDs provided' }
    }

    try {
      const updates = {}

      // Create batch of delete operations
      notificationIds.forEach((id) => {
        updates[`notifications/${id}`] = null
      })

      // Execute batch delete
      await update(dbRef(rtdb), updates)

      // Update local state by removing the deleted notifications
      notifications.value = notifications.value.filter(
        (notification) => !notificationIds.includes(notification.id),
      )

      return { success: true }
    } catch (err) {
      console.error('Error deleting notifications:', err)
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  // Format timestamp into human-readable "time ago" format
  const getTimeElapsed = (timestamp) => {
    if (!timestamp) return 'Tidak diketahui'

    const now = new Date()
    const notifTime = new Date(timestamp)
    const diffInSeconds = Math.floor((now - notifTime) / 1000)

    if (diffInSeconds < 60) return 'Baru saja'

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} hari yang lalu`

    // Format for older notifications
    return notifTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return {
    notifications,
    loading,
    error,
    createNotification,
    listenToNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotifications, // Add this line
    getTimeElapsed,
  }
})
