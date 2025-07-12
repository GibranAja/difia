<template>
  <div class="destination-search">
    <label for="destination">Alamat Tujuan</label>
    <div class="search-dropdown" ref="dropdownRef">
      <!-- Input utama - readonly, hanya untuk display -->
      <div 
        class="search-input-container"
        @click="toggleDropdown"
        :class="{ 'dropdown-open': isDropdownOpen }"
      >
        <input
          type="text"
          id="destination"
          v-model="displayValue"
          :placeholder="'Pilih alamat tujuan'"
          readonly
          required
        />
        <i 
          class="fas fa-chevron-down dropdown-icon"
          :class="{ 'rotated': isDropdownOpen }"
        ></i>
      </div>
      
      <!-- Dropdown content -->
      <div 
        v-if="isDropdownOpen" 
        class="dropdown-content"
        :class="{ 'show': isDropdownOpen }"
      >
        <!-- Search bar di dalam dropdown -->
        <div class="dropdown-search-container">
          <div class="dropdown-search-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Cari alamat..."
              class="dropdown-search-input"
              @input="handleSearch"
              ref="searchInput"
            />
            <i 
              v-if="searchQuery"
              class="fas fa-times clear-icon"
              @click="clearSearch"
            ></i>
          </div>
        </div>

        <!-- Suggestions list -->
        <div class="suggestions-container">
          <!-- Loading state -->
          <div v-if="isLoading" class="loading-item">
            <i class="fas fa-spinner fa-spin"></i>
            Mencari alamat...
          </div>
          
          <!-- No results -->
          <div v-else-if="searchResults.length === 0 && searchQuery.length >= 3" class="no-results">
            <i class="fas fa-map-marker-alt"></i>
            Tidak ditemukan alamat yang sesuai
          </div>
          
          <!-- Minimum characters -->
          <div v-else-if="searchQuery.length > 0 && searchQuery.length < 3" class="min-chars">
            <i class="fas fa-info-circle"></i>
            Minimal 3 karakter untuk pencarian
          </div>

          <!-- Default state when no search -->
          <div v-else-if="searchQuery.length === 0" class="search-hint">
            <i class="fas fa-search"></i>
            Ketik minimal 3 karakter untuk mencari alamat
          </div>
          
          <!-- Results list -->
          <div 
            v-for="destination in searchResults" 
            :key="destination.id"
            class="dropdown-item"
            @click="selectDestination(destination)"
          >
            <div class="destination-icon">
              <i class="fas fa-map-marker-alt"></i>
            </div>
            <div class="destination-content">
              <div class="destination-label">{{ destination.label }}</div>
            </div>
            <div class="select-icon">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import komerceAPI from '@/api/KomerceAPI'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

// State
const isDropdownOpen = ref(false)
const searchQuery = ref('')
const displayValue = ref('')
const searchResults = ref([])
const isLoading = ref(false)
const dropdownRef = ref(null)
const searchInput = ref(null)

// Debounce timer
let searchTimer = null

// Initialize display value
if (props.modelValue && props.modelValue.label) {
  displayValue.value = props.modelValue.label
}

const toggleDropdown = async () => {
  isDropdownOpen.value = !isDropdownOpen.value
  
  if (isDropdownOpen.value) {
    // Focus search input when dropdown opens
    await nextTick()
    if (searchInput.value) {
      searchInput.value.focus()
    }
  } else {
    // Clear search when closing
    clearSearch()
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
}

const handleSearch = (event) => {
  searchQuery.value = event.target.value
  
  // Clear previous timer
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  
  // Debounce search
  searchTimer = setTimeout(() => {
    performSearch()
  }, 300)
}

const performSearch = async () => {
  if (searchQuery.value.length < 3) {
    searchResults.value = []
    return
  }
  
  try {
    isLoading.value = true
    searchResults.value = await komerceAPI.searchDestination(searchQuery.value)
  } catch (error) {
    console.error('Error searching destinations:', error)
    searchResults.value = []
  } finally {
    isLoading.value = false
  }
}

const selectDestination = (destination) => {
  displayValue.value = destination.label
  isDropdownOpen.value = false
  clearSearch()
  
  // Emit selected destination
  emit('update:modelValue', {
    id: destination.id,
    label: destination.label
  })
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isDropdownOpen.value = false
    clearSearch()
    
    // Restore display value if nothing selected
    if (props.modelValue && props.modelValue.label) {
      displayValue.value = props.modelValue.label
    } else {
      displayValue.value = ''
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
})
</script>

<style scoped>
.destination-search {
  position: relative;
}

.search-dropdown {
  position: relative;
  width: 100%;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.search-input-container input {
  width: 100%;
  padding: 12px 40px 12px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 12px; /* Dikecilkan dari 14px ke 13px */
  font-family: 'Montserrat', sans-serif; /* Tambahkan font family */
  transition: all 0.3s ease;
  background: white;
  cursor: pointer;
}

.search-input-container input:focus {
  outline: none;
  border-color: #02163b;
  box-shadow: 0 0 0 3px rgba(2, 22, 59, 0.1);
}

.search-input-container.dropdown-open input {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom-color: #02163b;
}

.dropdown-icon {
  position: absolute;
  right: 12px;
  color: #666;
  transition: transform 0.3s ease;
  pointer-events: none;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

/* Dropdown content styling */
.dropdown-content {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #02163b;
  border-top: none;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  max-height: 280px;
  z-index: 1000;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  overflow: hidden;
}

.dropdown-content.show {
  opacity: 1;
  transform: translateY(0);
}

/* Search container dalam dropdown */
.dropdown-search-container {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  background: #f8f9fa;
}

.dropdown-search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #666;
  font-size: 14px;
  z-index: 1;
}

.dropdown-search-input {
  width: 100%;
  padding: 10px 35px 10px 35px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: 'Montserrat', sans-serif; /* Tambahkan font family untuk search input */
  background: white;
  transition: all 0.2s ease;
}

.dropdown-search-input:focus {
  outline: none;
  border-color: #02163b;
  box-shadow: 0 0 0 2px rgba(2, 22, 59, 0.1);
}

.clear-icon {
  position: absolute;
  right: 12px;
  color: #999;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s ease;
  z-index: 1;
}

.clear-icon:hover {
  color: #666;
}

/* Suggestions container */
.suggestions-container {
  max-height: 200px;
  overflow-y: auto;
}

/* Suggestion items */
.dropdown-item {
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.destination-icon {
  color: #02163b;
  font-size: 14px;
  min-width: 16px;
}

.destination-content {
  flex: 1;
}

.destination-label {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  font-family: 'Montserrat', sans-serif; /* Tambahkan font family untuk label hasil */
}

.select-icon {
  color: #999;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.dropdown-item:hover .select-icon {
  opacity: 1;
}

/* State messages */
.loading-item, .no-results, .min-chars, .search-hint {
  padding: 16px 12px;
  text-align: center;
  color: #666;
  font-size: 14px;
  font-family: 'Montserrat', sans-serif; /* Tambahkan font family untuk pesan state */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.loading-item i {
  font-size: 16px;
}

.no-results {
  color: #999;
}

.search-hint {
  color: #999;
  font-style: italic;
}

/* Scrollbar styling */
.suggestions-container::-webkit-scrollbar {
  width: 6px;
}

.suggestions-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.suggestions-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.suggestions-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>