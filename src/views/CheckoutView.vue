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

      <section class="checkout-section customer-info">
        <h2 class="section-title">Informasi Pemesanan</h2>
        <form class="form-grid">
          <div class="form-group">
            <label for="name">Nama</label>
            <input type="text" id="name" v-model="formData.name" placeholder="Masukkan nama" />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="formData.email" placeholder="Masukkan email" />
          </div>
          <div class="form-group">
            <label for="phone">No Telp</label>
            <input
              type="text"
              v-model="formData.phone"
              placeholder="Masukkan nomor telepon"
              maxlength="13"
              class="no-spinner"
              @input="validatePhone"
            />
          </div>
          <div class="form-group">
            <label for="address">Alamat Lengkap</label>
            <textarea
              id="address"
              v-model="formData.address"
              rows="3"
              placeholder="Masukkan alamat lengkap"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="province">Provinsi</label>
            <select
              id="province"
              v-model="selectedProvince"
              @change="loadCities(selectedProvince)"
              :disabled="isLoadingProvinces"
            >
              <option value="">
                {{ isLoadingProvinces ? 'Loading provinsi...' : 'Pilih Provinsi' }}
              </option>
              <option
                v-for="province in provinces"
                :key="province.province_id"
                :value="province.province"
              >
                {{ province.province }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="town">Kota</label>
            <select
              id="town"
              v-model="selectedCity"
              @change="calculateShipping"
              :disabled="!selectedProvince || isLoadingCities"
            >
              <option value="">
                {{
                  isLoadingCities
                    ? 'Loading kota...'
                    : !selectedProvince
                      ? 'Pilih provinsi terlebih dahulu'
                      : 'Pilih Kota'
                }}
              </option>
              <option
                v-for="city in cities"
                :key="city.city_id"
                :value="`${city.type} ${city.city_name}`"
              >
                {{ city.type }} {{ city.city_name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="zip">Kode Pos</label>
            <input type="text" id="zip" v-model="formData.zip" placeholder="Kode pos" />
          </div>
        </form>

        <div class="shipping-info">
          <i class="fas fa-truck-fast"></i>
          <div>
            <h3>Pengiriman via</h3>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
          </div>
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
          :disabled="!selectedCity || isLoadingShipping || isProcessing || !acceptedTerms"
          @click="handleSubmitOrder"
        >
          <span v-if="isProcessing">Process<span class="loading-dots">...</span></span>
          <span v-else>Bayar Sekarang</span>
        </button>

        <p class="terms-notice" v-if="!acceptedTerms">
          Anda harus menyetujui syarat & ketentuan untuk melanjutkan
        </p>
      </section>
    </div>
    <div v-else>
      <p>Tidak ada data order. Kembali ke <router-link to="/">home</router-link></p>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeMount, watch, onBeforeUnmount } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
// import { doc, getDoc } from 'firebase/firestore'
// import { db } from '@/config/firebase'
import { useAuthStore } from '@/stores/AuthStore'
import { useOrderStore } from '@/stores/OrderStore'
import { useRouter, useRoute } from 'vue-router'
import rajaOngkir from '@/api/RajaOngkir'
import { useVoucherStore } from '@/stores/VoucherStore'
import { useToast } from 'vue-toastification'

const authStore = useAuthStore()
const orderStore = useOrderStore()
const router = useRouter()
const route = useRoute()
const voucherStore = useVoucherStore()
const toast = useToast()

const formData = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  town: '',
  province: '',
  zip: '',
})

const provinces = ref([])
const cities = ref([])
const selectedProvince = ref('')
const selectedCity = ref('')
const shippingCost = ref(0)
const courier = ref('jne') // Default courier
const isLoadingShipping = ref(false)

// Add these with your other refs
const isLoadingProvinces = ref(false)
const isLoadingCities = ref(false)

const isProcessing = ref(false) // Add this with other refs

// Add these refs with your existing refs
const cartItems = ref([])

// Add near other refs
const acceptedTerms = ref(false)

// Update loadProvinces function
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

// Update loadCities function
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

