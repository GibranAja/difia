import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/config/firebase'
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { useAuthStore } from './AuthStore'
import { useToast } from 'vue-toastification'

export const useOrderStore = defineStore('order', () => {
  const currentOrder = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()
  const toast = useToast()
  const paymentProof = ref(null)
  const newOrdersCount = ref(0)
  const viewedOrders = ref(new Set()) // Track viewed order IDs

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
          ...currentOrder.value.customOptions, // Spread operator untuk menyertakan semua customOptions
          note: currentOrder.value.customOptions.note || '', // Pastikan note ada
        },
        shippingDetails: {
          name: orderDetails.name,
          email: orderDetails.email,
          phone: orderDetails.phone,
          address: orderDetails.address,
          province: orderDetails.province,
          city: orderDetails.city,
          zip: orderDetails.zip,
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
    newOrdersCount,
    setNewOrdersCount,
    markOrderAsViewed,
    resetNewOrdersCount,
  }
})
