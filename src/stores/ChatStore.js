// stores/ChatStore.js

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { collection, addDoc, query, orderBy, onSnapshot, where } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuthStore } from './AuthStore'

export const useChatStore = defineStore('chat', () => {
  const messages = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()

  const sendMessage = async (content, recipientId) => {
    try {
      if (!authStore.currentUser) throw new Error('Must be logged in to send messages')
      
      const messageData = {
        content,
        senderId: authStore.currentUser.id,
        senderName: authStore.currentUser.name,
        recipientId: recipientId || 'admin',
        timestamp: new Date(),
        senderPhoto: authStore.currentUser.profilePhoto || ''
      }
      
      await addDoc(collection(db, 'messages'), messageData)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // For regular users - only show their own messages
  const subscribeToUserMessages = (userId) => {
    const q = query(
      collection(db, 'messages'),
      where('senderId', '==', userId),
      orderBy('timestamp', 'asc')
    )

    return onSnapshot(q, (snapshot) => {
      messages.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }))
    })
  }

  // For admin - show all messages
  const subscribeToAllMessages = () => {
    const q = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'desc')
    )

    return onSnapshot(q, (snapshot) => {
      messages.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }))
    })
  }

  // For admin - show messages with specific user
  const subscribeToUserChat = (userId) => {
    const q = query(
      collection(db, 'messages'),
      where('senderId', 'in', [userId, authStore.currentUser.id]),
      orderBy('timestamp', 'asc')
    )

    return onSnapshot(q, (snapshot) => {
      messages.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }))
    })
  }

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    subscribeToUserMessages,
    subscribeToAllMessages,
    subscribeToUserChat
  }
})