const calculateShipping = async () => {
  if (!selectedCity.value) return

  try {
    isLoadingShipping.value = true
    // Find city ID from cities list
    const city = cities.value.find((c) => `${c.type} ${c.city_name}` === selectedCity.value)

    if (city) {
      const weight = orderStore.currentOrder?.quantity * 1000 || 1000 // Assume 1kg per item
      const costs = await rajaOngkir.calculateShipping(city.city_id, weight, courier.value)
      shippingCost.value = costs[0]?.cost[0]?.value || 0
    }
  } catch (error) {
    console.error('Error calculating shipping:', error)
    shippingCost.value = 0
  } finally {
    isLoadingShipping.value = false
  }
}

// const totalPrice = computed(() => {
//   return getSubtotal.value + shippingCost.value
// })

const loadShippingDetails = async () => {
  try {
    // Check if there are shipping details in route query
    if (route.query.shippingDetails) {
      const shippingDetails = JSON.parse(route.query.shippingDetails)

      // Pre-fill form data
      formData.value = {
        name: shippingDetails.name || '',
        email: shippingDetails.email || '',
        phone: shippingDetails.phone || '',
        address: shippingDetails.address || '',
        zip: shippingDetails.zip || '',
      }

      // Set province and city
      selectedProvince.value = shippingDetails.province || ''

      // Load cities first then set selected city
      if (shippingDetails.province) {
        await loadCities(shippingDetails.province)
        selectedCity.value = shippingDetails.city || ''

        // Calculate shipping after city is selected
        if (shippingDetails.city) {
          await calculateShipping()
        }
      }
    } else {
      // Fallback to user data if available
      if (authStore.currentUser) {
        formData.value.name = authStore.currentUser.name || ''
        formData.value.email = authStore.currentUser.email || ''
      }
    }
  } catch (error) {
    console.error('Error loading shipping details:', error)
    toast.error('Gagal memuat data pengiriman')
  }
}

onMounted(async () => {
  try {
    await loadProvinces() // Load provinces first
    await loadShippingDetails() // Then load shipping details
  } catch (error) {
    console.error('Error in onMounted:', error)
  }
})

const formatPrice = (price) => {
  return price.toLocaleString('id-ID')
}

const getSubtotal = computed(() => {
  const order = orderStore.currentOrder || getOrderFromLocal()
  if (!order) return 0
  return order.price * order.quantity
})

// Fungsi untuk menyimpan order ke localStorage
const saveOrderToLocal = (orderData) => {
  if (!orderData) return

  // Bersihkan data yang tidak perlu
  const cleanOrder = {
    id: orderData.id,
    productId: orderData.productId,
    name: orderData.name,
    price: orderData.price,
    quantity: orderData.quantity,
    image: orderData.image,
    customOptions: {
      purchaseType: orderData.customOptions.purchaseType,
      priceType: orderData.customOptions.priceType,
      bahanLuar: orderData.customOptions.bahanLuar,
      bahanDalam: orderData.customOptions.bahanDalam,
      aksesoris: orderData.customOptions.aksesoris,
      note: orderData.customOptions.note,
      uploadedImage: orderData.customOptions.uploadedImage,
    },
  }

  try {
    // Coba simpan ke localStorage
    const orderString = JSON.stringify(cleanOrder)
    localStorage.setItem('currentOrder', orderString)
  } catch (error) {
    console.error('Error saving to localStorage:', error)
    // Jika quota terlampaui, bersihkan localStorage dan coba lagi
    if (error.name === 'QuotaExceededError') {
      try {
        localStorage.clear()
        localStorage.setItem('currentOrder', JSON.stringify(cleanOrder))
      } catch (retryError) {
        console.error('Failed to save after clearing storage:', retryError)
      }
    }
  }
}

// Fungsi untuk mendapatkan order dari localStorage
const getOrderFromLocal = () => {
  try {
    const savedOrder = localStorage.getItem('currentOrder')
    if (savedOrder) {
      const parsedOrder = JSON.parse(savedOrder)
      // Check if order has shipping details
      if (parsedOrder.shippingDetails) {
        formData.value = {
          name: parsedOrder.shippingDetails.name || '',
          email: parsedOrder.shippingDetails.email || '',
          phone: parsedOrder.shippingDetails.phone || '',
          address: parsedOrder.shippingDetails.address || '',
          zip: parsedOrder.shippingDetails.zip || '',
        }
        selectedProvince.value = parsedOrder.shippingDetails.province || ''
        if (parsedOrder.shippingDetails.province) {
          loadCities(parsedOrder.shippingDetails.province).then(() => {
            selectedCity.value = parsedOrder.shippingDetails.city || ''
            if (parsedOrder.shippingDetails.city) {
              calculateShipping()
            }
          })
        }
      }
      return parsedOrder
    }
    return null
  } catch (error) {
    console.error('Error getting order from local:', error)
    return null
  }
}

