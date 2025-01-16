<!-- src/views/admin/PartnerView.vue -->
<template>
  <div class="partner-container">
    <h1>Daftar Partner</h1>
    <div class="top-controls">
      <router-link to="/admin/partner/create" class="add-btn">
        Add Partner
      </router-link>
    </div>

    <!-- Loading state -->
    <div v-if="partnerStore.isLoading" class="loading">Loading...</div>

    <!-- Empty state -->
    <div v-else-if="!partnerStore.partners.length" class="empty-state">
      <div class="empty-state-content">
        <span class="empty-icon">🤝</span>
        <h3>No partners yet</h3>
        <p>Start by adding a new partner</p>
      </div>
    </div>

    <!-- Partner grid -->
    <div v-else class="partner-grid">
      <div v-for="partner in partnerStore.partners" :key="partner.id" class="partner-card">
        <img :src="partner.image" :alt="partner.name">
        <h3>{{ partner.name }}</h3>
        <div class="card-actions">
          <router-link :to="`/admin/partner/edit/${partner.id}`" class="edit-btn">
            Edit
          </router-link>
          <button @click="confirmDelete(partner.id)" class="delete-btn">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePartnerStore } from '@/stores/PartnerStore'

const partnerStore = usePartnerStore()

onMounted(async () => {
  await partnerStore.fetchPartners()
})

const confirmDelete = async (id) => {
  if (confirm('Are you sure you want to delete this partner?')) {
    await partnerStore.deletePartner(id)
  }
}
</script>

<style scoped>
.partner-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.top-controls {
  margin-bottom: 20px;
}

.add-btn {
  background-color: #02163b;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
}

.partner-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.partner-card {
  background: #eeeeee;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.partner-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
}

.partner-card h3 {
  margin: 10px 0;
}

.card-actions {
  display: flex;
  gap: 10px;
}

.edit-btn, .delete-btn {
  flex: 1;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
}

.edit-btn {
  background: #4caf50;
  color: white;
}

.delete-btn {
  background: #f44336;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 40px;
  background: #f5f5f5;
  border-radius: 8px;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}
</style>