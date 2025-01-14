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
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 120px 40px; /* Increased row gap to account for floating keterangan */
  padding: 20px;
  width: 100%;
  max-width: 1700px;
  margin: 0 auto;
}

.card {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  overflow: visible; /* Changed from hidden to allow content to overflow */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card img {
  width: 100%;
  height: 15rem; /* Changed from aspect-ratio to fixed height */
  object-fit: cover;
  display: block; /* Removes any extra space below image */
}

.card .keterangan {
  position: absolute;
  width: 75%;
  background-color: rgba(96, 93, 93, 0.9); /* Added transparency */
  padding: 20px;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 10px;
  bottom: -150px;
  transform: none; /* Removed the center transform */
  z-index: 2;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card .keterangan h1 {
  font-size: 1.5rem;
  margin: 0;
  line-height: 1.2;
}

.card .keterangan p {
  margin: 0;
  line-height: 1.5;
}

.card .keterangan .line {
  width: 50%;
  border: 1px solid white;
  margin: 10px 0;
}

.card .keterangan a {
  text-decoration: none;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  align-self: flex-start;
  transition: all 0.3s ease;
}

.card .keterangan a:hover {
  background-color: white;
  color: #605D5D;
}

/* Responsive design for smaller screens */
@media (max-width: 768px) {
  .card-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .card-container {
    grid-template-columns: 1fr;
  }
}
</style>
