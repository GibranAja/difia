<template>
  <div class="card" v-if="item">
    <img :src="item.images[0]" alt="foto-produk" v-if="item.images && item.images.length > 0">
    <h1><b>{{ item.nama }}</b></h1>
    <a href="#">Detail</a>
  </div>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.card {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #02163b;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 5px;
}

.card h1 {
  font-size: 1.5rem;
  margin: 15px 0;
  color: white;
  text-align: center;
}

.card a {
  text-decoration: none;
  color: black;
  background-color: #e8ba38;
  padding: 8px 20px;
  border-radius: 100px;
  transition: all 0.3s ease;
  text-align: center;
  margin-top: auto;
}

.card a:hover {
  background-color: white;
  color: #e8ba38;
}
</style>
