// stores/AuthStore.js

import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  // applyActionCode,
  // checkActionCode,
  // EmailAuthProvider,
  // linkWithCredential,
  // fetchSignInMethodsForEmail,
} from 'firebase/auth'
import {
  collection,
  doc,
  updateDoc,
  addDoc,
  query,
  where,
  getDocs,
  // getDoc,
} from 'firebase/firestore'
import { auth, db, googleProvider } from '../config/firebase'
import bcrypt from 'bcryptjs'

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

// Function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Function to validate phone number format
const isValidPhone = (phone) => {
  const phoneRegex = /^(62|0)\d{9,12}$/
  return phoneRegex.test(phone)
}

export const useAuthStore = defineStore('auth', () => {
  const toast = useToast()

  const currentUser = ref(null)
  const isLoading = ref(true)
  const isLoggedIn = ref(false)
  const isError = ref(false)
  const message = ref('')
  const resetEmail = ref('')
  const verificationCode = ref(null)
  const isEmailVerified = ref(false)
  const isAdmin = ref(false)

  const user = reactive({
    name: '',
    email: '',
    phone: '', // Add phone field
    password: '',
    profilePhoto: '',
  })

  const setAdminStatus = (status) => {
    isAdmin.value = status
  }

  const redirectAfterAuth = async (isAdmin, router) => {
    try {
      if (isAdmin) {
        await router.push('/admin')
        toast.success('Welcome back, Admin!')
      } else {
        await router.push('/')
        toast.success('Welcome back!')
      }
    } catch (error) {
      console.error('Redirect error:', error)
    }
  }

  const authUser = async (isLogin = false, router, loginIdentifier = null) => {
    try {
      isLoading.value = true
      isError.value = false
      message.value = ''

      if (isLogin) {
        // Login flow
        const isEmail = loginIdentifier ? isValidEmail(loginIdentifier) : isValidEmail(user.email)
        const identifier = loginIdentifier || user.email

        if (isEmail) {
          // Login with email
          const userCredential = await signInWithEmailAndPassword(auth, identifier, user.password)

          if (userCredential) {
            // Check in users collection first
            const userQuery = query(
              collection(db, 'users'),
              where('uid', '==', userCredential.user.uid),
            )
            const userData = await getDocs(userQuery)

            // Check staff collection if not found in users
            const staffQuery = query(
              collection(db, 'staff'),
              where('email', '==', userCredential.user.email),
            )
            const staffData = await getDocs(staffQuery)

            if (!userData.empty) {
              // User found in users collection
              const userDoc = userData.docs[0].data()
              currentUser.value = {
                email: userCredential.user.email,
                id: userCredential.user.uid,
                name: userDoc.name,
                isAdmin: userDoc.isAdmin || false,
                phone: userDoc.phone || '',
                isStaff: false,
                profilePhoto: userDoc.profilePhoto || '',
              }
              isLoggedIn.value = true
              await redirectAfterAuth(userDoc.isAdmin, router)
            } else if (!staffData.empty) {
              // User found in staff collection
              const staffDoc = staffData.docs[0].data()
              currentUser.value = {
                email: userCredential.user.email,
                id: userCredential.user.uid,
                name: staffDoc.name,
                isAdmin: false,
                isStaff: true,
                role: 'staff',
                phone: staffDoc.phone || '',
                profilePhoto: staffDoc.profilePhoto || '',
              }
              isLoggedIn.value = true
              await router.push('/admin')
              toast.success('Welcome back, Staff member!')
            } else {
              throw new Error('User account not found')
            }
          }
        } else {
          // Login with phone number
          const userQuery = query(collection(db, 'users'), where('phone', '==', identifier))
          const userData = await getDocs(userQuery)

          if (userData.empty) {
            throw new Error('No user found with this phone number')
          }

          const userDoc = userData.docs[0].data()

          // Verify password with bcrypt
          const isPasswordValid = await bcrypt.compare(user.password, userDoc.hashedPassword)

          if (!isPasswordValid) {
            throw new Error('Invalid phone number or password')
          }

          // Check if the user has an associated Firebase auth account
          if (userDoc.uid) {
            await signInWithEmailAndPassword(auth, userDoc.email, user.password)

            currentUser.value = {
              email: userDoc.email,
              id: userDoc.uid,
              name: userDoc.name,
              phone: userDoc.phone || '',
              isAdmin: userDoc.isAdmin || false,
              isStaff: false,
              profilePhoto: userDoc.profilePhoto || '',
            }

            isLoggedIn.value = true
            await redirectAfterAuth(userDoc.isAdmin, router)
          } else {
            throw new Error('Account error: Please contact support')
          }
        }

        // Add a check for email verification
        const firebaseUser = auth.currentUser
        if (firebaseUser && !firebaseUser.emailVerified) {
          toast.warning('Please verify your email before logging in.')
          await sendEmailVerification(firebaseUser)
          await router.push('/verify-email')
          return
        }
      } else {
        // Register flow with hashed password
        // Check if phone number already exists
        const phoneQuery = query(collection(db, 'users'), where('phone', '==', user.phone))
        const phoneSnapshot = await getDocs(phoneQuery)

        if (!phoneSnapshot.empty) {
          throw new Error('Phone number is already registered')
        }

        const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password)

        if (userCredential) {
          // Hash password before storing
          const hashedPassword = await hashPassword(user.password)

          // Send verification email
          await sendEmailVerification(userCredential.user)
          isEmailVerified.value = false

          // Store user in Firestore with all fields
          await addDoc(collection(db, 'users'), {
            uid: userCredential.user.uid,
            name: user.name,
            email: user.email,
            phone: user.phone,
            hashedPassword: hashedPassword,
            profilePhoto: user.profilePhoto || '',
            isAdmin: false,
            emailVerified: false,
            // Add payment information
            paymentInfo: user.paymentInfo || null,
            profileComplete: true, // Mark as complete since all info is provided
          })

          // Set current user after successful registration
          currentUser.value = {
            email: user.email,
            id: userCredential.user.uid,
            name: user.name,
            phone: user.phone,
            isAdmin: false,
            profilePhoto: user.profilePhoto || '',
            emailVerified: false,
          }

          toast.success('Registration successful! Please check your email to verify your account.')

          if (router) {
            // Redirect to verify-email page instead of home
            await router.push('/verify-email')
          }
        }
      }

      // Reset form
      user.name = ''
      user.email = ''
      user.password = ''
      user.phone = ''
      user.profilePhoto = ''
    } catch (error) {
      handleAuthError(error)
    } finally {
      isLoading.value = false
    }
  }

  const logoutUser = async (router) => {
    try {
      await signOut(auth)
      currentUser.value = null
      isLoggedIn.value = false
      toast.success('Successfully logged out!')
      if (router) {
        await router.push('/login')
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error logging out')
    }
  }

  const handleAuthError = (error) => {
    isError.value = true
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        message.value = 'Invalid email/phone or password'
        break
      case 'auth/email-already-in-use':
        message.value = 'Email is already registered'
        break
      case 'auth/invalid-email':
        message.value = 'Invalid email format'
        break
      case 'auth/weak-password':
        message.value = 'Password should be at least 6 characters'
        break
      default:
        message.value = error.message
    }
    toast.error(message.value)
    return Promise.reject(error)
  }

  const initializeAuthState = () => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          if (firebaseUser) {
            // Set email verification status
            isEmailVerified.value = firebaseUser.emailVerified

            // Check users (admin) collection
            const usersRef = collection(db, 'users')
            const userQuery = query(usersRef, where('uid', '==', firebaseUser.uid))
            const userSnapshot = await getDocs(userQuery)

            // Check staff collection
            const staffRef = collection(db, 'staff')
            const staffQuery = query(staffRef, where('email', '==', firebaseUser.email))
            const staffSnapshot = await getDocs(staffQuery)

            if (!userSnapshot.empty) {
              const userData = userSnapshot.docs[0].data()
              currentUser.value = {
                email: firebaseUser.email,
                id: firebaseUser.uid,
                name: userData.name,
                isAdmin: userData.isAdmin || false,
                isStaff: false,
                role: 'admin',
                profilePhoto: userData.profilePhoto || '',
              }
              isLoggedIn.value = true
            } else if (!staffSnapshot.empty) {
              const staffData = staffSnapshot.docs[0].data()
              currentUser.value = {
                email: firebaseUser.email,
                id: firebaseUser.uid,
                name: staffData.name,
                isAdmin: false,
                isStaff: true,
                role: 'staff',
                profilePhoto: staffData.profilePhoto || '',
              }
              isLoggedIn.value = true
            }
          } else {
            currentUser.value = null
            isLoggedIn.value = false
            isEmailVerified.value = false
          }
        } catch (error) {
          console.error('Auth state error:', error)
          currentUser.value = null
          isLoggedIn.value = false
          isEmailVerified.value = false
        } finally {
          isLoading.value = false
          resolve()
        }
      })

      return () => unsubscribe()
    })
  }

  const signInWithGoogle = async (router) => {
    try {
      isLoading.value = true

      // Set custom parameters untuk Google Auth
      googleProvider.setCustomParameters({
        prompt: 'select_account',
      })

      // Use the standard Firebase signInWithPopup
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Cek apakah user sudah ada di Firestore
      const userRef = collection(db, 'users')
      const q = query(userRef, where('uid', '==', user.uid))
      const querySnapshot = await getDocs(q)

      let isAdmin = false
      let needsProfileCompletion = false

      if (querySnapshot.empty) {
        // Buat dokumen user baru
        await addDoc(userRef, {
          uid: user.uid,
          name: user.displayName || '',
          email: user.email,
          profilePhoto: user.photoURL || '',
          isAdmin: false, // Default false for new users
          createdAt: new Date(),
          // Missing payment info - mark as incomplete
          profileComplete: false,
        })

        needsProfileCompletion = true
      } else {
        // Get existing user data and check if profile is complete
        const userData = querySnapshot.docs[0].data()
        isAdmin = userData.isAdmin || false
        needsProfileCompletion = !userData.profileComplete
      }

      // Set current user with admin status
      currentUser.value = {
        email: user.email,
        id: user.uid,
        name: user.displayName || '',
        isAdmin: isAdmin,
        profilePhoto: user.photoURL || '',
      }

      isLoggedIn.value = true

      // If profile is incomplete, redirect to profile completion page
      if (needsProfileCompletion) {
        // Mark that this user needs to complete their profile
        sessionStorage.setItem('googleSignInFlow', 'true')
        toast.info('Silahkan lengkapi informasi profil Anda')
        return { success: true, needsProfileCompletion: true }
      } else {
        if (isAdmin) {
          toast.success('Welcome back, Admin!')
          await router.push('/admin')
        } else {
          toast.success('Successfully logged in with Google!')
          await router.push('/')
        }
        return { success: true, needsProfileCompletion: false }
      }
    } catch (error) {
      console.error('Google sign-in error:', error)

      isLoading.value = false

      if (error.code === 'auth/popup-closed-by-user') {
        console.log('ditutup oleh user')
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Pop-up was blocked by the browser. Please enable pop-ups for this site.')
      } else {
        toast.error('Failed to sign in with Google. Please try again.')
      }

      // Re-throw to ensure the component receives the error
      throw error
    } finally {
      // Ensure loading state is reset
      isLoading.value = false
    }
  }

  const setResetEmail = (email) => {
    resetEmail.value = email
  }

  const setVerificationCode = (code) => {
    verificationCode.value = code
  }

  const sendVerificationEmail = async (email, code) => {
    // Here you would typically use a backend service or Firebase Functions
    // to send an email. For now, we'll just console.log
    console.log(`Sending code ${code} to ${email}`)
    return true
  }

  const updatePassword = async () => {
    await sendPasswordResetEmail(auth, resetEmail.value)
    resetEmail.value = ''
    verificationCode.value = null
  }

  const checkEmailVerification = () => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          // Force refresh to get the latest emailVerified status
          user.reload().then(async () => {
            isEmailVerified.value = user.emailVerified

            if (user.emailVerified) {
              // Update the Firestore document when email is verified
              await updateUserVerificationStatus(user.uid)

              // Set the user as logged in
              isLoggedIn.value = true

              // Fetch user data from Firestore to update currentUser
              const userQuery = query(collection(db, 'users'), where('uid', '==', user.uid))
              const userData = await getDocs(userQuery)

              if (!userData.empty) {
                const userDoc = userData.docs[0].data()
                currentUser.value = {
                  email: user.email,
                  id: user.uid,
                  name: userDoc.name,
                  isAdmin: userDoc.isAdmin || false,
                  profilePhoto: userDoc.profilePhoto || '',
                  emailVerified: true,
                }

                // Show success message to user
                toast.success('Email berhasil diverifikasi! Anda sudah login.')
              }
            }
            resolve(user.emailVerified)
          })
        } else {
          isEmailVerified.value = false
          resolve(false)
        }
      })

      // Clean up the listener after initial check
      setTimeout(() => {
        unsubscribe()
      }, 1000)
    })
  }

  const updateUserVerificationStatus = async (uid) => {
    try {
      const userQuery = query(collection(db, 'users'), where('uid', '==', uid))
      const userData = await getDocs(userQuery)

      if (!userData.empty) {
        const userDoc = userData.docs[0]
        const userRef = doc(db, 'users', userDoc.id)
        await updateDoc(userRef, {
          emailVerified: true,
        })
      }
    } catch (error) {
      console.error('Error updating verification status:', error)
    }
  }

  const resendVerificationEmail = async () => {
    try {
      isLoading.value = true
      const firebaseUser = auth.currentUser

      if (firebaseUser) {
        await sendEmailVerification(firebaseUser)
        toast.success('Verification email sent! Please check your inbox.')
      } else {
        toast.error('You must be logged in to resend verification email.')
      }
    } catch (error) {
      console.error('Error sending verification email:', error)
      toast.error('Failed to send verification email. Please try again later.')
    } finally {
      isLoading.value = false
    }
  }

  // Refresh user data after profile updates
  const refreshUserData = async () => {
    try {
      if (!currentUser.value || !currentUser.value.id) return

      const userRef = collection(db, 'users')
      const q = query(userRef, where('uid', '==', currentUser.value.id))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data()

        // Update current user with new data
        currentUser.value = {
          ...currentUser.value,
          paymentInfo: userData.paymentInfo || {},
          // Update other fields as needed
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error)
    }
  }

  return {
    user,
    isLoggedIn,
    isError,
    message,
    currentUser,
    isLoading,
    authUser,
    logoutUser,
    isAdmin,
    setAdminStatus,
    initializeAuthState,
    signInWithGoogle,
    resetEmail,
    verificationCode,
    setResetEmail,
    setVerificationCode,
    sendVerificationEmail,
    updatePassword,
    isEmailVerified,
    checkEmailVerification,
    resendVerificationEmail,
    refreshUserData,
  }
})
