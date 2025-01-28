<template>
  <div class="card" :class="{ 'card-alt': isAlternate }" v-if="item">
    <img :src="item.images[0]" alt="foto-produk" v-if="item.images && item.images.length > 0">
    <h1><b>{{ item.nama }}</b></h1>
    <div class="button-group">
      <a href="" class="cart-btn" :class="{ 'cart-alt': isAlternate }">
        <i class="fas fa-cart-shopping"></i>
      </a>
      <a href="/detail" class="detail-btn"><b>Detail</b></a>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})

// Modified to create the pattern: blue, yellow, blue, blue, yellow, blue, blue, yellow, ...
const isAlternate = computed(() => {
  // Pattern repeats every 4 cards
  const position = props.index % 3
  // Return true (yellow) only for position 1 (second card) in each group of 3
  return position === 1
})
</script>

<style scoped>
.card { 
  width: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* Default/Primary style - navy blue background */
  background-color: #02163b;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Alternate style - gold background */
.card-alt {
  background-color: #e8ba38;
}

.card img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 5px;
}

.card h1 {
  font-size: 1.2rem;
  color: white;
  text-align: center;
  margin: 10px 0;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: auto;
  align-items: center;
}

.cart-btn {
  /* Default/Primary style - gold cart icon */
  color: #e8ba38;
  transition: 700ms;
}

/* Alternate style - navy blue cart icon */
.cart-btn.cart-alt {
  color: #02163b;
}

.cart-btn i {
  font-size: x-large;
}

.detail-btn {
  text-decoration: none;
  color: white;
  background-color: rgba(255, 253, 253, 0.3);
  border-radius: 100px;
  transition: all 0.3s ease;
  text-align: center;
  font-size: x-large;
  width: 120px;
}

.detail-btn:hover {
  background-color: white;
  color: #e8ba38;
}
</style>
