<template>
  <div class="pagination-wrapper">
    <div class="entries-dropdown">
      <span>Show</span>
      <select :value="entriesPerPage" @change="$emit('update:entriesPerPage', parseInt($event.target.value))">
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="50">50</option>
      </select>
      <span>entries</span>
    </div>

    <div class="pagination">
      <button :disabled="currentPage === 1" @click="$emit('prev-page')">
        <i class="fas fa-chevron-left"></i>
      </button>
      <span>{{ currentPage }} of {{ totalPages }}</span>
      <button :disabled="currentPage >= totalPages" @click="$emit('next-page')">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  entriesPerPage: {
    type: Number,
    required: true
  }
});

defineEmits(['prev-page', 'next-page', 'update:entriesPerPage']);
</script>

<style scoped>
.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding: 0 10px;
}

.entries-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
}

.entries-dropdown select {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-family: 'Montserrat', sans-serif;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.pagination button {
  padding: 8px 12px;
  border: 1px solid #02163b;
  background-color: #02163b;
  color: white;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.pagination button:hover:not(:disabled) {
  background-color: #032661;
}

.pagination button:disabled {
  background-color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}

.pagination span {
  font-weight: 500;
  color: #02163b;
}
</style>