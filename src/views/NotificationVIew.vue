<template>
  <div class="notification-page">
    <NavigationBar />

    <main class="notification-container">
      <div class="notification-header">
        <h1>Notifikasi</h1>
        <button v-if="notifications.length" class="mark-all-btn" @click="markAllAsRead">
          <i class="fas fa-check-double"></i> Tandai Semua Terbaca
        </button>
      </div>

      <div v-if="isLoading" class="loading-container">
        <i class="fas fa-circle-notch fa-spin"></i>
        <span>Memuat notifikasi...</span>
      </div>

      <div v-else-if="notifications.length === 0" class="empty-state">
        <i class="fas fa-bell-slash"></i>
        <h3>Belum Ada Notifikasi</h3>
        <p>Kami akan memberitahu ketika ada berita menarik untuk Anda!</p>
        <router-link to="/" class="browse-btn">Jelajahi Katalog</router-link>
      </div>

      <div v-else class="notification-list">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-card"
          :class="{ unread: !notification.read }"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon" :class="getNotificationClass(notification.type)">
            <i :class="getNotificationIcon(notification.type)"></i>
          </div>
          <div class="notification-content">
            <h3>{{ notification.title }}</h3>
            <p v-html="notification.message"></p>
            <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
          </div>
          <i class="fas fa-chevron-right go-icon"></i>
        </div>
      </div>

      <div v-if="notifications.length > 5" class="view-more-container">
        <button class="view-more-btn" @click="loadMoreNotifications">
          Lihat Notifikasi Lainnya
        </button>
      </div>
    </main>

    <FooterComponent />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  doc,
  updateDoc,
  addDoc,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from '@/stores/AuthStore'
import { useNotificationStore } from '@/stores/NotificationStore'
import { useToast } from 'vue-toastification'
import NavigationBar from '@/components/NavigationBar.vue'
import FooterComponent from '@/components/FooterComponent.vue'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const toast = useToast()

const notifications = ref([])
const isLoading = ref(true)
let unsubscribe = null
let orderUnsubscribe = null
const notificationsLimit = ref(10)

// Update the fetchNotifications function
const fetchNotifications = async () => {
  if (!authStore.currentUser?.id) {
    console.log('No user ID found, skipping notification fetch')
    isLoading.value = false
    return
  }

  try {
    console.log('Fetching notifications for user:', authStore.currentUser.id)

    const notificationsRef = collection(db, 'notifications')
    const notificationsQuery = query(
      notificationsRef,
      where('userId', '==', authStore.currentUser.id),
      orderBy('createdAt', 'desc'),
      limit(notificationsLimit.value),
    )

    unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        console.log(`Snapshot received with ${snapshot.docs.length} notifications`)

        notifications.value = snapshot.docs.map((doc) => {
          const data = doc.data()
          // Ensure createdAt is properly handled
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt, // Keep the Firestore timestamp
          }
        })

        console.log('Notifications loaded:', notifications.value.length)
        isLoading.value = false
      },
      (error) => {
        console.error('Error in notification snapshot listener:', error)
        isLoading.value = false
      },
    )

    // Set up order status change listener to create notifications in real-time
    listenForOrderStatusChanges()
  } catch (error) {
    console.error('Error setting up notification listeners:', error)
    toast.error('Gagal memuat notifikasi')
    isLoading.value = false
  }
}

// Listen for order status changes and create notifications
const listenForOrderStatusChanges = () => {
  if (!authStore.currentUser?.id) return

  const ordersRef = collection(db, 'orders')
  const ordersQuery = query(ordersRef, where('userId', '==', authStore.currentUser.id))

  // Create a map to store the last known status of each order
  const orderStatusMap = new Map()

  orderUnsubscribe = onSnapshot(ordersQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const order = { id: change.doc.id, ...change.doc.data() }

      // For new orders, just store their initial status
      if (change.type === 'added') {
        orderStatusMap.set(order.id, order.status)
        return
      }

      // For modified orders, check if status has changed
      if (change.type === 'modified') {
        const previousStatus = orderStatusMap.get(order.id)

        // Only create notification if status has actually changed
        if (previousStatus && previousStatus !== order.status) {
          console.log(`Order ${order.id} status changed from ${previousStatus} to ${order.status}`)

          // Create notification with the accurate previous status
          createStatusUpdateNotification(order, previousStatus)
        }

        // Update status map with the new status
        orderStatusMap.set(order.id, order.status)
      }
    })
  })
}

