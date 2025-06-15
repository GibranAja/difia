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

    <div v-if="checkoutItems.length > 0" class="checkout-content">
      <!-- Use the new component here -->
      <OrderSummaryComponent :checkout-items="checkoutItems" />

      <section class="checkout-section customer-info">
        <h2 class="section-title">Alamat Pengiriman</h2>

        <div v-if="addressStore.loading" class="address-loading">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Memuat alamat...</p>
        </div>

        <div v-else-if="addressStore.addresses.length === 0" class="no-address">
          <div class="empty-address">
            <i class="fas fa-map-marker-alt empty-icon"></i>
            <p>Anda belum memiliki alamat pengiriman</p>
            <button class="add-address-btn" @click="showAddressModal = true">
              <i class="fas fa-plus"></i> Buat Alamat
            </button>
          </div>
        </div>

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
          <span>Subtotal ({{ totalItems }} item)</span>
          <span>Rp {{ formatPrice(getTotalSubtotal) }}</span>
        </div>
        <div class="summary-item">
          <span>Pengiriman</span>
          <div class="shipping-info-column">
            <span v-if="isLoadingShipping">Menghitung...</span>
            <template v-else>
              <span>Rp {{ formatPrice(shippingCost) }}</span>
              <div class="shipping-details">
                <span class="shipping-method">
                  <i class="fas fa-truck"></i>
                  {{ orderStore.currentOrder?.quantity >= 20 ? 'JNE Cargo' : 'JNE Reguler' }}
                </span>
                <span class="shipping-weight" v-if="itemWeight > 0">
                  Berat: {{ totalWeight }}g
                </span>
              </div>
            </template>
          </div>
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
    <div v-else class="empty-checkout">
      <div class="empty-state">
        <i class="fas fa-shopping-bag empty-icon"></i>
        <h3>Tidak ada data order</h3>
        <p>Anda tidak dapat mengakses halaman checkout secara langsung.</p>
        <router-link to="/cart" class="return-cart-btn">
          <i class="fas fa-arrow-left"></i> Kembali ke Keranjang
        </router-link>
      </div>
    </div>

    <AddressModalComponent
      v-if="showAddressModal"
      :is-editing="isEditingAddress"
      :initial-data="addressForm"
      :is-first-address="isFirstAddress"
      @close="closeAddressModal"
      @save="saveAddress"
      @error="(message) => toast.error(message)"
    />

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
            <button
              type="button"
              class="submit-btn"
              @click="processOrderAfterConfirmation"
              :disabled="isProcessing"
            >
              {{ isProcessing ? 'Memproses...' : 'Konfirmasi & Bayar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Fixed Order Summary -->
    <div class="order-summary-mobile-fixed" v-if="checkoutItems.length > 0">
      <div class="summary-mobile-header">
        <h3>Total Pembayaran</h3>
        <button class="summary-mobile-toggle" @click="toggleMobileSummary">
          {{ isMobileSummaryExpanded ? 'Tutup' : 'Detail' }}
          <i :class="['fas', isMobileSummaryExpanded ? 'fa-chevron-down' : 'fa-chevron-up']"></i>
        </button>
      </div>

      <div :class="['summary-mobile-content', { expanded: isMobileSummaryExpanded }]">
        <div class="summary-item">
          <span>Subtotal ({{ totalItems }} item)</span>
          <span>Rp {{ formatPrice(getTotalSubtotal) }}</span>
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

        <div class="terms-checkbox">
          <label class="custom-checkbox">
            <input type="checkbox" v-model="acceptedTerms" id="termsCheckboxMobile" />
            <span class="checkmark"></span>
            <span class="terms-text">
              Saya menyetujui
              <a href="/terms" target="_blank" class="terms-link">Syarat & Ketentuan</a>
            </span>
          </label>
        </div>
      </div>

      <div class="summary-mobile-bottom">
        <div class="mobile-total-amount">Rp {{ formatPrice(finalTotal) }}</div>
        <button
          class="mobile-checkout-button"
          :disabled="!isCheckoutEnabled || isProcessing"
          @click="handleSubmitOrder"
        >
          {{ isProcessing ? 'Process...' : 'Bayar' }}
        </button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { onBeforeRouteLeave } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import { useOrderStore } from '@/stores/OrderStore'
import { useAddressStore } from '@/stores/AddressStore'
import { useRouter } from 'vue-router'
import rajaOngkir from '@/api/RajaOngkir'
import { useVoucherStore } from '@/stores/VoucherStore'
import { useToast } from 'vue-toastification'
import AddressModalComponent from '@/components/AddressModalComponent.vue'
import OrderSummaryComponent from '@/components/checkout/OrderSummaryComponent.vue' // Import the new component

const authStore = useAuthStore()
const orderStore = useOrderStore()
const addressStore = useAddressStore()
const router = useRouter()
const voucherStore = useVoucherStore()
const toast = useToast()

const provinces = ref([])
const cities = ref([])
const shippingCost = ref(0)
const courier = ref('jne')
const isLoadingShipping = ref(false)
const isLoadingProvinces = ref(false)
const isLoadingCities = ref(false)
const isProcessing = ref(false)
const acceptedTerms = ref(false)

const checkoutItems = ref([])
const currentItemIndex = ref(0)

const totalItems = computed(() => checkoutItems.value.length)

const selectedAddressId = ref(null)

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

const showConfirmationModal = ref(false)
const selectedAddress = ref(null)

const addressLabelOptions = [
  { value: 'home', name: 'Rumah', icon: 'fas fa-home' },
  { value: 'office', name: 'Kantor', icon: 'fas fa-building' },
  { value: 'school', name: 'Sekolah', icon: 'fas fa-school' },
  { value: 'apartment', name: 'Apartemen', icon: 'fas fa-city' },
  { value: 'other', name: 'Lainnya', icon: 'fas fa-map-marker-alt' },
]

const isFirstAddress = computed(() => {
  return addressStore.addresses.length === 0
})

const getLabelIcon = (label) => {
  const option = addressLabelOptions.find((opt) => opt.value === label)
  return option ? option.icon : 'fas fa-map-marker-alt'
}

const itemWeight = ref(0)
const totalWeight = ref(0)

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

const loadAddressCities = async (provinceName) => {
  await loadCities(provinceName)
  addressForm.value.city = ''
}

const calculateShipping = async (address) => {
  if (!address?.city) return

  try {
    isLoadingShipping.value = true

    const cityMatch = address.city.match(/([A-Za-z]+)\s+(.+)/)
    if (!cityMatch) {
      console.error('Invalid city format:', address.city)
      return
    }

    const cityType = cityMatch[1]
    const cityName = cityMatch[2]

    const city = cities.value.find(
      (c) =>
        c.type.toLowerCase() === cityType.toLowerCase() &&
        c.city_name.toLowerCase() === cityName.toLowerCase(),
    )

    if (city) {
      // Determine shipping method based on quantity
      const quantity = orderStore.currentOrder?.quantity || 0
      const isPurchaseBulk = quantity >= 20

      // Set courier based on order size
      const shippingCourier = isPurchaseBulk ? 'jne' : courier.value // Use JNE cargo for bulk orders
      const shippingService = isPurchaseBulk ? 'cargo' : 'reg'

      // Get the item weight from product data (in grams)
      itemWeight.value = 0
      if (orderStore.currentOrder?.productId) {
        try {
          const productRef = doc(db, 'katalog', orderStore.currentOrder.productId)
          const productDoc = await getDoc(productRef)

          if (productDoc.exists()) {
            // Get weight from product data - default to 0 if not available
            itemWeight.value = productDoc.data().detail?.berat || 0
          }
        } catch (err) {
          console.error('Error fetching product weight:', err)
          itemWeight.value = 0
        }
      }

      // Calculate total weight in grams - gunakan ref totalWeight yang sudah didefinisikan
      totalWeight.value = Math.max(itemWeight.value * quantity, 100) // Minimum 100g

      // Calculate shipping
      const costs = await rajaOngkir.calculateShipping(
        city.city_id,
        totalWeight.value,
        shippingCourier,
        isPurchaseBulk ? shippingService : null,
      )

      console.log('Shipping response costs:', costs)

      if (costs && costs.length > 0) {
        // Jika service adalah cargo atau ada service spesifik yang ditentukan
        if (isPurchaseBulk && shippingService) {
          // Temukan service yang sesuai (cargo)
          const serviceData = costs.find(
            (service) => service.service.toLowerCase() === shippingService.toLowerCase(),
          )
          if (serviceData && serviceData.cost && serviceData.cost.length > 0) {
            shippingCost.value = serviceData.cost[0].value
          } else {
            // Fallback ke service pertama jika tidak menemukan cargo
            shippingCost.value = costs[0].cost[0].value
          }
        } else {
          // Untuk reguler, gunakan service REG atau service pertama
          const regService = costs.find((service) => service.service === 'REG')

          // Gunakan REG jika ada, jika tidak gunakan service pertama
          if (regService && regService.cost && regService.cost.length > 0) {
            shippingCost.value = regService.cost[0].value
          } else if (costs[0].cost && costs[0].cost.length > 0) {
            shippingCost.value = costs[0].cost[0].value
          } else {
            shippingCost.value = 0
          }
        }

        console.log('Selected shipping cost:', shippingCost.value)
      } else {
        console.error('No shipping costs returned', costs)
        shippingCost.value = 0
      }
    }
  } catch (error) {
    console.error('Error calculating shipping:', error)
    shippingCost.value = 0
  } finally {
    isLoadingShipping.value = false
  }
}

const formatPrice = (price) => {
  return price.toLocaleString('id-ID')
}

const getSubtotal = computed(() => {
  return checkoutItems.value.reduce((total, item) => total + item.price * item.quantity, 0)
})

const getTotalSubtotal = computed(() => {
  return checkoutItems.value.reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0)
})

const getOrderFromLocal = () => {
  try {
    const checkoutData = localStorage.getItem('currentOrder')
    if (!checkoutData) return null

    const data = JSON.parse(checkoutData)

    // Only check timestamp if we're validating age
    // Don't reject the order if it has valid product data
    if (!data || (!data.productId && !data.name)) return null

    // Check if data is too old (> 24 hours) if timestamp exists
    if (data.timestamp && Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem('currentOrder')
      return null
    }

    return data
  } catch (error) {
    console.error('Error loading current order:', error)
    return null
  }
}

const loadCheckoutItems = () => {
  try {
    // Try to get items from sessionStorage first (where we stored the full data)
    const checkoutData = sessionStorage.getItem('checkout_items_data')
    if (checkoutData) {
      const data = JSON.parse(checkoutData)
      // Clean up sessionStorage after reading
      sessionStorage.removeItem('checkout_items_data')
      return data.items || []
    }

    // Fallback to the old method if needed
    const oldCheckoutData = localStorage.getItem('checkout_items')
    if (oldCheckoutData) {
      const data = JSON.parse(oldCheckoutData)
      if (
        Date.now() - data.timestamp > 30 * 60 * 1000 ||
        data.userId !== authStore.currentUser?.id
      ) {
        localStorage.removeItem('checkout_items')
        return []
      }
      return data.items || []
    }

    return []
  } catch (error) {
    console.error('Error loading checkout items:', error)
    return []
  }
}

const selectAddress = async (address) => {
  selectedAddressId.value = address.id

  isLoadingShipping.value = true

  try {
    if (address.province) {
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

const editAddress = (address) => {
  isEditingAddress.value = true
  addressForm.value = { ...address }
  showAddressModal.value = true
}

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

const closeAddressModal = () => {
  showAddressModal.value = false
}

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
      // Check if we're editing the currently selected address
      const isEditingSelectedAddress =
        isEditingAddress.value && addressData.id === selectedAddressId.value

      if (isFirstAddress.value || result.address?.id === selectedAddressId.value) {
        const addressToUse = isEditingAddress.value
          ? addressStore.addresses.find((a) => a.id === addressData.id)
          : result.address

        if (addressToUse) {
          selectedAddressId.value = addressToUse.id
          await calculateShipping(addressToUse)
        }
      }

      if (isFirstAddress.value && result.address) {
        selectedAddressId.value = result.address.id
        await calculateShipping(result.address)
      }

      // If editing selected address but not first address, the watcher will handle the recalculation
      // So we don't need to manually calculate here as it will be done by the watcher

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

const validateAddressPhone = (event) => {
  addressForm.value.phone = event.target.value.replace(/\D/g, '')
}

const isCheckoutEnabled = computed(() => {
  return (
    selectedAddressId.value &&
    acceptedTerms.value &&
    !isLoadingShipping.value &&
    orderStore.paymentProof
  )
})

const voucherCode = ref('')
const appliedVoucher = ref(null)
const isApplyingVoucher = ref(false)

const discountAmount = computed(() => {
  if (!appliedVoucher.value) return 0

  const subtotal = getSubtotal.value
  if (appliedVoucher.value.discountType === 'percentage') {
    return Math.floor((subtotal * appliedVoucher.value.discountValue) / 100)
  }
  return Math.min(appliedVoucher.value.discountValue, subtotal)
})

const finalTotal = computed(() => {
  return getTotalSubtotal.value + shippingCost.value - discountAmount.value
})

const applyVoucher = async () => {
  if (!voucherCode.value) return

  try {
    isApplyingVoucher.value = true

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

const removeVoucher = () => {
  appliedVoucher.value = null
  toast.info('Voucher dihapus')
}

const MAX_DIMENSION = 1200
const COMPRESSION_QUALITY = 0.6

const resizeImage = (file) => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    image.onload = () => {
      let width = image.width
      let height = image.height

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

      canvas.toBlob(
        (blob) => {
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

const handlePaymentProofUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const MAX_FILE_SIZE = 5 * 1024 * 1024

  if (file.size > MAX_FILE_SIZE) {
    toast.warning(
      `Gambar terlalu besar (${(file.size / 1024 / 1024).toFixed(2)}MB), akan dikompres`,
    )
  }

  try {
    isProcessing.value = true

    if (!file.type.match('image.*')) {
      toast.error('Hanya file gambar yang diperbolehkan')
      return
    }

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

const handleSubmitOrder = async () => {
  if (!selectedAddressId.value) {
    toast.error('Pilih alamat pengiriman terlebih dahulu')
    return
  }

  if (!acceptedTerms.value) {
    toast.error('Mohon setujui syarat & ketentuan')
    return
  }

  if (!orderStore.paymentProof) {
    toast.error('Mohon upload bukti pembayaran')
    return
  }

  selectedAddress.value = addressStore.addresses.find((addr) => addr.id === selectedAddressId.value)

  if (!selectedAddress.value) {
    toast.error('Alamat pengiriman tidak valid')
    return
  }

  showConfirmationModal.value = true
}

const processOrderAfterConfirmation = async () => {
  try {
    isProcessing.value = true

    const address = addressStore.addresses.find((addr) => addr.id === selectedAddressId.value)
    if (!address) {
      toast.error('Alamat pengiriman tidak valid')
      return
    }

    // Array untuk menyimpan ID pesanan yang berhasil dibuat
    const successfulOrders = []

    // Membuat pesanan terlebih dahulu tanpa memproses voucher
    for (const item of checkoutItems.value) {
      await orderStore.setCurrentOrder(item)

      const orderDetails = {
        name: address.name,
        email: address.email,
        phone: address.phone,
        address: address.address,
        province: address.province,
        city: address.city,
        zip: address.zip,
        shippingCost: shippingCost.value,
        finalTotal: item.price * item.quantity + shippingCost.value,
        voucher: currentItemIndex.value === 0 ? appliedVoucher.value : null,
        discountAmount: currentItemIndex.value === 0 ? discountAmount.value : 0,
      }

      const result = await orderStore.createOrder(orderDetails)
      if (!result.success) {
        toast.error(`Gagal membuat pesanan untuk ${item.name}`)
      } else if (result.orderId) {
        successfulOrders.push(result.orderId)
      }

      currentItemIndex.value++
    }

    // Setelah pesanan berhasil dibuat, proses voucher
    if (successfulOrders.length > 0 && appliedVoucher.value) {
      const voucherResult = await voucherStore.updateVoucherUsage(
        appliedVoucher.value.id,
        authStore.currentUser?.id,
      )

      if (!voucherResult.success) {
        toast.warning('Pesanan berhasil dibuat tetapi terjadi masalah saat memproses voucher')
      }
    }

    showConfirmationModal.value = false
    localStorage.removeItem('checkout_items')
    localStorage.removeItem('currentOrder')
    router.push('/notification')
  } catch (error) {
    console.error('Error processing orders:', error)
    toast.error('Gagal memproses pesanan: ' + error.message)
  } finally {
    isProcessing.value = false
  }
}

// Enhance the beforeunload handler to clear localStorage without confirmation
const handleBeforeUnload = (e) => {
  if (isProcessing.value) return

  // Standard message required for browser compatibility
  const message = 'Tidak ada data order'
  e.preventDefault()
  e.returnValue = message

  // Clear localStorage data immediately without confirmation
  localStorage.removeItem('checkout_items')
  localStorage.removeItem('currentOrder')

  return message
}

// Add a history state change listener to detect address bar changes
const setupHistoryListener = () => {
  const handlePopState = () => {
    // Clear localStorage data when user navigates using browser history
    localStorage.removeItem('checkout_items')
    localStorage.removeItem('currentOrder')
  }

  window.addEventListener('popstate', handlePopState)
  return () => window.removeEventListener('popstate', handlePopState)
}

// Update the onBeforeRouteLeave hook to not show confirmation dialog
onBeforeRouteLeave((to, from, next) => {
  if (isProcessing.value || to.path === '/notification') {
    next()
    return
  }

  // Clear data without confirmation and show toast
  localStorage.removeItem('checkout_items')
  localStorage.removeItem('currentOrder')
  next()
})

// Add these new data properties for mobile
const isMobileSummaryExpanded = ref(false)

// Add this new method for mobile
const toggleMobileSummary = () => {
  isMobileSummaryExpanded.value = !isMobileSummaryExpanded.value
}

// Add this watcher after the existing computed and ref declarations
watch(
  () => {
    const selectedAddr = addressStore.addresses.find((addr) => addr.id === selectedAddressId.value)
    return selectedAddr
      ? {
          id: selectedAddr.id,
          province: selectedAddr.province,
          city: selectedAddr.city,
        }
      : null
  },
  async (newAddress, oldAddress) => {
    // Only recalculate if the selected address province or city changed
    if (
      newAddress &&
      oldAddress &&
      (newAddress.province !== oldAddress.province || newAddress.city !== oldAddress.city)
    ) {
      const fullAddress = addressStore.addresses.find((addr) => addr.id === selectedAddressId.value)
      if (fullAddress) {
        // Load cities if province changed
        if (newAddress.province !== oldAddress.province) {
          await loadCities(newAddress.province)
        }

        // Recalculate shipping
        await calculateShipping(fullAddress)

        toast.info('Ongkos kirim telah diperbarui')
      }
    }
  },
  { deep: true },
)

onMounted(async () => {
  try {
    // Add the beforeunload event listener for tab close/refresh
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Add history listener for address bar navigation
    const removeHistoryListener = setupHistoryListener()

    // Store the cleanup function to be used in onBeforeUnmount
    onBeforeUnmount(() => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      removeHistoryListener()
    })

    // Existing code
    checkoutItems.value = loadCheckoutItems()

    // Check for direct access with no checkout data
    if (checkoutItems.value.length === 0) {
      const localOrder = getOrderFromLocal()
      if (!localOrder) {
        // No checkout data found - show message and redirect
        toast.error('Tidak ada data order. Pengalihan ke halaman keranjang')
        router.push('/cart')
        return
      }
      checkoutItems.value = [localOrder]
    }

    await orderStore.setCurrentOrder(checkoutItems.value[0])

    await loadProvinces()
    await addressStore.fetchUserAddresses()

    if (addressStore.primaryAddress) {
      selectedAddressId.value = addressStore.primaryAddress.id

      if (addressStore.primaryAddress.province) {
        await loadCities(addressStore.primaryAddress.province)
      }

      await calculateShipping(addressStore.primaryAddress)
    } else if (addressStore.addresses.length === 0) {
      openAddressModal()
    }
  } catch (error) {
    console.error('Error in onMounted:', error)
  }
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
  transition: transform 0.3s;
  margin-bottom: 0; /* Remove margin-bottom as we're using gap now */
}

.upload-area div {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem; /* Add gap between icon and text */
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
  0%,
  20% {
    content: '.';
  }
  40%,
  60% {
    content: '..';
  }
  80%,
  100% {
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

/* Empty Checkout */
.empty-checkout {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 2rem;
}

.empty-state {
  text-align: center;
  max-width: 400px;
  background: #f9f9f9;
  border-radius: 12px;
  padding: 3rem 2rem;
  border: 1px dashed #ddd;
}

.empty-icon {
  font-size: 3.5rem;
  color: #ccc;
  margin-bottom: 1.5rem;
}

.return-cart-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding: 0.85rem 1.75rem;
  background-color: #02163b;
  border: none;
  border-radius: 50px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
}

.order-summary-mobile-fixed {
  display: none; /* Hidden by default with higher specificity */
}

.return-cart-btn:hover {
  background-color: #032968;
  transform: translateY(-2px);
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
  .checkout-container {
    margin: 1rem auto 8rem; /* Keep vertical margins */
    padding: 0; /* Remove horizontal padding */
    max-width: 100%;
    width: 100%;
  }

  .checkout-section {
    padding: 1.25rem;
    margin-bottom: 1.5rem;
    width: 100%; /* Ensure full width */
    box-sizing: border-box; /* Include padding in width calculation */
  }

  /* Center all content sections */
  .checkout-section > * {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%; /* Ensure full width */
  }

  /* All elements should be full width */
  .address-card,
  .voucher-input,
  .qr-code,
  .upload-area {
    width: 100%;
    max-width: 100%;
    margin-left: 0;
    margin-right: 0;
    box-sizing: border-box;
  }

  .order-summary-mobile-fixed {
    display: none; /* Hidden by default, will show in mobile */
  }
}

/* Smaller mobile screens */
@media (max-width: 576px) {
  .checkout-container {
    margin: 0.5rem auto 8rem; /* Keep vertical margins */
    padding: 0; /* Remove horizontal padding */
  }

  .modal-content {
    padding: 1.25rem;
    width: 95%;
  }

  .modal-title {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
  }

  .address-labels {
    grid-template-columns: repeat(auto-fill, minmax(75px, 1fr));
    gap: 0.5rem;
  }

  .label-option {
    padding: 0.7rem 0.4rem;
  }

  .label-option i {
    font-size: 1.2rem;
  }

  .upload-area {
    min-height: 120px;
  }

  .upload-area div {
    gap: 0.75rem; /* Slightly smaller gap for mobile */
  }

  .upload-area i {
    font-size: 2.5rem;
  }

  .voucher-input {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    width: 100%;
  }

  .voucher-input input {
    flex: 1;
    height: 44px;
  }

  .voucher-button {
    width: auto;
    min-width: 90px;
    padding: 0 0.8rem;
    white-space: nowrap;
    height: 44px;
  }

  /* More compact address cards */
  .address-card {
    padding: 1rem;
  }

  .recipient {
    font-size: 0.95rem;
  }

  .full-address {
    font-size: 0.85rem;
  }

  /* Enhanced mobile order summary */
  .order-summary {
    display: none; /* Hide the original order summary */
  }

  .order-summary-mobile-fixed {
    display: flex; /* Show the mobile fixed version */
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    z-index: 100;
    flex-direction: column;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
  }

  .summary-mobile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .summary-mobile-toggle {
    background: none;
    border: none;
    color: #02163b;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .summary-mobile-content {
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.3s ease;
  }

  .summary-mobile-content.expanded {
    max-height: 300px;
  }

  .summary-mobile-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid #f0f0f0;
  }

  .mobile-total-amount {
    font-weight: 700;
    color: #02163b;
    font-size: 1.1rem;
  }

  .mobile-checkout-button {
    padding: 0.75rem 1.25rem;
    background-color: #e8ba38;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    width: 60%;
    text-transform: uppercase;
    font-size: 0.9rem;
    letter-spacing: 0.5px;
  }

  /* Improved touch targets for mobile */
  button,
  .label-option,
  .address-card,
  .custom-checkbox {
    min-height: 44px; /* Apple's recommended minimum touch target size */
  }

  /* Improve spacing for terms checkbox on mobile */
  .terms-checkbox {
    margin: 1rem 0;
    width: 100%;
  }

  .custom-checkbox {
    padding: 0.5rem 0;
  }

  .terms-text {
    font-size: 0.8rem;
    line-height: 1.4;
  }
}

/* Animation for mobile summary */
@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

/* Shipping Info Column */
.shipping-info-column {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
}

.shipping-details {
  display: flex;
  flex-direction: column;
  font-size: 0.8rem;
  margin-top: 2px;
  color: #666;
}

.shipping-method {
  display: flex;
  align-items: center;
  gap: 4px;
}

.shipping-method i {
  color: #02163b;
}

.shipping-weight {
  font-size: 0.75rem;
  color: #888;
}

/* Media query adjustments */
@media (max-width: 576px) {
  .shipping-details {
    flex-direction: row;
    gap: 8px;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .order-summary-mobile-fixed .shipping-info-column {
    align-items: flex-end;
  }

  .order-summary-mobile-fixed .shipping-details {
    font-size: 0.7rem;
    opacity: 0.8;
  }
}
</style>
