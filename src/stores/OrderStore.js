import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/config/firebase'
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  limit,
  where,
  orderBy,
} from 'firebase/firestore'
import { useAuthStore } from './AuthStore'
import { useToast } from 'vue-toastification'
import { useNotificationStore } from './NotificationStore'

export const useOrderStore = defineStore('order', () => {
  const currentOrder = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()
  const toast = useToast()
  const paymentProof = ref(null)
  const newOrdersCount = ref(0)
  const viewedOrders = ref(new Set()) // Track viewed order IDs
  const notificationStore = useNotificationStore()

  // Set current order from CustomView
  const setCurrentOrder = async (orderData) => {
    try {
      if (!orderData) {
        currentOrder.value = null
        return
      }

      // Validasi data yang diperlukan
      if (!orderData.productId || !orderData.price || !orderData.quantity) {
        throw new Error('Invalid order data')
      }

      currentOrder.value = orderData
    } catch (error) {
      console.error('Error setting current order:', error)
      throw error
    }
  }

  // Handle payment proof upload
  const setPaymentProof = async (file) => {
    try {
      // Add file size validation (example: 2MB limit)
      const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB in bytes

      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`Ukuran file tidak boleh lebih dari ${MAX_FILE_SIZE / 1024 / 1024}MB`)
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        paymentProof.value = e.target.result
      }
      reader.readAsDataURL(file)
    } catch (err) {
      toast.error(err.message || 'Failed to process payment proof')
      throw err
    }
  }

  // Create order in Firestore
  const createOrder = async (orderDetails) => {
    try {
      loading.value = true
      error.value = null

      const newOrder = {
        userId: authStore.currentUser?.id,
        productId: currentOrder.value.productId,
        productName: currentOrder.value.name,
        quantity: currentOrder.value.quantity,
        price: currentOrder.value.price,
        totalAmount: orderDetails.finalTotal,
        customOptions: {
          ...currentOrder.value.customOptions,
          note: currentOrder.value.customOptions.note || '',
        },
        shippingDetails: {
          name: orderDetails.name,
          email: orderDetails.email,
          phone: orderDetails.phone,
          address: orderDetails.address,
          destination: orderDetails.destination, // GUNAKAN: destination object
        },
        shippingCost: orderDetails.shippingCost,
        paymentProof: paymentProof.value,
        voucherApplied: orderDetails.voucher || null,
        discountAmount: orderDetails.discountAmount || 0,
        status: 'pending',
        isBulkOrder: currentOrder.value.customOptions.purchaseType === 'Souvenir',
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, 'orders'), newOrder)

      // 1. Create USER notification
      await notificationStore.createNotification({
        title: 'Pesanan Berhasil Dibuat! ✨',
        message: `Pesanan #${docRef.id.slice(-6)} telah dibuat dan menunggu konfirmasi. Kami akan segera memprosesnya!`,
        type: 'order',
        userId: authStore.currentUser?.id, // EKSPLISIT: untuk user
        forAdmin: false, // EKSPLISIT: bukan untuk admin
        orderId: docRef.id,
        icon: 'fas fa-shopping-bag',
        color: '#16a34a',
        link: `/my-account/orders?search=${docRef.id}`,
      })

      // 2. Create ADMIN notification (terpisah dan eksplisit)
      await notificationStore.createNotification({
        title: 'Pesanan Baru Masuk! 🛒',
        message: `Pesanan baru #${docRef.id.slice(-6)} untuk ${currentOrder.value.name} (${currentOrder.value.quantity} pcs) telah masuk.`,
        type: 'order',
        userId: null, // EKSPLISIT: null untuk admin
        forAdmin: true, // EKSPLISIT: untuk admin
        orderId: docRef.id,
        icon: 'fas fa-shopping-bag',
        color: '#0ea5e9',
      })

      // Clear current order and payment proof after successful creation
      currentOrder.value = null
      paymentProof.value = null

      toast.success('Order berhasil dibuat!')
      return { success: true, orderId: docRef.id }
    } catch (err) {
      error.value = err.message
      toast.error('Gagal membuat order: ' + err.message)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Update sendOrderStatusNotification di sekitar baris 188-215
  const sendOrderStatusNotification = async (orderId, status, userId) => {
    let userNotifData = {
      userId: userId,
      orderId: orderId,
      type: 'order',
      forAdmin: false, // EKSPLISIT: untuk user
    }

    let adminNotifData = {
      userId: null,
      orderId: orderId,
      type: 'order',
      forAdmin: true, // EKSPLISIT: untuk admin
    }

    // Create user notification data
    switch (status) {
      case 'process':
        userNotifData = {
          ...userNotifData,
          title: 'Pesanan Diproses! 🛠️',
          message: `Pesanan #${orderId.slice(-6)} sedang diproses dengan penuh kehati-hatian. Kami memastikan kualitas terbaik untuk Anda!`,
          icon: 'fas fa-cog',
          color: '#0ea5e9',
        }
        // Tidak perlu admin notification untuk process
        break
      case 'delivery':
        userNotifData = {
          ...userNotifData,
          title: 'Pesanan Dikirim! 🚚',
          message: `Kabar gembira! Pesanan #${orderId.slice(-6)} sedang dalam perjalanan ke alamat Anda. Siap-siap untuk menerima produk istimewa kami!`,
          icon: 'fas fa-truck',
          color: '#9333ea',
        }
        // Tidak perlu admin notification untuk delivery
        break
      case 'complete':
        userNotifData = {
          ...userNotifData,
          title: 'Pesanan Selesai! 🎉',
          message: `Terima kasih! Pesanan #${orderId.slice(-6)} telah selesai. Bagaimana pengalaman berbelanja Anda? Kami menunggu pesanan berikutnya!`,
          icon: 'fas fa-check-circle',
          color: '#16a34a',
        }
        adminNotifData = {
          ...adminNotifData,
          title: 'Pesanan Selesai ✅',
          message: `Pesanan #${orderId.slice(-6)} telah dikonfirmasi selesai oleh pelanggan.`,
          icon: 'fas fa-check-circle',
          color: '#16a34a',
        }
        break
      case 'cancelled':
        userNotifData = {
          ...userNotifData,
          title: 'Pesanan Dibatalkan',
          message: `Pesanan #${orderId.slice(-6)} telah dibatalkan. Jika ini tidak sesuai harapan Anda, mohon hubungi kami untuk klarifikasi.`,
          icon: 'fas fa-times-circle',
          color: '#dc2626',
        }
        adminNotifData = {
          ...adminNotifData,
          title: 'Pesanan Dibatalkan ❌',
          message: `Pesanan #${orderId.slice(-6)} telah dibatalkan oleh admin.`,
          icon: 'fas fa-times-circle',
          color: '#dc2626',
        }
        break
      default:
        return
    }

    // Send user notification
    await notificationStore.createNotification(userNotifData)

    // Send admin notification untuk status tertentu
    if (status === 'cancelled' || status === 'complete') {
      await notificationStore.createNotification(adminNotifData)
    }
  }

  // Get user orders
  const getUserOrders = async () => {
    try {
      loading.value = true
      const ordersRef = collection(db, 'orders')
      const q = query(
        ordersRef,
        where('userId', '==', authStore.currentUser?.id),
        orderBy('createdAt', 'desc'),
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (err) {
      error.value = err.message
      toast.error('Failed to fetch orders')
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchOrders = async (limit = 500) => {
    try {
      loading.value = true
      error.value = null

      const ordersRef = collection(db, 'orders')
      const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(limit))

      const snapshot = await getDocs(q)
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      return orders
    } catch (err) {
      error.value = err.message
      toast.error('Failed to fetch orders')
      return []
    } finally {
      loading.value = false
    }
  }

  // Add this function to your OrderStore
  const fetchAllOrders = async (limitCount = 500) => {
    try {
      loading.value = true
      error.value = null

      const ordersRef = collection(db, 'orders')
      const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(limitCount))

      const snapshot = await getDocs(q)
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      return orders
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch orders:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const setNewOrdersCount = (orders) => {
    // Only count orders that haven't been viewed
    const newCount = orders.filter((order) => !viewedOrders.value.has(order.id)).length
    newOrdersCount.value = newCount
  }

  const markOrderAsViewed = (orderId) => {
    viewedOrders.value.add(orderId)
  }

  const resetNewOrdersCount = () => {
    newOrdersCount.value = 0
  }

  return {
    currentOrder,
    loading,
    error,
    paymentProof,
    setCurrentOrder,
    setPaymentProof,
    createOrder,
    getUserOrders,
    fetchOrders, // Add this line
    fetchAllOrders,
    newOrdersCount,
    setNewOrdersCount,
    markOrderAsViewed,
    resetNewOrdersCount,
    sendOrderStatusNotification,
  }
})
