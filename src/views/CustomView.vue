<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue' // Add computed, watch, nextTick
import { useRoute, useRouter } from 'vue-router' // Add useRouter
import { useKatalogStore } from '@/stores/KatalogStore'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/CartStore' // Add this import
import { useOrderStore } from '@/stores/OrderStore' // Add this import
import { getDoc, doc } from 'firebase/firestore' // Add this import
import { db } from '@/config/firebase' // Add this import
import { PDFDocument } from 'pdf-lib' // Add this import

const route = useRoute()
const router = useRouter() // Add this
const purchaseType = ref('Satuan')
const store = useKatalogStore()
const cartStore = useCartStore() // Add this
const orderStore = useOrderStore() // Add this
const { katalogItems } = storeToRefs(store)

const productId = route.params.id
const selectedProduct = ref(null)
const uploadedImage = ref(null)
const selectedPrice = ref('Standard') // Add this for radio control
const note = ref('')

// Add new refs for form selections
const selectedBahanLuar = ref('')
const selectedBahanDalam = ref('')
const selectedAksesoris = ref([]) // Change to array for multiple selections
const selectedColor = ref('#000000') // Add this for color input

// Create computed property to parse accessories from database
const availableAksesoris = computed(() => {
  if (!selectedProduct.value?.detail?.aksesoris) return []
  return selectedProduct.value.detail.aksesoris.split(',').map((item) => item.trim())
})

// Add this new ref for dropdown state
const isAksesorisOpen = ref(false)

// Add new imports and refs
const isSubmitting = ref(false)
const errors = ref({})

// Add after your existing ref declarations
const budgetInput = ref(null)

// Add after other refs
const quantity = ref(1) // Default to 1 for 'Satuan'

// Add these new refs after other refs
// const showSouvenirSuggestion = ref(false)
const dismissedSuggestion = ref(false)

// Add this computed property
const shouldShowSouvenirSuggestion = computed(() => {
  return purchaseType.value === 'Satuan' && quantity.value >= 20 && !dismissedSuggestion.value
})

// Add this method to dismiss the suggestion
const dismissSuggestion = () => {
  dismissedSuggestion.value = true
}

// Add this computed property in the script section
const isMinusDisabled = computed(() => {
  if (purchaseType.value === 'Souvenir') {
    return quantity.value <= 20 // Disable minus when quantity is 20 for Souvenir
  } else {
    return quantity.value <= 1 // Disable minus when quantity is 1 for Satuan
  }
})

// Add this flag
const isQuantityEditing = ref(false)

// New method for handling input
const handleQuantityInput = (event) => {
  // Allow any value during typing
  isQuantityEditing.value = true

  // Clear null values (empty input) to avoid Vue warnings
  if (event.target.value === '') {
    quantity.value = null
  }
}

// Validate after user finishes typing
const validateQuantity = () => {
  isQuantityEditing.value = false
  const minQuantity = purchaseType.value === 'Souvenir' ? 20 : 1

  // Apply minimum value only if the quantity is below minimum or null
  if (!quantity.value || quantity.value < minQuantity) {
    quantity.value = minQuantity
  }
}

onMounted(async () => {
  if (katalogItems.value.length === 0) {
    await store.fetchKatalog()
  }
  selectedProduct.value = katalogItems.value.find((item) => item.id === productId)

  if (route.query.reorder) {
    const orderId = route.query.orderId
    // Fetch original order data and pre-fill form
    const orderDoc = await getDoc(doc(db, 'orders', orderId))
    if (orderDoc.exists()) {
      const orderData = orderDoc.data()
      // Pre-fill form data
      selectedBahanLuar.value = orderData.customOptions.bahanLuar
      selectedBahanDalam.value = orderData.customOptions.bahanDalam
      selectedAksesoris.value = orderData.customOptions.aksesoris
      selectedPrice.value = orderData.customOptions.priceType
      quantity.value = orderData.quantity
      note.value = orderData.customOptions.note
      // etc.
    }
  }
})

