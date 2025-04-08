<template>
  <div
    class="voucher-notification-container"
    v-if="!voucherStore.isLoading && activeVouchers.length > 0"
  >
    <div class="voucher-notification" @click="toggleVoucherModal">
      <div class="notification-content">
        <i class="fas fa-ticket-alt"></i>
        <span>{{ activeVouchers.length }} voucher tersedia! Klik untuk melihat</span>
      </div>
    </div>

    <!-- Voucher Modal -->
    <div class="voucher-modal" v-if="showVoucherModal">
      <div class="voucher-modal-content">
        <div class="modal-header">
          <h2>Voucher Tersedia</h2>
          <button class="close-button" @click="toggleVoucherModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="activeVouchers.length > 0">
            <!-- Rest of your voucher content remains the same -->
            <div class="voucher-info-banner">
              <i class="fas fa-info-circle"></i>
              <p>Gunakan voucher untuk mendapatkan potongan harga spesial!</p>
            </div>

            <div class="voucher-card" v-for="voucher in activeVouchers" :key="voucher.id">
              <!-- Existing voucher card content -->
              <div class="voucher-details">
                <h3 class="voucher-code">{{ voucher.code }}</h3>
                <p class="voucher-discount">
                  {{ formatDiscount(voucher) }}
                </p>
                <p class="voucher-validity">Berlaku hingga: {{ formatDate(voucher.validUntil) }}</p>
              </div>
              <div class="voucher-copy">
                <button @click="copyVoucherCode(voucher.code)" title="Salin kode">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </div>

            <!-- Terms and Conditions Section remains the same -->
            <div class="terms-section">
              <div class="terms-header" @click="toggleTerms">
                <h3>Syarat & Ketentuan</h3>
                <i :class="['fas', isTermsOpen ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
              </div>
              <div class="terms-content" :class="{ 'terms-open': isTermsOpen }">
                <ul>
                  <li>
                    <i class="fas fa-check-circle"></i>
                    Voucher hanya berlaku untuk 1 kali penggunaan per transaksi
                  </li>
                  <li>
                    <i class="fas fa-check-circle"></i>
                    Voucher tidak dapat digabungkan dengan voucher lain
                  </li>
                  <li>
                    <i class="fas fa-check-circle"></i>
                    Voucher akan hangus jika melebihi masa berlaku
                  </li>
                  <li>
                    <i class="fas fa-check-circle"></i>
                    Diperuntukan hanya untuk tipe pembelian Souvenir
                  </li>
                  <li>
                    <i class="fas fa-check-circle"></i>
                    Difia berhak membatalkan pesanan jika terjadi penyalahgunaan voucher
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div v-else class="no-vouchers">
            <p>Tidak ada voucher yang tersedia saat ini.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useVoucherStore } from '@/stores/VoucherStore'
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '@/config/firebase'

const voucherStore = useVoucherStore()
const showVoucherModal = ref(false)
const copiedCode = ref('')
const unsubscribeListener = ref(null)
const isInitialLoad = ref(true)

// Set up real-time listener for vouchers
const setupVoucherListener = () => {
  console.log('Setting up real-time voucher listener')

  // Create a query for all vouchers ordered by creation date
  const vouchersRef = collection(db, 'vouchers')
  const vouchersQuery = query(vouchersRef, orderBy('createdAt', 'desc'))

  // Set up the real-time listener
  unsubscribeListener.value = onSnapshot(
    vouchersQuery,
    (snapshot) => {
      console.log('Voucher snapshot received:', snapshot.size)

      // Handle loading state
      voucherStore.isLoading = false

      // Process each document and update the store's voucher items
      const vouchers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      // Update the voucher store directly
      voucherStore.voucherItems = vouchers

      // Log information
      console.log('Vouchers updated at:', new Date().toLocaleTimeString())
      console.log('Total vouchers:', voucherStore.voucherItems.length)
      console.log('Active vouchers:', activeVouchers.value.length)

      isInitialLoad.value = false
    },
    (error) => {
      console.error('Error listening to vouchers:', error)
      voucherStore.isLoading = false
    },
  )
}

// Set up real-time listener when component is mounted
onMounted(() => {
  console.log('VoucherNotification component mounted')
  voucherStore.isLoading = true
  setupVoucherListener()
})

