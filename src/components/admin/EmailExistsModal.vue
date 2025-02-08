<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h3>Email Sudah Terdaftar</h3>
      <p>
        Email ini sudah terdaftar di sistem Authentication:
        <br><strong>{{ email }}</strong>
      </p>
      <p class="warning-text">
        Pulihkan akan menambahkan akun ini ke daftar staff.
      </p>
      
      <div class="modal-actions">
        <button 
          @click="$emit('cancel')" 
          class="cancel-btn"
          :disabled="isProcessing"
        >
          Batalkan
        </button>
        <button 
          @click="handleRecover" 
          class="recover-btn"
          :disabled="isProcessing"
        >
          {{ isProcessing ? 'Memproses...' : 'Pulihkan' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStaffStore } from '@/stores/StaffStore'

const props = defineProps({
  email: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['cancel', 'recovered'])
const staffStore = useStaffStore()
const isProcessing = ref(false)

const handleRecover = async () => {
  try {
    isProcessing.value = true
    const result = await staffStore.recoverStaff(props.email)
    if (result.success) {
      emit('recovered')
    }
  } catch (error) {
    console.error('Recovery error:', error)
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.warning-text {
  color: #e67e22;
  font-size: 0.9rem;
  margin: 1rem 0;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.modal-actions button {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-actions button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #e0e0e0;
  color: #666;
}

.recover-btn {
  background-color: #e67e22;
  color: white;
}

.cancel-btn:hover:not(:disabled) {
  background-color: #d5d5d5;
}

.recover-btn:hover:not(:disabled) {
  background-color: #d35400;
}
</style>