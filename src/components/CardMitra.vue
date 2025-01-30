<template>
  <div class="card-container">
    <div v-for="partner in partnerStore.partners" :key="partner.id" class="card">
      <div class="image-container">
        <img :src="partner.image" :alt="partner.name">
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
}

.image-container {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
