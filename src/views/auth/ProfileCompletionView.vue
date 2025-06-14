<template>
  <div class="profile-completion-container">
    <div class="profile-completion-content">
      <!-- Left side with logo and information -->
      <div class="info-section">
        <div class="logo-wrapper">
          <img src="../../assets/Logo Difia Haki.png" alt="DIFIA" class="difia-logo" />
        </div>
        <div class="info-text">
          <h2>Hampir Selesai!</h2>
          <p>Lengkapi informasi kontak dan pembayaran Anda untuk menyelesaikan pendaftaran.</p>
        </div>
      </div>

      <!-- Right side with form -->
      <div class="form-section">
        <div class="form-header">
          <h1>Lengkapi Profil Anda</h1>
          <div class="progress-indicator">
            <div class="progress-step completed">
              <div class="step-number">1</div>
              <div class="step-label">Akun</div>
            </div>
            <div class="progress-line"></div>
            <div class="progress-step active">
              <div class="step-number">2</div>
              <div class="step-label">Profil</div>
            </div>
            <div class="progress-line"></div>
            <div class="progress-step">
              <div class="step-number">3</div>
              <div class="step-label">Selesai</div>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="completion-form">
          <!-- Contact Information Section -->
          <div class="form-section-title">
            <i class="fas fa-user"></i>
            <span>Informasi Kontak</span>
          </div>

          <div class="form-group">
            <label for="phone">Nomor Telepon <span class="required">*</span></label>
            <div class="input-wrapper">
              <span class="input-prefix">+62</span>
              <input
                id="phone"
                type="tel"
                v-model="phoneWithoutPrefix"
                placeholder="8xxxxxxxxxx"
                class="form-input with-prefix"
                required
                maxlength="12"
                @input="validatePhone"
              />
            </div>
            <p v-if="phoneError" class="error-text">
              <i class="fas fa-exclamation-circle"></i> {{ phoneError }}
            </p>
            <p v-else class="hint-text">Contoh: 812345678</p>
          </div>

          <!-- Payment Information Section -->
          <div class="form-section-title">
            <i class="fas fa-credit-card"></i>
            <span>Informasi Pembayaran</span>
          </div>

          <div class="form-group payment-selection">
            <label>Pilih Metode Pembayaran <span class="required">*</span></label>
            <div class="payment-method-options">
              <div
                class="payment-option"
                :class="{ selected: profileData.paymentMethod === 'bank' }"
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
                :class="{ selected: profileData.paymentMethod === 'ewallet' }"
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

          <div class="payment-details-inputs">
            <div class="form-group">
              <label for="paymentName">
                {{ profileData.paymentMethod === 'bank' ? 'Nama Bank' : 'Nama E-Wallet' }}
                <span class="required">*</span>
              </label>
              <div class="custom-dropdown" :class="{ active: isPaymentDropdownOpen }">
                <div
                  class="selected-option"
                  @click="togglePaymentDropdown"
                  @keydown="handleDropdownKeydown"
                >
                  <i
                    :class="[
                      'input-icon',
                      profileData.paymentMethod === 'bank'
                        ? 'fas fa-landmark'
                        : 'fas fa-mobile-alt',
                    ]"
                  ></i>
                  <span>{{
                    profileData.paymentName ||
                    (profileData.paymentMethod === 'bank' ? 'Pilih Bank' : 'Pilih E-Wallet')
                  }}</span>
                  <i
                    class="fas fa-chevron-down dropdown-icon"
                    :class="{ rotate: isPaymentDropdownOpen }"
                  ></i>
                </div>
                <transition name="dropdown-fade">
                  <div class="dropdown-menu" v-if="isPaymentDropdownOpen" ref="dropdownMenu">
                    <div
                      v-for="option in paymentOptions"
                      :key="option"
                      class="dropdown-option"
                      :class="{ 'option-selected': profileData.paymentName === option }"
                      @click="selectPaymentOption(option)"
                      tabindex="0"
                      @keydown.enter="selectPaymentOption(option)"
                    >
                      <i
                        class="fas fa-check check-icon"
                        v-if="profileData.paymentName === option"
                      ></i>
                      {{ option }}
                    </div>
                  </div>
                </transition>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="accountNumber">
                  {{ profileData.paymentMethod === 'bank' ? 'Nomor Rekening' : 'Nomor E-Wallet' }}
                  <span class="required">*</span>
                </label>
                <div class="input-wrapper">
                  <i class="input-icon fas fa-hashtag"></i>
                  <input
                    id="accountNumber"
                    type="text"
                    v-model="profileData.accountNumber"
                    :placeholder="
                      profileData.paymentMethod === 'bank' ? 'Nomor rekening' : 'Nomor e-wallet'
                    "
                    class="form-input with-icon"
                    required
                    @input="validateAccountNumber"
                  />
                </div>
                <p v-if="accountNumberError" class="error-text">
                  <i class="fas fa-exclamation-circle"></i> {{ accountNumberError }}
                </p>
              </div>

              <div class="form-group">
                <label for="ownerName">Nama Pemilik <span class="required">*</span></label>
                <div class="input-wrapper">
                  <i class="input-icon fas fa-user"></i>
                  <input
                    id="ownerName"
                    type="text"
                    v-model="profileData.ownerName"
                    placeholder="Nama pemilik rekening/e-wallet"
                    class="form-input with-icon"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="form-privacy-notice">
            <i class="fas fa-shield-alt"></i>
            <p>
              Informasi pembayaran Anda disimpan dengan baik dan hanya akan digunakan untuk proses
              refund.
            </p>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="isSubmitting || !isFormValid">
              <span v-if="isSubmitting">
                <i class="fas fa-spinner fa-spin"></i>
                Memproses...
              </span>
              <span v-else>
                Simpan & Lanjutkan
                <i class="fas fa-arrow-right"></i>
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/AuthStore'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/config/firebase'

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const isSubmitting = ref(false)
const phoneError = ref('')
const accountNumberError = ref('')

