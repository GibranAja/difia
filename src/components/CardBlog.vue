<template>
  <div class="card-container">
    <div class="card" v-for="blog in blogStore.blogItems" :key="blog.id">
      <img :src="blog.image" :alt="blog.title">
      <div class="keterangan">
        <h1>{{ blog.title }}</h1>
        <span class="line"></span>
        <p>{{ truncateText(blog.description, 100) }}</p>
        <a href="#">Baca Selengkapnya</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useBlogStore } from '../stores/BlogStore'

const blogStore = useBlogStore()

const truncateText = (text, length) => {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

onMounted(async () => {
  await blogStore.fetchBlogs()
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
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  padding: 10px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif;
  position: relative;
  width: 80%;
  min-height: 400px;
}

.card img {
  position: absolute;
  top: 0;
  width: 30%;
  border-radius: 5px;
  border: 1px solid #A79277;
  z-index: -1;
  /* Ubah z-index menjadi positif */
}

.card .keterangan {
  display: flex;
  flex-wrap: wrap;
  position: absolute;
  /* Tambahkan position absolute */
  bottom: 20px;
  /* Atur jarak dari bawah */
  left: 300px;
  /* Atur posisi dari kiri */
  width: 30%;
  background-color: #605D5D;
  color: white;
  padding: 10px;
  box-sizing: border-box;
  z-index: -1;
  /* Ubah z-index menjadi lebih tinggi dari gambar */
}

.card .keterangan a {
  text-decoration: none;
  color: white;
  padding: 5px;
}

.card .keterangan .line {
  width: 50%;
  border: 1px solid white;
}

.card .keterangan h1 {
  width: 100%;
}
</style>