// Clean up when component is unmounted
onUnmounted(() => {
  if (unsubscribeListener.value) {
    console.log('Unsubscribing from voucher updates')
    unsubscribeListener.value()
  }
})

// Filter active vouchers
const activeVouchers = computed(() => {
  return voucherStore.voucherItems.filter((voucher) => {
    const now = new Date()
    const isNotExpired = new Date(voucher.validUntil) > now
    const hasRemainingUses = voucher.currentUses < voucher.maxUses
    return voucher.isActive && isNotExpired && hasRemainingUses
  })
})

// Add watch to debug when voucher items change
watch(
  () => voucherStore.voucherItems,
  (newItems) => {
    console.log('Voucher items updated:', newItems.length)
    console.log('Active vouchers after update:', activeVouchers.value.length)
  },
  { deep: true },
)

// Toggle voucher modal
const toggleVoucherModal = () => {
  showVoucherModal.value = !showVoucherModal.value
}

// Format discount for display
const formatDiscount = (voucher) => {
  if (voucher.discountType === 'percentage') {
    return `${voucher.discountValue}% diskon`
  } else {
    return `Rp ${new Intl.NumberFormat('id-ID').format(voucher.discountValue)} diskon`
  }
}

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

// Copy voucher code to clipboard
const copyVoucherCode = (code) => {
  navigator.clipboard
    .writeText(code)
    .then(() => {
      copiedCode.value = code
      alert(`Kode voucher ${code} berhasil disalin!`)
    })
    .catch((err) => {
      console.error('Gagal menyalin kode voucher:', err)
      alert('Gagal menyalin kode voucher')
    })
}

// Add to existing script
const isTermsOpen = ref(false)

const toggleTerms = () => {
  isTermsOpen.value = !isTermsOpen.value
}
</script>

<style scoped>
/* Add these global styles at the beginning of your <style> section */
* {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

*::-webkit-scrollbar {
  display: none; /* Chrome/Safari/Webkit */
}

.voucher-notification-container {
  position: fixed; /* Change from relative to fixed */
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1001; /* Higher than navbar's z-index of 100 */
}

.voucher-notification {
  /* Keep existing styles */
  background-color: #02163b;
  color: #e8ba38;
  padding: 10px 20px;
  text-align: center;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.voucher-notification:hover {
  background-color: #010c1f;
}

.notification-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.notification-content i {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Modal styles */
.voucher-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.voucher-modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.voucher-modal-content::-webkit-scrollbar {
  display: none;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #02163b;
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.modal-body::-webkit-scrollbar {
  display: none;
}

/* Remove or comment out these old scrollbar styles */
/* .modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #e8ba38;
  border-radius: 3px;
} */

.voucher-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin-bottom: 12px;
  border: 2px dashed #e8ba38;
  border-radius: 8px;
  background-color: #fffdf5;
  transition: transform 0.2s ease;
}

.voucher-card:hover {
  transform: translateY(-2px);
}

.voucher-details {
  flex: 1;
}

.voucher-code {
  font-size: 1.5rem;
  color: #02163b;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.voucher-discount {
  font-size: 1.1rem;
  color: #e8ba38;
  font-weight: 600;
  margin: 5px 0;
}

.voucher-validity,
.voucher-usage {
  color: #666;
  margin: 5px 0;
  font-size: 0.9rem;
}

.voucher-copy button {
  background-color: #02163b;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.voucher-copy button:hover {
  background-color: #e8ba38;
  transform: scale(1.1);
}

.no-vouchers {
  text-align: center;
  padding: 20px;
  color: #666;
}

/* Add to existing styles */
.voucher-info-banner {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #02163b;
}

.voucher-info-banner i {
  color: #e8ba38;
  font-size: 1.2rem;
}

.terms-section {
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.terms-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 10px 0;
}

.terms-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #02163b;
}

.terms-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.terms-content.terms-open {
  max-height: 500px;
}

.terms-content ul {
  list-style: none;
  padding: 0;
  margin: 10px 0 0 0;
}

.terms-content li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.terms-content li i {
  color: #e8ba38;
  margin-top: 3px;
  font-size: 0.8rem;
}
</style>
