<template>
  <div class="notification-page">
    <VoucherNotification />
    <NavigationBar />

    <main class="notification-container">
      <!-- Notification Header -->
      <div class="notification-header">
        <h1>Notifikasi</h1>
        <button class="mark-all-btn" @click="handleMarkAllAsRead" :disabled="loading || !hasUnread">
          <i class="fas fa-check-double"></i>
          Tandai Semua Dibaca
        </button>
      </div>

      <!-- Loading State -->
      <div class="loading-container" v-if="loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Memuat notifikasi terbaru...</p>
      </div>

      <!-- Empty State -->
      <div class="empty-state" v-else-if="!userNotifications.length">
        <i class="fas fa-bell-slash"></i>
        <h3>Tidak Ada Notifikasi</h3>
        <p>
          Saat ini Anda belum memiliki notifikasi. Notifikasi akan muncul di sini ketika ada
          pembaruan pesanan atau promo eksklusif untuk Anda.
        </p>
        <router-link to="/" class="browse-btn">Jelajahi Produk</router-link>
      </div>

      <!-- Notification List -->
      <div class="notification-list" v-else>
        <div
          v-for="notification in userNotifications"
          :key="notification.id"
          class="notification-card"
          :class="{ unread: !notification.read }"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon" :class="getIconClass(notification.type)">
            <i :class="notification.icon"></i>
          </div>
          <div class="notification-content">
            <h3>{{ notification.title }}</h3>
            <p>{{ notification.message }}</p>
            <span class="notification-time">{{
              notificationStore.getTimeElapsed(notification.timestamp)
            }}</span>
          </div>
          <span class="go-icon">
            <i class="fas fa-chevron-right"></i>
          </span>
        </div>

        <!-- View More Button -->
        <div class="view-more-container" v-if="canLoadMore">
          <button class="view-more-btn" @click="loadMoreNotifications" :disabled="loadingMore">
            <span v-if="loadingMore"> <i class="fas fa-spinner fa-spin"></i> Memuat... </span>
            <span v-else> Lihat Lebih Banyak </span>
          </button>
        </div>
      </div>
    </main>

    <FooterComponent />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import NavigationBar from '@/components/NavigationBar.vue'
import FooterComponent from '@/components/FooterComponent.vue'
import VoucherNotification from '@/components/VoucherNotification.vue'
import { useNotificationStore } from '@/stores/NotificationStore'
import { useAuthStore } from '@/stores/AuthStore'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const notificationStore = useNotificationStore()
const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const loading = ref(true)
const loadingMore = ref(false)
const notificationsLimit = ref(10)
const canLoadMore = ref(false)

// Computed properties
const userNotifications = computed(() => {
  return notificationStore.userNotifications.slice(0, notificationsLimit.value)
})

const hasUnread = computed(() => {
  return notificationStore.getUnreadCount > 0
})

// Get appropriate icon class based on notification type
const getIconClass = (type) => {
  const typeMap = {
    order: 'icon-order',
    payment: 'icon-payment',
    voucher: 'icon-voucher',
    delivery: 'icon-delivery',
    system: 'icon-system',
    promo: 'icon-promo',
  }
  return typeMap[type] || 'icon-system'
}

// Handle notification click
const handleNotificationClick = async (notification) => {
  try {
    // Mark as read if unread
    if (!notification.read) {
      try {
        // First update local state for better UX responsiveness
        notification.read = true

        // Then try to update in database
        await notificationStore.markAsRead(notification.id).catch((err) => {
          console.error('Database error when marking notification as read:', err)
          // Already updated UI state above, so user won't notice the backend failure
        })
      } catch (markReadError) {
        console.error('Error marking notification as read:', markReadError)
        // UI is already updated, no need to do it again
      }
    }

    // Navigate based on notification type
    if (notification.link) {
      router.push(notification.link)
    } else if (notification.type === 'order' && notification.orderId) {
      router.push(`/my-account/orders?search=${notification.orderId}`)
    } else if (notification.type === 'voucher') {
      toast.info('Voucher siap digunakan di halaman checkout!')
    }
  } catch (error) {
    console.error('Error handling notification click:', error)
    toast.error('Terjadi kesalahan saat memproses notifikasi')
  }
}

// Mark all as read
const handleMarkAllAsRead = async () => {
  try {
    await notificationStore.markAllAsRead()
    toast.success('Semua notifikasi telah ditandai sebagai telah dibaca')
  } catch (error) {
    toast.error('Gagal menandai notifikasi sebagai dibaca')
  }
}

// Load more notifications
const loadMoreNotifications = () => {
  loadingMore.value = true
  // Increase the limit
  notificationsLimit.value += 10

  // Check if we can load more
  setTimeout(() => {
    canLoadMore.value = notificationsLimit.value < notificationStore.userNotifications.length
    loadingMore.value = false
  }, 500)
}

onMounted(async () => {
  loading.value = true

  try {
    // Check auth state
    if (!authStore.currentUser) {
      await new Promise((resolve) => {
        const unsubscribe = authStore.$subscribe(() => {
          if (authStore.currentUser) {
            unsubscribe()
            resolve()
          }
        })
      })
    }

    // Start listening to notifications
    notificationStore.listenToNotifications()

    // Check if we can load more
    setTimeout(() => {
      canLoadMore.value = notificationsLimit.value < notificationStore.userNotifications.length
      loading.value = false
    }, 1000)
  } catch (error) {
    console.error('Error loading notifications:', error)
    loading.value = false
  }
})
</script>

<style scoped>
.notification-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
  padding-top: 40px;
}

.notification-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
  flex: 1;
  padding-top: calc(80px + 2rem);
  padding-bottom: 4rem;
  margin-bottom: 2rem;
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
