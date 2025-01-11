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
} from 'firebase/auth'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import { auth, db, googleProvider } from '../config/firebase'

export const useAuthStore = defineStore('auth', () => {
  const toast = useToast()
  
  const currentUser = ref(null)
  const isLoading = ref(true)
  const isLoggedIn = ref(false)
  const isError = ref(false)
  const message = ref('')
  
  const user = reactive({
    name: '',
    email: '',
    password: '',
    profilePhoto: ''
  })

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

  const authUser = async (isLogin = false, router) => {
    try {
      isLoading.value = true
      isError.value = false
      message.value = ''

      if (isLogin) {
        // Login flow
        const userCredential = await signInWithEmailAndPassword(
          auth,
          user.email,
          user.password
        )
        
        if (userCredential) {
          const queryId = query(
            collection(db, 'users'), 
            where('uid', '==', userCredential.user.uid)
          )
          const queryData = await getDocs(queryId)

          if (!queryData.empty) {
            const userData = queryData.docs[0].data()
            currentUser.value = {
              email: userCredential.user.email,
              id: userCredential.user.uid,
              name: userData.name,
              isAdmin: userData.isAdmin,
              profilePhoto: userData.profilePhoto || ''
            }
            isLoggedIn.value = true
            
            // Pass router to redirect function
            await redirectAfterAuth(userData.isAdmin, router)
          }
        }
      } else {
        // Register flow
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          user.email,
          user.password
        )
        
        if (userCredential) {
          await addDoc(collection(db, 'users'), {
            uid: userCredential.user.uid,
            name: user.name,
            email: user.email,
            profilePhoto: user.profilePhoto || '',
            isAdmin: false
          })
          toast.success("Registration successful! Please login.")
          if (router) {
            await router.push('/login')
          }
        }
      }

      // Reset form
      user.name = ''
      user.email = ''
      user.password = ''
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
      toast.success("Successfully logged out!")
      if (router) {
        await router.push('/login')
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error("Error logging out")
    }
  }

  const handleAuthError = (error) => {
    isError.value = true
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        message.value = 'Invalid email or password'
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
  }

  const initializeAuthState = () => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          if (firebaseUser) {
            const usersRef = collection(db, 'users')
            const q = query(usersRef, where('uid', '==', firebaseUser.uid))
            const querySnapshot = await getDocs(q)

            if (!querySnapshot.empty) {
              const userData = querySnapshot.docs[0].data()
              currentUser.value = {
                email: firebaseUser.email,
                id: firebaseUser.uid,
                name: userData.name,
                isAdmin: userData.isAdmin || false,
                profilePhoto: userData.profilePhoto || ''
              }
              isLoggedIn.value = true
            }
          } else {
            currentUser.value = null
            isLoggedIn.value = false
          }
        } catch (error) {
          console.error('Auth state error:', error)
          currentUser.value = null
          isLoggedIn.value = false
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
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Cek apakah user sudah ada di Firestore
      const userRef = collection(db, 'users');
      const q = query(userRef, where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);

      let isAdmin = false;
      
      if (querySnapshot.empty) {
        // Buat dokumen user baru
        await addDoc(userRef, {
          uid: user.uid,
          name: user.displayName || '',
          email: user.email,
          profilePhoto: user.photoURL || '',
          isAdmin: false, // Default false for new users
          createdAt: new Date()
        });
      } else {
        // Get existing user data
        isAdmin = querySnapshot.docs[0].data().isAdmin;
      }

      // Set current user with admin status
      currentUser.value = {
        email: user.email,
        id: user.uid,
        name: user.displayName || '',
        isAdmin: isAdmin,
        profilePhoto: user.photoURL || ''
      };
      
      isLoggedIn.value = true;
      
      // Redirect based on admin status
      if (isAdmin) {
        toast.success('Welcome back, Admin!');
        await router.push('/admin');
      } else {
        toast.success('Successfully logged in with Google!');
        await router.push('/');
      }

    } catch (error) {
      console.error('Google sign-in error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in cancelled by user');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Pop-up was blocked by the browser. Please enable pop-ups for this site.');
      } else {
        toast.error('Failed to sign in with Google. Please try again.');
      }
      
    } finally {
      isLoading.value = false;
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
    initializeAuthState,
    signInWithGoogle
  }
})