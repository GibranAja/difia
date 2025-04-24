<template>
  <main class="checkout-container">
    <header class="checkout-header">
      <a href="/" class="back-button">
        <i class="fas fa-chevron-left"></i>
      </a>
      <div class="header-title">
        <i class="fas fa-bag-shopping"></i>
        <h1>CHECKOUT</h1>
      </div>
    </header>

    <div v-if="orderStore.currentOrder || getOrderFromLocal()" class="checkout-content">
      <section class="checkout-section order-details">
        <h2 class="section-title">Ringkasan Order</h2>
        <div class="order-card" v-if="orderStore.currentOrder">
          <img
            :src="orderStore.currentOrder.image"
            :alt="orderStore.currentOrder.name"
            class="order-image"
          />
          <div class="order-info">
            <div class="order-header">
              <h3>{{ orderStore.currentOrder.name }}</h3>
              <p class="order-price">
                {{ orderStore.currentOrder.quantity }}x Rp
                {{ formatPrice(orderStore.currentOrder.price) }}
              </p>
            </div>
            <div class="order-specs">
              <div class="spec-item">
                <span class="spec-label">Tipe:</span>
                <span>{{ orderStore.currentOrder.customOptions.purchaseType }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Harga:</span>
                <span>{{ orderStore.currentOrder.customOptions.priceType }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Bahan Luar:</span>
                <span>{{ orderStore.currentOrder.customOptions.bahanLuar }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Bahan Dalam:</span>
                <span>{{ orderStore.currentOrder.customOptions.bahanDalam }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Aksesoris:</span>
                <span>{{ orderStore.currentOrder.customOptions.aksesoris.join(', ') }}</span>
              </div>
              <div class="spec-item" v-if="orderStore.currentOrder.customOptions.note">
                <span class="spec-label">Catatan:</span>
                <span>{{ orderStore.currentOrder.customOptions.note }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- New Shipping Address Section -->
      <section class="checkout-section customer-info">
        <h2 class="section-title">Alamat Pengiriman</h2>

        <!-- Loading state -->
        <div v-if="addressStore.loading" class="address-loading">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Memuat alamat...</p>
        </div>

        <!-- No addresses state -->
        <div v-else-if="addressStore.addresses.length === 0" class="no-address">
          <div class="empty-address">
            <i class="fas fa-map-marker-alt empty-icon"></i>
            <p>Anda belum memiliki alamat pengiriman</p>
            <button class="add-address-btn" @click="showAddressModal = true">
              <i class="fas fa-plus"></i> Buat Alamat
            </button>
          </div>
        </div>

        <!-- Address selection -->
        <div v-else class="address-selection">
          <div
            v-for="address in addressStore.addresses"
            :key="address.id"
            :class="['address-card', { active: selectedAddressId === address.id }]"
            @click="selectAddress(address)"
          >
            <div class="address-label">
              <i :class="getLabelIcon(address.label)"></i>
              <span>{{ address.label }}</span>
              <span v-if="address.isPrimary" class="primary-badge">Utama</span>
            </div>
            <div class="address-details">
              <p class="recipient">{{ address.name }}</p>
              <p class="phone">{{ address.phone }}</p>
              <p class="full-address">
                {{ address.address }}, {{ address.city }}, {{ address.province }}, {{ address.zip }}
              </p>
            </div>
            <div class="address-actions">
              <button class="edit-address-btn" @click.stop="editAddress(address)">
                <i class="fas fa-pen"></i>
              </button>
            </div>
          </div>

          <button class="add-another-address-btn" @click="showAddressModal = true">
            <i class="fas fa-plus"></i> Tambah Alamat Baru
          </button>
        </div>
      </section>

      <section class="checkout-section payment-method">
        <h2 class="section-title">Metode Pembayaran</h2>
        <div class="payment-options">
          <div class="qris-option">
            <div class="qr-code">
              <img src="../assets/QRIS_Difia.jpg" alt="QR Code" />
            </div>
          </div>
        </div>
        <div class="upload-section">
          <h3 class="upload-proof-title">
            <i class="fas fa-upload"></i>
            Upload bukti pembayaran
          </h3>
          <label
            for="paymentProof"
            class="upload-area"
            :class="{ 'has-file': orderStore.paymentProof }"
          >
            <div v-if="!orderStore.paymentProof">
              <i class="fas fa-cloud-upload-alt"></i>
              <span>Klik atau drag file ke sini</span>
            </div>
            <img v-else :src="orderStore.paymentProof" alt="Payment Proof" class="preview-image" />
            <input
              type="file"
              id="paymentProof"
              @change="handlePaymentProofUpload"
              accept="image/*"
              hidden
            />
          </label>
        </div>
      </section>

      <section class="checkout-section voucher-section">
        <h2 class="section-title">Voucher Tas</h2>
        <div class="voucher-input">
          <input
            type="text"
            v-model="voucherCode"
            placeholder="Masukkan kode voucher"
            :disabled="isApplyingVoucher"
          />
          <button
            @click="applyVoucher"
            :disabled="!voucherCode || isApplyingVoucher"
            class="voucher-button"
          >
            <span v-if="isApplyingVoucher"> Process<span class="loading-dots">...</span> </span>
            <span v-else>Gunakan</span>
          </button>
        </div>
        <div v-if="appliedVoucher" class="applied-voucher">
          <div class="voucher-info">
            <span class="voucher-code">{{ appliedVoucher.code }}</span>
            <span class="voucher-discount">
              -{{
                appliedVoucher.discountType === 'percentage'
                  ? appliedVoucher.discountValue + '%'
                  : 'Rp ' + formatPrice(appliedVoucher.discountValue)
              }}
            </span>
          </div>
          <button class="remove-voucher" @click="removeVoucher">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </section>

      <section class="checkout-section order-summary">
        <div class="summary-item">
          <span>Subtotal</span>
          <span>Rp {{ formatPrice(getSubtotal) }}</span>
        </div>
        <div class="summary-item">
          <span>Pengiriman</span>
          <span v-if="isLoadingShipping">Menghitung...</span>
          <span v-else>Rp {{ formatPrice(shippingCost) }}</span>
        </div>
        <div v-if="discountAmount > 0" class="summary-item discount">
          <span>Diskon Voucher</span>
          <span class="discount-amount">-Rp {{ formatPrice(discountAmount) }}</span>
        </div>
        <div class="summary-item total">
          <span>Total</span>
          <span>Rp {{ formatPrice(finalTotal) }}</span>
        </div>

        <div class="terms-checkbox">
          <label class="custom-checkbox">
            <input type="checkbox" v-model="acceptedTerms" id="termsCheckbox" />
            <span class="checkmark"></span>
            <span class="terms-text">
              Saya menyetujui
              <a href="/terms" target="_blank" class="terms-link">Syarat & Ketentuan</a> yang
              berlaku
            </span>
          </label>
        </div>

        <button
          class="checkout-button"
          :disabled="!isCheckoutEnabled || isProcessing"
          @click="handleSubmitOrder"
        >
          <span v-if="isProcessing">Process<span class="loading-dots">...</span></span>
          <span v-else>Bayar Sekarang</span>
        </button>

        <p class="terms-notice" v-if="!acceptedTerms">
          Anda harus menyetujui syarat & ketentuan untuk melanjutkan
        </p>

        <p class="terms-notice" v-if="!selectedAddressId && addressStore.addresses.length > 0">
          Pilih alamat pengiriman untuk melanjutkan
        </p>
      </section>
    </div>
    <div v-else>
      <p>Tidak ada data order. Kembali ke <router-link to="/">home</router-link></p>
    </div>

    <!-- Address Modal -->
    <AddressModalComponent
      v-if="showAddressModal"
      :is-editing="isEditingAddress"
      :initial-data="addressForm"
      :is-first-address="isFirstAddress"
      @close="closeAddressModal"
      @save="saveAddress"
      @error="(message) => toast.error(message)"
    />

    <!-- Address Confirmation Modal -->
    <div v-if="showConfirmationModal" class="modal-overlay" @click="showConfirmationModal = false">
      <div class="modal-content" @click.stop>
        <h2 class="modal-title">Konfirmasi Alamat Pengiriman</h2>

        <div class="address-confirmation">
          <p class="confirmation-text">Silahkan periksa kembali alamat pengiriman Anda:</p>

          <div class="confirmation-address" v-if="selectedAddress">
            <div class="address-label">
              <i :class="getLabelIcon(selectedAddress.label)"></i>
              <span>{{ selectedAddress.label }}</span>
              <span v-if="selectedAddress.isPrimary" class="primary-badge">Utama</span>
            </div>
            <div class="address-details">
              <p class="recipient">{{ selectedAddress.name }}</p>
              <p class="phone">{{ selectedAddress.phone }}</p>
              <p class="full-address">
                {{ selectedAddress.address }}, {{ selectedAddress.city }},
                {{ selectedAddress.province }}, {{ selectedAddress.zip }}
              </p>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="showConfirmationModal = false">
              Batal
            </button>
            <button type="button" class="submit-btn" @click="processOrderAfterConfirmation">
              {{ isProcessing ? 'Memproses...' : 'Konfirmasi & Bayar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import { useOrderStore } from '@/stores/OrderStore'
import { useAddressStore } from '@/stores/AddressStore'
import { useRouter } from 'vue-router'
import rajaOngkir from '@/api/RajaOngkir'
import { useVoucherStore } from '@/stores/VoucherStore'
import { useToast } from 'vue-toastification'
import AddressModalComponent from '@/components/AddressModalComponent.vue' // Add this import

const authStore = useAuthStore()
const orderStore = useOrderStore()
const addressStore = useAddressStore()
const router = useRouter()
const voucherStore = useVoucherStore()
const toast = useToast()

const provinces = ref([])
const cities = ref([])
const shippingCost = ref(0)
const courier = ref('jne') // Default courier
const isLoadingShipping = ref(false)
const isLoadingProvinces = ref(false)
const isLoadingCities = ref(false)
const isProcessing = ref(false)
const acceptedTerms = ref(false)

// Address selection
const selectedAddressId = ref(null)

// Address modal
const showAddressModal = ref(false)
const isEditingAddress = ref(false)
const isSavingAddress = ref(false)
const addressForm = ref({
  name: '',
  email: '',
  phone: '',
  label: 'home',
  province: '',
  city: '',
  address: '',
  zip: '',
  isPrimary: false,
})

// Address confirmation modal
const showConfirmationModal = ref(false)
const selectedAddress = ref(null)

// Address label options
const addressLabelOptions = [
  { value: 'home', name: 'Rumah', icon: 'fas fa-home' },
  { value: 'office', name: 'Kantor', icon: 'fas fa-building' },
  { value: 'school', name: 'Sekolah', icon: 'fas fa-school' },
  { value: 'apartment', name: 'Apartemen', icon: 'fas fa-city' },
  { value: 'other', name: 'Lainnya', icon: 'fas fa-map-marker-alt' },
]

// Check if this is the first address
const isFirstAddress = computed(() => {
  return addressStore.addresses.length === 0
})

// Get icon based on address label
const getLabelIcon = (label) => {
  const option = addressLabelOptions.find((opt) => opt.value === label)
  return option ? option.icon : 'fas fa-map-marker-alt'
}

// Load all provinces
const loadProvinces = async () => {
  try {
    isLoadingProvinces.value = true
    provinces.value = await rajaOngkir.getProvinces()
  } catch (error) {
    console.error('Error loading provinces:', error)
  } finally {
    isLoadingProvinces.value = false
  }
}

// Load cities based on selected province
const loadCities = async (provinceName) => {
  if (!provinceName) return

  try {
    isLoadingCities.value = true
    const province = provinces.value.find((p) => p.province === provinceName)

    if (province) {
      cities.value = await rajaOngkir.getCities(province.province_id)
    }
  } catch (error) {
    console.error('Error loading cities:', error)
    toast.error('Gagal memuat data kota')
  } finally {
    isLoadingCities.value = false
  }
}

// Load cities for address form
const loadAddressCities = async (provinceName) => {
  await loadCities(provinceName)
  addressForm.value.city = '' // Reset city when province changes
}

// Calculate shipping cost
const calculateShipping = async (address) => {
  if (!address?.city) return

  try {
    isLoadingShipping.value = true

    // Extract city name from address
    const cityMatch = address.city.match(/([A-Za-z]+)\s+(.+)/)
    if (!cityMatch) {
      console.error('Invalid city format:', address.city)
      return
    }

    const cityType = cityMatch[1]
    const cityName = cityMatch[2]

    // Find city ID from cities list
    const city = cities.value.find(
      (c) =>
        c.type.toLowerCase() === cityType.toLowerCase() &&
        c.city_name.toLowerCase() === cityName.toLowerCase(),
    )

    if (city) {
      const weight = orderStore.currentOrder?.quantity * 1000 || 1000 // Assume 1kg per item
      const costs = await rajaOngkir.calculateShipping(city.city_id, weight, courier.value)
      shippingCost.value = costs[0]?.cost[0]?.value || 0
    } else {
      console.error('City not found:', address.city)
      shippingCost.value = 0
    }
  } catch (error) {
    console.error('Error calculating shipping:', error)
    shippingCost.value = 0
  } finally {
    isLoadingShipping.value = false
  }
}

// Format price display
const formatPrice = (price) => {
  return price.toLocaleString('id-ID')
}

// Calculate subtotal
const getSubtotal = computed(() => {
  const order = orderStore.currentOrder || getOrderFromLocal()
  if (!order) return 0
  return order.price * order.quantity
})

// Get order from localStorage
const getOrderFromLocal = () => {
  try {
    const savedOrder = localStorage.getItem('currentOrder')
    if (savedOrder) {
      return JSON.parse(savedOrder)
    }
    return null
  } catch (error) {
    console.error('Error getting order from local:', error)
    return null
  }
}

// Select address
const selectAddress = async (address) => {
  selectedAddressId.value = address.id

  isLoadingShipping.value = true

  try {
    if(address.province) {
    await loadCities(address.province)
  }
  await calculateShipping(address)  
  } catch (error) {
    console.error('Error selecting address:', error)
    toast.error('Gagal memuat alamat')
  } finally {
    isLoadingShipping.value = false
  }

  
}

// Initialize edit address
const editAddress = (address) => {
  isEditingAddress.value = true
  addressForm.value = { ...address }
  showAddressModal.value = true
}

// Open address modal for new address
const openAddressModal = () => {
  isEditingAddress.value = false
  addressForm.value = {
    name: authStore.currentUser?.name || '',
    email: authStore.currentUser?.email || '',
    phone: authStore.currentUser?.phone || '',
    label: 'home',
    province: '',
    city: '',
    address: '',
    zip: '',
    isPrimary: isFirstAddress.value,
  }
  showAddressModal.value = true
}

// Close address modal
const closeAddressModal = () => {
  showAddressModal.value = false
}

// Save address form
const saveAddress = async (addressData) => {
  try {
    isSavingAddress.value = true

    let result

    if (isEditingAddress.value) {
      result = await addressStore.updateAddress(addressData.id, addressData)
    } else {
      result = await addressStore.addAddress(addressData)
    }

    if (result.success) {
      // If this is the first address or the updated address was selected, update the shipping calculation
      if (isFirstAddress.value || result.address?.id === selectedAddressId.value) {
        const addressToUse = isEditingAddress.value
          ? addressStore.addresses.find((a) => a.id === addressData.id)
          : result.address

        if (addressToUse) {
          selectedAddressId.value = addressToUse.id
          await calculateShipping(addressToUse)
        }
      }

      // For first address, auto-select it
      if (isFirstAddress.value && result.address) {
        selectedAddressId.value = result.address.id
        await calculateShipping(result.address)
      }

      closeAddressModal()
      toast.success(
        isEditingAddress.value ? 'Alamat berhasil diperbarui' : 'Alamat berhasil ditambahkan',
      )
    }
  } catch (error) {
    console.error('Error saving address:', error)
    toast.error('Gagal menyimpan alamat')
  } finally {
    isSavingAddress.value = false
  }
}

// Validate phone in address form
const validateAddressPhone = (event) => {
  // Allow only digits
  addressForm.value.phone = event.target.value.replace(/\D/g, '')
}

// Check if checkout can proceed
const isCheckoutEnabled = computed(() => {
  return (
    selectedAddressId.value &&
    acceptedTerms.value &&
    !isLoadingShipping.value &&
    orderStore.paymentProof
  )
})

// Voucher code
const voucherCode = ref('')
const appliedVoucher = ref(null)
const isApplyingVoucher = ref(false)

// Discount calculation
const discountAmount = computed(() => {
  if (!appliedVoucher.value) return 0

  const subtotal = getSubtotal.value
  if (appliedVoucher.value.discountType === 'percentage') {
    return Math.floor((subtotal * appliedVoucher.value.discountValue) / 100)
  }
  return Math.min(appliedVoucher.value.discountValue, subtotal)
})

// Total amount calculation
const finalTotal = computed(() => {
  return getSubtotal.value + shippingCost.value - discountAmount.value
})

// Apply voucher
const applyVoucher = async () => {
  if (!voucherCode.value) return

  try {
    isApplyingVoucher.value = true

    // Get purchase type from current order
    const purchaseType = orderStore.currentOrder.customOptions.purchaseType
    const userId = authStore.currentUser?.id

    if (!userId) {
      toast.error('Anda harus login untuk menggunakan voucher')
      return
    }

    const result = await voucherStore.validateVoucher(voucherCode.value, purchaseType, userId)

    if (!result.success) {
      toast.error(result.error || 'Voucher tidak valid')
      return
    }

    // Check usage limits
    if (result.voucher.currentUses >= result.voucher.maxUses) {
      toast.error('Voucher sudah mencapai batas penggunaan')
      return
    }

    appliedVoucher.value = result.voucher
    voucherCode.value = ''
    toast.success('Voucher berhasil diterapkan')
  } catch (error) {
    console.error('Error applying voucher:', error)
    toast.error('Gagal menerapkan voucher')
  } finally {
    isApplyingVoucher.value = false
  }
}

// Remove voucher
const removeVoucher = () => {
  appliedVoucher.value = null
  toast.info('Voucher dihapus')
}

// Add these constants at the top of your script section with other constants
const MAX_DIMENSION = 1200 // Maximum dimension for resized images
const COMPRESSION_QUALITY = 0.6 // Image compression quality (0.6 = 60%)

// Add this resizeImage function before handlePaymentProofUpload
const resizeImage = (file) => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    image.onload = () => {
      let width = image.width
      let height = image.height

      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > MAX_DIMENSION) {
          height = Math.round((height * MAX_DIMENSION) / width)
          width = MAX_DIMENSION
        }
      } else {
        if (height > MAX_DIMENSION) {
          width = Math.round((width * MAX_DIMENSION) / height)
          height = MAX_DIMENSION
        }
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(image, 0, 0, width, height)

      // Use canvas to compress the image
      canvas.toBlob(
        (blob) => {
          // Convert blob to base64 for preview
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(blob)
        },
        'image/jpeg',
        COMPRESSION_QUALITY,
      )
    }

    image.onerror = reject
    image.src = URL.createObjectURL(file)
  })
}

// Replace your current handlePaymentProofUpload function with this one
const handlePaymentProofUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB initial check before compression

  if (file.size > MAX_FILE_SIZE) {
    toast.warning(
      `Gambar terlalu besar (${(file.size / 1024 / 1024).toFixed(2)}MB), akan dikompres`,
    )
  }

  try {
    isProcessing.value = true

    // Check if file is an image
    if (!file.type.match('image.*')) {
      toast.error('Hanya file gambar yang diperbolehkan')
      return
    }

    // Compress the image using our resize function
    const compressedImage = await resizeImage(file)
    orderStore.paymentProof = compressedImage

    toast.success('Bukti pembayaran berhasil diunggah')
  } catch (error) {
    console.error('Error processing image:', error)
    toast.error('Gagal memproses gambar, silakan coba lagi')
  } finally {
    isProcessing.value = false
  }
}

// Process voucher usage
const processVoucherUsage = async () => {
  if (appliedVoucher.value) {
    const result = await voucherStore.updateVoucherUsage(
      appliedVoucher.value.id,
      authStore.currentUser?.id,
    )

    if (!result.success) {
      toast.error('Gagal menggunakan voucher: ' + result.error)
      return false
    }
  }
  return true
}

// Submit order
const handleSubmitOrder = async () => {
  // Check if address is selected
  if (!selectedAddressId.value) {
    toast.error('Pilih alamat pengiriman terlebih dahulu')
    return
  }

  // Check terms acceptance
  if (!acceptedTerms.value) {
    toast.error('Mohon setujui syarat & ketentuan')
    return
  }

  // Check payment proof
  if (!orderStore.paymentProof) {
    toast.error('Mohon upload bukti pembayaran')
    return
  }

  // Get selected address
  selectedAddress.value = addressStore.addresses.find((addr) => addr.id === selectedAddressId.value)

  if (!selectedAddress.value) {
    toast.error('Alamat pengiriman tidak valid')
    return
  }

  // Show confirmation modal instead of processing immediately
  showConfirmationModal.value = true
}

// Process order after confirmation
const processOrderAfterConfirmation = async () => {
  try {
    isProcessing.value = true

    // Process voucher if applied
    const voucherProcessed = await processVoucherUsage()
    if (!voucherProcessed) return

    // Prepare order details
    const orderDetails = {
      name: selectedAddress.value.name,
      email: selectedAddress.value.email,
      phone: selectedAddress.value.phone,
      address: selectedAddress.value.address,
      province: selectedAddress.value.province,
      city: selectedAddress.value.city,
      zip: selectedAddress.value.zip,
      shippingCost: shippingCost.value,
      finalTotal: finalTotal.value,
      voucher: appliedVoucher.value,
      discountAmount: discountAmount.value,
    }

    // Create order
    const result = await orderStore.createOrder(orderDetails)
    if (result.success) {
      // Hide the modal
      showConfirmationModal.value = false

      // Clear checkout data
      localStorage.removeItem('checkout_items')
      router.push('/notification')
      localStorage.removeItem('currentOrder')
    }
  } catch (error) {
    toast.error('Gagal membuat pesanan: ' + error.message)
  } finally {
    isProcessing.value = false
  }
}

// Initial data loading
onMounted(async () => {
  try {
    // Load provinces first (needed for both address selection and creation)
    await loadProvinces()

    // Load user addresses
    await addressStore.fetchUserAddresses()

    // If user has a primary address, select it
    if (addressStore.primaryAddress) {
      selectedAddressId.value = addressStore.primaryAddress.id

      // First load cities for the selected address's province
      if (addressStore.primaryAddress.province) {
        await loadCities(addressStore.primaryAddress.province)
      }

      // Then calculate shipping
      await calculateShipping(addressStore.primaryAddress)
    }
    // If no addresses, show the modal
    else if (addressStore.addresses.length === 0) {
      openAddressModal()
    }
  } catch (error) {
    console.error('Error in onMounted:', error)
  }
})

// Handle navigation guard
onBeforeRouteLeave((to, from, next) => {
  // Skip confirmation if order is processed or going to notification page
  if (isProcessing.value || to.path === '/notification') {
    next()
    return
  }

  const confirmLeave = window.confirm(
    'Anda yakin ingin meninggalkan proses checkout? Data checkout Anda akan hilang.',
  )

  if (confirmLeave) {
    // Clear checkout data
    localStorage.removeItem('checkout_items')
    localStorage.removeItem('currentOrder')
    next()
  } else {
    next(false)
  }
})

// Handle beforeunload event
const handleBeforeUnload = (e) => {
  // Skip confirmation if order is processed
  if (isProcessing.value) return

  // Confirmation when closing/refreshing browser
  e.preventDefault()
  e.returnValue = 'Anda yakin ingin meninggalkan proses checkout? Data checkout Anda akan hilang.'
}

// Add beforeunload listener
onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

// Remove beforeunload listener
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
/* Base Layout & Container */
.checkout-container {
  max-width: 1200px;
  margin: 2rem auto 4rem;
  padding: 0 1.5rem;
  font-family: 'Montserrat', sans-serif;
  color: #333;
}

.checkout-header {
  display: flex;
  align-items: center;
  margin-bottom: 2.5rem;
  position: relative;
}

.back-button {
  position: absolute;
  left: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #02163b;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0 auto;
}

.header-title i {
  font-size: 1.5rem;
  color: #e8ba38;
}

.header-title h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #02163b;
  margin: 0;
}

/* Section Styling */
.checkout-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.checkout-section {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  margin-bottom: 2rem;
  transition: transform 0.3s ease;
}

.checkout-section:hover {
  transform: translateY(-3px);
}

.section-title {
  color: #02163b;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid rgba(232, 186, 56, 0.3);
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background-color: #e8ba38;
}

/* Order Details */
.order-card {
  display: flex;
  border-radius: 10px;
  overflow: hidden;
  background: #f9f9f9;
  transition: all 0.3s;
}

.order-card:hover {
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.07);
}

