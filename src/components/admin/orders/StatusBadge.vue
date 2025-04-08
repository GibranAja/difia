<template>
  <span class="status-badge" :class="status">
    {{ status }}
  </span>
</template>

<script setup>
defineProps({
  status: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
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
</style>