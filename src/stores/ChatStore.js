import { ref } from 'vue'
import { defineStore } from 'pinia'
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  addDoc,
  serverTimestamp,
  where,
  getDocs
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from './AuthStore'

export const useChatStore = defineStore('chat', () => {
  // State as refs
  const messages = ref([])
  const chatUsers = ref([])
  const loading = ref(false)
  const currentChatUser = ref(null)

  // Actions
  const sendMessage = async (message, receiverId) => {
    const authStore = useAuthStore()
    loading.value = true
    
    try {
      await addDoc(collection(db, 'messages'), {
        content: message,
        senderId: authStore.currentUser.id, // Changed from uid to id to match AuthStore
        receiverId,
        timestamp: serverTimestamp(),
        senderName: authStore.currentUser.name,
        isAdmin: authStore.currentUser.isAdmin || false
      })
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      loading.value = false
    }
  }

  const listenToMessages = async (userId, adminId) => {
    loading.value = true
    
    try {
      // Query for messages between these two users
      const q = query(
        collection(db, 'messages'),
        where('senderId', 'in', [userId, adminId]),
        where('receiverId', 'in', [userId, adminId]),
        orderBy('timestamp')
      )

      return onSnapshot(q, (snapshot) => {
        messages.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        }))
        loading.value = false
      })
    } catch (error) {
      console.error('Error listening to messages:', error)
      loading.value = false
    }
  }

  const fetchChatUsers = async () => {
    const authStore = useAuthStore()
    if (!authStore.currentUser?.isAdmin) return
    
    loading.value = true
    
    try {
      // Get unique users who have sent messages
      const q = query(
        collection(db, 'messages'),
        where('receiverId', '==', authStore.currentUser.id)
      )

      const snapshot = await getDocs(q)
      const uniqueUsers = new Set()
      
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        if (!data.isAdmin) {
          uniqueUsers.add(JSON.stringify({
            id: data.senderId,
            name: data.senderName
          }))
        }
      })

      chatUsers.value = Array.from(uniqueUsers).map(user => JSON.parse(user))
    } catch (error) {
      console.error('Error fetching chat users:', error)
    } finally {
      loading.value = false
    }
  }

  const setCurrentChatUser = (user) => {
    currentChatUser.value = user
  }

  return {
    // State
    messages,
    chatUsers,
    loading,
    currentChatUser,
    
    // Actions
    sendMessage,
    listenToMessages,
    fetchChatUsers,
    setCurrentChatUser
  }
})