// Add validation function
const validateForm = () => {
  errors.value = {}
  let isValid = true

  if (!selectedBahanLuar.value) {
    errors.value.bahanLuar = 'Bahan luar harus dipilih'
    isValid = false
  }

  if (!selectedBahanDalam.value) {
    errors.value.bahanDalam = 'Bahan dalam harus dipilih'
    isValid = false
  }

  if (!selectedAksesoris.value.length) {
    errors.value.aksesoris = 'Pilih minimal 1 aksesoris'
    isValid = false
  }

  return isValid
}

// Add these new refs to your component's script section
const uploadedLogo = ref(null)
const logoFileName = ref('')
const logoFileSize = ref(null)

// Replace the handleImageUpload with this PDF upload handler
const handleLogoUpload = async (event) => {
  const file = event.target.files[0]
  if (!file || file.type !== 'application/pdf') {
    alert('Please upload a PDF file')
    return
  }

  try {
    // Check file size (limit to 2MB before compression)
    if (file.size > 2 * 1024 * 1024) {
      alert('File is too large. Maximum size allowed is 2MB')
      return
    }

    logoFileName.value = file.name
    logoFileSize.value = file.size

    // Compress PDF using pdf-lib
    const compressedPdf = await compressPdf(file)

    // Convert to base64
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedLogo.value = e.target.result // This will be base64
    }
    reader.readAsDataURL(compressedPdf)
  } catch (error) {
    console.error('Error processing PDF:', error)
    alert('Error processing PDF file')
  }
}

// More robust PDF compression function
const compressPdf = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)

    // Create a compressed version
    const compressedPdfBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    })

    // Convert back to File object
    const compressedFile = new File([compressedPdfBytes], file.name, {
      type: 'application/pdf',
      lastModified: new Date().getTime(),
    })

    console.log(
      `Original size: ${(file.size / 1024).toFixed(2)}KB, Compressed size: ${(compressedFile.size / 1024).toFixed(2)}KB`,
    )

    return compressedFile
  } catch (error) {
    console.error('Error compressing PDF:', error)
    // Return original file if compression fails
    return file
  }
}

// Replace removeUploadedImage with this
const removeUploadedLogo = () => {
  uploadedLogo.value = null
  logoFileName.value = ''
  logoFileSize.value = null
  // Reset file input
  const fileInput = document.getElementById('logoUpload')
  if (fileInput) fileInput.value = ''
}

// Add this helper function
const getSelectedPrice = () => {
  switch (selectedPrice.value) {
    case 'Premium':
      return selectedProduct.value.harga.premium
    case 'budget':
      return budgetInput.value
    default: // standard
      return selectedProduct.value.harga.standar
  }
}