.order-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
}

.order-info {
  padding: 1rem;
  flex: 1;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.order-header h3 {
  margin: 0 0 0.25rem;
  color: #02163b;
  font-size: 1.1rem;
}

.order-price {
  font-weight: 600;
  color: #e8ba38;
  margin: 0;
}

.order-specs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  font-size: 0.9rem;
}

.spec-item {
  display: flex;
  flex-direction: column;
}

.spec-label {
  font-weight: 500;
  color: #666;
  margin-bottom: 0.25rem;
}

/* Address Selection */
.address-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  color: #666;
  background: #f9f9f9;
  border-radius: 10px;
  border: 1px dashed #ddd;
}

.address-loading i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #e8ba38;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.no-address {
  display: flex;
  justify-content: center;
  padding: 3rem 0;
}

.empty-address {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 400px;
  background: #f9f9f9;
  border-radius: 12px;
  padding: 2.5rem;
  border: 1px dashed #ddd;
}

.empty-icon {
  font-size: 3.5rem;
  color: #ccc;
  margin-bottom: 1.25rem;
}

.add-address-btn {
  margin-top: 1.5rem;
  padding: 0.85rem 1.75rem;
  background-color: #e8ba38;
  border: none;
  border-radius: 50px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 10px rgba(232, 186, 56, 0.3);
}

