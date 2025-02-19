<template>
  <!-- Move back button outside container -->
  <button class="back-button" @click="goBack">
    <i class="fas fa-arrow-left"></i>
    <span>Kembali</span>
  </button>

  <div class="blog-view-container">
    <div v-if="blog" class="blog-content">
      <!-- Blog Header Section -->
      <header class="blog-header">
        <h1 class="blog-title">{{ blog.title }}</h1>
        <div class="title-underline"></div>
        <div class="blog-metadata">
          <span class="blog-date">
            {{ formatDate(blog.createdAt) }}
          </span>
        </div>
      </header>

      <!-- Blog Image -->
      <div class="blog-image-container">
        <img :src="blog.image" :alt="blog.title" class="blog-image" />
      </div>

      <!-- Blog Content -->
      <article class="blog-description">
        <p
          v-for="(paragraph, idx) in blog.description.split('\n')"
          :key="idx"
          class="description-paragraph"
        >
          {{ paragraph }}
        </p>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBlogStore } from '@/stores/BlogStore'
import { useRoute } from 'vue-router'

const route = useRoute()
const blogStore = useBlogStore()
const blog = ref(null)

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const goBack = () => {
  window.history.back()
}

onMounted(async () => {
  const blogId = route.params.id
  blog.value = await blogStore.getBlogById(blogId)
})
</script>

<style scoped>
.blog-view-container {
  max-width: 1200px; /* Reduced width for better readability */
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Montserrat', sans-serif;
  margin-top: 2rem; /* Add margin-top to create space below back button */
}

/* Update back button styles to position it absolutely */
.back-button {
  position: fixed;
  top: 2rem;
  left: 8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #e8ba38;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-family: 'Montserrat', sans-serif;
  cursor: pointer;
  font-size: 1rem;
  z-index: 10; /* Ensure button stays above other content */
  transition: all 0.3s ease;
}

.back-button i {
  font-size: 1.2rem;
}

.back-button:hover {
  background-color: #d1a32e;
  transform: translateX(-5px);
}

.blog-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* Reduced gap between sections from 3.5rem */
}

/* Header Styles */
.blog-header {
  text-align: left;
  margin-bottom: 1rem; /* Reduced from 2rem */
  width: fit-content;
}

.blog-title {
  font-size: 2.2rem;
  color: #02163b;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 0.5rem; /* Reduced from 1rem */
  display: inline-block;
}

.title-underline {
  width: 100%;
  height: 3px;
  background-color: #e8ba38;
  margin: 0.4rem 0; /* Reduced from 0.8rem */
  border-radius: 2px;
}

.blog-metadata {
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.5rem; /* Reduced from 1rem */
  text-align: left;
}

.blog-date {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem; /* Increased gap */
}

.blog-date i {
  color: #e8ba38;
}

/* Image Styles */
.blog-image-container {
  width: 100%;
  height: 400px; /* Fixed height */
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 1rem 0;
  display: flex; /* Added to center image */
  justify-content: center; /* Center horizontally */
  align-items: center; /* Center vertically */
  background-color: #f5f5f5; /* Added background color for empty spaces */
}

.blog-image {
  width: auto; /* Changed from 100% to auto */
  height: 100%;
  max-width: 100%; /* Added max-width */
  object-fit: contain; /* Changed from cover to contain */
  object-position: center; /* Center the image focus point */
  transition: transform 0.5s ease;
}

.blog-image:hover {
  transform: scale(1.02); /* Reduced from 1.03 */
}

/* Content Styles */
.blog-description {
  line-height: 1.8;
  color: #333;
  font-size: 1.1rem;
  max-width: 100%;
  margin: 1rem 0; /* Reduced from 2rem */
}

.description-paragraph {
  margin-bottom: 1.5rem; /* Reduced from 2rem */
  text-align: justify;
}

.description-paragraph:last-child {
  margin-bottom: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .blog-view-container {
    padding: 1.5rem;
    margin-top: 4rem; /* Reduce margin on smaller screens */
  }

  .blog-content {
    gap: 1rem; /* Further reduced for mobile */
  }

  .blog-title {
    font-size: 1.8rem;
  }

  .blog-image-container {
    max-height: 300px;
    margin: 0.75rem 0;
  }

  .blog-image {
    width: auto;
    max-width: 100%;
  }

  .blog-description {
    font-size: 1rem;
    line-height: 1.6;
  }

  .title-underline {
    width: 100%; /* Keep it 100% on mobile */
  }

  .description-paragraph {
    margin-bottom: 1rem;
  }

  /* Add responsive styles for back button */
  .back-button {
    top: 1rem;
    left: 1rem;
  }
}

@media (max-width: 480px) {
  .blog-view-container {
    padding: 1rem;
    margin-top: 3.5rem; /* Further reduce margin on mobile */
  }

  .blog-title {
    font-size: 1.6rem;
  }

  .blog-content {
    gap: 0.75rem;
  }

  .blog-image-container {
    max-height: 200px;
    margin: 0.5rem 0;
  }

  .description-paragraph {
    margin-bottom: 1.2rem;
  }
}
</style>