// Modify addToCart function
const addToCart = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    const cartItem = {
      productId: selectedProduct.value.id,
      name: selectedProduct.value.nama,
      image: selectedProduct.value.images[0],
      price: getSelectedPrice(), // Use the helper function
      quantity: quantity.value, // Use quantity ref
      customOptions: {
        priceType: selectedPrice.value,
        bahanLuar: selectedBahanLuar.value,
        bahanDalam: selectedBahanDalam.value,
        aksesoris: selectedAksesoris.value,
        color: selectedColor.value,
        uploadedLogo: purchaseType.value === 'Souvenir' ? uploadedLogo.value : null, // Changed from uploadedImage
        purchaseType: purchaseType.value,
        budgetPrice: selectedPrice.value === 'budget' ? budgetInput.value : null, // Store budget price if selected
        note: note.value,
      },
      createdAt: new Date(),
    }

    await cartStore.addToCart(cartItem)
    router.push('/cart')
  } catch (error) {
    console.error('Error adding to cart:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Add this function
const handleColorChange = (event) => {
  selectedColor.value = event.target.value
}

// Updated handleBuyNow function
const handleBuyNow = async () => {
  if (!validateForm()) return

  try {
    isSubmitting.value = true
    const orderData = {
      productId: selectedProduct.value.id,
      name: selectedProduct.value.nama,
      image: selectedProduct.value.images[0],
      price: getSelectedPrice(),
      quantity: quantity.value,
      customOptions: {
        priceType: selectedPrice.value,
        bahanLuar: selectedBahanLuar.value,
        bahanDalam: selectedBahanDalam.value,
        aksesoris: selectedAksesoris.value,
        color: selectedColor.value,
        purchaseType: purchaseType.value,
        budgetPrice: selectedPrice.value === 'budget' ? budgetInput.value : null,
        note: note.value,
        // Use uploadedLogo with conditional check - consistent with addToCart
        uploadedLogo: purchaseType.value === 'Souvenir' ? uploadedLogo.value : null,
      },
    }

    // Simpan order ke localStorage sebelum redirect
    localStorage.setItem(
      'currentOrder',
      JSON.stringify({
        ...orderData,
        timestamp: Date.now(),
      }),
    )

    // Set order di store
    await orderStore.setCurrentOrder(orderData)

    // Pastikan data tersimpan sebelum redirect
    await nextTick()

    // Redirect ke checkout
    await router.push('/checkout')
  } catch (error) {
    console.error('Error processing order:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Add these new methods
const handleBudgetPriceSelection = () => {
  const minPrice = selectedProduct.value?.harga?.standar || 69000
  // Initialize with minimum price only if field is empty
  if (!budgetInput.value) {
    budgetInput.value = minPrice
  }
}

const handleBudgetInput = (event) => {
  // Allow empty value during typing
  if (event.target.value === '') {
    budgetInput.value = null
    return
  }

  let value = Number(event.target.value)
  if (isNaN(value)) {
    budgetInput.value = null
  } else {
    budgetInput.value = value
  }
}

// Add new method to validate on blur
const validateBudgetInput = () => {
  const minPrice = selectedProduct.value?.harga?.standar || 69000

  // If empty or below minimum when leaving the field, set to minimum
  if (!budgetInput.value || budgetInput.value < minPrice) {
    budgetInput.value = minPrice
  }
}

// Replace the existing watch for quantity
watch(quantity, (newQuantity) => {
  // No longer automatically switch to Souvenir when >= 20
  // Just enforce minimum quantity based on current type
  if (!isQuantityEditing.value && purchaseType.value === 'Souvenir' && newQuantity < 20) {
    quantity.value = 20
  }
})

// Modify handleQuantityChange function
const handleQuantityChange = (newQuantity) => {
  const minQuantity = purchaseType.value === 'Souvenir' ? 20 : 1

  if (newQuantity >= minQuantity) {
    quantity.value = newQuantity
  } else {
    quantity.value = minQuantity
  }
}

// Update this watch for purchaseType changes
watch(purchaseType, (newType) => {
  if (newType === 'Souvenir') {
    quantity.value = 20
  } else if (newType === 'Satuan') {
    quantity.value = 1 // Reset to 1 when switching to Satuan
  }
})

// Remove or comment out the watcher for purchaseType changes that resets quantity
// watch(purchaseType, (newType) => {
//   quantity.value = newType === 'Satuan' ? 1 : 20
// })

watch(purchaseType, (newType) => {
  if (newType === 'Souvenir' && quantity.value < 20) {
    quantity.value = 20 // Enforce minimum quantity for Souvenir
  }
  // No need to reset Satuan quantities, as they can be any value ≥ 1
})
</script>

<template>
  <KeepAlive>
    <div class="product-container">
      <!-- Navigation Header -->
      <nav class="nav-header">
        <router-link to="/" class="nav-back">
          <span>
            <i class="fas fa-chevron-left"></i>
          </span>
        </router-link>
        <h1>Custom Produk</h1>
      </nav>

      <!-- Product Overview Section -->
      <section class="product-overview">
        <div class="product-preview">
          <img
            :src="selectedProduct?.images[0]"
            :alt="selectedProduct?.nama"
            v-if="selectedProduct?.images?.length"
          />
          <div class="product-meta">
            <h2>{{ selectedProduct?.nama || 'POUCH' }}</h2>
            <div class="price-tag">
              <span class="price"
                >Rp. {{ selectedProduct?.harga?.standar?.toLocaleString() || '5.300.000' }}</span
              >
              <span class="quantity">{{
                purchaseType === 'Satuan' ? 'Min 1 pcs' : 'Min 20 pcs'
              }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Configuration Grid -->
      <div class="config-grid">
        <!-- Price Options -->
        <section class="config-section price-options">
          <h3>Harga Per pcs</h3>
          <div class="options-list">
            <label class="option-item">
              <div class="option-content">
                <span
                  >Standar : Rp {{ selectedProduct?.harga?.standar?.toLocaleString() || '0' }}</span
                >
                <div class="custom-radio">
                  <input type="radio" name="price" value="Standard" v-model="selectedPrice" />
                  <span class="radio-checkmark">
                    <i class="fas fa-check"></i>
                  </span>
                </div>
              </div>
            </label>

            <label class="option-item">
              <div class="option-content">
                <span
                  >Premium : Rp {{ selectedProduct?.harga?.premium?.toLocaleString() || '0' }}</span
                >
                <div class="custom-radio">
                  <input type="radio" name="price" value="Premium" v-model="selectedPrice" />
                  <span class="radio-checkmark">
                    <i class="fas fa-check"></i>
                  </span>
                </div>
              </div>
            </label>

            <label class="option-item budget-option">
              <div class="option-content">
                <span>Budget :</span>
                <div class="budget-control">
                  <input
                    type="number"
                    v-model.number="budgetInput"
                    :disabled="selectedPrice !== 'budget'"
                    :min="selectedProduct?.harga?.standar || 0"
                    @input="handleBudgetInput"
                    @blur="validateBudgetInput"
                    :placeholder="`Min. Rp ${selectedProduct?.harga?.standar?.toLocaleString() || '0'}`"
                  />
                  <div class="custom-radio">
                    <input
                      type="radio"
                      name="price"
                      value="budget"
                      v-model="selectedPrice"
                      @change="handleBudgetPriceSelection"
                      id="budgetRadio"
                    />
                    <label for="budgetRadio" class="radio-checkmark">
                      <i class="fas fa-check"></i>
                    </label>
                  </div>
                </div>
              </div>
            </label>
          </div>
        </section>

        <!-- Purchase Type -->
        <section class="config-section purchase-type">
          <h3>Tipe Pembelian</h3>
          <div class="type-selector">
            <label class="type-option">
              <input type="radio" name="purchaseType" value="Satuan" v-model="purchaseType" />
              <span class="type-label">Satuan</span>
            </label>
            <label class="type-option">
              <input type="radio" name="purchaseType" value="Souvenir" v-model="purchaseType" />
              <span class="type-label">Souvenir</span>
            </label>
          </div>

          <!-- Add this quantity control -->
          <div class="quantity-control">
            <button
              class="quantity-btn"
              @click="handleQuantityChange(quantity - 1)"
              :disabled="isMinusDisabled"
            >
              <i class="fas fa-minus"></i>
            </button>

            <input
              type="number"
              v-model.number="quantity"
              min="1"
              @input="handleQuantityInput"
              @blur="validateQuantity"
            />

            <button class="quantity-btn" @click="handleQuantityChange(quantity + 1)">
              <i class="fas fa-plus"></i>
            </button>
          </div>

          <!-- Add this notification after the quantity-control div -->
          <transition name="fade">
            <div v-if="shouldShowSouvenirSuggestion" class="souvenir-suggestion">
              <div class="suggestion-content">
                <div class="suggestion-icon">
                  <i class="fas fa-lightbulb"></i>
                </div>
                <div class="suggestion-text">
                  <h4>Pembelian Banyak!</h4>
                  <p>
                    Bagus! Anda memesan <strong>{{ quantity }}</strong> produk. Ingin pengalaman
                    belanja lebih baik? Coba <strong>Tipe Souvenir</strong> untuk akses fitur
                    khusus:
                  </p>
                  <ul>
                    <li><i class="fas fa-check"></i> Upload logo/design kustom Anda</li>
                    <li><i class="fas fa-check"></i> Harga khusus untuk pembelian massal</li>
                    <li><i class="fas fa-check"></i> Layanan prioritas</li>
                  </ul>
                  <button class="switch-mode-btn" @click="purchaseType = 'Souvenir'">
                    Beralih ke Tipe Souvenir
                  </button>
                </div>
                <button class="close-suggestion" @click="dismissSuggestion">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </transition>

          <!-- Add after the quantity-control div -->
          <div class="purchase-info">
            <div class="info-item" :class="{ active: purchaseType === 'Satuan' }">
              <i class="fas fa-info-circle"></i>
              <div class="info-content">
                <h4>Pembelian Satuan</h4>
                <p>Minimum pembelian 1 pcs. Cocok untuk pembelian personal atau sample produk.</p>
              </div>
            </div>
            <div class="info-item" :class="{ active: purchaseType === 'Souvenir' }">
              <i class="fas fa-info-circle"></i>
              <div class="info-content">
                <h4>Pembelian Souvenir</h4>
                <p>
                  Minimum pembelian 20 pcs. Ideal untuk acara, souvenir perusahaan, atau merchandise
                  dengan desain custom.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Product Details -->
        <section class="config-section product-details">
          <h3>Detail Produk</h3>
          <div class="details-form">
            <!-- Materials Selection -->
            <div class="form-row">
              <div class="input-group">
                <label>Bahan Luar</label>
                <select v-model="selectedBahanLuar" :class="{ error: errors.bahanLuar }">
                  <option value="" disabled selected>Select material</option>
                  <option value="Finish Glossy">Finish Glossy</option>
                  <option value="Finish Doff">Finish Doff</option>
                </select>
                <span class="error-text" v-if="errors.bahanLuar">{{ errors.bahanLuar }}</span>
              </div>

              <div class="input-group">
                <label>Bahan Dalam</label>
                <select v-model="selectedBahanDalam" :class="{ error: errors.bahanDalam }">
                  <option value="" disabled selected>Select material</option>
                  <option value="Puring Glossy">Puring Glossy</option>
                  <option value="Puring Doff">Puring Doff</option>
                </select>
                <span class="error-text" v-if="errors.bahanDalam">{{ errors.bahanDalam }}</span>
              </div>
            </div>

            <!-- Color and Accessories -->
            <div class="form-row">
              <div class="input-group">
                <label>Warna</label>
                <div class="color-selector">
                  <input type="color" v-model="selectedColor" @input="handleColorChange" />
                  <input type="text" v-model="selectedColor" readonly />
                </div>
              </div>

              <div class="input-group">
                <label>Aksesoris</label>
                <div class="dropdown-select" :class="{ active: isAksesorisOpen }">
                  <div class="selected" @click="isAksesorisOpen = !isAksesorisOpen">
                    <span>{{
                      selectedAksesoris.length
                        ? `${selectedAksesoris.length} selected`
                        : 'Select accessories'
                    }}</span>
                    <i class="arrow"></i>
                  </div>
                  <div class="options-dropdown">
                    <label
                      v-for="aksesoris in availableAksesoris"
                      :key="aksesoris"
                      class="dropdown-option"
                    >
                      <input type="checkbox" :value="aksesoris" v-model="selectedAksesoris" />
                      <span>{{ aksesoris }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Add after accessories dropdown and before image upload -->
            <div class="form-row">
              <div class="input-group full-width">
                <label>Catatan (Opsional)</label>
                <textarea
                  v-model="note"
                  placeholder="Tambahkan catatan khusus untuk pesanan Anda..."
                  class="note-input"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <!-- PDF Upload for Souvenir -->
            <div class="form-row" v-if="purchaseType === 'Souvenir'">
              <div class="input-group full-width">
                <label>Upload Logo (PDF)</label>
                <div class="upload-zone" :class="{ 'has-file': uploadedLogo }">
                  <input
                    type="file"
                    id="logoUpload"
                    @change="handleLogoUpload"
                    accept="application/pdf"
                    hidden
                  />
                  <label for="logoUpload" class="upload-trigger">
                    <i class="upload-icon fas fa-file-pdf" v-if="!uploadedLogo"></i>
                    <div class="pdf-preview" v-if="uploadedLogo">
                      <i class="fas fa-file-pdf pdf-icon"></i>
                      <span class="pdf-filename">{{ logoFileName }}</span>
                    </div>
                  </label>
                  <button v-if="uploadedLogo" @click="removeUploadedLogo" class="remove-file">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div class="file-info" v-if="logoFileSize">
                  {{ (logoFileSize / 1024).toFixed(2) }} KB
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button
          class="action-btn cart"
          @click="addToCart"
          :disabled="
            isSubmitting || !selectedBahanLuar || !selectedBahanDalam || !selectedAksesoris.length
          "
        >
          {{ isSubmitting ? 'Menambahkan...' : 'Masukan keranjang' }}
        </button>
        <button
          class="action-btn buy"
          @click="handleBuyNow"
          :disabled="
            isSubmitting || !selectedBahanLuar || !selectedBahanDalam || !selectedAksesoris.length
          "
        >
          {{ isSubmitting ? 'Menambahkan...' : 'Beli Sekarang' }}
        </button>
      </div>
    </div>
  </KeepAlive>
</template>

<style scoped>
/* Root Container */
.product-container {
  --primary-color: #02163b;
  --accent-color: #e8ba38;
  --error-color: #dc3545;
  --border-radius: 8px;
  --transition: 0.2s ease;

  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background: #f5f5f5;
  min-height: 100vh;
  position: relative; /* Add this */
  overflow-x: hidden; /* Add this to prevent horizontal scrolling */
  padding-top: 64px; /* Adjust this value based on your navbar height */
}

/* Navigation Header */
.nav-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed; /* Change from sticky to fixed */
  top: 0;
  left: 0; /* Add this */
  right: 0; /* Add this */
  z-index: 100;
  width: 100%; /* Change from 100vw */
  margin: 0; /* Remove margin calculations */
}

/* Adjust title positioning */
.nav-header h1 {
  font-size: 1.25rem;
  margin: 0;
  font-weight: 500;
  margin-left: 1rem; /* Add some spacing from the back button */
}

/* Adjust back button container */
.nav-back {
  font-size: 1.5rem;
  color: var(--primary-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: var(--transition);
  margin-left: 1rem; /* Add some spacing from the left edge */
}

.nav-back:hover {
  background: #e0e0e0;
}

/* Product Overview */
.product-overview {
  padding: 1rem;
  margin-top: 1rem; /* Add this */
}

.product-preview {
  background: white;
  border-radius: var(--border-radius);
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.product-preview img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: var(--border-radius);
}

.product-meta {
  flex: 1;
}

.product-meta h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--primary-color);
}

.price-tag {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.price {
  font-weight: 500;
  color: var(--primary-color);
}

.quantity {
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

/* Configuration Grid */
.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

/* Configuration Section */
.config-section {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.config-section h3 {
  margin: 0;
  padding: 1rem;
  background: var(--primary-color);
  color: white;
  font-size: 1rem;
  font-weight: 500;
  /* Tambahkan border radius pada h3 */
  border-top-left-radius: var(--border-radius);
  border-top-right-radius: var(--border-radius);
}

/* Price Options */
.options-list {
  padding: 1rem;
}

.option-item {
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.option-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: var(--border-radius);
  transition: var(--transition);
}

.option-item:hover .option-content {
  background: #f5f5f5;
}

/* Custom Radio Button */
.custom-radio {
  position: relative;
  display: inline-block;
  width: 24px;
  height: 24px;
}

.custom-radio input[type='radio'] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.radio-checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 24px;
  width: 24px;
  background-color: #fff;
  border: 2px solid #ddd;
  border-radius: 4px; /* Ubah dari 50% ke 4px untuk bentuk kotak */
  transition: all 0.2s ease;
}

.custom-radio:hover .radio-checkmark {
  border-color: var(--primary-color);
}

.custom-radio input[type='radio']:checked ~ .radio-checkmark {
  border-color: var(--primary-color);
  background-color: var(--primary-color);
}

/* Update untuk icon check */
.radio-checkmark i {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 14px;
  display: none;
}

.custom-radio input[type='radio']:checked ~ .radio-checkmark i {
  display: block;
}

/* Budget Option Modifications */
.budget-option .option-content {
  flex-wrap: nowrap; /* Change from wrap to nowrap */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.budget-control {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 65%; /* Add width constraint */
  margin-top: 0; /* Remove top margin */
}

.budget-control input[type='number'] {
  width: 150px; /* Set fixed width for input */
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
}

/* Add responsive styles */
@media (max-width: 480px) {
  .budget-option .option-content {
    flex-wrap: wrap;
  }

  .budget-control {
    width: 100%;
    margin-top: 0.5rem;
  }

  .budget-control input[type='number'] {
    width: 100%;
  }
}

/* Hover state untuk budget option */
.budget-option:hover .radio-checkmark {
  border-color: var(--primary-color);
}

/* Focus styles for accessibility */
.custom-radio input[type='radio']:focus-visible ~ .radio-checkmark {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Purchase Type */
.type-selector {
  display: flex;
  padding: 1rem;
  gap: 1rem;
}

.type-option {
  flex: 1;
  text-align: center;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
}

.type-option input[type='radio'] {
  display: none;
}

.type-option input[type='radio']:checked + .type-label {
  color: var(--primary-color);
}

.type-option:has(input:checked) {
  border-color: var(--primary-color);
  background: rgba(2, 22, 59, 0.05);
}

/* Quantity Control */
.quantity-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0 1rem 1rem;
}

.quantity-control input {
  width: 60px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  text-align: center;
  appearance: textfield;
  -moz-appearance: textfield;
}

.quantity-control input::-webkit-outer-spin-button,
.quantity-control input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  color: var(--primary-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.quantity-btn:hover {
  background: #f5f5f5;
  color: var(--accent-color);
}

/* Add these styles to the existing .quantity-btn styles */
.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;
  color: #ccc;
}

.quantity-btn:disabled:hover {
  background: #f5f5f5;
  color: #ccc;
}

/* Product Details Form */
.details-form {
  padding: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-weight: 500;
  color: var(--primary-color);
}

.input-group select,
.input-group input[type='text'],
.input-group input[type='number'] {
  font-family: 'Montserrat', sans-serif;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  transition: var(--transition);
}

.input-group select:focus,
.input-group input[type='text']:focus {
  border-color: var(--primary-color);
  outline: none;
}

.error-text {
  color: var(--error-color);
  font-size: 0.75rem;
}

/* Color Selector */
.color-selector {
  display: flex;
  gap: 0.5rem;
}

.color-selector input[type='color'] {
  width: 42px;
  height: 42px;
  padding: 0;
  border: none;
  border-radius: 4px;
}

.color-selector input[type='text'] {
  flex: 1;
}

/* Dropdown Select */
.dropdown-select {
  position: relative;
  z-index: 20;
  font-family: 'Montserrat', sans-serif; /* Tambahkan ini */
}

.selected {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif; /* Tambahkan ini */
}

.arrow {
  border: solid var(--primary-color);
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  transform: rotate(45deg);
  transition: var(--transition);
}

.dropdown-select.active .arrow {
  transform: rotate(-135deg);
}

.options-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  margin-top: 0.25rem;
  max-height: 200px;
  overflow-y: auto;
  z-index: 30;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: none;
  font-family: 'Montserrat', sans-serif; /* Tambahkan ini */
}

.dropdown-select.active .options-dropdown {
  display: block;
}

.dropdown-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  cursor: pointer;
  transition: var(--transition);
  font-family: 'Montserrat', sans-serif; /* Tambahkan ini */
}

.dropdown-option:hover {
  background: #f5f5f5;
}

.dropdown-option input[type='checkbox'] {
  width: 18px;
  height: 18px;
  border: 2px solid var(--primary-color);
  border-radius: 3px;
  position: relative;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}

.dropdown-option input[type='checkbox']:checked {
  background: var(--primary-color);
}

.dropdown-option input[type='checkbox']:checked::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Upload Zone */
.upload-zone {
  border: 2px dashed #ddd;
  border-radius: var(--border-radius);
  position: relative;
  transition: var(--transition);
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.upload-zone:hover {
  border-color: var(--primary-color);
  background: rgba(2, 22, 59, 0.02);
}

.upload-trigger {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  cursor: pointer;
  padding: 2rem;
}

.upload-icon {
  font-size: 2.5rem;
  color: var(--primary-color);
  opacity: 0.5;
  transition: var(--transition);
}

.upload-zone:hover .upload-icon {
  opacity: 1;
  transform: scale(1.1);
}

.upload-zone img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.remove-image {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: var(--error-color);
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: var(--transition);
}

.remove-image:hover {
  transform: scale(1.1);
}

/* Add these styles to your existing style section */
.pdf-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.pdf-icon {
  font-size: 3rem;
  color: #e74c3c;
}

.pdf-filename {
  font-size: 0.85rem;
  color: var(--primary-color);
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-info {
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.25rem;
}

.remove-file {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: var(--error-color);
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: var(--transition);
}

.remove-file:hover {
  transform: scale(1.1);
}

/* Action Buttons */
.action-buttons {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: white;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.action-btn {
  padding: 1rem;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.action-btn.cart {
  background: var(--accent-color);
  color: white;
}

.action-btn.cart:not(:disabled):hover {
  background: #d6ab33;
}

.action-btn.buy {
  background: var(--primary-color);
  color: white;
}

.action-btn.buy:not(:disabled):hover {
  background: #032155;
}

/* Loading State */
.action-btn.loading {
  position: relative;
  color: transparent;
}

.action-btn.loading::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-radius: 50%;
  border-right-color: transparent;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Full Width Utility */
.full-width {
  grid-column: 1 / -1;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .config-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .product-preview {
    flex-direction: column;
    text-align: center;
  }

  .product-preview img {
    width: 150px;
    height: 150px;
  }

  .type-selector {
    flex-direction: column;
  }

  .budget-option {
    flex-direction: column;
    gap: 0.5rem;
  }

  .budget-control {
    width: 100%;
  }

  .budget-control input[type='number'] {
    width: 100%;
  }
}

/* Custom Scrollbar */
.options-dropdown::-webkit-scrollbar {
  width: 8px;
}

.options-dropdown::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.options-dropdown::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 4px;
}

.options-dropdown::-webkit-scrollbar-thumb:hover {
  background: #032155;
}

/* Focus States for Accessibility */
:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Animation for Dropdowns and Transitions */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.options-dropdown {
  animation: slideDown 0.2s ease;
}

/* Purchase Info Styles */
.purchase-info {
  padding: 0 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: var(--border-radius);
  border: 1px solid #e9ecef;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.info-item.active {
  background: rgba(2, 22, 59, 0.05);
  border-color: var(--primary-color);
  opacity: 1;
}

.info-item i {
  color: var(--primary-color);
  font-size: 1.25rem;
  padding-top: 0.25rem;
}

.info-content h4 {
  margin: 0;
  font-size: 0.875rem;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.info-content p {
  margin: 0;
  font-size: 0.75rem;
  color: #6c757d;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .purchase-info {
    padding: 0.5rem 1rem 1rem;
  }
}

/* Add with other input styles */
.note-input {
  width: 92%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  font-family: 'Montserrat', sans-serif;
  resize: vertical;
  min-height: 80px;
  transition: var(--transition);
  background-color: #f8f9fa;
}

.note-input:focus {
  border-color: var(--primary-color);
  outline: none;
  background-color: white;
}

.note-input::placeholder {
  color: #6c757d;
  font-family: 'Montserrat', sans-serif;
}

/* Add to the <style> section of your component */
.souvenir-suggestion {
  margin: 0 1rem;
  margin-bottom: 1rem;
  border-radius: var(--border-radius);
  background: linear-gradient(to right, #fff9e6, #fff);
  border: 1px solid #f8e3a3;
  box-shadow: 0 2px 8px rgba(232, 186, 56, 0.15);
  position: relative;
  overflow: hidden;
}

.souvenir-suggestion::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background-color: var(--accent-color);
}

.suggestion-content {
  padding: 1rem;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.suggestion-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background-color: var(--accent-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.suggestion-icon i {
  color: white;
  font-size: 1.25rem;
}

.suggestion-text {
  flex: 1;
}

.suggestion-text h4 {
  margin: 0;
  color: var(--primary-color);
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.suggestion-text p {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  color: #555;
  line-height: 1.4;
}

.suggestion-text ul {
  margin: 0.75rem 0;
  padding-left: 1.25rem;
  list-style-type: none;
}

.suggestion-text li {
  font-size: 0.85rem;
  margin-bottom: 0.35rem;
  position: relative;
}

.suggestion-text li i {
  color: var(--accent-color);
  margin-right: 0.5rem;
}

.close-suggestion {
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0;
  font-size: 1rem;
  transition: color 0.2s;
}

.close-suggestion:hover {
  color: var(--primary-color);
}

.switch-mode-btn {
  background-color: var(--accent-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background-color 0.2s;
}

.switch-mode-btn:hover {
  background-color: #d6ab33;
}

/* Animation for the notification */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Mobile optimizations */
@media (max-width: 480px) {
  .suggestion-content {
    flex-direction: column;
  }

  .suggestion-icon {
    margin: 0 auto 0.75rem auto;
  }

  .close-suggestion {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
  }

  .switch-mode-btn {
    width: 100%;
    padding: 0.75rem;
  }
}
</style>