.add-address-btn:hover {
  background-color: #d5a832;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(232, 186, 56, 0.4);
}

.address-selection {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.address-card {
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  border: 2px solid #f0f0f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.address-card:hover {
  border-color: #e8ba38;
  box-shadow: 0 6px 16px rgba(232, 186, 56, 0.12);
  transform: translateY(-3px);
}

.address-card.active {
  border: 2px solid #e8ba38;
  background-color: rgba(232, 186, 56, 0.05);
}

.address-card.active::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  border: 2px solid #e8ba38;
  border-radius: 10px;
  animation: pulse 2s infinite;
  pointer-events: none;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(1.02);
  }
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
}

.address-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.address-label i {
  color: #e8ba38;
  font-size: 1.1rem;
}

.primary-badge {
  background-color: #e8ba38;
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 50px;
  font-size: 0.7rem;
  margin-left: 0.5rem;
  box-shadow: 0 2px 5px rgba(232, 186, 56, 0.2);
}

.address-details {
  margin-bottom: 0.5rem;
}

.recipient {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 1.05rem;
}

.phone {
  color: #666;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.phone::before {
  content: '\f095';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  font-size: 0.8rem;
  color: #999;
}

.full-address {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #555;
  padding-left: 0.2rem;
  border-left: 2px solid rgba(232, 186, 56, 0.3);
}

