<template>
  <div class="card" :class="{ 'card-alt': isAlternate }" v-if="item">
    <router-link :to="`/detail/${item.id}`" class="image-container">
      <img :src="item.images[0]" alt="foto-produk" v-if="item.images && item.images.length > 0" />
      <div class="overlay">
        <span>Lihat Detail</span>
      </div>
    </router-link>
    <h1>
      <b>{{ item.nama }}</b>
    </h1>
    <p class="price">Rp {{ formatPrice(item.harga.standar) }}</p>
    <div class="button-group">
      <a href="" class="cart-btn" :class="{ 'cart-alt': isAlternate }">
        <i class="fas fa-cart-shopping"></i>
      </a>
      <a @click.prevent="handleBuyClick" class="detail-btn" href="#">
        <b>Beli Sekarang</b>
      </a>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import { useToast } from 'vue-toastification'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
})

// Modified to create the pattern: blue, yellow, blue, blue, yellow, blue, blue, yellow, ...
const isAlternate = computed(() => {
  const position = props.index % 3
  return position === 1
})

const handleBuyClick = () => {
  if (!authStore.isLoggedIn) {
    toast.warning('Silakan login terlebih dahulu')
    router.push('/login')
    return
  }
  router.push(`/custom/${props.item.id}`)
}

// Add this function to format the price
const formatPrice = (price) => {
  return price.toLocaleString('id-ID')
}
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  cursor: pointer; /* Add cursor pointer to show it's clickable */
  transition: transform 0.2s ease; /* Optional: add hover effect */
}

.card img:hover {
  transform: scale(1.05); /* Optional: add hover effect */
}

.card h1 {
  font-size: 1.2rem;
  color: white;
  text-align: center;
  margin: 10px 0 5px 0; /* Reduced bottom margin */
}

.price {
  color: #ffffff;
  font-size: 1rem;
  margin: 0 0 10px 0;
  text-align: center;
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
  font-size: 16px;
  padding: 10px;
  width: 120px;
}

.detail-btn:hover {
  background-color: white;
  color: #e8ba38;
}

.image-container {
  position: relative;
  width: 200px;
  height: 200px;
  overflow: hidden;
  border-radius: 5px;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.overlay span {
  color: white;
  font-size: 1.1rem;
  font-weight: 500;
  transform: translateY(20px);
  transition: transform 0.3s ease;
}

.image-container:hover .overlay {
  opacity: 1;
}

.image-container:hover img {
  transform: scale(1.1);
}

.image-container:hover .overlay span {
  transform: translateY(0);
}
</style>
