<template>
  <div class="order-controls">
    <!-- Order Type Toggle -->
    <div class="order-type-toggle">
      <button
        :class="['toggle-btn', { active: activeOrderType === 'regular' }]"
        @click="$emit('update:activeOrderType', 'regular')"
      >
        <i class="fas fa-shopping-bag"></i>
        Satuan
      </button>
      <button
        :class="['toggle-btn', { active: activeOrderType === 'souvenir' }]"
        @click="$emit('update:activeOrderType', 'souvenir')"
      >
        <i class="fas fa-gift"></i>
        Souvenir
      </button>

      <!-- New Refund Button with different style -->
      <button
        :class="['refund-btn', { active: activeOrderType === 'refund' }]"
        @click="$emit('update:activeOrderType', 'refund')"
      >
        <i class="fas fa-undo-alt"></i>
        Refund
      </button>
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
import { ref, onMounted, onUnmounted } from 'vue'

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
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isDropdownOpen.value = false
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

/* Order type toggle */
.order-type-toggle {
  display: flex;
  gap: 8px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 2px solid #02163b;
  border-radius: 4px;
  background: none;
  color: #02163b;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn i {
  font-size: 1em;
}

.toggle-btn.active {
  background-color: #02163b;
  color: white;
}

.toggle-btn:hover:not(.active) {
  background-color: rgba(2, 22, 59, 0.1);
}

/* Refund button styles */
.refund-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 2px solid #e74c3c;
  border-radius: 4px;
  background: none;
  color: #e74c3c;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 10px; /* Add some separation from the other buttons */
}

.refund-btn i {
  font-size: 1em;
}

.refund-btn.active {
  background-color: #e74c3c;
  color: white;
}

.refund-btn:hover:not(.active) {
  background-color: rgba(231, 76, 60, 0.1);
}

/* Search styles */
.search-container {
  position: relative;
  flex: 1;
  max-width: 200px;
  margin: 0 15px;
  margin-left: 14rem;
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
}
</style>