.address-actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.edit-address-btn {
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-address-btn:hover {
  color: #e8ba38;
  background: rgba(232, 186, 56, 0.1);
}

.add-another-address-btn {
  align-self: flex-start;
  padding: 0.75rem 1.25rem;
  background: none;
  border: 1px dashed #ccc;
  border-radius: 50px;
  color: #666;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.add-another-address-btn:hover {
  border-color: #e8ba38;
  color: #e8ba38;
  background: rgba(232, 186, 56, 0.03);
}

/* Payment Section */
.payment-method {
  position: relative;
  overflow: hidden;
}

.payment-options {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  position: relative;
}

.payment-options::before {
  content: 'QRIS';
  position: absolute;
  font-size: 6rem;
  font-weight: 800;
  color: rgba(232, 186, 56, 0.05);
  z-index: 0;
  pointer-events: none;
  opacity: 0.7;
}

.qris-option {
  width: 100%;
  display: flex;
  justify-content: center;
}

.qr-code {
  padding: 1rem;
  background: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  max-width: 220px;
  position: relative;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  border: 1px solid rgba(232, 186, 56, 0.2);
}

.qr-code:hover {
  transform: scale(1.03);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
}

.qr-code::after {
  content: 'Scan untuk membayar';
  position: absolute;
  bottom: -1.5rem;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 0.85rem;
  color: #666;
}

.qr-code img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 6px;
}

