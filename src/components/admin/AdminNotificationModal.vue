<template>
  <div class="notification-modal-overlay" v-if="isOpen" @click.self="$emit('close')">
    <div class="notification-modal">
      <div class="modal-header">
        <h3>Notifikasi</h3>
        <div class="header-actions">
          <button
            class="mark-all-btn"
            @click="handleMarkAllAsRead"
            :disabled="loading || !hasUnread"
          >
            <i class="fas fa-check-double"></i>
            Tandai Semua Dibaca
          </button>
          <button class="close-btn" @click="$emit('close')">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-container" v-if="loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Memuat notifikasi...</p>
      </div>

      <!-- Empty State -->
      <div class="empty-state" v-else-if="adminNotifications.length === 0">
        <i class="fas fa-bell-slash"></i>
        <h3>Tidak Ada Notifikasi</h3>
        <p>Saat ini tidak ada notifikasi baru.</p>
      </div>

      <!-- Notification List -->
      <div class="notification-list" v-else>
        <div
          v-for="notification in adminNotifications"
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/stores/NotificationStore'
import { useAuthStore } from '@/stores/AuthStore'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])
const router = useRouter()
const toast = useToast()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()

// State
const loading = ref(true)
const loadingMore = ref(false)
const limit = ref(10)
const canLoadMore = ref(false)
let unsubscribe = null

// Explicitly set admin status
if (!authStore.isAdmin) {
  authStore.setAdminStatus(true)
}

// Computed properties
const adminNotifications = computed(() => {
  // Filter for notifications that have forAdmin=true
  return notificationStore.notifications
    .filter(notification => {
      // Only include notifications explicitly marked for admin
      return notification.forAdmin === true && 
             // Exclude any notifications that might have a userId (these are user-specific)
             (notification.userId === null || notification.userId === undefined)
    })
    .slice(0, limit.value)
})

const hasUnread = computed(() => {
  return adminNotifications.value.some((notification) => !notification.read)
})

// Methods
const loadMoreNotifications = () => {
  loadingMore.value = true
  limit.value += 10

  setTimeout(() => {
    loadingMore.value = false
    canLoadMore.value = limit.value < notificationStore.notifications.length
  }, 500)
}

const handleMarkAllAsRead = async () => {
  try {
    await notificationStore.markAllAsRead()
    toast.success('Semua notifikasi telah ditandai sebagai dibaca')
  } catch (error) {
    console.error('Error marking all as read:', error)
    toast.error('Gagal menandai semua notifikasi sebagai dibaca')
  }
}

const handleNotificationClick = async (notification) => {
  try {
    // Mark as read if unread
    if (!notification.read) {
      await notificationStore.markAsRead(notification.id)
    }

    // Navigate based on notification type
    if (notification.link) {
      router.push(notification.link)
      emit('close')
    } else if (notification.orderId) {
      router.push(`/admin/order?id=${notification.orderId}`)
      emit('close')
    }
  } catch (error) {
    console.error('Error handling notification:', error)
  }
}

const getIconClass = (type) => {
  const typeMap = {
    order: 'icon-order',
    system: 'icon-system',
    refund: 'icon-refund',
  }
  return typeMap[type] || 'icon-system'
}

// Lifecycle hooks
onMounted(() => {
  // Set admin status
  authStore.setAdminStatus(true)

  // Set up real-time listener for notifications
  unsubscribe = notificationStore.listenToNotifications()

  // Turn off loading after a short delay
  setTimeout(() => {
    loading.value = false
    canLoadMore.value = limit.value < notificationStore.notifications.length
  }, 1000)
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<style scoped>
.notification-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  z-index: 100;
}

.notification-modal {
  width: 400px;
  max-height: calc(100vh - 80px);
  margin-top: 64px; /* Height of navbar */
  margin-right: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #edf2f7;
  background: #f8fafc;
}

.modal-header h3 {
  font-size: 18px;
  color: #1e293b;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mark-all-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 4px;
}

.mark-all-btn:hover {
  background: #eff6ff;
}

.mark-all-btn:disabled {
  color: #94a3b8;
  cursor: not-allowed;
  background: none;
}

.close-btn {
  background: none;
  border: none;
  color: #64748b;
  padding: 6px;
  cursor: pointer;
  border-radius: 4px;
}

.close-btn:hover {
  background: #f1f5f9;
}

.notification-list {
  overflow-y: auto;
  max-height: 70vh;
  padding: 0;
}

.loading-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #64748b;
}

.loading-container i,
.empty-state i {
  font-size: 32px;
  margin-bottom: 16px;
  color: #94a3b8;
}

.notification-card {
  display: flex;
  padding: 16px 20px;
  border-bottom: 1px solid #edf2f7;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.notification-card:hover {
  background: #f8fafc;
}

.notification-card.unread {
  background: #f0f9ff;
}

.notification-card.unread:hover {
  background: #e0f2fe;
}

.notification-card.unread::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 24px;
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
  margin-right: 16px;
  flex-shrink: 0;
}

.icon-order {
  background-color: #ebf7ee;
  color: #16a34a;
}

.icon-system {
  background-color: #f1f5f9;
  color: #64748b;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-content h3 {
  font-size: 15px;
  color: #1e293b;
  margin: 0 0 4px;
  font-weight: 500;
}

.notification-content p {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 8px;
  line-height: 1.4;
}

.notification-time {
  font-size: 12px;
  color: #94a3b8;
}

.go-icon {
  display: flex;
  align-items: center;
  color: #cbd5e1;
  margin-left: 12px;
}

.view-more-container {
  padding: 16px;
  text-align: center;
}

.view-more-btn {
  background: none;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.view-more-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.view-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
