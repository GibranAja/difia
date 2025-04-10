<template>
  <div class="card-container">
    <div class="card" v-for="blog in blogStore.blogItems" :key="blog.id">
      <img :src="blog.image" :alt="blog.title" />
      <div class="keterangan">
        <h1>{{ blog.title }}</h1>
        <span class="line"></span>
        <p>{{ truncateText(blog.description, 100) }}</p>
        <div class="card-footer">
          <router-link :to="`/blog/${blog.id}`" class="read-more-btn">
            Baca Selengkapnya
          </router-link>
          <p class="creation-date">{{ formatDate(blog.createdAt) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useBlogStore } from '../stores/BlogStore'
import { defineProps } from 'vue'

const blogStore = useBlogStore()

defineProps({
  blog: {
    type: Object,
    required: true,
  },
})

const truncateText = (text, length) => {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

const formatDate = (dateValue) => {
  if (!dateValue) return '-'

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

onMounted(async () => {
  await blogStore.fetchBlogs()
})
</script>

<style scoped>
.card {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  background-color: #f9f9f9; /* Lighter background color */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  align-items: center;
  padding: 15px;
  height: 100%;
  width: 100%;
  border-radius: 8px;
}

.card img {
  width: 10%;
  object-fit: cover;
}

.keterangan {
  width: 60%;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.card-footer {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Changed from flex-end to flex-start */
}

.read-more-btn {
  text-decoration: none;
  background-color: #02163b;
  color: white;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
}

.read-more-btn:hover {
  background-color: #032661;
  transform: translateY(-2px);
}

.creation-date {
  margin-top: 8px;
  font-size: 0.85rem;
  color: #666;
  font-style: italic;
}

.line {
  width: 30%;
  display: flex;
  flex-wrap: wrap;
  border: 1px solid #000;
  margin-bottom: 10px;
}
</style>
