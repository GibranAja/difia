// stores/VoucherStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/config/firebase'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  where,
  updateDoc,
  getDoc,
} from 'firebase/firestore'

export const useVoucherStore = defineStore('voucher', () => {
  const voucherItems = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // In-memory cache mechanism (no localStorage)
  const cache = {
    data: new Map(),
    timestamp: new Map(),
    maxAge: 30 * 60 * 1000, // 30 minutes cache

    set(key, value) {
      this.data.set(key, value)
      this.timestamp.set(key, Date.now())
      // Removed localStorage code
    },

    get(key) {
      const timestamp = this.timestamp.get(key)
      if (!timestamp) return null

      if (Date.now() - timestamp > this.maxAge) {
        this.clear(key)
        return null
      }

      return this.data.get(key)
    },

    clear(key) {
      this.data.delete(key)
      this.timestamp.delete(key)
      // Removed localStorage code
    },
  }

  // Add new voucher
  const addVoucher = async (voucherData) => {
    try {
      isLoading.value = true
      error.value = null

      // Validate code uniqueness
      const existingVoucher = voucherItems.value.find(
        (v) => v.code.toLowerCase() === voucherData.code.toLowerCase(),
      )
      if (existingVoucher) {
        throw new Error('Kode voucher sudah digunakan')
      }

      const newVoucher = {
        code: voucherData.code.toUpperCase(),
        discountType: voucherData.discountType, // 'percentage' or 'fixed'
        discountValue: Number(voucherData.discountValue),
        validUntil: voucherData.validUntil,
        maxUses: Number(voucherData.maxUses),
        currentUses: 0,
        isActive: true,
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, 'vouchers'), newVoucher)

      // Update local state with the new voucher
      const voucherWithId = { id: docRef.id, ...newVoucher }
      voucherItems.value.unshift(voucherWithId)

      // Update cache
      cache.set('vouchers', voucherItems.value)

      return { success: true, id: docRef.id }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Fetch vouchers without using localStorage cache
  const fetchVouchers = async () => {
    try {
      // Check in-memory cache first
      const cached = cache.get('vouchers')
      if (cached) {
        voucherItems.value = cached
        return { success: true }
      }

      isLoading.value = true
      error.value = null

      const q = query(collection(db, 'vouchers'), orderBy('createdAt', 'desc'))

      const snapshot = await getDocs(q)
      voucherItems.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      // Update in-memory cache only
      cache.set('vouchers', voucherItems.value)

      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Delete voucher
  const deleteVoucher = async (id) => {
    try {
      isLoading.value = true
      error.value = null

      await deleteDoc(doc(db, 'vouchers', id))

      // Update local state
      voucherItems.value = voucherItems.value.filter((v) => v.id !== id)

      // Update cache
      cache.set('vouchers', voucherItems.value)

      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Validate and apply voucher
  const validateVoucher = async (code, purchaseType, userId) => {
    try {
      console.log('Validating voucher for purchase type:', purchaseType) // Debug log

      // Check if purchase type is Souvenir
      if (purchaseType !== 'Souvenir') {
        throw new Error('Voucher hanya berlaku untuk pembelian tipe Souvenir')
      }

      const q = query(
        collection(db, 'vouchers'),
        where('code', '==', code.toUpperCase()),
        where('isActive', '==', true),
      )

      const snapshot = await getDocs(q)
      if (snapshot.empty) {
        throw new Error('Voucher tidak ditemukan')
      }

      const voucher = {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      }

      // Check validity
      if (new Date(voucher.validUntil) < new Date()) {
        throw new Error('Voucher sudah kadaluarsa')
      }

      if (voucher.currentUses >= voucher.maxUses) {
        throw new Error('Voucher sudah mencapai batas penggunaan')
      }

      // Check if user has used this voucher before
      const usageQuery = query(
        collection(db, 'voucher_usage'),
        where('userId', '==', userId),
        where('voucherId', '==', voucher.id),
      )

      const usageSnapshot = await getDocs(usageQuery)
      if (!usageSnapshot.empty) {
        throw new Error('Anda sudah pernah menggunakan voucher ini')
      }

      return { success: true, voucher }
    } catch (err) {
      console.error('Voucher validation failed:', err.message) // Debug log
      return { success: false, error: err.message }
    }
  }

  // Update voucher
  const updateVoucher = async (id, voucherData) => {
    try {
      isLoading.value = true
      error.value = null

      const voucherRef = doc(db, 'vouchers', id)

      const updatePayload = {
        discountType: voucherData.discountType,
        discountValue: Number(voucherData.discountValue),
        validUntil: voucherData.validUntil,
        maxUses: Number(voucherData.maxUses),
        updatedAt: serverTimestamp(),
      }

      await updateDoc(voucherRef, updatePayload)

      // Update local state
      const index = voucherItems.value.findIndex((v) => v.id === id)
      if (index !== -1) {
        voucherItems.value[index] = {
          ...voucherItems.value[index],
          ...updatePayload,
        }
      }

      // Update cache
      cache.set('vouchers', voucherItems.value)

      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Update voucher usage
  const updateVoucherUsage = async (voucherId, userId) => {
    try {
      const voucherRef = doc(db, 'vouchers', voucherId)
      const voucherDoc = await getDoc(voucherRef)

      if (!voucherDoc.exists()) {
        throw new Error('Voucher tidak ditemukan')
      }

      const voucherData = voucherDoc.data()
      const newUsage = voucherData.currentUses + 1

      // Cek apakah sudah mencapai batas
      if (newUsage > voucherData.maxUses) {
        throw new Error('Voucher sudah mencapai batas penggunaan')
      }

      // Add record to voucher_usage collection
      await addDoc(collection(db, 'voucher_usage'), {
        userId: userId,
        voucherId: voucherId,
        usedAt: serverTimestamp(),
      })

      // Update penggunaan voucher
      await updateDoc(voucherRef, {
        currentUses: newUsage,
        isActive: newUsage < voucherData.maxUses,
      })

      // Update local state
      const index = voucherItems.value.findIndex((v) => v.id === voucherId)
      if (index !== -1) {
        voucherItems.value[index] = {
          ...voucherItems.value[index],
          currentUses: newUsage,
          isActive: newUsage < voucherData.maxUses,
        }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  return {
    voucherItems,
    isLoading,
    error,
    addVoucher,
    fetchVouchers,
    deleteVoucher,
    validateVoucher,
    updateVoucher,
    updateVoucherUsage,
  }
})
