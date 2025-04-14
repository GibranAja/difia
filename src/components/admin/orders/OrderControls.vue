<template>
  <div class="order-controls">
    <div class="order-type-tabs">
      <div class="custom-dropdown" ref="orderTypeDropdownRef">
        <button class="dropdown-toggle" @click="toggleOrderTypeDropdown">
          <div class="selected-type">
            <i :class="getActiveIcon"></i>
            <span>{{ getActiveLabel }}</span>
          </div>
          <i
            class="fas fa-chevron-down dropdown-arrow"
            :class="{ rotate: isOrderTypeDropdownOpen }"
          ></i>
        </button>

        <div class="dropdown-options" v-if="isOrderTypeDropdownOpen">
          <div
            class="dropdown-option"
            :class="{ active: activeOrderType === 'regular' }"
            @click="selectOrderType('regular')"
          >
            <i class="fas fa-shopping-bag"></i>
            <span>Pesanan Satuan</span>
          </div>
          <div
            class="dropdown-option"
            :class="{ active: activeOrderType === 'souvenir' }"
            @click="selectOrderType('souvenir')"
          >
            <i class="fas fa-gift"></i>
            <span>Pesanan Souvenir</span>
          </div>
          <div
            class="dropdown-option"
            :class="{ active: activeOrderType === 'mixed' }"
            @click="selectOrderType('mixed')"
          >
            <i class="fas fa-shopping-basket"></i>
            <span>Pesanan Campuran</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Search input -->
    <div class="search-container">
      <input
        type="text"
        :value="searchQuery"
        @input="$emit('update:searchQuery', $event.target.value)"
        placeholder="Search orders by ID, customer, product..."
        class="search-input"
      />
      <i class="fas fa-search search-icon"></i>
    </div>

    <!-- Status filter dropdown -->
    <div class="status-filter">
      <div class="dropdown-select" @click="toggleDropdown" ref="dropdownRef">
        <div class="selected-text">
          {{ selectedStatuses.length ? `${selectedStatuses.length} selected` : 'Filter Status' }}
        </div>
        <div class="dropdown-menu" v-if="isDropdownOpen">
          <label v-for="status in statusOptions" :key="status" class="dropdown-item" @click.stop>
            <input
              type="checkbox"
              :checked="selectedStatuses.includes(status)"
              @change="toggleStatus(status)"
            />
            <span class="status-badge" :class="status">{{ status }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  activeOrderType: {
    type: String,
    required: true,
  },
  searchQuery: {
    type: String,
    required: true,
  },
  selectedStatuses: {
    type: Array,
    required: true,
  },
  statusOptions: {
    type: Array,
    default: () => ['pending', 'process', 'delivery', 'complete', 'cancelled'],
  },
})

const emit = defineEmits([
  'update:activeOrderType',
  'update:searchQuery',
  'update:selectedStatuses',
])

const isDropdownOpen = ref(false)
const dropdownRef = ref(null)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const toggleStatus = (status) => {
  const newSelectedStatuses = [...props.selectedStatuses]

  if (newSelectedStatuses.includes(status)) {
    const index = newSelectedStatuses.indexOf(status)
    newSelectedStatuses.splice(index, 1)
  } else {
    newSelectedStatuses.push(status)
  }

  emit('update:selectedStatuses', newSelectedStatuses)
}

