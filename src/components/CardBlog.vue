<template>
  <div class="card-container">
    <div class="card" v-for="blog in blogStore.blogItems" :key="blog.id">
      <img :src="blog.image" :alt="blog.title">
      <div class="keterangan">
        <h1>{{ blog.title }}</h1>
        <span class="line"></span>
        <p>{{ truncateText(blog.description, 100) }}</p>
        <router-link :to="`/blog/${blog.id}`" class="read-more">
          Baca Selengkapnya
        </router-link>
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
.card{
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  background-color: #d9d9d9;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  align-items: center;
  padding: 10px;
}

.card img {
  width: 10%;
  object-fit: cover;
}
.keterangan {
  width: 60%;
  padding: 20px;
}

.read-more {
  text-decoration: none;
  width: 100%;
  float: right;
  text-align: right;
  color: #02163b;
  font-weight: 500;
  transition: color 0.3s ease;
}

.read-more:hover {
  color: #E8BA38;
}

.line{
  width: 30%;
  display: flex;
  flex-wrap: wrap;
  border: 1px solid #000;
}
</style>