const profileData = ref({
  phone: '',
  paymentMethod: 'bank',
  paymentName: '',
  accountNumber: '',
  ownerName: '',
})

// For phone input without the prefix
const phoneWithoutPrefix = computed({
  get() {
    return profileData.value.phone.startsWith('62')
      ? profileData.value.phone.substring(2)
      : profileData.value.phone
  },
  set(value) {
    // Remove non-digits
    const digitsOnly = value.replace(/\D/g, '')
    profileData.value.phone = '62' + digitsOnly
  },
})

// Select payment method with animation
const selectPaymentMethod = (method) => {
  profileData.value.paymentMethod = method
}

// Validate phone number
const validatePhone = () => {
  // Ensure phone starts with 62
  if (!profileData.value.phone.startsWith('62')) {
    profileData.value.phone = '62' + profileData.value.phone
  }

  // Remove non-digits
  profileData.value.phone = profileData.value.phone.replace(/\D/g, '')

  // Validate format (must start with 62 followed by 9-12 digits)
  if (profileData.value.phone && !/^62\d{9,12}$/.test(profileData.value.phone)) {
    phoneError.value = 'Format nomor telepon tidak valid'
  } else {
    phoneError.value = ''
  }
}

// Validate account/e-wallet number
const validateAccountNumber = () => {
  // Remove non-digits
  profileData.value.accountNumber = profileData.value.accountNumber.replace(/\D/g, '')

  const maxLength = profileData.value.paymentMethod === 'bank' ? 17 : 13

  if (profileData.value.accountNumber && profileData.value.accountNumber.length > maxLength) {
    profileData.value.accountNumber = profileData.value.accountNumber.substring(0, maxLength)
  }

  // Validate for bank (typically 10-17 digits)
  if (profileData.value.paymentMethod === 'bank') {
    if (profileData.value.accountNumber && profileData.value.accountNumber.length < 10) {
      accountNumberError.value = 'Nomor rekening bank minimal 10 digit'
    } else {
      accountNumberError.value = ''
    }
  }
  // Validate for e-wallet (typically 10-13 digits)
  else if (profileData.value.paymentMethod === 'ewallet') {
    if (profileData.value.accountNumber && profileData.value.accountNumber.length < 10) {
      accountNumberError.value = 'Nomor e-wallet minimal 10 digit'
    } else {
      accountNumberError.value = ''
    }
  }
}

