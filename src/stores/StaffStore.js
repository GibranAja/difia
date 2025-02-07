import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, auth } from '@/config/firebase'
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  where
} from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'

export const useStaffStore = defineStore('staff', () => {
  const staffItems = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Cache mechanism
  const cache = {
    data: new Map(),
    timestamp: new Map(),
    maxAge: 5 * 60 * 1000, // 5 minutes cache

    set(key, value) {
      this.data.set(key, value)
      this.timestamp.set(key, Date.now())
    },

    get(key) {
      const timestamp = this.timestamp.get(key)
      if (!timestamp) return null

      if (Date.now() - timestamp > this.maxAge) {
        this.data.delete(key)
        this.timestamp.delete(key)
        return null
      }

      return this.data.get(key)
    },

    clear() {
      this.data.clear()
      this.timestamp.clear()
    }
  }

  // Fetch all staff members with caching
  const fetchStaff = async (forceFetch = false) => {
    try {
      isLoading.value = true
      error.value = null

      // Check cache if forceFetch is false
      if (!forceFetch) {
        const cachedStaff = cache.get('staff')
        if (cachedStaff) {
          staffItems.value = cachedStaff
          return
        }
      }

      const staffQuery = query(
        collection(db, 'staff'), 
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(staffQuery)
      
      const staff = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString()
      }))

      staffItems.value = staff
      cache.set('staff', staff)

    } catch (err) {
      error.value = err.message
      throw new Error(`Error fetching staff: ${err.message}`)
    } finally {
      isLoading.value = false
    }
  }

  // Add new staff member
  const addStaff = async (staffData) => {
    try {
      isLoading.value = true
      error.value = null

      // First create the user authentication account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        staffData.email,
        staffData.password
      )

      // Then create the staff document in Firestore
      const docRef = await addDoc(collection(db, 'staff'), {
        uid: userCredential.user.uid,
        name: staffData.name,
        email: staffData.email,
        isAdmin: false, // Staff members are not admins by default
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      // Update cache with new data
      cache.clear()
      await fetchStaff()

      return { success: true, id: docRef.id }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Update staff member
  const updateStaff = async (id, staffData) => {
    try {
      isLoading.value = true
      error.value = null

      const staffRef = doc(db, 'staff', id)
      const updateData = {
        name: staffData.name,
        updatedAt: serverTimestamp()
      }

      await updateDoc(staffRef, updateData)

      // Update cache with new data
      cache.clear()
      await fetchStaff()

      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Delete staff member
  const deleteStaff = async (id) => {
    try {
      isLoading.value = true
      error.value = null

      await deleteDoc(doc(db, 'staff', id))
      
      // Update local state and cache
      staffItems.value = staffItems.value.filter(staff => staff.id !== id)
      cache.clear()

      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Get single staff member
  const getStaffById = (id) => {
    return staffItems.value.find(staff => staff.id === id) || null
  }

  // Get staff member by email
  const getStaffByEmail = async (email) => {
    try {
      const staffQuery = query(
        collection(db, 'staff'),
        where('email', '==', email)
      )
      const snapshot = await getDocs(staffQuery)
      
      if (snapshot.empty) {
        return null
      }

      const staffDoc = snapshot.docs[0]
      return {
        id: staffDoc.id,
        ...staffDoc.data()
      }
    } catch (err) {
      error.value = err.message
      return null
    }
  }

  // Clear cache manually if needed
  const clearCache = () => {
    cache.clear()
  }

  return {
    staffItems,
    isLoading,
    error,
    fetchStaff,
    addStaff,
    updateStaff,
    deleteStaff,
    getStaffById,
    getStaffByEmail,
    clearCache
  }
})