// Modifikasi onBeforeMount
const loadCartItems = () => {
  try {
    const savedCheckout = localStorage.getItem('checkout_items')
    if (!savedCheckout) {
      return
    }

    const { items, timestamp, userId } = JSON.parse(savedCheckout)

    // Validate checkout data
    if (userId !== authStore.currentUser?.id) {
      return
    }

    // Check if checkout is expired (30 minutes)
    if (Date.now() - timestamp > 30 * 60 * 1000) {
      localStorage.removeItem('checkout_items')
      return
    }

    cartItems.value = items

    // Update your order store with cart data
    const firstItem = items[0] // For single item checkout
    orderStore.setCurrentOrder({
      id: firstItem.id,
      productId: firstItem.productId,
      name: firstItem.name,
      price: firstItem.price,
      quantity: firstItem.quantity,
      image: firstItem.image,
      customOptions: firstItem.customOptions,
    })
  } catch (error) {
    console.error('Error loading checkout items:', error)
  }
}

onBeforeMount(async () => {
  try {
    // Check reorder first
    const reorderData = localStorage.getItem('reorder_data')
    if (reorderData) {
      // Handle reorder logic...
      return
    }

    await loadCartItems()

    // Check current order from store
    if (!orderStore.currentOrder) {
      // Try to get from localStorage
      const savedOrder = localStorage.getItem('currentOrder')
      if (savedOrder) {
        const parsedOrder = JSON.parse(savedOrder)
        // Validate timestamp (30 menit)
        if (Date.now() - parsedOrder.timestamp < 30 * 60 * 1000) {
          await orderStore.setCurrentOrder(parsedOrder)
          return
        }
      }
      // If no valid order found, redirect to cart
      return
    }
  } catch (error) {
    console.error('Error in onBeforeMount:', error)
  }
})

// Watch untuk perubahan order
watch(
  () => orderStore.currentOrder,
  (newOrder) => {
    if (newOrder) {
      saveOrderToLocal(newOrder)
    }
  },
  { deep: true },
)

onBeforeUnmount(() => {
  // Bersihkan localStorage saat checkout selesai
  // Uncomment jika ingin membersihkan data setelah checkout
  localStorage.removeItem('currentOrder')
})

// Voucher related code
const voucherCode = ref('')
const appliedVoucher = ref(null)
const isApplyingVoucher = ref(false)

// Add computed for discount and final total
const discountAmount = computed(() => {
  if (!appliedVoucher.value) return 0

  const subtotal = getSubtotal.value
  if (appliedVoucher.value.discountType === 'percentage') {
    return Math.floor((subtotal * appliedVoucher.value.discountValue) / 100)
  }
  return Math.min(appliedVoucher.value.discountValue, subtotal)
})

const finalTotal = computed(() => {
  return getSubtotal.value + shippingCost.value - discountAmount.value
})

// Add voucher functions
const applyVoucher = async () => {
  if (!voucherCode.value) return

  try {
    isApplyingVoucher.value = true
    const result = await voucherStore.validateVoucher(voucherCode.value)

    if (result.success) {
      // Real-time check saat apply voucher
      if (result.voucher.currentUses >= result.voucher.maxUses) {
        toast.error('Voucher sudah mencapai batas penggunaan')
        return
      }

      appliedVoucher.value = result.voucher
      voucherCode.value = ''
      toast.success('Voucher berhasil diterapkan')
    } else {
      toast.error(result.error || 'Voucher tidak valid')
    }
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

// Add to existing script section
const paymentFile = ref(null)

const handlePaymentProofUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

  if (file.size > MAX_FILE_SIZE) {
    toast.error(`Ukuran file tidak boleh lebih dari ${MAX_FILE_SIZE / 1024 / 1024}MB`)
    return
  }

  try {
    await orderStore.setPaymentProof(file)
    paymentFile.value = file
  } catch (error) {
    console.error('Error uploading payment proof:', error)
    toast.error('Failed to upload payment proof')
  }
}

const processVoucherUsage = async () => {
  if (appliedVoucher.value) {
    const result = await voucherStore.updateVoucherUsage(appliedVoucher.value.id)
    if (!result.success) {
      toast.error('Gagal menggunakan voucher: ' + result.error)
      return false
    }
  }
  return true
}

// Tambahkan fungsi helper untuk scroll smooth
const scrollToElement = (elementId) => {
  const element = document.getElementById(elementId)
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
    // Tambahkan highlight effect
    element.classList.add('highlight-error')
    setTimeout(() => {
      element.classList.remove('highlight-error')
    }, 2000)
  }
}

