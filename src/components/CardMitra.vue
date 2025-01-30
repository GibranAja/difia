<template>
  <div class="card-container">
    <div v-for="partner in partnerStore.partners" :key="partner.id" class="card">
      <img :src="partner.image" :alt="partner.name">
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
  width: 33.3%;
  background-color: #d9d9d9;
  justify-content: center;
  text-align: center;
  padding: 10px;
}

.card img {
  width: 100%;
  max-width: 150px;
}
</style>
