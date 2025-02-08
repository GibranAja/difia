<script setup>
import { ref, onMounted, computed } from 'vue' // Add computed
import { useRoute } from 'vue-router'
import { useKatalogStore } from '@/stores/KatalogStore'
import { storeToRefs } from 'pinia'

const route = useRoute()
const store = useKatalogStore()
const { katalogItems } = storeToRefs(store)

const productId = route.params.id
const selectedProduct = ref(null)
const uploadedImage = ref(null)
const selectedPrice = ref('standard') // Add this for radio control
const budgetInput = ref('') // Add this for budget input

// Add new refs for form selections
const selectedBahanLuar = ref('')
const selectedBahanDalam = ref('')
const selectedAksesoris = ref([]) // Change to array for multiple selections

// Create computed property to parse accessories from database
const availableAksesoris = computed(() => {
  if (!selectedProduct.value?.detail?.aksesoris) return []
  return selectedProduct.value.detail.aksesoris.split(',').map(item => item.trim())
})

// Add this new ref for dropdown state
const isAksesorisOpen = ref(false)

onMounted(async () => {
  if (katalogItems.value.length === 0) {
    await store.fetchKatalog()
  }
  selectedProduct.value = katalogItems.value.find(item => item.id === productId)
})

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadedImage.value = URL.createObjectURL(file)
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
            <p>Rp. {{ selectedProduct?.harga?.standar?.toLocaleString() || '5.300.000' }}</p>
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
              >
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
              >
            </div>
          </div>
          <div class="price-option">
            <label>Budgeting :</label>
            <div class="radio-wrapper">
              <input 
                type="text" 
                class="budget-input"
                v-model="budgetInput"
                :disabled="selectedPrice !== 'budget'"
                placeholder="By Request"
              >
              <div class="radio-label">
                <input 
                  type="radio" 
                  name="price" 
                  value="budget"
                  v-model="selectedPrice"
                  class="square-radio"
                >
              </div>
            </div>
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
                <option value="finish_glossy">Finish Glossy</option>
                <option value="finish_doff">Finish Doff</option>
              </select>
            </div>
            <div class="detail-group">
              <label>Warna :</label>
              <div class="color-input">
                <input type="color" value="#000000">
                <input type="text" value="#00000" class="color-text">
              </div>
            </div>
          </div>
          
          <div class="details-row">
            <div class="detail-group">
              <label>Bahan Dalam :</label>
              <select v-model="selectedBahanDalam">
                <option value="" disabled selected>Select material</option>
                <option value="puring_glossy">Puring Glossy</option>
                <option value="puring_doff">Puring Doff</option>
              </select>
            </div>
            <div class="detail-group">
              <label>Upload Photo :</label>
              <div class="upload-area-small">
                <input type="file" id="imageUpload" @change="handleImageUpload" hidden>
                <label for="imageUpload" class="upload-area">
                  <span class="upload-icon">↑</span>
                </label>
              </div>
            </div>
          </div>

          <div class="details-row single-column">
            <div class="detail-group full-width">
              <label>Aksesoris :</label>
              <div class="select-wrapper">
                <div class="select-field" @click="isAksesorisOpen = !isAksesorisOpen">
                  <span class="selected-text">
                    {{ selectedAksesoris.length ? `${selectedAksesoris.length} selected` : 'Select accessories' }}
                  </span>
                  <span class="arrow">{{ isAksesorisOpen ? '▲' : '▼' }}</span>
                </div>
                <div class="select-dropdown" :class="{ 'open': isAksesorisOpen }">
                  <div v-for="aksesoris in availableAksesoris" 
                       :key="aksesoris"
                       class="option-item">
                    <span class="option-text">{{ aksesoris }}</span>
                    <input type="checkbox"
                           :value="aksesoris"
                           v-model="selectedAksesoris"
                           class="option-checkbox">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <button class="cart-button">Masukan keranjang</button>
        <button class="buy-button">Beli Sekarang</button>
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
}

.section-header {
  background: #02163B;
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

.detail-group input[type="text"],
.detail-group select {
  width: 100%;
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
}

.color-input input[type="color"] {
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 120px;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
}

.upload-icon {
  font-size: 24px;
  color: #666;
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
  background: #E8BA38;
  color: #fff;
}

.buy-button {
  background: #02163B;
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
  width: 18px;
  height: 18px;
  border: 2px solid #02163B;
  border-radius: 0; /* Makes it square */
  margin: 0;
  cursor: pointer;
  position: relative;
}

.square-radio:checked {
  background-color: #02163B;
}

.square-radio:checked::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: white;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 0; /* Makes the inner check square */
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
  border-color: #02163B;
}

/* ... existing styles remain ... */

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

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  border: 2px solid #02163B;
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
  width: 15.5rem;
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
  border: 2px solid #02163B;
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
  height: 35px;
  background: #f5f5f5;
  margin-top: 15px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area-small .upload-icon {
  font-size: 18px;
  color: #666;
}
</style>