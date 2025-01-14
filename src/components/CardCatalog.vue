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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  padding: 10px;
  background-color: white;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
.card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 5px;
  border: 1px solid #A79277;
}
.card h1 {
  font-size: 2rem;
  margin: 10px 0;
  color: #A79277;
}
.card a{
  text-decoration: none;
  color: black;
  transition: all 700ms;
  background-color: #D1BB9E;
  padding: 5px;
  border-radius: 100px;
  width: 100px;
  text-align: center;
}

.card a:hover {
  background-color: white;
  color: #D1BB9E;
}
</style>