// Create notification for order status changes
const createStatusUpdateNotification = async (order, oldStatus) => {
  if (!order || !oldStatus) return

  // Only create notification if the status has actually changed
  if (oldStatus === order.status) return

  console.log(`Creating notification for order ${order.id}: ${oldStatus} -> ${order.status}`)

  try {
    // Make sure we're using server timestamp for proper ordering
    const notificationData = {
      userId: authStore.currentUser.id,
      type: getNotificationTypeForStatus(order.status),
      title: getNotificationTitleForStatus(order.status),
      message: getNotificationMessageForStatus(order.status, order.id),
      read: false,
      createdAt: new Date(), // This should be converted to Firestore timestamp when saved
      data: {
        orderId: order.id,
        oldStatus: oldStatus,
        newStatus: order.status,
      },
    }

    // Log the data we're about to save
    console.log('Creating notification with data:', notificationData)

    const docRef = await addDoc(collection(db, 'notifications'), notificationData)
    console.log('Notification created with ID:', docRef.id)

    // Increment unread count after successful creation
    notificationStore.incrementUnreadCount()
  } catch (error) {
    console.error('Error creating notification:', error)
  }
}

// Get notification type based on order status
const getNotificationTypeForStatus = (status) => {
  switch (status) {
    case 'process':
      return 'order'
    case 'delivery':
      return 'delivery'
    case 'complete':
      return 'order'
    case 'cancelled':
      return 'system'
    default:
      return 'order'
  }
}

// Get notification title based on order status
const getNotificationTitleForStatus = (status) => {
  switch (status) {
    case 'process':
      return 'Pesanan Diproses! 🎉'
    case 'delivery':
      return 'Pesanan Dalam Pengiriman! 🚚'
    case 'complete':
      return 'Pesanan Selesai! 🌟'
    case 'cancelled':
      return 'Pesanan Dibatalkan'
    default:
      return 'Update Pesanan'
  }
}

// Get notification message based on order status
const getNotificationMessageForStatus = (status, orderId) => {
  switch (status) {
    case 'process':
      return `Kabar gembira! Pesanan #${orderId.slice(-5)} sedang diproses dengan penuh perhatian oleh tim kami. Kami akan segera menyiapkan souvenir istimewa Anda!`
    case 'delivery':
      return `Pesanan #${orderId.slice(-5)} sedang dalam perjalanan menuju Anda! Bersiaplah untuk mendapatkan souvenir istimewa yang Anda pesan. Kami harap Anda menyukainya! 😊`
    case 'complete':
      return `Horee! Pesanan #${orderId.slice(-5)} telah selesai. Terima kasih telah mempercayai kami! Bagaimana kesan Anda? Kami akan senang jika Anda berbagi pengalaman Anda.`
    case 'cancelled':
      return `Pesanan #${orderId.slice(-5)} telah dibatalkan. Jangan khawatir, Anda masih bisa memesan souvenir lain yang tak kalah menarik di katalog kami!`
    default:
      return `Status pesanan #${orderId.slice(-5)} telah diperbarui. Klik untuk melihat detail.`
  }
}

// Load more notifications
const loadMoreNotifications = () => {
  notificationsLimit.value += 10
  fetchNotifications()
}

