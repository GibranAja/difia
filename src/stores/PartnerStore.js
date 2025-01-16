// src/stores/PartnerStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/config/firebase'
import { useToast } from 'vue-toastification'
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore'

export const usePartnerStore = defineStore('partner', () => {
  const partners = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const toast = useToast()

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  // Fetch all partners
  const fetchPartners = async () => {
    try {
      isLoading.value = true
      const q = query(collection(db, 'partners'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      partners.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (err) {
      error.value = err.message
      toast.error('Failed to fetch partners')
    } finally {
      isLoading.value = false
    }
  }

  // Add new partner
  const addPartner = async (partnerData) => {
    try {
      isLoading.value = true

      if (partnerData.imageFile) {
        partnerData.image = await fileToBase64(partnerData.imageFile)
        delete partnerData.imageFile
      }

      const docRef = await addDoc(collection(db, 'partners'), {
        ...partnerData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      await fetchPartners()
      toast.success('Partner added successfully')
      return { success: true, id: docRef.id }
    } catch (err) {
      error.value = err.message
      toast.error('Failed to add partner')
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Update partner
  const updatePartner = async (id, partnerData) => {
    try {
      isLoading.value = true
      const updatePayload = { ...partnerData, updatedAt: serverTimestamp() }

      if (partnerData.imageFile) {
        updatePayload.image = await fileToBase64(partnerData.imageFile)
        delete updatePayload.imageFile
      }

      await updateDoc(doc(db, 'partners', id), updatePayload)
      await fetchPartners()
      toast.success('Partner updated successfully')
      return { success: true }
    } catch (err) {
      error.value = err.message
      toast.error('Failed to update partner')
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Delete partner
  const deletePartner = async (id) => {
    try {
      isLoading.value = true
      await deleteDoc(doc(db, 'partners', id))
      await fetchPartners()
      toast.success('Partner deleted successfully')
      return { success: true }
    } catch (err) {
      error.value = err.message
      toast.error('Failed to delete partner')
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  return {
    partners,
    isLoading,
    error,
    fetchPartners,
    addPartner,
    updatePartner,
    deletePartner
  }
})