// Form validation
const isFormValid = computed(() => {
  return (
    profileData.value.phone &&
    !phoneError.value &&
    profileData.value.paymentName &&
    profileData.value.accountNumber &&
    !accountNumberError.value &&
    profileData.value.ownerName
  )
})

// Watch for payment method changes to clear related fields
watch(
  () => profileData.value.paymentMethod,
  () => {
    profileData.value.paymentName = ''
    profileData.value.accountNumber = ''
    accountNumberError.value = ''
  },
)

// Convert the phone number from "62xxxxxxxx" to "0xxxxxxxx" format for database
const formatPhoneForDB = (phone) => {
  if (phone.startsWith('62')) {
    return '0' + phone.substring(2)
  }
  return phone
}

const handleSubmit = async () => {
  if (!isFormValid.value) {
    toast.error('Silakan lengkapi semua informasi dengan benar')
    return
  }

  try {
    isSubmitting.value = true

    if (!authStore.currentUser || !authStore.currentUser.id) {
      toast.error('Sesi login tidak valid. Silakan login kembali.')
      router.push('/login')
      return
    }

    // Find the user document
    const userQuery = query(collection(db, 'users'), where('uid', '==', authStore.currentUser.id))
    const querySnapshot = await getDocs(userQuery)

    if (querySnapshot.empty) {
      toast.error('Data pengguna tidak ditemukan')
      return
    }

    const userDoc = querySnapshot.docs[0]

    // Format the phone number for database storage (remove 62, add 0)
    const formattedPhone = formatPhoneForDB(profileData.value.phone)

    // Update the user profile with payment info
    await updateDoc(doc(db, 'users', userDoc.id), {
      phone: formattedPhone, // Using the formatted phone with 0 prefix
      paymentInfo: {
        method: profileData.value.paymentMethod,
        name: profileData.value.paymentName,
        accountNumber: profileData.value.accountNumber,
        accountName: profileData.value.ownerName,
      },
      profileComplete: true,
      updatedAt: new Date(),
    })

    // Update local user state
    authStore.currentUser = {
      ...authStore.currentUser,
      phone: formattedPhone, // Store the formatted phone in the local state too
    }

    toast.success('Profil berhasil dilengkapi!')

    // Clear the Google sign-in flow marker
    sessionStorage.removeItem('googleSignInFlow')

    // Redirect to home page
    router.push('/')
  } catch (error) {
    console.error('Profile completion error:', error)
    toast.error('Gagal menyimpan informasi profil')
  } finally {
    isSubmitting.value = false
  }
}

// Add this in the onMounted hook
onMounted(async () => {
  const isInGoogleFlow = sessionStorage.getItem('googleSignInFlow') === 'true'

  // If we're in Google flow but the auth state appears logged out after refresh
  if (isInGoogleFlow && !authStore.currentUser) {
    try {
      // Try to reinitialize auth state
      await authStore.initializeAuthState()

      // If still not logged in, redirect to login
      if (!authStore.currentUser) {
        toast.error('Sesi Anda telah berakhir. Silakan login kembali.')
        router.push('/login')
        // Clear the flow to prevent redirect loops
        sessionStorage.removeItem('googleSignInFlow')
      }
    } catch (error) {
      console.error('Auth reinitialization error:', error)
      toast.error('Terjadi kesalahan. Silakan login kembali.')
      router.push('/login')
      sessionStorage.removeItem('googleSignInFlow')
    }
  }
})

