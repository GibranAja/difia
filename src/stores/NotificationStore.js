// src/stores/NotificationStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, rtdb } from '@/config/firebase'
import {
  ref as dbRef,
  onValue,
  push,
  serverTimestamp as rtdbServerTimestamp,
  update,
} from 'firebase/database'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { useAuthStore } from './AuthStore'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()

  // Get unread notifications count
  const getUnreadCount = computed(() => {
    return notifications.value.filter((notification) => !notification.read).length
  })

  // Get user-specific notifications
  const userNotifications = computed(() => {
    return notifications.value
      .filter(
        (notification) =>
          notification.type === 'global' || notification.userId === authStore.currentUser?.id,
      )
      .sort((a, b) => b.timestamp - a.timestamp)
  })

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
        read: false,
        timestamp: rtdbServerTimestamp(),
      }

      await push(notificationRef, notification)
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
      const userId = authStore.currentUser?.id
      if (!userId) return { success: false, error: 'User not authenticated' }

      const userNotifs = notifications.value.filter(
        (n) => n.userId === userId || n.type === 'global',
      )

      const updates = {}
      userNotifs.forEach((notification) => {
        if (!notification.read) {
          updates[`notifications/${notification.id}/read`] = true
        }
      })

      if (Object.keys(updates).length > 0) {
        await update(dbRef(rtdb), updates)
      }

      // Update local state
      notifications.value = notifications.value.map((n) => {
        if (n.userId === userId || n.type === 'global') {
          return { ...n, read: true }
        }
        return n
      })

      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  // Set up listener for notifications
  const listenToNotifications = () => {
    const userId = authStore.currentUser?.id
    if (!userId) return

    loading.value = true

    const notificationsRef = dbRef(rtdb, 'notifications')

    onValue(
      notificationsRef,
      (snapshot) => {
        loading.value = false
        const data = snapshot.val() || {}

        const notificationArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
          // Convert Firebase timestamp to JS Date if needed
          timestamp: data[key].timestamp ? new Date(data[key].timestamp) : new Date(),
        }))

        // Filter to only include global notifications and user-specific ones
        notifications.value = notificationArray.filter(
          (n) => n.type === 'global' || n.userId === userId,
        )

        // Calculate unread count
        unreadCount.value = notifications.value.filter((n) => !n.read).length
      },
      (err) => {
        loading.value = false
        error.value = err.message
      },
    )
  }

  // Get time elapsed since notification
  const getTimeElapsed = (timestamp) => {
    if (!timestamp) return 'Just now'

    const now = new Date()
    const notifTime = timestamp instanceof Date ? timestamp : new Date(timestamp)
    const diffInMinutes = Math.floor((now - notifTime) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60)
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`

    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`

    return notifTime.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return {
    notifications,
    unreadCount,
    loading,
    error,
    userNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    listenToNotifications,
    getTimeElapsed,
    getUnreadCount,
  }
})