.upload-section {
  margin-top: 3.5rem;
  padding-top: 1.5rem;
  border-top: 1px dashed #e0e0e0;
}

.upload-proof-title {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.upload-proof-title i {
  color: #e8ba38;
}

.upload-area {
  width: 93%;
  min-height: 180px;
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  padding: 1.5rem;
  background: #f9f9f9;
  position: relative;
  overflow: hidden;
}

.upload-area:hover {
  border-color: #e8ba38;
  background: rgba(232, 186, 56, 0.03);
}

.upload-area i {
  font-size: 3rem;
  color: #ccc;
  margin-bottom: 1rem;
  transition: transform 0.3s;
}

.upload-area:hover i {
  transform: translateY(-5px);
  color: #e8ba38;
}

.upload-area span {
  color: #666;
  text-align: center;
}

.preview-image {
  width: 100%;
  height: auto;
  max-height: 250px;
  object-fit: contain;
  border-radius: 8px;
}

.upload-area.has-file {
  border: none;
  padding: 0;
  background: none;
}

/* Voucher Section */
.voucher-section {
  position: relative;
}

.voucher-input {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.voucher-input input {
  flex: 1;
  height: 48px;
  padding: 0 1.25rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.voucher-input input:focus {
  outline: none;
  border-color: #e8ba38;
  box-shadow: 0 0 0 3px rgba(232, 186, 56, 0.15);
}

.voucher-button {
  padding: 0 1.5rem;
  background-color: #02163b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  min-width: 120px;
}

.voucher-button:hover:not(:disabled) {
  background-color: #062a5e;
  box-shadow: 0 4px 8px rgba(2, 22, 59, 0.2);
}

.voucher-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.applied-voucher {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: rgba(232, 186, 56, 0.1);
  border-radius: 8px;
  border-left: 4px solid #e8ba38;
  margin-top: 1rem;
  transition: all 0.3s;
}

.applied-voucher:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(232, 186, 56, 0.15);
}

.voucher-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.voucher-code {
  font-weight: 600;
  color: #02163b;
  background: rgba(2, 22, 59, 0.05);
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

.voucher-discount {
  font-weight: 600;
  color: #e8ba38;
}

.remove-voucher {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-voucher:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #f44336;
}

/* Order Summary */
.order-summary {
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  grid-column: 2;
  grid-row: 1 / span 4;
  background: #fff;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 1.75rem;
  scrollbar-width: none;
}

.order-summary::-webkit-scrollbar {
  display: none;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.85rem 0;
  color: #555;
}

.summary-item:not(:last-child) {
  border-bottom: 1px solid #f0f0f0;
}

.summary-item.total {
  margin-top: 0.5rem;
  padding: 1.25rem 0;
  border-top: 2px solid #f0f0f0;
  border-bottom: none;
  font-weight: 700;
  font-size: 1.2rem;
  color: #02163b;
}

.summary-item.discount {
  color: #e8ba38;
}

.discount-amount {
  font-weight: 600;
}

.terms-checkbox {
  margin: 1.75rem 0;
}

.custom-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  gap: 0.75rem;
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: relative;
  height: 22px;
  width: 22px;
  background-color: #f5f5f5;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  transition: all 0.2s;
}

.custom-checkbox:hover .checkmark {
  background-color: #e8f4fe;
  border-color: #02163b;
}

.custom-checkbox input:checked ~ .checkmark {
  background-color: #02163b;
  border-color: #02163b;
}

.checkmark:after {
  content: '';
  position: absolute;
  display: none;
  left: 7px;
  top: 3px;
  width: 4px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.custom-checkbox input:checked ~ .checkmark:after {
  display: block;
}

.terms-text {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #666;
}

.terms-link {
  color: #02163b;
  text-decoration: underline;
  font-weight: 500;
  transition: color 0.2s;
}

.terms-link:hover {
  color: #e8ba38;
}

.checkout-button {
  width: 100%;
  padding: 1.25rem;
  background-color: #e8ba38;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.checkout-button:hover:not(:disabled) {
  background-color: #d5a832;
  box-shadow: 0 8px 20px rgba(232, 186, 56, 0.25);
  transform: translateY(-2px);
}

.checkout-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.checkout-button::after {
  content: '';
  position: absolute;
  width: 30px;
  height: 200px;
  background: rgba(255, 255, 255, 0.3);
  top: -80px;
  left: -100px;
  transform: rotate(20deg);
  transition: 0.6s;
  opacity: 0;
}

.checkout-button:hover:not(:disabled)::after {
  left: 120%;
  opacity: 0.7;
}

.loading-dots {
  position: relative;
}

.loading-dots::after {
  content: '...';
  position: absolute;
  animation: dots 1.5s infinite;
  width: 18px;
  display: inline-block;
}

@keyframes dots {
  0% {
    content: '.';
  }
  33% {
    content: '..';
  }
  66% {
    content: '...';
  }
}

.terms-notice {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: rgba(244, 67, 54, 0.08);
  border-radius: 6px;
  color: #f44336;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.terms-notice::before {
  content: '\f071';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(3px);
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2.5rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.4s;
  position: relative;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #02163b;
  text-align: center;
  position: relative;
  padding-bottom: 1rem;
}

.modal-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background-color: #e8ba38;
  border-radius: 3px;
}

.address-form {
  display: grid;
  gap: 1.75rem;
}

.form-group {
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #444;
}

.form-group input[type='text'],
.form-group input[type='email'],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #333;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #e8ba38;
  box-shadow: 0 0 0 3px rgba(232, 186, 56, 0.15);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #aaa;
}

.form-group select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='%23666' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 20px;
  padding-right: 35px;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.address-labels {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.75rem;
}

.label-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 0.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.label-option:hover {
  border-color: #02163b;
  background: rgba(2, 22, 59, 0.02);
}

.label-option.active {
  border-color: #e8ba38;
  background-color: rgba(232, 186, 56, 0.1);
  box-shadow: 0 5px 10px rgba(232, 186, 56, 0.1);
}

.label-option i {
  font-size: 1.5rem;
  color: #777;
  transition: all 0.3s;
}

.label-option.active i {
  color: #e8ba38;
  transform: scale(1.1);
}

.label-option span {
  font-size: 0.85rem;
  text-align: center;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1.25rem;
  margin-top: 2rem;
}

.cancel-btn {
  padding: 0.85rem 1.75rem;
  background-color: #f5f5f5;
  border: none;
  border-radius: 8px;
  color: #666;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
  color: #333;
}

.submit-btn {
  padding: 0.85rem 2rem;
  background-color: #e8ba38;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 140px;
}

.submit-btn:hover:not(:disabled) {
  background-color: #d5a832;
  box-shadow: 0 5px 15px rgba(232, 186, 56, 0.2);
}

.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.custom-checkbox.disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Address Confirmation */
.address-confirmation {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.confirmation-text {
  font-size: 1rem;
  color: #555;
  margin-bottom: 0.5rem;
}

.confirmation-address {
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-left: 4px solid #e8ba38;
  border-radius: 8px;
  padding: 1.25rem;
}

/* Responsive Design */
@media (max-width: 992px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }

  .order-summary {
    position: relative;
    grid-column: 1;
    top: 0;
    margin-bottom: 2rem;
  }
}

@media (max-width: 768px) {
  .checkout-header {
    margin-bottom: 1.5rem;
  }

  .header-title h1 {
    font-size: 1.5rem;
  }

  .order-card {
    flex-direction: column;
  }

  .order-image {
    width: 100%;
    height: 200px;
  }

  .order-specs {
    grid-template-columns: 1fr;
  }

  .address-labels {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
}

@media (max-width: 576px) {
  .checkout-container {
    margin: 1rem auto 3rem;
    padding: 0 1rem;
  }

  .modal-content {
    padding: 1.5rem;
  }

  .modal-title {
    font-size: 1.3rem;
  }

  .upload-area {
    min-height: 150px;
  }
}
</style>