const isPaymentDropdownOpen = ref(false)
const dropdownMenu = ref(null)
const activeOptionIndex = ref(-1)

// Bank and e-wallet options
const bankOptions = ['BNI', 'BCA', 'BRI', 'BTN', 'Mega', 'Permata', 'Danamon', 'Bukopin', 'Seabank']
const ewalletOptions = ['Dana', 'OVO', 'GoPay', 'ShopeePay']

// Computed property to get the appropriate options based on selected payment method
const paymentOptions = computed(() => {
  return profileData.value.paymentMethod === 'bank' ? bankOptions : ewalletOptions
})

// Toggle dropdown visibility
const togglePaymentDropdown = () => {
  isPaymentDropdownOpen.value = !isPaymentDropdownOpen.value
  if (isPaymentDropdownOpen.value) {
    // Reset active index when opening
    activeOptionIndex.value = -1
    // Focus the dropdown after it opens
    nextTick(() => {
      const options = dropdownMenu.value?.querySelectorAll('.dropdown-option')
      if (options && options.length) {
        options[0].focus()
      }
    })
  }
}

// Handle option selection
const selectPaymentOption = (option) => {
  profileData.value.paymentName = option
  isPaymentDropdownOpen.value = false
}

// Handle keyboard navigation
const handleDropdownKeydown = (event) => {
  if (!isPaymentDropdownOpen.value) {
    // Open dropdown on arrow down/up
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      togglePaymentDropdown()
    }
    return
  }

  const options = dropdownMenu.value?.querySelectorAll('.dropdown-option')
  if (!options || !options.length) return

  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      isPaymentDropdownOpen.value = false
      break
    case 'ArrowDown':
      event.preventDefault()
      activeOptionIndex.value = Math.min(activeOptionIndex.value + 1, options.length - 1)
      options[activeOptionIndex.value].focus()
      break
    case 'ArrowUp':
      event.preventDefault()
      activeOptionIndex.value = Math.max(activeOptionIndex.value - 1, 0)
      options[activeOptionIndex.value].focus()
      break
    case 'Enter':
      event.preventDefault()
      if (activeOptionIndex.value >= 0) {
        selectPaymentOption(paymentOptions.value[activeOptionIndex.value])
      }
      break
  }
}

// Add outside click handler
const handleClickOutside = (event) => {
  if (isPaymentDropdownOpen.value && !event.target.closest('.custom-dropdown')) {
    isPaymentDropdownOpen.value = false
  }
}

// Add event listeners when component is mounted
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

// Clean up event listeners when component is unmounted
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Modern, clean styling with attention to UX principles */
.profile-completion-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
  padding: 2rem;
  font-family: 'Montserrat', sans-serif;
}

.profile-completion-content {
  display: flex;
  width: 100%;
  max-width: 1100px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  background: white;
}

