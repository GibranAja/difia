<template>
  <div class="detail-view">
    <div class="gambar-detail">
      <router-link to="/" class="back">
        <i class="fas fa-arrow-left"></i>
      </router-link>
      
      <h1>{{ katalog?.nama || 'Produk Kami' }}</h1>
      
      <div v-if="katalog" class="content-wrapper">
        <img :src="katalog.images[0]" :alt="katalog.nama" />
        
        <button class="hub">Hubungi Kami</button>
        
        <div class="toko-section">
          <h2>Kunjungi Toko Kami :</h2>
          <div class="sosmed-link">
            <a href="#" class="sosmed">
              <i class="fas fa-brands fa-instagram"></i>
              DIFIA.ID
            </a>
            <a href="#" class="sosmed">
              <i class="fas fa-bag-shopping"></i>
              DIFIA OFFICIAL SHOP
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-keterangan" v-if="katalog">
      <section>
        <h2>HARGA / PCS</h2>
        <div class="info-content">
          <p>Standard : {{ katalog.harga.standar.toLocaleString() }}</p>
          <p>Premium : {{ katalog.harga.premium.toLocaleString() }}</p>
          <p>Budgeting : {{ katalog.harga.budgetting }}</p>
        </div>
      </section>

      <section>
        <h2>DETAIL</h2>
        <div class="info-content">
          <p>Ukuran : {{ katalog.detail.ukuran.panjang }}x{{ katalog.detail.ukuran.lebar }}x{{ katalog.detail.ukuran.tinggi }} cm</p>
          <p>Bahan Luar : {{ katalog.detail.bahanLuar }}</p>
          <p>Bahan Dalam : {{ katalog.detail.bahanDalam }}</p>
          <p>Aksesoris : {{ katalog.detail.aksesoris }}</p>
          <p>Warna : {{ katalog.detail.warna }}</p>
        </div>
      </section>

      <section>
        <h2>WAKTU PENGERJAAN</h2>
        <div class="info-content">
          <p>50-100 pcs : {{ katalog.waktuPengerjaan.pcs50_100 }}</p>
          <p>200 pcs : {{ katalog.waktuPengerjaan.pcs200 }}</p>
          <p>300 pcs : {{ katalog.waktuPengerjaan.pcs300 }}</p>
          <p>>300 pcs : {{ katalog.waktuPengerjaan.pcsAbove300 }}</p>
          <p>Express : {{ katalog.waktuPengerjaan.express }}</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useKatalogStore } from '@/stores/KatalogStore'

const route = useRoute()
const katalogStore = useKatalogStore()
const katalog = ref(null)

// Function to save catalog to localStorage
const saveCatalogToCache = (catalogData) => {
  if (catalogData) {
    localStorage.setItem(`catalog-${catalogData.id}`, JSON.stringify(catalogData))
  }
}

// Function to get catalog from localStorage
const getCatalogFromCache = (id) => {
  const cached = localStorage.getItem(`catalog-${id}`)
  return cached ? JSON.parse(cached) : null
}

onMounted(async () => {
  const id = route.params.id
  
  // First try to get from cache
  const cachedItem = getCatalogFromCache(id)
  if (cachedItem) {
    katalog.value = cachedItem
  }
  
  // Then try to find in existing store items
  let item = katalogStore.katalogItems.find(k => k.id === id)
  
  if (!item) {
    // If not found in existing items, fetch from store
    await katalogStore.fetchKatalog()
    item = katalogStore.katalogItems.find(k => k.id === id)
  }

  if (item) {
    katalog.value = item
    // Save to cache for future use
    saveCatalogToCache(item)
  }
})
</script>

<style scoped>
.detail-view {
  display: flex;
  height: 100vh;
  background-color: #d9d9d9;
  font-family: 'Montserrat', sans-serif;
  overflow: hidden;
}

.gambar-detail {
  width: 50%;
  padding: 1.5rem;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.back {
  position: absolute;
  top: 1rem;
  left: 1rem;
  text-decoration: none;
}

.back i {
  color: #E8BA38;
  font-size: 1.5rem;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 100%;
}

.gambar-detail h1 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
}

.gambar-detail img {
  width: 100%;
  max-width: 350px;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
}

.hub {
  background-color: #E8BA38;
  color: white;
  padding: 0.6rem 1.8rem;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.toko-section {
  width: 100%;
  text-align: center;
}

.toko-section h2 {
  margin-bottom: 0.8rem;
  font-size: 1.1rem;
}

.sosmed-link {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.sosmed {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: black;
  font-size: 0.85rem;
}

.sosmed i {
  background-color: #E8BA38;
  color: white;
  padding: 0.4rem;
  border-radius: 50%;
  margin-right: 0.4rem;
  font-size: 0.9rem;
}

.detail-keterangan {
  width: 50%;
  background-color: white;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 0;
  height: 100%;
}

.detail-keterangan section {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.detail-keterangan h2 {
  background-color: #02163B;
  color: white;
  padding: 0.6rem;
  text-align: center;
  font-size: 1.1rem;
  margin: 0;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.info-content p {
  font-size: 0.9rem;
  padding: 0.2rem 0;
  margin: 0;
}

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

* {
  box-sizing: border-box;
}
</style>