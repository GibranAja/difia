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
              <div class="input-wrapper">
                <i
                  :class="[
                    'input-icon',
                    profileData.paymentMethod === 'bank' ? 'fas fa-landmark' : 'fas fa-mobile-alt',
                  ]"
                ></i>
                <input
                  id="paymentName"
                  type="text"
                  v-model="profileData.paymentName"
                  :placeholder="
                    profileData.paymentMethod === 'bank'
                      ? 'Contoh: BCA, Mandiri'
                      : 'Contoh: OVO, GoPay'
                  "
                  class="form-input with-icon"
                  required
                />
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
import { ref, computed, watch } from 'vue'
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

/* Responsive styles */
@media (max-width: 992px) {
  .profile-completion-content {
    flex-direction: column;
    max-width: 600px;
  }

  .info-section {
    width: 100%;
    padding: 2rem;
  }

  .form-section {
    padding: 2rem;
  }
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .payment-method-options {
    flex-direction: column;
  }

  .payment-option {
    margin-bottom: 1rem;
  }
}

@media (max-width: 480px) {
  .profile-completion-container {
    padding: 1rem;
  }

  .form-section {
    padding: 1.5rem;
  }

  .progress-line {
    width: 30px;
  }
}
</style>
```
