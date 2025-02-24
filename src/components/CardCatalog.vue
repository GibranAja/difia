<template>
  <div class="card" v-if="item">
    <div class="card-content">
      <div class="image-wrapper">
        <router-link :to="`/detail/${item.id}`" class="image-container">
          <img :src="item.images[0]" alt="foto-produk" v-if="item.images && item.images.length > 0" />
          <div class="overlay">
            <div class="overlay-content">
              <span class="view-details">Lihat Detail</span>
              <p class="hover-desc">Klik untuk melihat informasi lengkap produk</p>
            </div>
          </div>
        </router-link>
      </div>
      
      <div class="product-info">
        <h1 class="product-name">{{ item.nama }}</h1>
        
        <div class="price-section">
          <span class="price-label">Harga Mulai Dari</span>
          <p class="price">Rp {{ formatPrice(item.harga.standar) }}</p>
        </div>

        <button @click="handleBuyClick" class="order-btn">
          <span>Pesan Sekarang</span>
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
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
  }
})

const handleBuyClick = () => {
  if (!authStore.isLoggedIn) {
    toast.warning('Silakan login terlebih dahulu')
    router.push('/login')
    return
  }
  router.push(`/custom/${props.item.id}`)
}

const formatPrice = (price) => {
  return price.toLocaleString('id-ID')
}
</script>

<style scoped>
.card {
  width: 300px;
  background-color: #fafafa;
  border-radius: 16px;
  padding: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.image-wrapper {
  padding: 10px;
  background-color: white;
  border-radius: 12px;
  box-shadow: inset 0 0 10px rgba(2, 22, 59, 0.05);
}

.image-container {
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;
  border-radius: 8px;
  display: block;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(2, 22, 59, 0.7),
    rgba(232, 186, 56, 0.7)
  );
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.overlay-content {
  text-align: center;
  transform: translateY(20px);
  transition: transform 0.3s ease;
}

.view-details {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
}

.hover-desc {
  color: white;
  font-size: 0.9rem;
  opacity: 0.9;
}

.image-container:hover .overlay {
  opacity: 1;
}

.image-container:hover img {
  transform: scale(1.1);
}

.image-container:hover .overlay-content {
  transform: translateY(0);
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.product-name {
  font-size: 1.25rem;
  color: #02163b;
  font-weight: 600;
  line-height: 1.4;
  margin: 0;
}

.price-section {
  background-color: white;
  border: 2px solid #e8ba38;
  border-radius: 12px;
  padding: 12px 16px;
  position: relative;
  overflow: hidden;
}

.price-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background-color: #e8ba38;
}

.price-label {
  display: block;
  color: #02163b;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 4px;
  opacity: 0.8;
}

.price {
  color: #02163b;
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.order-btn {
  background-color: #e8ba38;
  color: #02163b;
  border: none;
  border-radius: 100px;
  padding: 14px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 5px;
}

.order-btn:hover {
  background-color: #02163b;
  color: #e8ba38;
  transform: translateX(5px);
}

.order-btn i {
  transition: transform 0.3s ease;
}

.order-btn:hover i {
  transform: translateX(5px);
}
</style>