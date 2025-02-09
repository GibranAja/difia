<template>
  <div class="card-container">
    <div v-for="partner in partnerStore.partners" :key="partner.id" class="card">
      <div class="image-container">
        <img :src="partner.image" :alt="partner.name" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePartnerStore } from '../stores/PartnerStore'

const partnerStore = usePartnerStore()

onMounted(async () => {
  await partnerStore.fetchPartners()
})
</script>

<style scoped>
.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  width: 100%;
}

.card {
  width: 25%;
  background-color: #d9d9d9;
  justify-content: center;
  text-align: center;
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.image-container {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.card img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: grayscale(100%);
  transition:
    filter 0.6s ease,
    transform 0.6s ease;
  will-change: filter, transform;
}

.card:hover img {
  filter: grayscale(0%);
  transform: scale(1.05);
}

/* Add a subtle overlay effect */
.image-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  opacity: 1;
  transition: opacity 0.6s ease;
}

.card:hover .image-container::after {
  opacity: 0;
}
</style>
