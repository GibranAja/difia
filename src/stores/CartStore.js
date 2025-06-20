import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/config/firebase'
import {
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  doc,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { useAuthStore } from './AuthStore'
import { useToast } from 'vue-toastification'

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref([])
  const loading = ref(false)
  const error = ref(null)
  const toast = useToast()
  const authStore = useAuthStore()

  // Fetch cart items for current user
  const fetchCartItems = async () => {
    try {
      loading.value = true
      error.value = null

      const cartQuery = query(
        collection(db, 'cart'),
        where('userId', '==', authStore.currentUser?.id),
      )

      const snapshot = await getDocs(cartQuery)
      cartItems.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      return cartItems.value
    } catch (err) {
      error.value = err.message
      toast.error('Failed to fetch cart items')
      return null
    } finally {
      loading.value = false
    }
  }

  // Add item to cart
  const addToCart = async (cartItem) => {
    try {
      loading.value = true
      error.value = null

      // Use the quantity from custom view, with minimum validation
      const minQuantity = cartItem.customOptions.purchaseType === 'Satuan' ? 1 : 20
      const quantity = Math.max(cartItem.quantity || minQuantity, minQuantity)

      // Create a sanitized version of customOptions to avoid Firestore errors
      const sanitizedOptions = {
        priceType: cartItem.customOptions.priceType,
        bahanLuar: cartItem.customOptions.bahanLuar,
        bahanDalam: cartItem.customOptions.bahanDalam,
        aksesoris: cartItem.customOptions.aksesoris,
        color: cartItem.customOptions.color,
        purchaseType: cartItem.customOptions.purchaseType,
        budgetPrice: cartItem.customOptions.budgetPrice,
        note: cartItem.customOptions.note,
        // CRITICAL: Pastikan logo PDF tersimpan dengan benar
        uploadedLogo: cartItem.customOptions.uploadedLogo || null,
        // Keep metadata for reference and debugging
        hasLogo: cartItem.customOptions.uploadedLogo ? true : false,
        logoFileName: cartItem.customOptions.uploadedLogo
          ? `logo_${Date.now()}_${authStore.currentUser?.id?.substring(0, 5)}`
          : null,
      }

      const newItem = {
        userId: authStore.currentUser?.id,
        productId: cartItem.productId,
        name: cartItem.name,
        image: cartItem.image,
        price: cartItem.price,
        quantity: quantity,
        customOptions: sanitizedOptions,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      // Enhanced validation with specific logo check
      if (
        !newItem.customOptions.bahanLuar ||
        !newItem.customOptions.bahanDalam ||
        !newItem.customOptions.aksesoris
      ) {
        throw new Error('Mohon lengkapi semua detail produk')
      }

      // CRITICAL: Validasi logo untuk tipe Souvenir
      if (
        newItem.customOptions.purchaseType === 'Souvenir' &&
        !newItem.customOptions.uploadedLogo
      ) {
        throw new Error('Logo PDF wajib diupload untuk pembelian tipe Souvenir')
      }

      const docRef = await addDoc(collection(db, 'cart'), newItem)

      // Simpan ke state lokal dengan data lengkap
      cartItems.value.push({
        id: docRef.id,
        ...newItem,
      })

      toast.success('Item berhasil ditambahkan ke keranjang')
      return { success: true }
    } catch (err) {
      error.value = err.message
      console.error('Error adding item to cart:', err)
      toast.error('Gagal menambahkan item: ' + err.message)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      loading.value = true
      error.value = null

      await deleteDoc(doc(db, 'cart', itemId))
      cartItems.value = cartItems.value.filter((item) => item.id !== itemId)

      return { success: true }
    } catch (err) {
      error.value = err.message
      toast.error('Failed to remove item from cart')
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Update item quantity
  const updateQuantity = async (itemId, newQuantity) => {
    try {
      loading.value = true
      error.value = null

      const item = cartItems.value.find((item) => item.id === itemId)
      if (!item) throw new Error('Item not found')

      // Validate minimum quantity based on purchase type
      const minQuantity = item.customOptions.purchaseType === 'Satuan' ? 1 : 20
      const quantity = Math.max(newQuantity, minQuantity)

      const cartRef = doc(db, 'cart', itemId)
      await updateDoc(cartRef, { quantity })

      item.quantity = quantity
    } catch (err) {
      error.value = err.message
      toast.error('Failed to update quantity')
    } finally {
      loading.value = false
    }
  }

  // Get cart total
  const getCartTotal = () => {
    return cartItems.value.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)
  }

  // Clear cart
  const clearCart = () => {
    cartItems.value = []
    error.value = null
  }

  return {
    cartItems,
    loading,
    error,
    fetchCartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    clearCart,
  }
})
