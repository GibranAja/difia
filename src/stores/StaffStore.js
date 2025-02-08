// stores/StaffStore.js

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, auth, app } from '@/config/firebase'
import { useToast } from 'vue-toastification'
import { 
  collection, 
  addDoc, 
  getDocs,
  doc, 
  deleteDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  orderBy,
  getDoc
} from 'firebase/firestore'
import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  initializeAuth,
  browserLocalPersistence,
} from 'firebase/auth'

export const useStaffStore = defineStore('staff', () => {
  const staffItems = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const toast = useToast()

  // Fetch all staff
  const fetchStaff = async () => {
    try {
      isLoading.value = true
      error.value = null

      const staffQuery = query(
        collection(db, 'staff'), 
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(staffQuery)
      
      staffItems.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString()
      }))

    } catch (err) {
      error.value = err.message
      toast.error('Failed to fetch staff list')
    } finally {
      isLoading.value = false
    }
  }

  // Add new staff
  const addStaff = async (staffData) => {
    try {
      isLoading.value = true
      error.value = null

      // Create auth account first
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        staffData.email,
        staffData.password
      )

      // Save staff data to Firestore
      const newStaffData = {
        uid: userCredential.user.uid,
        name: staffData.name,
        email: staffData.email,
        role: 'staff',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'staff'), newStaffData)
      
      // Add to local state
      staffItems.value.unshift({ 
        id: docRef.id, 
        ...newStaffData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      toast.success('Staff account created successfully')
      return { success: true, id: docRef.id }

    } catch (err) {
      error.value = err.message
      
      // Check specifically for email-already-in-use error
      if (err.code === 'auth/email-already-in-use') {
        return { 
          success: false, 
          emailExists: true,
          error: err.message 
        }
      }

      toast.error('Failed to create staff account: ' + err.message)
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Update staff
  const updateStaff = async (id, staffData) => {
    try {
      isLoading.value = true
      error.value = null

      const staffRef = doc(db, 'staff', id)
      await updateDoc(staffRef, {
        name: staffData.name,
        updatedAt: serverTimestamp()
      })

      // Update local state
      const index = staffItems.value.findIndex(item => item.id === id)
      if (index !== -1) {
        staffItems.value[index] = {
          ...staffItems.value[index],
          ...staffData,
          updatedAt: new Date().toISOString()
        }
      }

      toast.success('Staff account updated successfully')
      return { success: true }

    } catch (err) {
      error.value = err.message
      toast.error('Failed to update staff account')
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Delete staff
  const deleteStaff = async (staffId) => {
    try {
      isLoading.value = true
      error.value = null

      // Get staff data from Firestore first
      const staffDoc = doc(db, 'staff', staffId)
      const staffSnapshot = await getDoc(staffDoc)
      
      if (staffSnapshot.exists()) {
        const staffData = staffSnapshot.data()

        // Delete from Firestore first
        await deleteDoc(staffDoc)

        try {
          // Create a separate auth instance
          const adminAuth = initializeAuth(app, {
            persistence: browserLocalPersistence
          })

          // Delete the authentication account using the UID
          const staffUser = await signInWithEmailAndPassword(
            adminAuth,
            staffData.email,
            staffData.password
          )

          if (staffUser.user) {
            await deleteUser(staffUser.user)
          }

          // Clean up the temporary auth instance
          await adminAuth.signOut()
          adminAuth.deleteApp

        } catch (authError) {
          console.error('Error deleting auth account:', authError)
          // Even if auth deletion fails, continue with the process
          // since Firestore data is already deleted
        }

        // Update local state
        staffItems.value = staffItems.value.filter(item => item.id !== staffId)
        
        toast.success('Staff account deleted successfully')
        return { success: true }
      }

      throw new Error('Staff not found')

    } catch (err) {
      error.value = err.message
      toast.error('Failed to delete staff account: ' + err.message)
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Recover staff
  const recoverStaff = async (email) => {
    try {
      isLoading.value = true
      error.value = null

      // Check if staff already exists in Firestore
      const staffQuery = query(
        collection(db, 'staff'),
        where('email', '==', email)
      )
      const staffSnapshot = await getDocs(staffQuery)

      if (!staffSnapshot.empty) {
        throw new Error('Staff already exists in database')
      }

      // Get user info from Authentication
      const userQuery = query(
        collection(db, 'users'),
        where('email', '==', email)
      )
      const userSnapshot = await getDocs(userQuery)
      let userData = {}
      
      if (!userSnapshot.empty) {
        userData = userSnapshot.docs[0].data()
      }

      // Add new staff document
      const newStaffData = {
        email: email,
        name: userData.name || email.split('@')[0], // Use name from users collection or generate from email
        role: 'staff',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'staff'), newStaffData)
      
      // Add to local state
      staffItems.value.unshift({
        id: docRef.id,
        ...newStaffData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      toast.success('Staff account recovered successfully')
      return { success: true }

    } catch (err) {
      error.value = err.message
      toast.error('Failed to recover staff account: ' + err.message)
      console.error('Recover staff error:', err)
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  return {
    staffItems,
    isLoading,
    error,
    fetchStaff,
    addStaff,
    updateStaff,
    deleteStaff,
    recoverStaff
  }
})