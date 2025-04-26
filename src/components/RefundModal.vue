<template>
  <div class="refund-modal-overlay" @click.self="close">
    <div class="refund-modal">
      <div class="modal-header">
        <h3>{{ isCancellation ? 'Batalkan Pesanan' : 'Ajukan Refund' }}</h3>
        <button class="close-btn" @click="close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="warning-container" :class="{ 'cancellation-warning': isCancellation }">
        <i :class="['fas', isCancellation ? 'fa-exclamation-triangle' : 'fa-info-circle']"></i>
        <p>
          {{
            isCancellation
              ? 'Apakah Anda yakin ingin membatalkan pesanan ini?'
              : 'No Rekening/E-wallet harus sama dengan yang anda registrasi'
          }}
        </p>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="loading-container">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Memuat data pembayaran...</p>
      </div>

      <form v-else @submit.prevent="submitForm" class="refund-form">
        <!-- Show cancellation reason field if user is cancelling their own order -->
        <div class="form-group full-width" v-if="isCancellation || showCancellationReason">
          <label for="cancellationReason">Alasan Pembatalan</label>
          <textarea
            id="cancellationReason"
            v-model="formData.cancellationReason"
            placeholder="Masukkan alasan pembatalan"
            required
            rows="2"
          ></textarea>
        </div>

        <!-- Payment details fields - readonly and pre-filled -->
        <div class="form-row">
          <div class="form-group">
            <label for="accountType">Jenis Akun</label>
            <input
              type="text"
              id="accountType"
              v-model="formData.accountTypeDisplay"
              class="readonly-input"
              readonly
            />
          </div>
          <div class="form-group">
            <label for="bankName">
              {{ formData.accountType === 'bank' ? 'Nama Bank' : 'Nama E-wallet' }}
            </label>
            <input
              type="text"
              id="bankName"
              v-model="formData.bankName"
              class="readonly-input"
              readonly
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="accountNumber">No Rekening/E-wallet</label>
            <input
              type="text"
              id="accountNumber"
              v-model="formData.accountNumber"
              class="readonly-input"
              readonly
            />
          </div>
          <div class="form-group">
            <label for="accountName">Atas Nama</label>
            <input
              type="text"
              id="accountName"
              v-model="formData.accountName"
              class="readonly-input"
              readonly
            />
          </div>
        </div>

        <div class="button-group">
          <button type="button" class="cancel-btn" @click="close">Batal</button>
          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            <span v-if="isSubmitting"><i class="fas fa-spinner fa-spin"></i></span>
            <span v-else>{{ isCancellation ? 'Batalkan & Ajukan' : 'Ajukan' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  doc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from '@/stores/AuthStore'
import { useToast } from 'vue-toastification'
import { useNotificationStore } from '@/stores/NotificationStore'

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
  isCancellation: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])
const authStore = useAuthStore()
const toast = useToast()
const notificationStore = useNotificationStore()
const isLoading = ref(true)

// Determine if we need to show the cancellation reason field
const showCancellationReason = computed(() => {
  return !props.isCancellation && !props.order.cancelReason
})

// Form data
const formData = ref({
  accountType: 'bank',
  accountTypeDisplay: '',
  accountNumber: '',
  accountName: '',
  bankName: '',
  cancellationReason: props.order.cancelReason || '',
})

const isSubmitting = ref(false)

// Fetch user payment information
const fetchUserPaymentInfo = async () => {
  try {
    isLoading.value = true

    if (!authStore.currentUser?.id) {
      toast.error('Data pengguna tidak tersedia')
      return
    }

    // Query Firestore for the user document
    const userQuery = query(collection(db, 'users'), where('uid', '==', authStore.currentUser.id))

    const querySnapshot = await getDocs(userQuery)

    if (querySnapshot.empty) {
      toast.error('Data pengguna tidak ditemukan')
      return
    }

    const userData = querySnapshot.docs[0].data()

    // Check if payment info exists
    if (userData.paymentInfo) {
      formData.value.accountType = userData.paymentInfo.method || 'bank'
      formData.value.accountTypeDisplay =
        userData.paymentInfo.method === 'bank' ? 'Rekening Bank' : 'E-Wallet'
      formData.value.bankName = userData.paymentInfo.name || ''
      formData.value.accountNumber = userData.paymentInfo.accountNumber || ''
      formData.value.accountName = userData.paymentInfo.accountName || ''
    } else {
      toast.warning('Informasi pembayaran tidak tersedia dalam profil Anda')
    }
  } catch (error) {
    console.error('Error fetching user payment info:', error)
    toast.error('Gagal memuat informasi pembayaran')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchUserPaymentInfo()
})