// Add click outside handler
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // Add this additional event listener for the order type dropdown
  document.addEventListener('click', (e) => {
    if (orderTypeDropdownRef.value && !orderTypeDropdownRef.value.contains(e.target)) {
      isOrderTypeDropdownOpen.value = false
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Order type dropdown logic
const isOrderTypeDropdownOpen = ref(false)
const orderTypeDropdownRef = ref(null)

const toggleOrderTypeDropdown = () => {
  isOrderTypeDropdownOpen.value = !isOrderTypeDropdownOpen.value
}

const selectOrderType = (type) => {
  emit('update:activeOrderType', type)
  isOrderTypeDropdownOpen.value = false
}

const getActiveIcon = computed(() => {
  switch (props.activeOrderType) {
    case 'regular':
      return 'fas fa-shopping-bag'
    case 'souvenir':
      return 'fas fa-gift'
    case 'mixed':
      return 'fas fa-shopping-basket'
    default:
      return 'fas fa-shopping-bag'
  }
})

const getActiveLabel = computed(() => {
  switch (props.activeOrderType) {
    case 'regular':
      return 'Pesanan Satuan'
    case 'souvenir':
      return 'Pesanan Souvenir'
    case 'mixed':
      return 'Pesanan Campuran'
    default:
      return 'Pesanan Satuan'
  }
})

// Add click outside handler for order type dropdown
onMounted(() => {
  document.addEventListener('click', handleOrderTypeClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOrderTypeClickOutside)
})

function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isDropdownOpen.value = false
  }
}

function handleOrderTypeClickOutside(e) {
  if (orderTypeDropdownRef.value && !orderTypeDropdownRef.value.contains(e.target)) {
    isOrderTypeDropdownOpen.value = false
  }
}
</script>

<style scoped>
.order-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

/* Order type tabs */
.order-type-tabs {
  display: flex;
  gap: 0;
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.custom-dropdown {
  position: relative;
  width: 220px;
  font-family: 'Montserrat', sans-serif;
  z-index: 1001;
}

.dropdown-toggle {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.dropdown-toggle:hover {
  border-color: #02163b;
}

.selected-type {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #02163b;
  font-weight: 500;
}

.selected-type i {
  color: #e8ba38;
  font-size: 1.1em;
}

.dropdown-arrow {
  transition: transform 0.3s ease;
}

.dropdown-arrow.rotate {
  transform: rotate(180deg);
}

.dropdown-options {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  animation: fadeInDown 0.3s forwards;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.dropdown-option:hover {
  background: #f5f7fa;
}

.dropdown-option.active {
  background: #f0f5ff;
}

.dropdown-option.active i {
  color: #e8ba38;
}

.dropdown-option.active span {
  color: #02163b;
  font-weight: 500;
}

/* Responsive styles */
@media (max-width: 768px) {
  .custom-dropdown {
    width: 100%;
  }
}

.type-tab {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #555;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  flex: 1;
  justify-content: center;
}

.type-tab i {
  font-size: 1.1em;
  transition: transform 0.2s ease;
}

.type-tab span {
  white-space: nowrap;
}

.type-tab.active {
  color: #02163b;
  background-color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.type-tab.active i {
  color: #e8ba38;
  transform: scale(1.1);
}

.type-tab:hover:not(.active) {
  color: #02163b;
  background-color: rgba(255, 255, 255, 0.5);
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 3px;
  background-color: #e8ba38;
  transform: translateX(-50%);
  transition: width 0.3s ease;
}

.type-tab.active .tab-indicator {
  width: 30px;
}

/* Search styles */
.search-container {
  position: relative;
  flex: 1;
  max-width: 400px;
  margin: 0 15px;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #02163b;
  box-shadow: 0 0 0 2px rgba(2, 22, 59, 0.1);
  outline: none;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 1rem;
}

/* Status filter dropdown */
.status-filter {
  position: relative;
  min-width: 200px;
}

.dropdown-select {
  position: relative;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.selected-text {
  padding: 8px 12px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.selected-text::after {
  content: '▼';
  font-size: 0.8em;
  margin-left: 8px;
}

.dropdown-menu {
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
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  gap: 8px;
  user-select: none;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item input[type='checkbox'] {
  margin: 0;
  cursor: pointer;
}

/* Status badges */
.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: 500;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.process {
  background-color: #cce5ff;
  color: #004085;
}

.status-badge.delivery {
  background-color: #e9d5ff;
  color: #6b21a8;
}

.status-badge.complete {
  background-color: #d1e7dd;
  color: #0f5132;
}

.status-badge.cancelled {
  background-color: #f8d7da;
  color: #842029;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .order-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container {
    max-width: 100%;
    margin: 10px 0;
  }

  .order-type-tabs {
    flex-direction: column;
    width: 100%;
  }

  .type-tab {
    justify-content: flex-start;
  }
}
</style>
