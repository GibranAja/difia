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

  // Set current order from CustomView
  const setCurrentOrder = (orderData) => {
    currentOrder.value = orderData
  }

  // Handle payment proof upload
  const setPaymentProof = async (file) => {
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        paymentProof.value = e.target.result
      }
      reader.readAsDataURL(file)
    } catch (err) {
      toast.error('Failed to process payment proof')
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

  return {
    currentOrder,
    loading,
    error,
    paymentProof,
    setCurrentOrder,
    setPaymentProof,
    createOrder,
    getUserOrders,
  }
})
