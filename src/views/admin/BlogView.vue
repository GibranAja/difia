<!-- views/admin/BlogView.vue -->

<template>
  <div class="blog-container">
    <h1>DAFTAR BLOG</h1>

    <div class="blog-controls">
      <div class="top-controls">
        <router-link to="/admin/blog/create" class="add-btn"> Tambah Blog </router-link>
      </div>

      <div class="filter-controls">
        <div class="entries-control">
          <select v-model="entriesPerPage">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <span>entries per page</span>
        </div>

        <div class="search-box">
          <input type="text" v-model="searchQuery" placeholder="Search..." />
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <!-- Empty state -->
      <div v-if="!paginatedBlogs.length" class="empty-state">
        <div class="empty-state-content">
          <span class="empty-icon">📝</span>
          <h3>Tidak ada blog disini</h3>
          <p>Mulai dengan menambahkan blog baru</p>
        </div>
      </div>

      <!-- Blog table -->
      <table v-else class="blog-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Gambar</th>
            <th>Judul Blog</th>
            <th>Deskripsi</th>
            <th>Tanggal</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(blog, index) in paginatedBlogs" :key="blog.id">
            <td>{{ startIndex + index + 1 }}</td>
            <td class="image-cell">
              <img :src="blog.image" :alt="blog.title" />
            </td>
            <td>{{ blog.title }}</td>
            <td class="description-cell">
              <div class="description-content">
                <p
                  v-for="(paragraph, idx) in blog.description.split('\n')"
                  :key="idx"
                  class="description-paragraph"
                >
                  {{ paragraph }}
                </p>
              </div>
            </td>
            <td>{{ formatDate(blog.createdAt) }}</td>
            <td class="action-cell">
              <div class="action-buttons">
                <router-link :to="`/admin/blog/edit/${blog.id}`" class="edit-btn">
                  Edit
                </router-link>
                <button class="delete-btn" @click="confirmDelete(blog.id)">Hapus</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="paginatedBlogs.length" class="pagination">
      <button :disabled="currentPage === 1" @click="currentPage--">&lt;&lt;</button>
      <span>{{ currentPage }} of {{ totalPages }}</span>
      <button :disabled="currentPage >= totalPages" @click="currentPage++">&gt;&gt;</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBlogStore } from '@/stores/BlogStore'

const blogStore = useBlogStore()
const searchQuery = ref('')
const currentPage = ref(1)
const entriesPerPage = ref(10)

// Fetch blogs on component mount
onMounted(async () => {
  await blogStore.fetchBlogs()
})

// Computed properties for filtering and pagination
const filteredBlogs = computed(() => {
  return blogStore.blogItems.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      blog.description.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

const totalPages = computed(() => Math.ceil(filteredBlogs.value.length / entriesPerPage.value))

const startIndex = computed(() => (currentPage.value - 1) * entriesPerPage.value)

const paginatedBlogs = computed(() => {
  const start = startIndex.value
  const end = start + entriesPerPage.value
  return filteredBlogs.value.slice(start, end)
})

// Helper functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const confirmDelete = async (id) => {
  if (confirm('Are you sure you want to delete this blog?')) {
    try {
      await blogStore.deleteBlog(id)
    } catch (error) {
      console.error('Error deleting blog:', error)
      alert('Failed to delete blog')
    }
  }
}
</script>

<style>
.blog-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.blog-controls {
  margin: 20px 0 30px 0;
}

.top-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-btn {
  background-color: #02163b;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

.filter-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.entries-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.entries-control select {
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.search-box input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
}

.table-responsive {
  overflow-x: auto;
  margin-bottom: 20px;
}

.blog-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

.blog-table th,
.blog-table td {
  border: 1px solid #02163b;
  padding: 12px;
  text-align: left;
}

.blog-table th {
  background-color: #02163b;
  color: white;
}

.image-cell img {
  width: 100px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.description-cell {
  max-width: 300px;
}

.description-content {
  max-height: 100px;
  overflow-y: auto;
  white-space: pre-line;
  padding: 8px;
}

.action-cell {
  width: 150px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.edit-btn,
.delete-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  color: white;
}

.edit-btn {
  background-color: #2196f3;
}

.delete-btn {
  background-color: #f44336;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background-color: #f9f9f9;
  border: 2px dashed #ddd;
  border-radius: 8px;
}

.empty-state-content {
  text-align: center;
  color: #666;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination button {
  padding: 5px 10px;
  border: 1px solid #ddd;
  background-color: #b69b87;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}

.pagination button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

.description-paragraph {
  margin: 0;
  padding: 0;
}

.description-paragraph:not(:last-child) {
  margin-bottom: 8px;
}
</style>
