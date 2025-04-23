import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/config/firebase'
import { useAuthStore } from '@/stores/AuthStore'
import { collection, doc, addDoc, getDocs, updateDoc, query, where, orderBy } from 'firebase/firestore'
import { useToast } from 'vue-toastification'

export const useAddressStore = defineStore('address', () => {
  const addresses = ref([])
  const loading = ref(false)
  const error = ref(null)
  const primaryAddress = ref(null)
  
  const authStore = useAuthStore()
  const toast = useToast()
  
  // Fetch user addresses
  const fetchUserAddresses = async () => {
    try {
      loading.value = true
      error.value = null
      
      if (!authStore.currentUser?.id) {
        throw new Error('User not authenticated')
      }
      
      const addressesQuery = query(
        collection(db, 'addresses'),
        where('userId', '==', authStore.currentUser.id),
        orderBy('isPrimary', 'desc')
      )
      
      const snapshot = await getDocs(addressesQuery)
      addresses.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Set primary address
      primaryAddress.value = addresses.value.find(addr => addr.isPrimary) || null
      
      return addresses.value
    } catch (err) {
      error.value = err.message
      console.error('Error fetching addresses:', err)
      return []
    } finally {
      loading.value = false
    }
  }
  
  // Add new address
  const addAddress = async (addressData) => {
    try {
      loading.value = true
      error.value = null
      
      if (!authStore.currentUser?.id) {
        throw new Error('User not authenticated')
      }
      
      // If this is the first address or marked as primary
      if (addresses.value.length === 0 || addressData.isPrimary) {
        // If making this primary, update all others to not primary
        if (addresses.value.length > 0 && addressData.isPrimary) {
          await updatePrimaryStatus(null)
        }
        
        addressData.isPrimary = true
      }
      
      const newAddress = {
        userId: authStore.currentUser.id,
        ...addressData,
        createdAt: new Date()
      }
      
      const docRef = await addDoc(collection(db, 'addresses'), newAddress)
      const addedAddress = { id: docRef.id, ...newAddress }
      
      // Update local state
      addresses.value.push(addedAddress)
      
      // If primary, update primaryAddress ref
      if (addedAddress.isPrimary) {
        primaryAddress.value = addedAddress
      }
      
      toast.success('Alamat berhasil ditambahkan')
      return { success: true, address: addedAddress }
    } catch (err) {
      error.value = err.message
      toast.error('Gagal menambahkan alamat: ' + err.message)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }
  
  // Update address
  const updateAddress = async (id, addressData) => {
    try {
      loading.value = true
      error.value = null
      
      const addressRef = doc(db, 'addresses', id)
      
      // If making this primary, update all others to not primary
      if (addressData.isPrimary) {
        await updatePrimaryStatus(id)
      }
      
      await updateDoc(addressRef, {
        ...addressData,
        updatedAt: new Date()
      })
      
      // Update local state
      const index = addresses.value.findIndex(addr => addr.id === id)
      if (index !== -1) {
        addresses.value[index] = { 
          ...addresses.value[index],
          ...addressData
        }
      }
      
      // Update primary address if needed
      if (addressData.isPrimary) {
        primaryAddress.value = addresses.value[index]
      } else if (primaryAddress.value?.id === id) {
        // This was the primary but no longer is
        primaryAddress.value = addresses.value.find(addr => addr.isPrimary) || null
      }
      
      toast.success('Alamat berhasil diperbarui')
      return { success: true }
    } catch (err) {
      error.value = err.message
      toast.error('Gagal memperbarui alamat: ' + err.message)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }
  
  // Helper to update primary status of all addresses except one
  const updatePrimaryStatus = async (exceptId) => {
    try {
      // Get all addresses except the one being made primary
      const otherAddresses = addresses.value.filter(addr => 
        addr.id !== exceptId && addr.isPrimary
      )
      
      // Update them all to not be primary
      const updatePromises = otherAddresses.map(addr => {
        const addressRef = doc(db, 'addresses', addr.id)
        return updateDoc(addressRef, { isPrimary: false })
      })
      
      await Promise.all(updatePromises)
      
      // Update local state
      addresses.value.forEach(addr => {
        if (addr.id !== exceptId) {
          addr.isPrimary = false
        }
      })
      
      return true
    } catch (err) {
      console.error('Error updating primary status:', err)
      return false
    }
  }
  
  return {
    addresses,
    loading,
    error,
    primaryAddress,
    fetchUserAddresses,
    addAddress,
    updateAddress,
    updatePrimaryStatus
  }
})