// Format timestamp to relative time
const formatTime = (timestamp) => {
  if (!timestamp) return ''

  const now = new Date()
  const notificationDate = timestamp.toDate()
  const diffInSeconds = Math.floor((now - notificationDate) / 1000)

  if (diffInSeconds < 60) {
    return 'Baru saja'
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)} menit yang lalu`
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`
  } else if (diffInSeconds < 604800) {
    return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`
  } else {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(notificationDate)
  }
}

// Get notification icon based on type
const getNotificationIcon = (type) => {
  const icons = {
    order: 'fas fa-shopping-bag',
    voucher: 'fas fa-ticket-alt',
    payment: 'fas fa-credit-card',
    delivery: 'fas fa-truck',
    system: 'fas fa-bell',
    promo: 'fas fa-percent',
  }
  return icons[type] || 'fas fa-bell'
}

// Get notification class based on type
const getNotificationClass = (type) => {
  return `icon-${type}`
}

// Handle notification click
const handleNotificationClick = async (notification) => {
  // Mark notification as read
  if (!notification.read) {
    await updateDoc(doc(db, 'notifications', notification.id), {
      read: true,
    })
    notificationStore.decrementUnreadCount()
  }

  // Navigate based on notification type and data
  if (notification.type === 'order') {
    if (notification.data?.orderId) {
      router.push(`/account/orders?highlight=${notification.data.orderId}`)
    } else {
      router.push('/account/orders')
    }
  } else if (notification.type === 'voucher') {
    router.push('/')
  } else if (notification.type === 'payment') {
    if (notification.data?.orderId) {
      router.push(`/account/orders?highlight=${notification.data.orderId}`)
    } else {
      router.push('/account/orders')
    }
  } else if (notification.type === 'delivery') {
    if (notification.data?.orderId) {
      router.push(`/account/orders?highlight=${notification.data.orderId}`)
    } else {
      router.push('/account/orders')
    }
  } else if (notification.type === 'promo') {
    router.push('/catalog')
  } else {
    // Default action for other notification types
    if (notification.data?.url) {
      router.push(notification.data.url)
    } else if (notification.data?.orderId) {
      router.push(`/account/orders?highlight=${notification.data.orderId}`)
    }
  }
}

// Mark all notifications as read
const markAllAsRead = async () => {
  try {
    const batch = db.batch()

    notifications.value.forEach((notification) => {
      if (!notification.read) {
        const notificationRef = doc(db, 'notifications', notification.id)
        batch.update(notificationRef, { read: true })
      }
    })

    await batch.commit()
    notificationStore.resetUnreadCount()
    toast.success('Semua notifikasi telah ditandai terbaca')
  } catch (error) {
    console.error('Error marking notifications as read:', error)
    toast.error('Gagal menandai notifikasi sebagai terbaca')
  }
}

// Debug notification system
const debugNotificationSystem = () => {
  console.log('Checking notification system...')
  console.log('Current user:', authStore.currentUser?.id)
  console.log('Notifications loaded:', notifications.value.length)
  console.log('Order listener active:', orderUnsubscribe !== null)

  // Test creating a manual notification
  if (authStore.isLoggedIn) {
    const testNotification = {
      userId: authStore.currentUser.id,
      type: 'system',
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working.',
      read: false,
      createdAt: new Date(),
      data: {},
    }

    addDoc(collection(db, 'notifications'), testNotification)
      .then(() => console.log('Test notification created successfully'))
      .catch((err) => console.error('Failed to create test notification:', err))
  }
}

onMounted(() => {
  if (authStore.isLoggedIn) {
    fetchNotifications()
    // Uncomment the line below to test the notification system
    // debugNotificationSystem()
  } else {
    isLoading.value = false
  }
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
  if (orderUnsubscribe) {
    orderUnsubscribe()
  }
})
</script>

<style scoped>
.notification-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

.notification-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
  flex: 1;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.notification-header h1 {
  font-size: 1.75rem;
  color: #02163b;
  margin: 0;
  font-weight: 600;
  font-family: 'Montserrat', sans-serif;
}

.mark-all-btn {
  background: transparent;
  border: none;
  color: #e8ba38;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: color 0.2s;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
}

.mark-all-btn:hover {
  color: #d5a832;
  background-color: rgba(232, 186, 56, 0.1);
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notification-card {
  display: flex;
  align-items: flex-start;
  background-color: white;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}

.notification-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.unread {
  background-color: rgba(232, 186, 56, 0.05);
  border-left: 4px solid #e8ba38;
}

.unread::after {
  content: '';
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 8px;
  height: 8px;
  background-color: #e8ba38;
  border-radius: 50%;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 1rem;
  flex-shrink: 0;
}

.icon-order {
  background-color: #ebf7ee;
  color: #16a34a;
}

.icon-voucher {
  background-color: #fff0e1;
  color: #f59e0b;
}

.icon-payment {
  background-color: #e0f2fe;
  color: #0ea5e9;
}

.icon-delivery {
  background-color: #f3e8ff;
  color: #9333ea;
}

.icon-system {
  background-color: #f1f5f9;
  color: #64748b;
}

.icon-promo {
  background-color: #ffe4e6;
  color: #e11d48;
}

.notification-content {
  flex: 1;
  padding-right: 1.5rem;
}

.notification-content h3 {
  font-size: 1rem;
  margin: 0 0 0.25rem 0;
  color: #02163b;
  font-weight: 600;
  font-family: 'Montserrat', sans-serif;
}

.notification-content p {
  margin: 0 0 0.5rem 0;
  color: #555;
  font-size: 0.95rem;
  line-height: 1.4;
}

.notification-time {
  color: #888;
  font-size: 0.8rem;
}

.go-icon {
  color: #ccc;
  margin-left: auto;
  align-self: center;
  transition: transform 0.2s;
}

.notification-card:hover .go-icon {
  transform: translateX(4px);
  color: #e8ba38;
}

.view-more-container {
  text-align: center;
  margin-top: 1.5rem;
}

.view-more-btn {
  background: transparent;
  border: 1px solid #e8ba38;
  color: #e8ba38;
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.view-more-btn:hover {
  background-color: #e8ba38;
  color: white;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.empty-state i {
  font-size: 3rem;
  color: #e8ba38;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: #02163b;
  margin: 0 0 0.5rem 0;
  font-family: 'Montserrat', sans-serif;
}

.empty-state p {
  color: #666;
  margin-bottom: 1.5rem;
}

.browse-btn {
  background-color: #e8ba38;
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.browse-btn:hover {
  background-color: #d5a832;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #888;
  gap: 1rem;
}

.loading-container i {
  font-size: 2rem;
  color: #e8ba38;
}

@media (max-width: 640px) {
  .notification-container {
    margin-top: 1rem;
  }

  .notification-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .notification-card {
    padding: 0.75rem;
  }

  .notification-icon {
    width: 32px;
    height: 32px;
  }

  .notification-content h3 {
    font-size: 0.95rem;
  }

  .notification-content p {
    font-size: 0.85rem;
  }
}
</style>
