// src/stores/OrderStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOrderStore = defineStore('order', () => {
  const currentOrder = ref(null)

  const setCurrentOrder = (orderData) => {
    currentOrder.value = orderData
  }

  const clearCurrentOrder = () => {
    currentOrder.value = null
  }

  return {
    currentOrder,
    setCurrentOrder,
    clearCurrentOrder
  }
})