<script setup>
import { ref, onMounted, computed } from 'vue' // Add computed
import { useRoute, useRouter } from 'vue-router' // Add useRouter
import { useKatalogStore } from '@/stores/KatalogStore'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/CartStore' // Add this import
import { useOrderStore } from '@/stores/OrderStore' // Add this import

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
const selectedPrice = ref('standard') // Add this for radio control

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

onMounted(async () => {
  if (katalogItems.value.length === 0) {
    await store.fetchKatalog()
  }
  selectedProduct.value = katalogItems.value.find((item) => item.id === productId)
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

// Modify handleImageUpload to use base64
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImage.value = e.target.result // This will be base64
    }
    reader.readAsDataURL(file)
  }
}

// Add this helper function
const getSelectedPrice = () => {
  switch (selectedPrice.value) {
    case 'premium':
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
      quantity: purchaseType.value === 'Souvenir' ? 20 : 1,
      customOptions: {
        priceType: selectedPrice.value,
        bahanLuar: selectedBahanLuar.value,
        bahanDalam: selectedBahanDalam.value,
        aksesoris: selectedAksesoris.value,
        color: selectedColor.value,
        uploadedImage: purchaseType.value === 'souvenir' ? uploadedImage.value : null,
        purchaseType: purchaseType.value,
        budgetPrice: selectedPrice.value === 'budget' ? budgetInput.value : null, // Store budget price if selected
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

// Add remove function
const removeUploadedImage = () => {
  uploadedImage.value = null
  // Reset file input
  const fileInput = document.getElementById('imageUpload')
  if (fileInput) fileInput.value = ''
}

// Add handleBuyNow function
const handleBuyNow = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    const orderData = {
      productId: selectedProduct.value.id,
      name: selectedProduct.value.nama,
      image: selectedProduct.value.images[0],
      price: getSelectedPrice(), // Use the helper function
      quantity: purchaseType.value === 'Souvenir' ? 20 : 1,
      customOptions: {
        priceType: selectedPrice.value,
        bahanLuar: selectedBahanLuar.value,
        bahanDalam: selectedBahanDalam.value,
        aksesoris: selectedAksesoris.value,
        color: selectedColor.value,
        purchaseType: purchaseType.value,
        budgetPrice: selectedPrice.value === 'budget' ? budgetInput.value : null, // Store budget price if selected
      },
    }

    orderStore.setCurrentOrder(orderData)
    router.push('/checkout')
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
</script>

<template>
  <KeepAlive>
    <div class="custom-container">
      <div class="header">
        <router-link to="/" class="back-link">
          <span>←</span>
        </router-link>
        <h1>Custom Produk</h1>
      </div>

      <div class="product-card">
        <div class="product-content">
          <div class="product-image">
            <img
              :src="selectedProduct?.images[0]"
              :alt="selectedProduct?.nama"
              v-if="selectedProduct?.images?.length"
            />
          </div>
          <div class="product-info">
            <h2>{{ selectedProduct?.nama || 'POUCH' }}</h2>
            <div class="price-quantity">
              <p>Rp. {{ selectedProduct?.harga?.standar?.toLocaleString() || '5.300.000' }}</p>
              <span class="quantity-badge">
                {{ purchaseType === 'Satuan' ? '1 pcs' : 'min 20 pcs' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="custom-note">*Tolong untuk pilih custom</div>

      <div class="price-card">
        <div class="section-header">
          <h3>Harga Per pcs</h3>
        </div>
        <div class="price-content">
          <div class="price-option">
            <label>Standar : 69.000</label>
            <div class="radio-label">
              <input
                type="radio"
                name="price"
                value="standard"
                v-model="selectedPrice"
                class="square-radio"
              />
            </div>
          </div>
          <div class="price-option">
            <label>Premium : 89.000</label>
            <div class="radio-label">
              <input
                type="radio"
                name="price"
                value="premium"
                v-model="selectedPrice"
                class="square-radio"
              />
            </div>
          </div>
          <div class="price-option">
            <label>Budgeting :</label>
            <div class="radio-wrapper">
              <input
                type="number"
                class="budget-input"
                v-model.number="budgetInput"
                :disabled="selectedPrice !== 'budget'"
                :min="selectedProduct?.harga?.standar || 69000"
                @input="handleBudgetInput"
                @blur="validateBudgetInput"
                placeholder="Min. Rp 69.000"
              />
              <div class="radio-label">
                <input
                  type="radio"
                  name="price"
                  value="budget"
                  v-model="selectedPrice"
                  class="square-radio"
                  @change="handleBudgetPriceSelection"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="purchase-type-card">
        <div class="section-header">
          <h3>Tipe Pembelian</h3>
        </div>
        <div class="purchase-options">
          <div class="purchase-option">
            <label class="radio-label">
              <input
                type="radio"
                name="purchaseType"
                value="Satuan"
                v-model="purchaseType"
                class="square-radio"
              />
              <span>Satuan</span>
            </label>
          </div>
          <div class="purchase-option">
            <label class="radio-label">
              <input
                type="radio"
                name="purchaseType"
                value="Souvenir"
                v-model="purchaseType"
                class="square-radio"
              />
              <span>Souvenir</span>
            </label>
          </div>
        </div>
      </div>

      <div class="details-card">
        <div class="section-header">
          <h3>Detail Produk</h3>
        </div>
        <div class="details-content">
          <div class="details-row">
            <div class="detail-group">
              <label>Bahan Luar :</label>
              <select v-model="selectedBahanLuar">
                <option value="" disabled selected>Select material</option>
                <option value="Finish Glossy">Finish Glossy</option>
                <option value="Finish Doff">Finish Doff</option>
              </select>
              <!-- Add error messages -->
              <div class="error-message" v-if="errors.bahanLuar">{{ errors.bahanLuar }}</div>
            </div>
            <div class="detail-group">
              <label>Bahan Dalam :</label>
              <select v-model="selectedBahanDalam">
                <option value="" disabled selected>Select material</option>
                <option value="Puring Glossy">Puring Glossy</option>
                <option value="Puring Doff">Puring Doff</option>
              </select>
            </div>
          </div>

          <div class="details-row">
            <div class="detail-group">
              <label>Warna :</label>
              <div class="color-input">
                <input type="color" v-model="selectedColor" @input="handleColorChange" />
                <input type="text" v-model="selectedColor" class="color-text" readonly />
              </div>
            </div>
            <div class="detail-group">
              <label>Aksesoris :</label>
              <div class="select-wrapper">
                <div class="select-field" @click="isAksesorisOpen = !isAksesorisOpen">
                  <span class="selected-text">
                    {{
                      selectedAksesoris.length
                        ? `${selectedAksesoris.length} selected`
                        : 'Select accessories'
                    }}
                  </span>
                  <span class="arrow">{{ isAksesorisOpen ? '▲' : '▼' }}</span>
                </div>
                <div class="select-dropdown" :class="{ open: isAksesorisOpen }">
                  <div v-for="aksesoris in availableAksesoris" :key="aksesoris" class="option-item">
                    <span class="option-text">{{ aksesoris }}</span>
                    <input
                      type="checkbox"
                      :value="aksesoris"
                      v-model="selectedAksesoris"
                      class="option-checkbox"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Centered upload section -->
          <!-- Only show upload section for souvenir purchases -->
          <div class="upload-row" v-if="purchaseType === 'Souvenir'">
            <div class="detail-group upload-group">
              <label>Upload Photo :</label>
              <div class="upload-area-small">
                <input
                  type="file"
                  id="imageUpload"
                  @change="handleImageUpload"
                  hidden
                  accept="image/*"
                />
                <label for="imageUpload" class="upload-area">
                  <!-- Replace text arrow with Font Awesome icon -->
                  <i class="fas fa-cloud-upload-alt upload-icon"></i>

                  <!-- Add image preview -->
                  <img
                    v-if="uploadedImage"
                    :src="uploadedImage"
                    alt="Preview"
                    class="image-preview"
                  />
                </label>
              </div>
              <!-- Add remove button when image is uploaded -->
              <button
                v-if="uploadedImage"
                @click="removeUploadedImage"
                class="remove-image-btn"
                type="button"
              >
                <i class="fas fa-times"></i> Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modify buttons to show disabled state -->
      <div class="action-buttons">
        <button
          class="cart-button"
          @click="addToCart"
          :disabled="
            isSubmitting || !selectedBahanLuar || !selectedBahanDalam || !selectedAksesoris.length
          "
        >
          {{ isSubmitting ? 'Menambahkan...' : 'Masukan keranjang' }}
        </button>
        <button
          class="buy-button"
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
.custom-container {
  max-width: 1444px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.back-link {
  text-decoration: none;
  color: #000;
  font-size: 24px;
}

.header h1 {
  font-size: 24px;
  margin: 0;
  font-weight: 500;
}

.product-card {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
}

.product-content {
  display: flex;
  gap: 20px;
  align-items: center;
}

.product-image {
  width: 80px;
  height: 80px;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden; /* Add this */
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* This ensures the image covers the container nicely */
  display: block; /* This removes any extra space below the image */
}

.product-info h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.product-info p {
  margin: 5px 0 0;
  color: #333;
}

.custom-note {
  color: #666;
  margin-bottom: 15px;
  font-size: 14px;
}

.price-card,
.details-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 15px;
  padding-bottom: 4rem;
}

.section-header {
  background: #02163b;
  padding: 12px 20px;
}

.section-header h3 {
  color: #fff;
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.price-content,
.details-content {
  padding: 20px;
}

.price-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.price-option:last-child {
  margin-bottom: 0;
}

.budget-input {
  width: 200px;
  height: 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f5f5f5;
  padding: 0 10px;
  -moz-appearance: textfield; /* Firefox */
}

/* Remove arrows for Chrome, Safari, Edge, Opera */
.budget-input::-webkit-outer-spin-button,
.budget-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.budget-input:disabled {
  background-color: #eee;
  cursor: not-allowed;
}

.budget-input:focus {
  outline: none;
  border-color: #02163b;
  background: #fff;
}

.details-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 15px;
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-group input[type='text'],
.detail-group select {
  width: 90%;
  height: 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f5f5f5;
  padding: 0 10px;
}

.color-input {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 89.9%;
}

.color-input input[type='color'] {
  width: 35px;
  height: 35px;
  padding: 0;
  border: none;
  border-radius: 4px;
}

.color-text {
  flex: 1;
  height: 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0 10px;
  background: #f5f5f5;
}

.upload-section {
  text-align: center;
  margin-top: 20px;
}

.upload-area {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.upload-note {
  margin: 8px 0 0;
  color: #666;
  font-size: 14px;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 20px;
}

.cart-button,
.buy-button {
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  font-size: 16px;
}

.cart-button {
  background: #e8ba38;
  color: #fff;
}

.buy-button {
  background: #02163b;
  color: #fff;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 10px;
}

.square-radio {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #02163b;
  border-radius: 4px; /* Sedikit rounded corners */
  margin: 0;
  cursor: pointer;
  position: relative;
  background-color: white;
  transition: all 0.2s ease;
}

.square-radio:checked {
  background-color: #02163b;
}

.square-radio:checked::after {
  content: '\f00c'; /* Font Awesome checkmark icon */
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px; /* Sesuaikan ukuran checkmark */
}

/* Hover effect */
.square-radio:hover {
  background-color: rgba(2, 22, 59, 0.1);
}

.budget-input:disabled {
  background-color: #eee;
  cursor: not-allowed;
}

.radio-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  justify-content: flex-end; /* This will push items to the right */
}

.detail-group select:focus {
  outline: none;
  border-color: #02163b;
}

.accessories-group {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  max-height: 120px;
  overflow-y: auto;
}

.accessory-item {
  margin-bottom: 8px;
}

.accessory-item:last-child {
  margin-bottom: 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px;
}

.checkbox-label:hover {
  background: #e8e8e8;
  border-radius: 4px;
}

.checkbox-label input[type='checkbox'] {
  width: 16px;
  height: 16px;
  border: 2px solid #02163b;
  border-radius: 3px;
  cursor: pointer;
}

.checkbox-text {
  font-size: 14px;
  color: #333;
}

/* Adjust the detail group for accessories */
.detail-group:has(.accessories-group) {
  flex: 1;
}

/* Make the accessories group take full width on mobile */
@media (max-width: 480px) {
  .details-row {
    grid-template-columns: 1fr;
  }
}

/* New styles for the dropdown */
.select-wrapper {
  position: relative;
  width: 90%;
}

.select-field {
  width: 100%;
  height: 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f5f5f5;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
}

.selected-text {
  color: #333;
  font-size: 14px;
}

.arrow {
  color: #666;
  font-size: 12px;
}

.select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  display: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.select-dropdown.open {
  display: block;
}

.option-item {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background-color 0.2s;
}

.option-item:hover {
  background-color: #f5f5f5;
}

.option-text {
  font-size: 14px;
  color: #333;
}

.option-checkbox {
  width: 20px; /* Increased checkbox size */
  height: 20px; /* Increased checkbox size */
  border: 2px solid #02163b;
  border-radius: 3px;
  cursor: pointer;
  margin-left: 8px;
}

/* Close dropdown when clicking outside */
:deep(.custom-container) {
  position: relative;
}

.single-column {
  grid-template-columns: 1fr !important;
}

.full-width {
  width: 100%;
}

.upload-area-small {
  height: 120px; /* Increased height to accommodate preview */
  width: 100%;
  background: #f5f5f5;
  border: 2px dashed #ccc;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.upload-area-small:hover {
  border-color: #02163b;
  background: #f0f0f0;
}

.upload-icon {
  font-size: 2rem;
  color: #666;
  transition: all 0.2s ease;
}

.upload-area:hover .upload-icon {
  color: #02163b;
  transform: scale(1.1);
}

/* Add these new styles */
.image-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.remove-image-btn {
  margin-top: 8px;
  padding: 6px 12px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.remove-image-btn:hover {
  background-color: #c82333;
}

/* Handle upload area when image is present */
.upload-area-small:has(.image-preview) .upload-icon {
  display: none;
}

/* Show upload icon on hover when image exists */
.upload-area-small:has(.image-preview):hover::before {
  content: '\f093'; /* Font Awesome upload icon */
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  color: white;
  z-index: 2;
  background: rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-row {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  width: 100%;
}

.upload-group {
  width: 200px; /* Keep compact width */
}

.upload-area {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Add these new styles */
.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
}

.cart-button:disabled,
.buy-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Optional: Add loading state styles */
.cart-button.loading,
.buy-button.loading {
  position: relative;
  color: transparent;
}

.cart-button.loading::after,
.buy-button.loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  top: 50%;
  left: 50%;
  margin: -8px 0 0 -8px;
  border: 2px solid #fff;
  border-radius: 50%;
  border-right-color: transparent;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.purchase-type-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 15px;
}

.purchase-options {
  padding: 20px;
  display: flex;
  gap: 30px;
}

.purchase-option {
  display: flex;
  align-items: center;
}

.purchase-option .radio-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.purchase-option span {
  font-size: 16px;
  color: #333;
}

/* Add these new styles */
.price-quantity {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
}

.price-quantity p {
  margin: 0;
  color: #333;
}

.quantity-badge {
  background-color: #02163b;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}
</style>