// Modifikasi handleSubmitOrder
const handleSubmitOrder = async () => {
  try {
    isProcessing.value = true

    // Check terms acceptance
    if (!acceptedTerms.value) {
      toast.error('Mohon setujui syarat & ketentuan')
      scrollToElement('termsCheckbox')
      return
    }

    // Check bukti pembayaran
    if (!orderStore.paymentProof) {
      toast.error('Mohon upload bukti pembayaran')
      scrollToElement('paymentProof')
      return
    }

    // Cek field satu per satu
    if (!formData.value.name) {
      toast.error('Mohon isi nama penerima')
      scrollToElement('name')
      return
    }

    if (!formData.value.email) {
      toast.error('Mohon isi email')
      scrollToElement('email')
      return
    }

    if (!formData.value.phone) {
      toast.error('Mohon isi nomor telepon')
      scrollToElement('phone')
      return
    }

    if (!formData.value.address) {
      toast.error('Mohon isi alamat lengkap')
      scrollToElement('address')
      return
    }

    if (!selectedProvince.value) {
      toast.error('Mohon pilih provinsi')
      scrollToElement('province')
      return
    }

    if (!selectedCity.value) {
      toast.error('Mohon pilih kota')
      scrollToElement('town')
      return
    }

    if (!formData.value.zip) {
      toast.error('Mohon isi kode pos')
      scrollToElement('zip')
      return
    }

    // Lanjutkan dengan proses checkout jika semua field terisi
    const voucherProcessed = await processVoucherUsage()
    if (!voucherProcessed) return

    const orderDetails = {
      name: formData.value.name,
      email: formData.value.email,
      phone: formData.value.phone,
      address: formData.value.address,
      province: selectedProvince.value,
      city: selectedCity.value,
      zip: formData.value.zip,
      shippingCost: shippingCost.value,
      finalTotal: finalTotal.value,
      voucher: appliedVoucher.value,
      discountAmount: discountAmount.value,
    }

    const result = await orderStore.createOrder(orderDetails)
    if (result.success) {
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

// Tambahkan watch untuk memvalidasi nomor telepon
const validatePhone = (event) => {
  // Hanya izinkan angka
  const value = event.target.value.replace(/\D/g, '')

  // Batasi panjang maksimal 13 digit
  formData.value.phone = value.slice(0, 13)
}

// Add route navigation guard
onBeforeRouteLeave((to, from, next) => {
  // Skip confirmation if order is already processed
  if (isProcessing.value) {
    next()
    return
  }

  const confirmLeave = window.confirm(
    'Anda yakin ingin meninggalkan proses checkout? Data checkout Anda akan hilang.',
  )

  if (confirmLeave) {
    // Clear checkout data from localStorage
    localStorage.removeItem('checkout_items')
    localStorage.removeItem('currentOrder')
    next()
  } else {
    next(false)
  }
})

// Handle browser close/refresh
const handleBeforeUnload = (e) => {
  // Skip confirmation if order is already processed
  if (isProcessing.value) return

  e.preventDefault()
  e.returnValue = 'Anda yakin ingin meninggalkan proses checkout? Data checkout Anda akan hilang.'
}

// Add event listener when component mounts
onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

// Remove event listener when component unmounts
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
.fas {
  display: inline-block !important;
  font-family: 'Font Awesome 6 Free' !important;
  font-weight: 900 !important;
  visibility: visible !important;
  opacity: 1 !important;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Montserrat', sans-serif;
}

.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f5f5f5;
}

.checkout-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-button {
  color: #333;
  text-decoration: none;
  font-size: 1.5rem;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-title i {
  color: #e8ba38;
  font-size: 1.5rem;
}

.header-title h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.checkout-content {
  display: grid;
  gap: 1.5rem;
}

.checkout-section {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
}

.order-card {
  display: flex;
  gap: 1.5rem;
  padding: 1rem;
  background-color: #f8f8f8;
  border-radius: 8px;
}

.order-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.order-info {
  flex: 1;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.order-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.order-price {
  font-weight: 600;
  color: #e8ba38;
}

.order-specs {
  display: grid;
  gap: 0.5rem;
}

.spec-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.spec-label {
  font-weight: 500;
  color: #666;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr; /* Single column */
  gap: 1rem;
  width: 100%; /* Set width to 50% */
  margin: 0; /* Remove auto margin to align left */
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

.upload-proof-title {
  margin-bottom: 1rem;
}

input,
select,
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #f8f8f8;
  font-size: 0.9rem;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #e8ba38;
  box-shadow: 0 0 0 2px rgba(232, 186, 56, 0.1);
}

.shipping-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: rgba(0, 247, 255, 0.1);
  border-radius: 8px;
}

.shipping-info i {
  font-size: 2rem;
  color: #00b4d8;
}

.shipping-info h3 {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.shipping-info p {
  font-size: 0.9rem;
  color: #666;
}

.payment-options {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.qris-option {
  width: 100%;
  text-align: center;
}

.payment-button {
  display: inline-block;
  padding: 0.75rem 2rem;
  background-color: #f8f8f8;
  border-radius: 6px;
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.payment-button.active {
  background-color: #e8ba38;
  color: white;
}

.qr-code {
  margin-top: 1.5rem;
}

.qr-code img {
  max-width: 200px;
}

.upload-section {
  margin-top: 1.5rem;
}

.upload-area {
  position: relative;
  width: 100%;
  min-height: 200px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: #666;
}

.upload-area.has-file {
  border-style: solid;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
}

.voucher-input {
  display: flex;
  gap: 0.5rem;
}

.voucher-input input {
  flex: 1;
}

.voucher-input button {
  padding: 0.75rem 1.5rem;
  background-color: #e8ba38;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.voucher-input button:hover {
  background-color: #d5a832;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: #666;
}

.summary-item.total {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.checkout-button {
  width: 100%;
  padding: 1rem;
  margin-top: 1.5rem;
  background-color: #e8ba38;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.checkout-button:hover {
  background-color: #d5a832;
}

.terms {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #666;
  text-align: center;
}

@media (max-width: 768px) {
  .checkout-container {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .order-card {
    flex-direction: column;
  }

  .order-image {
    width: 100%;
    height: 200px;
  }

  .order-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .shipping-info {
    flex-direction: column;
    text-align: center;
  }

  .checkout-button {
    padding: 1.25rem;
    font-size: 1.1rem;
  }
}

/* Additional improvements for better visual hierarchy */
.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #999;
}

.form-group input[type='number']::-webkit-inner-spin-button,
.form-group input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.form-group input[type='number'] {
  appearance: textfield;
  -moz-appearance: textfield;
}

select {
  appearance: none;
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23333%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 0.7rem top 50%;
  background-size: 0.65rem auto;
  padding-right: 2rem;
}

/* Improved focus states for accessibility */
input:focus,
select:focus,
textarea:focus,
button:focus {
  outline: none;
  border-color: #e8ba38;
  box-shadow: 0 0 0 3px rgba(232, 186, 56, 0.2);
}

/* Enhanced button states */
.checkout-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(232, 186, 56, 0.3);
}

.checkout-button:active {
  transform: translateY(1px);
}

/* Improved spacing for nested elements */
.order-specs .spec-item:last-child {
  margin-bottom: 0;
}

.shipping-info div h3 {
  color: #333;
  margin-bottom: 0.25rem;
}

/* Better visual separation */
.checkout-section + .checkout-section {
  margin-top: 1.5rem;
}

/* Enhanced form validation states */
input:invalid,
select:invalid,
textarea:invalid {
  border-color: #ff4646;
}

/* Improved upload area interaction */
.upload-area:active {
  transform: scale(0.99);
}

/* Better spacing for payment section */
.payment-options {
  margin-bottom: 2rem;
}

/* Enhanced QR code container */
.qr-code {
  padding: 1.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Improved voucher section */
.voucher-section .voucher-input {
  max-width: 100%;
}

/* Additional helper classes */
.text-error {
  color: #ff4646;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.text-success {
  color: #00c853;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}

/* High contrast mode improvements */
@media (prefers-contrast: high) {
  .checkout-button,
  .payment-button.active {
    border: 2px solid #000;
  }
}

/* Print styles */
@media print {
  .checkout-container {
    padding: 0;
    box-shadow: none;
  }

  .checkout-button,
  .upload-area,
  .back-button {
    display: none;
  }
}

select:disabled {
  background-color: #f0f0f0;
  cursor: not-allowed;
  color: #666;
}

select:disabled option {
  color: #666;
}

/* Optional: Add a loading indicator style */
.loading-select {
  position: relative;
}

.loading-select::after {
  content: '';
  position: absolute;
  right: 2.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  border: 2px solid #e8ba38;
  border-right-color: transparent;
  border-radius: 50%;
  animation: rotate 0.8s linear infinite;
}

@keyframes rotate {
  from {
    transform: translateY(-50%) rotate(0deg);
  }
  to {
    transform: translateY(-50%) rotate(360deg);
  }
}

.checkout-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.terms-link {
  color: #e8ba38;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.terms-link:hover {
  color: #02163b;
  text-decoration: underline;
}

.loading {
  opacity: 0.7;
  cursor: wait;
}

.applied-voucher {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f8f8f8;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.voucher-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.voucher-code {
  font-weight: 600;
  color: #333;
}

.voucher-discount {
  color: #00c853;
  font-weight: 500;
}

.remove-voucher {
  background: none;
  border: none;
  color: #ff4646;
  cursor: pointer;
  padding: 0.25rem;
}

.remove-voucher:hover {
  color: #ff1a1a;
}

.summary-item.discount {
  color: #00c853;
}

.discount-amount {
  font-weight: 500;
}

/* Add loading dots animation */
.loading-dots {
  display: inline-block;
  animation: loadingDots 1.5s infinite;
  min-width: 24px;
}

@keyframes loadingDots {
  0% {
    content: '.';
  }
  33% {
    content: '..';
  }
  66% {
    content: '...';
  }
  100% {
    content: '.';
  }
}

/* Update button styles */
.checkout-button,
.voucher-button {
  position: relative;
  overflow: hidden;
}

.checkout-button:disabled,
.voucher-button:disabled {
  background-color: #cccccc;
  cursor: wait;
}

/* Add subtle loading background animation */
.checkout-button:disabled::before,
.voucher-button:disabled::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.2) 50%,
    transparent 100%
  );
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(50%);
  }
}

/* Menghilangkan panah di input number */
.no-spinner::-webkit-inner-spin-button,
.no-spinner::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.no-spinner {
  appearance: textfield; /* Safari */
  -moz-appearance: textfield; /* Firefox */
}

/* Update button styles untuk hover */
.checkout-button:hover:not(:disabled),
.voucher-button:hover:not(:disabled) {
  background-color: #d5a832;
  cursor: pointer;
}

.checkout-button:disabled,
.voucher-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Tambahkan di bagian <style> */
@keyframes highlightField {
  0% {
    background-color: rgba(255, 70, 70, 0.2);
    border-color: #ff4646;
  }
  100% {
    background-color: #f8f8f8;
    border-color: #e0e0e0;
  }
}

.highlight-error {
  animation: highlightField 2s ease;
}

/* Tambahkan smooth scroll untuk semua */
html {
  scroll-behavior: smooth;
}

/* Pastikan elemen yang akan discroll memiliki padding/margin agar tidak terlalu mepet */
.form-group {
  scroll-margin-top: 20px;
}

.upload-area {
  scroll-margin-top: 20px;
}

.terms-checkbox {
  margin: 1rem 0;
}

.custom-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  position: relative;
  padding-left: 30px;
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  left: 0;
  height: 20px;
  width: 20px;
  border: 2px solid #e8ba38;
  border-radius: 4px;
  transition: all 0.2s;
}

.custom-checkbox:hover input ~ .checkmark {
  background-color: rgba(232, 186, 56, 0.1);
}

.custom-checkbox input:checked ~ .checkmark {
  background-color: #e8ba38;
}

.checkmark:after {
  content: '';
  position: absolute;
  display: none;
}

.custom-checkbox input:checked ~ .checkmark:after {
  display: block;
}

.custom-checkbox .checkmark:after {
  left: 6px;
  top: 2px;
  width: 4px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.terms-text {
  font-size: 0.9rem;
  color: #666;
}

.terms-notice {
  margin-top: 0.5rem;
  color: #ff4646;
  font-size: 0.8rem;
  text-align: center;
}

#address {
  resize: vertical;
  min-height: 100px;
  max-height: 200px;
}
</style>