/* Left side styling */
.info-section {
  width: 40%;
  background: linear-gradient(135deg, #02163b 0%, #02265e 100%);
  color: white;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.logo-wrapper {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  width: 80%;
  margin: 0 auto 2rem;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.difia-logo {
  max-width: 100%;
  height: auto;
  max-height: 220px;
}

.info-text {
  padding: 0 1rem;
}

.info-text h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.info-text p {
  margin-bottom: 2rem;
  font-size: 1rem;
  line-height: 1.6;
  opacity: 0.9;
}

.benefits {
  margin-top: 2rem;
}

.benefit-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.benefit-item i {
  color: #e8ba38;
  font-size: 1.2rem;
  margin-right: 0.75rem;
}

/* Form section styling */
.form-section {
  flex: 1;
  padding: 3rem;
  background: white;
  overflow-y: auto;
}

.form-header {
  margin-bottom: 2rem;
  text-align: center;
}

.form-header h1 {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #02163b;
}

/* Progress indicator */
.progress-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #757575;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.step-label {
  font-size: 0.8rem;
  color: #757575;
}

.progress-step.active .step-number {
  background-color: #e8ba38;
  color: white;
}

.progress-step.active .step-label {
  color: #02163b;
  font-weight: 500;
}

.progress-step.completed .step-number {
  background-color: #02163b;
  color: white;
}

.progress-line {
  width: 60px;
  height: 2px;
  background-color: #e0e0e0;
  margin: 0 10px;
  margin-bottom: 30px;
}

/* Form section titles */
.form-section-title {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  color: #02163b;
}

.form-section-title i {
  margin-right: 0.75rem;
  font-size: 1.2rem;
}

.form-section-title span {
  font-weight: 600;
  font-size: 1.1rem;
}

/* Form styling */
.completion-form {
  width: 100%;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
}

.required {
  color: #d32f2f;
  margin-left: 3px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
}

.form-input.with-prefix {
  padding-left: 55px;
}

.form-input.with-icon {
  padding-left: 40px;
}

.input-prefix {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  background-color: #02163b;
  color: white;
  font-weight: 600;
  border-radius: 8px 0 0 8px;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: #757575;
}

.form-input:focus {
  outline: none;
  border-color: #02163b;
  box-shadow: 0 0 0 2px rgba(2, 22, 59, 0.1);
  background-color: white;
}

.hint-text {
  color: #757575;
  font-size: 0.8rem;
  margin-top: 5px;
}

.error-text {
  color: #d32f2f;
  font-size: 0.85rem;
  margin-top: 5px;
  display: flex;
  align-items: center;
}

.error-text i {
  margin-right: 5px;
}

/* Payment method options */
.payment-selection {
  margin-bottom: 2rem;
}

.payment-method-options {
  display: flex;
  gap: 1rem;
}

.payment-option {
  flex: 1;
  padding: 1.25rem;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #f9f9f9;
  position: relative;
  display: flex;
  align-items: center;
}

.payment-option:hover {
  border-color: #02163b;
  transform: translateY(-2px);
}

.payment-option.selected {
  border-color: #02163b;
  background-color: #eef5ff;
}

.payment-icon {
  width: 50px;
  height: 50px;
  background-color: #02163b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4rem;
  margin-right: 1rem;
}

.payment-details {
  flex: 1;
}

.payment-name {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #333;
}

.payment-desc {
  display: block;
  font-size: 0.85rem;
  color: #757575;
}

.selected-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #02163b;
  font-size: 1.25rem;
  opacity: 0;
  transition: all 0.3s ease;
}

.payment-option.selected .selected-indicator {
  opacity: 1;
}

/* Form layout improvements */
.payment-details-inputs {
  background-color: #f7faff;
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

/* Form privacy notice */
.form-privacy-notice {
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  border-left: 4px solid #02163b;
}

.form-privacy-notice i {
  font-size: 1.2rem;
  color: #02163b;
  margin-right: 1rem;
}

.form-privacy-notice p {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

/* Submit button */
.form-actions {
  margin-top: 2rem;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background-color: #02163b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn:hover:not(:disabled) {
  background-color: #03215c;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(2, 22, 59, 0.2);
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.submit-btn i {
  margin-left: 10px;
  font-size: 0.9rem;
}

.submit-btn i.fa-spinner {
  margin-right: 10px;
  margin-left: 0;
}

/* Custom Dropdown Styling */
.custom-dropdown {
  position: relative;
  max-width: 24.7rem;
  width: 100%;
}

.selected-option {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 15px 12px 40px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.selected-option:hover {
  border-color: #02163b;
}

.custom-dropdown.active .selected-option {
  border-color: #02163b;
  box-shadow: 0 0 0 2px rgba(2, 22, 59, 0.1);
  background-color: white;
}

.dropdown-icon {
  margin-left: auto;
  color: #02163b;
  transition: transform 0.3s ease;
}

.dropdown-icon.rotate {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 100%;
  max-height: 220px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.dropdown-option {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  padding-left: 40px;
}

.dropdown-option:hover,
.dropdown-option:focus {
  background-color: #f5f5f5;
  outline: none;
}

.dropdown-option.option-selected {
  background-color: rgba(2, 22, 59, 0.05);
  font-weight: 500;
  color: #02163b;
}

.check-icon {
  position: absolute;
  left: 15px;
  color: #02163b;
}

/* Custom scrollbar */
.dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* Transition animations */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* Ensure proper positioning of the icon */
.selected-option .input-icon {
  position: absolute;
  left: 12px;
}

/* ================================ */
/* RESPONSIVE DESIGN STARTS HERE */
/* ================================ */

/* Tablet Responsive - 768px to 1024px */
@media (max-width: 1024px) {
  .profile-completion-container {
    padding: 1.5rem;
  }

  .profile-completion-content {
    max-width: 900px;
  }

  .info-section {
    width: 35%;
    padding: 2.5rem 1.5rem;
  }

  .form-section {
    padding: 2.5rem;
  }

  .logo-wrapper {
    width: 85%;
    margin-bottom: 1.5rem;
  }

  .difia-logo {
    max-height: 180px;
  }

  .info-text h2 {
    font-size: 1.6rem;
  }

  .form-header h1 {
    font-size: 1.6rem;
  }
}

/* Mobile Landscape - 768px and below */
@media (max-width: 768px) {
  .profile-completion-container {
    padding: 1rem;
    align-items: flex-start;
    min-height: 100vh;
  }

  .profile-completion-content {
    flex-direction: column;
    max-width: 100%;
    min-height: 100vh;
    border-radius: 0;
  }

  /* Info section adjustments for mobile */
  .info-section {
    width: 100%;
    padding: 2rem 1.5rem;
    min-height: auto;
    display: flex;
    flex-direction: column; /* Pastikan arah kolom */
    justify-content: center; /* Center secara vertikal */
    align-items: center; /* Center secara horizontal - PERBAIKAN UTAMA */
    text-align: center; /* Center semua teks */
  }

  /* Logo wrapper - pastikan benar-benar center */
  .logo-wrapper {
    width: 60%;
    margin: 0 auto 1rem; /* Center horizontal dengan margin auto */
    padding: 1rem;
    display: flex; /* Tambahkan flex */
    justify-content: center; /* Center konten logo */
    align-items: center; /* Center vertikal logo */
  }

  /* Logo image - pastikan responsive dan center */
  .difia-logo {
    max-height: 120px;
    width: auto; /* Maintain aspect ratio */
    display: block; /* Block untuk centering yang lebih baik */
    margin: 0 auto; /* Center horizontal */
  }

  /* Info text - pastikan semua teks center */
  .info-text {
    padding: 0;
    text-align: center;
    width: 100%; /* Full width untuk centering yang optimal */
    display: flex; /* Flex container */
    flex-direction: column; /* Kolom layout */
    align-items: center; /* Center horizontal semua child elements */
  }

  /* Heading - center dengan margin auto */
  .info-text h2 {
    font-size: 1.4rem;
    margin: 0 auto 1rem auto; /* Center dengan margin auto */
    text-align: center;
    width: 100%;
  }

  /* Paragraph - center dengan optimal */
  .info-text p {
    font-size: 0.9rem;
    margin: 0 auto 1rem auto; /* Center dengan margin auto */
    text-align: center;
    max-width: 90%; /* Limit width untuk readability */
    line-height: 1.5; /* Better line height untuk mobile */
  }

  /* Form section adjustments for mobile */
  .form-section {
    padding: 2rem 1.5rem;
  }

  .form-header h1 {
    font-size: 1.4rem;
    margin-bottom: 1rem;
  }

  /* Progress indicator mobile adjustments */
  .progress-indicator {
    margin-bottom: 1.5rem;
  }

  .step-number {
    width: 25px;
    height: 25px;
    font-size: 0.8rem;
  }

  .step-label {
    font-size: 0.7rem;
  }

  .progress-line {
    width: 40px;
    margin: 0 5px;
    margin-bottom: 20px;
  }

  /* Form adjustments */
  .form-group {
    margin-bottom: 1.2rem;
  }

  .form-section-title {
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  /* Payment method options for mobile */
  .payment-method-options {
    flex-direction: column;
    gap: 0.8rem;
  }

  .payment-option {
    padding: 1rem;
  }

  .payment-icon {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
    margin-right: 0.8rem;
  }

  .payment-name {
    font-size: 0.9rem;
  }

  .payment-desc {
    font-size: 0.8rem;
  }

  /* Form row adjustments for mobile */
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .payment-details-inputs {
    padding: 1rem;
  }

  /* Input adjustments for mobile */
  .form-input {
    padding: 10px 12px;
    font-size: 0.9rem;
  }

  .form-input.with-prefix {
    padding-left: 50px;
  }

  .form-input.with-icon {
    padding-left: 35px;
  }

  .input-prefix {
    width: 45px;
    font-size: 0.9rem;
  }

  .input-icon {
    left: 10px;
    font-size: 0.9rem;
  }

  /* Custom dropdown mobile adjustments */
  .custom-dropdown {
    max-width: 100%;
  }

  .selected-option {
    padding: 10px 12px 10px 35px;
    font-size: 0.9rem;
  }

  .selected-option .input-icon {
    left: 10px;
    font-size: 0.9rem;
  }

  .dropdown-menu {
    max-height: 180px;
  }

  .dropdown-option {
    padding: 10px 12px;
    padding-left: 35px;
    font-size: 0.9rem;
  }

  /* Privacy notice mobile adjustments */
  .form-privacy-notice {
    padding: 0.8rem;
    flex-direction: column;
    text-align: center;
    border-left: none;
    border-top: 3px solid #02163b;
  }

  .form-privacy-notice i {
    margin-right: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }

  .form-privacy-notice p {
    font-size: 0.8rem;
  }

  /* Submit button mobile adjustments */
  .submit-btn {
    padding: 12px;
    font-size: 0.9rem;
  }
}

/* Small Mobile - 480px and below */
@media (max-width: 480px) {
  .profile-completion-container {
    padding: 0.5rem;
  }

  .info-section {
    padding: 1.5rem 1rem;
    align-items: center; /* Pastikan center horizontal */
    justify-content: center; /* Pastikan center vertikal */
  }

  .logo-wrapper {
    width: 70%;
    padding: 0.8rem;
    margin: 0 auto 0.8rem auto; /* Double ensure centering */
  }

  .difia-logo {
    max-height: 100px;
    margin: 0 auto; /* Ensure logo centering */
  }

  .info-text h2 {
    font-size: 1.2rem;
    margin: 0 auto 0.8rem auto;
    text-align: center;
  }

  .info-text p {
    font-size: 0.85rem;
    margin: 0 auto;
    text-align: center;
    max-width: 95%; /* Slightly wider pada mobile kecil */
  }
}

/* Extra Small Mobile - 360px and below */
@media (max-width: 360px) {
  .info-section {
    padding: 1rem 0.8rem;
    align-items: center;
    justify-content: center;
  }

  .logo-wrapper {
    width: 80%;
    padding: 0.6rem;
    margin: 0 auto 0.6rem auto;
  }

  .difia-logo {
    max-height: 80px;
    margin: 0 auto;
  }

  .info-text h2 {
    font-size: 1.1rem;
    margin: 0 auto 0.6rem auto;
  }

  .info-text p {
    margin: 0 auto;
    max-width: 98%;
  }
}

/* Landscape orientation - pastikan centering tetap baik */
@media (max-height: 600px) and (orientation: landscape) {
  .info-section {
    padding: 1rem;
    align-items: center;
    justify-content: center;
  }

  .logo-wrapper {
    margin: 0 auto 0.5rem auto;
  }

  .info-text h2 {
    margin: 0 auto 0.5rem auto;
  }

  .info-text p {
    margin: 0 auto 0.5rem auto;
  }
}
</style>