const submitForm = async () => {
  try {
    isSubmitting.value = true
    const orderRef = doc(db, 'orders', props.order.id)

    if (props.isCancellation) {
      // This is for order cancellation
      await updateDoc(orderRef, {
        status: 'cancelled',
        cancelReason: formData.value.cancellationReason,
        cancelledBy: 'user', // Explicitly set cancelledBy as 'user'
        cancelledAt: serverTimestamp(),
        refundRequest: {
          status: 'pending',
          requestDate: serverTimestamp(),
          accountType: formData.value.accountType,
          accountNumber: formData.value.accountNumber,
          accountName: formData.value.accountName,
          bankName: formData.value.bankName,
          userId: authStore.currentUser?.id,
        },
      })

      // Send notification
      await notificationStore.createNotification({
        title: 'Pesanan Dibatalkan',
        message: `Pesanan #${props.order.id.slice(-6)} telah dibatalkan oleh Anda. Permintaan refund sedang diproses.`,
        type: 'order',
        userId: authStore.currentUser?.id,
        orderId: props.order.id,
        icon: 'fas fa-times-circle',
        color: '#ef4444',
        link: `/my-account/orders?search=${props.order.id}`,
      })

      toast.success('Pesanan berhasil dibatalkan dan permintaan refund sedang diproses')
    } else {
      // Only submit refund request for already cancelled order
      await updateDoc(orderRef, {
        refundRequest: {
          status: 'pending', // Initial status: pending, processed, rejected
          requestDate: serverTimestamp(),
          accountType: formData.value.accountType,
          accountNumber: formData.value.accountNumber,
          accountName: formData.value.accountName,
          bankName: formData.value.bankName,
          userId: authStore.currentUser?.id,
        },
        // If cancellation reason is empty and user provided one, update it
        ...(showCancellationReason.value && { cancelReason: formData.value.cancellationReason }),
      })

      toast.success('Permintaan refund berhasil diajukan')
    }

    close()
  } catch (error) {
    console.error('Error processing request:', error)
    toast.error(
      props.isCancellation ? 'Gagal membatalkan pesanan' : 'Gagal mengajukan permintaan refund',
    )
  } finally {
    isSubmitting.value = false
  }
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
.refund-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.refund-modal {
  background: white;
  width: 90%;
  max-width: 520px; /* Increased for better form layout */
  border-radius: 10px;
  overflow: hidden;
  padding: 0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: modal-in 0.2s ease-out;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(-15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1.2rem; /* Increased from 0.75rem 1rem */
  border-bottom: 1px solid #eaeaea;
  background-color: #02163b;
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem; /* Increased from 1rem */
  font-family: 'Montserrat', sans-serif;
}

.close-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 1rem; /* Increased from 0.9rem */
  cursor: pointer;
  width: 28px; /* Increased from 24px */
  height: 28px; /* Increased from 24px */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.warning-container {
  background-color: #fff3cd;
  border-left: 3px solid #ffc107;
  padding: 0.7rem 1rem; /* Increased from 0.6rem 0.8rem */
  margin: 0.85rem; /* Increased from 0.75rem */
  display: flex;
  align-items: center;
  gap: 0.6rem; /* Increased from 0.5rem */
  border-radius: 4px;
  font-size: 0.9rem; /* Increased from 0.85rem */
}

.warning-container.cancellation-warning {
  background-color: #fee2e2;
  border-left: 3px solid #ef4444;
}

.warning-container i {
  color: #ff9800;
  font-size: 1rem;
}

.cancellation-warning i {
  color: #ef4444;
}

.warning-container p {
  margin: 0;
  color: #856404;
  line-height: 1.3;
}

.cancellation-warning p {
  color: #991b1b;
}

/* Loading container */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #666;
}

.loading-container i {
  font-size: 2rem;
  color: #02163b;
  margin-bottom: 1rem;
}

.refund-form {
  padding: 0 1.5rem 1.2rem; /* Increased left/right padding */
  margin: 0 auto;
  max-width: 460px; /* Control the maximum width of the form */
}

.form-row {
  display: flex;
  gap: 1.25rem; /* Increased gap between columns */
  margin-bottom: 0.9rem;
  justify-content: space-between; /* Distribute space evenly */
}

.form-group {
  width: calc(50% - 0.625rem); /* Set fixed width: 50% minus half the gap */
  min-width: 0; /* Prevent overflow */
  margin-bottom: 0.9rem;
}

/* Make cancellation reason field full width */
.form-group.full-width {
  width: 100%;
  max-width: 100%;
}

/* Previous rule kept for compatibility */
.form-group:only-child {
  width: 100%;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.3rem; /* Increased from 0.25rem */
  font-size: 0.9rem; /* Increased from 0.85rem */
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.6rem 0.7rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
  font-family: 'Montserrat', sans-serif;
  box-sizing: border-box; /* Ensure padding doesn't affect width */
}

.readonly-input {
  background-color: #f9f9f9;
  color: #666;
  cursor: not-allowed;
  border-color: #e0e0e0;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #02163b;
  box-shadow: 0 0 0 2px rgba(2, 22, 59, 0.1);
}

.button-group {
  display: flex;
  gap: 0.9rem; /* Increased from 0.75rem */
  margin-top: 0.75rem; /* Increased from 0.5rem */
  justify-content: flex-end;
}

.cancel-btn,
.submit-btn {
  padding: 0.6rem 1.2rem; /* Increased from 0.5rem 1rem */
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.95rem; /* Increased from 0.9rem */
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Montserrat', sans-serif;
}

.cancel-btn {
  background-color: #f1f5f9;
  border: 1px solid #ddd;
  color: #333;
}

.submit-btn {
  background-color: #e8ba38;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.submit-btn:disabled {
  background-color: #f1f1f1;
  color: #999;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .form-group {
    width: 100%;
  }
}
</style>
