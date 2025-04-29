<template>
  <div class="payment-view">
    <h2 class="section-title">Informasi Pembayaran</h2>

    <!-- Loading state -->
    <div v-if="isLoading" class="loading-container">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Memuat informasi pembayaran...</p>
    </div>

    <!-- Display payment information -->
    <div v-else-if="!isEditing" class="payment-info-card">
      <div class="card-header">
        <div class="payment-title">
          <i
            :class="[
              'payment-icon',
              paymentInfo.method === 'bank' ? 'fas fa-university' : 'fas fa-wallet',
            ]"
          ></i>
          <div class="payment-label">
            <h3>{{ paymentInfo.method === 'bank' ? 'Rekening Bank' : 'E-Wallet' }}</h3>
            <span class="payment-subtitle">Informasi utama untuk refund dan pembayaran</span>
          </div>
        </div>
        <button class="edit-btn" @click="startEditing">
          <i class="fas fa-pen"></i>
          <span>Edit</span>
        </button>
      </div>

      <div class="payment-details">
        <div class="detail-row">
          <span class="detail-label">{{
            paymentInfo.method === 'bank' ? 'Bank' : 'E-Wallet'
          }}</span>
          <span class="detail-value">{{ paymentInfo.name || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">{{
            paymentInfo.method === 'bank' ? 'Nomor Rekening' : 'Nomor E-Wallet'
          }}</span>
          <span class="detail-value">{{ paymentInfo.accountNumber || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Nama Penerima</span>
          <span class="detail-value">{{ paymentInfo.accountName || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Terakhir Diperbarui</span>
          <span class="detail-value">{{ formattedLastUpdated }}</span>
        </div>
      </div>
    </div>

    <!-- Edit payment form -->
    <div v-else class="payment-edit-form">
      <div class="form-header">
        <h3>Edit Informasi Pembayaran</h3>
        <!-- Removed the close button as requested -->
      </div>

      <form @submit.prevent="savePaymentInfo">
        <div class="form-group payment-selection">
          <label>Pilih Metode Pembayaran <span class="required">*</span></label>
          <div class="payment-method-options">
            <div
              class="payment-option"
              :class="{ selected: editForm.method === 'bank' }"
              @click="selectPaymentMethod('bank')"
            >
              <div class="payment-icon">
                <i class="fas fa-university"></i>
              </div>
              <div class="payment-details">
                <span class="payment-name">Rekening Bank</span>
                <span class="payment-desc">BCA, Mandiri, BNI, dll</span>
              </div>
              <div class="selected-indicator">
                <i class="fas fa-check-circle"></i>
              </div>
            </div>

            <div
              class="payment-option"
              :class="{ selected: editForm.method === 'ewallet' }"
              @click="selectPaymentMethod('ewallet')"
            >
              <div class="payment-icon">
                <i class="fas fa-wallet"></i>
              </div>
              <div class="payment-details">
                <span class="payment-name">E-Wallet</span>
                <span class="payment-desc">OVO, GoPay, DANA, dll</span>
              </div>
              <div class="selected-indicator">
                <i class="fas fa-check-circle"></i>
              </div>
            </div>
          </div>
        </div>

        <keep-alive>
          <div :key="editForm.method">
            <div class="form-group">
              <label for="paymentName">
                {{ editForm.method === 'bank' ? 'Nama Bank' : 'Nama E-Wallet' }}
                <span class="required">*</span>
              </label>
              <div class="custom-dropdown" :class="{ active: isDropdownOpen }">
                <div class="selected-option" @click="toggleDropdown">
                  <span>{{
                    editForm.method === 'bank'
                      ? bankForm.name || 'Pilih Bank'
                      : ewalletForm.name || 'Pilih E-Wallet'
                  }}</span>
                  <i class="fas fa-chevron-down dropdown-icon"></i>
                </div>
                <div class="dropdown-menu" v-if="isDropdownOpen">
                  <div
                    v-for="option in editForm.method === 'bank' ? bankOptions : ewalletOptions"
                    :key="option"
                    class="dropdown-option"
                    @click="selectOption(option)"
                    :class="{
                      selected:
                        editForm.method === 'bank'
                          ? bankForm.name === option
                          : ewalletForm.name === option,
                    }"
                  >
                    {{ option }}
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="accountNumber">
                {{ editForm.method === 'bank' ? 'Nomor Rekening' : 'Nomor E-Wallet' }}
                <span class="required">*</span>
              </label>
              <div class="input-wrapper">
                <i class="input-icon fas fa-hashtag"></i>
                <input
                  type="text"
                  id="accountNumber"
                  :value="
                    editForm.method === 'bank' ? bankForm.accountNumber : ewalletForm.accountNumber
                  "
                  @input="updateAccountNumber($event)"
                  :placeholder="
                    editForm.method === 'bank'
                      ? 'Masukkan nomor rekening'
                      : 'Masukkan nomor e-wallet'
                  "
                  class="form-input with-icon"
                  required
                  inputmode="numeric"
                />
              </div>
              <p v-if="accountNumberError" class="error-text">
                <i class="fas fa-exclamation-circle"></i> {{ accountNumberError }}
              </p>
            </div>

            <div class="form-group">
              <label for="accountName">
                Nama Penerima
                <span class="required">*</span>
              </label>
              <div class="input-wrapper">
                <i class="input-icon fas fa-user"></i>
                <input
                  type="text"
                  id="accountName"
                  :value="
                    editForm.method === 'bank' ? bankForm.accountName : ewalletForm.accountName
                  "
                  @input="updateAccountName($event)"
                  placeholder="Nama penerima rekening/e-wallet"
                  class="form-input with-icon"
                  required
                />
              </div>
            </div>
          </div>
        </keep-alive>

        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="cancelEdit">Batal</button>
          <button type="submit" class="save-btn" :disabled="isSaving || !isFormValid">
            <i class="fas fa-spinner fa-spin" v-if="isSaving"></i>
            <span>{{ isSaving ? 'Menyimpan...' : 'Simpan' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/AuthStore'
import { useToast } from 'vue-toastification'
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useRoute } from 'vue-router'

const authStore = useAuthStore()
const toast = useToast()
const route = useRoute()

// State
const isLoading = ref(true)
const isEditing = ref(false)
const isSaving = ref(false)
const isDropdownOpen = ref(false)
const userDocId = ref(null)
const accountNumberError = ref('')

// Payment information
const paymentInfo = ref({
  method: 'bank',
  name: '',
  accountNumber: '',
  accountName: '',
  updatedAt: null,
})

// Separate form data for bank and ewallet
const bankForm = ref({
  name: '',
  accountNumber: '',
  accountName: '',
})

const ewalletForm = ref({
  name: '',
  accountNumber: '',
  accountName: '',
})

// Edit form method selector
const editForm = ref({
  method: 'bank',
})

// Options for banks and e-wallets
const bankOptions = ref([
  'BCA',
  'Mandiri',
  'BNI',
  'BRI',
  'CIMB Niaga',
  'Permata',
  'BTN',
  'BTPN',
  'Lainnya',
])
const ewalletOptions = ref(['OVO', 'GoPay', 'DANA', 'ShopeePay', 'LinkAja', 'Lainnya'])

// Define handleClickOutside outside of onMounted for proper scope
const handleClickOutside = (e) => {
  if (isDropdownOpen.value && !e.target.closest('.custom-dropdown')) {
    isDropdownOpen.value = false
  }
}

// Formatted last updated date
const formattedLastUpdated = computed(() => {
  if (!paymentInfo.value.updatedAt) return 'Belum pernah diperbarui'

  const date = new Date(paymentInfo.value.updatedAt)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

// Get active form based on current method
const activeForm = computed(() => {
  return editForm.value.method === 'bank' ? bankForm.value : ewalletForm.value
})

// Validate form before submission
const isFormValid = computed(() => {
  const form = activeForm.value
  return (
    editForm.value.method &&
    form.name &&
    form.accountNumber &&
    form.accountName &&
    !accountNumberError.value
  )
})

// Load user payment information
const loadPaymentInfo = async () => {
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

    const userDoc = querySnapshot.docs[0]
    userDocId.value = userDoc.id
    const userData = userDoc.data()

    // Check if payment info exists
    if (userData.paymentInfo) {
      paymentInfo.value = {
        method: userData.paymentInfo.method || 'bank',
        name: userData.paymentInfo.name || '',
        accountNumber: userData.paymentInfo.accountNumber || '',
        accountName: userData.paymentInfo.accountName || '',
        updatedAt: userData.updatedAt ? userData.updatedAt.toDate() : null,
      }

      // Initialize the proper form based on existing data
      if (paymentInfo.value.method === 'bank') {
        bankForm.value = {
          name: paymentInfo.value.name,
          accountNumber: paymentInfo.value.accountNumber,
          accountName: paymentInfo.value.accountName,
        }
      } else {
        ewalletForm.value = {
          name: paymentInfo.value.name,
          accountNumber: paymentInfo.value.accountNumber,
          accountName: paymentInfo.value.accountName,
        }
      }
    }
  } catch (error) {
    console.error('Error loading payment info:', error)
    toast.error('Gagal memuat informasi pembayaran')
  } finally {
    isLoading.value = false
  }
}

// Start editing payment information
const startEditing = () => {
  // Set initial edit form method
  editForm.value.method = paymentInfo.value.method

  // Ensure the appropriate form is initialized
  if (paymentInfo.value.method === 'bank') {
    bankForm.value = {
      name: paymentInfo.value.name,
      accountNumber: paymentInfo.value.accountNumber,
      accountName: paymentInfo.value.accountName,
    }
  } else {
    ewalletForm.value = {
      name: paymentInfo.value.name,
      accountNumber: paymentInfo.value.accountNumber,
      accountName: paymentInfo.value.accountName,
    }
  }

  isEditing.value = true
}

// Cancel editing
const cancelEdit = () => {
  isEditing.value = false
  accountNumberError.value = ''
  isDropdownOpen.value = false
}

// Toggle dropdown for payment options
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// Select payment method (bank or ewallet)
const selectPaymentMethod = (method) => {
  editForm.value.method = method
  accountNumberError.value = '' // Reset validation error
}

// Select a payment option from the dropdown
const selectOption = (option) => {
  if (editForm.value.method === 'bank') {
    bankForm.value.name = option
  } else {
    ewalletForm.value.name = option
  }
  isDropdownOpen.value = false
}

// Update account number based on payment method
const updateAccountNumber = (event) => {
  const value = event.target.value
  if (editForm.value.method === 'bank') {
    bankForm.value.accountNumber = value
  } else {
    ewalletForm.value.accountNumber = value
  }
  validateAccountNumber()
}

// Update account name based on payment method
const updateAccountName = (event) => {
  const value = event.target.value
  if (editForm.value.method === 'bank') {
    bankForm.value.accountName = value
  } else {
    ewalletForm.value.accountName = value
  }
}

// Validate account/e-wallet number
const validateAccountNumber = () => {
  const currentForm = editForm.value.method === 'bank' ? bankForm.value : ewalletForm.value

  // Remove non-digits
  currentForm.accountNumber = currentForm.accountNumber.replace(/\D/g, '')

  const maxLength = editForm.value.method === 'bank' ? 17 : 13

  if (currentForm.accountNumber && currentForm.accountNumber.length > maxLength) {
    currentForm.accountNumber = currentForm.accountNumber.substring(0, maxLength)
  }

  // Validate for bank (typically 10-17 digits)
  if (editForm.value.method === 'bank') {
    if (currentForm.accountNumber && currentForm.accountNumber.length < 10) {
      accountNumberError.value = 'Nomor rekening bank minimal 10 digit'
    } else {
      accountNumberError.value = ''
    }
  }
  // Validate for e-wallet (typically 10-13 digits)
  else if (editForm.value.method === 'ewallet') {
    if (currentForm.accountNumber && currentForm.accountNumber.length < 10) {
      accountNumberError.value = 'Nomor e-wallet minimal 10 digit'
    } else {
      accountNumberError.value = ''
    }
  }
}
const savePaymentInfo = async () => {
  if (!isFormValid.value) {
    toast.error('Silakan lengkapi semua informasi dengan benar')
    return
  }

  try {
    isSaving.value = true

    if (!userDocId.value) {
      toast.error('ID pengguna tidak ditemukan')
      return
    }

    // Get current form data based on selected method
    const currentForm = editForm.value.method === 'bank' ? bankForm.value : ewalletForm.value

    // Update the user document with new payment info
    await updateDoc(doc(db, 'users', userDocId.value), {
      paymentInfo: {
        method: editForm.value.method,
        name: currentForm.name,
        accountNumber: currentForm.accountNumber,
        accountName: currentForm.accountName,
      },
      updatedAt: new Date(),
    })

    // Update local state
    paymentInfo.value = {
      method: editForm.value.method,
      name: currentForm.name,
      accountNumber: currentForm.accountNumber,
      accountName: currentForm.accountName,
      updatedAt: new Date(),
    }

    // Reset the unused payment method data
    if (editForm.value.method === 'bank') {
      ewalletForm.value = {
        name: '',
        accountNumber: '',
        accountName: '',
      }
    } else {
      bankForm.value = {
        name: '',
        accountNumber: '',
        accountName: '',
      }
    }

    toast.success('Informasi pembayaran berhasil diperbarui')
    isEditing.value = false

    // Update auth store if needed
    authStore.refreshUserData()
  } catch (error) {
    console.error('Error saving payment info:', error)
    toast.error('Gagal menyimpan informasi pembayaran')
  } finally {
    isSaving.value = false
  }
}

// Initialize component
onMounted(() => {
  loadPaymentInfo()

  // Add click event listener
  document.addEventListener('click', handleClickOutside)

  // Check for URL parameter
  const shouldOpenEdit = route.query.edit === 'true'

  // Also check for the localStorage flag
  const editModeFlag = localStorage.getItem('payment_edit_mode')

  // Open edit mode if either condition is true
  if (shouldOpenEdit || editModeFlag === 'true') {
    isEditing.value = true
    localStorage.removeItem('payment_edit_mode') // Clear the flag
  }
})

// Cleanup when component is unmounted
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* General layout */
.payment-view {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 1rem;
}

.section-title {
  font-size: 1.75rem;
  color: #333;
  margin-bottom: 2rem;
  font-weight: 600;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #666;
}

.loading-container i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #02163b;
}

/* Payment Info Card */
.payment-info-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
}
/* 
.payment-info-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
} */

.card-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.payment-title {
  display: flex;
  align-items: center;
}

.payment-icon {
  background-color: #e8f4ff;
  color: #02163b;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  margin-right: 1rem;
}

.payment-label h3 {
  font-size: 1.25rem;
  margin: 0 0 0.25rem 0;
  color: #333;
}

.payment-subtitle {
  font-size: 0.875rem;
  color: #666;
}

.edit-btn {
  background-color: transparent;
  color: #02163b;
  border: 1px solid #02163b;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.edit-btn i {
  margin-right: 0.5rem;
}

.edit-btn:hover {
  background-color: #02163b;
  color: white;
}

.payment-details {
  padding: 1.5rem;
}

.detail-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f5f5f5;
}

.detail-row:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.detail-label {
  width: 40%;
  color: #666;
  font-weight: 500;
  padding-right: 1rem;
}

.detail-value {
  width: 60%;
  color: #333;
  font-weight: 600;
}

/* Edit Form */
.payment-edit-form {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.form-header h3 {
  font-size: 1.25rem;
  margin: 0;
  color: #333;
}

.close-btn {
  background-color: transparent;
  border: none;
  font-size: 1.25rem;
  color: #666;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #02163b;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.required {
  color: #e53935;
  margin-left: 2px;
}

.payment-method-options {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.payment-option {
  flex: 1;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.payment-option:hover {
  border-color: #02163b;
  background-color: rgba(2, 22, 59, 0.02);
}

.payment-option.selected {
  border-color: #02163b;
  background-color: rgba(2, 22, 59, 0.05);
}

.payment-details {
  flex: 1;
}

.payment-name {
  font-weight: 600;
  display: block;
  margin-bottom: 0.25rem;
}

.payment-desc {
  font-size: 0.875rem;
  color: #666;
}

.selected-indicator {
  width: 24px;
  height: 24px;
  color: #02163b;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.payment-option.selected .selected-indicator {
  opacity: 1;
}

/* Custom dropdown */
.custom-dropdown {
  position: relative;
  width: 100%;
}

.selected-option {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  background-color: white;
  transition: all 0.3s ease;
}

.selected-option:hover {
  border-color: #02163b;
}

.dropdown-icon {
  margin-left: auto;
  transition: transform 0.3s ease;
}

.custom-dropdown.active .dropdown-icon {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-top: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dropdown-option {
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.dropdown-option:hover {
  background-color: #f5f5f5;
}

.dropdown-option.selected {
  font-weight: bold;
  color: #02163b;
}

/* Input with icons */
.input-wrapper {
  position: relative;
  width: 100%;
}

.input-icon {
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  color: #666;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #02163b;
  outline: none;
  box-shadow: 0 0 0 2px rgba(2, 22, 59, 0.1);
}

.form-input.with-icon {
  padding-left: 2.5rem;
}

.error-text {
  color: #e53935;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
}

.error-text i {
  margin-right: 0.5rem;
}

/* Form actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn,
.save-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn {
  background-color: transparent;
  border: 1px solid #e0e0e0;
  color: #666;
}

.cancel-btn:hover {
  background-color: #f5f5f5;
  border-color: #d0d0d0;
}

.save-btn {
  background-color: #02163b;
  color: white;
  border: none;
}

.save-btn:hover:not(:disabled) {
  background-color: #03235b;
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.save-btn i {
  margin-right: 0.5rem;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .section-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .payment-title {
    margin-bottom: 1rem;
  }

  .edit-btn {
    align-self: flex-end;
  }

  .detail-label,
  .detail-value {
    width: 100%;
  }

  .detail-label {
    margin-bottom: 0.25rem;
  }

  .payment-method-options {
    flex-direction: column;
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
  }

  /* Improved touch targets for mobile */
  .payment-option,
  .selected-option,
  .dropdown-option,
  .cancel-btn,
  .save-btn {
    padding: 0.875rem;
  }
}

/* iOS specific optimizations */
@media screen and (max-width: 844px) {
  /* Ensure better tap targets */
  button,
  .payment-option,
  .dropdown-option {
    min-height: 44px; /* Apple's recommended minimum touch target size */
  }

  /* iOS specific input styling */
  input,
  select,
  .form-input {
    font-size: 16px; /* Prevents iOS from zooming in on form fields */
    -webkit-appearance: none; /* Removes default iOS styling */
    border-radius: 8px;
  }

  /* Improved scrolling on iOS */
  .dropdown-menu {
    -webkit-overflow-scrolling: touch;
  }

  /* Prevent pull-to-refresh */
  .payment-view {
    overscroll-behavior-y: contain;
  }
}
</style>
```
