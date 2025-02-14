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
} from 'firebase/firestore'

export const useVoucherStore = defineStore('voucher', () => {
  const voucherItems = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Cache mechanism
  const cache = {
    data: new Map(),
    timestamp: new Map(),
    maxAge: 30 * 60 * 1000, // 30 minutes cache

    set(key, value) {
      this.data.set(key, value)
      this.timestamp.set(key, Date.now())

      // Persist to localStorage as backup
      try {
        localStorage.setItem(
          'voucher_cache',
          JSON.stringify({
            data: Array.from(this.data.entries()),
            timestamp: Array.from(this.timestamp.entries()),
          }),
        )
      } catch (e) {
        console.warn('LocalStorage write failed:', e)
      }
    },

    get(key) {
      // Try to load from localStorage first if cache is empty
      if (this.data.size === 0) {
        try {
          const cached = localStorage.getItem('voucher_cache')
          if (cached) {
            const { data, timestamp } = JSON.parse(cached)
            this.data = new Map(data)
            this.timestamp = new Map(timestamp)
          }
        } catch (e) {
          console.warn('LocalStorage read failed:', e)
        }
      }

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
      localStorage.removeItem('voucher_cache')
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

  // Fetch vouchers with caching
  const fetchVouchers = async () => {
    try {
      // Check cache first
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
  const validateVoucher = async (code) => {
    try {
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

      return { success: true, voucher }
    } catch (err) {
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

  return {
    voucherItems,
    isLoading,
    error,
    addVoucher,
    fetchVouchers,
    deleteVoucher,
    validateVoucher,
    updateVoucher,
  }
})
