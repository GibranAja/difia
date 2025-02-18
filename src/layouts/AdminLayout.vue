<!-- layouts/AdminLayout.vue -->

<template>
  <div class="admin-layout">
    <!-- Sidebar with overlay for mobile -->
    <div v-if="isSidebarOpen && isMobile" class="sidebar-overlay" @click="toggleSidebar"></div>

    <SidebarAdmin :is-open="isSidebarOpen" class="sidebar-transition" />

    <div class="main-content" :class="{ 'sidebar-open': isSidebarOpen }">
      <!-- Navbar -->
      <nav class="admin-navbar">
        <div class="navbar-left">
          <button class="hamburger-btn" @click="toggleSidebar">
            <i class="fas fa-bars" :class="{ rotate: !isSidebarOpen }"></i>
          </button>
          <h1 class="dashboard-title">{{ currentPageTitle }}</h1>
        </div>

        <div class="navbar-right">
          <!-- Search Bar -->
          <div class="search-container" v-click-outside="closeSearch">
            <input
              type="text"
              placeholder="Search..."
              class="search-input"
              v-model="searchQuery"
              @focus="showSearchOverlay = true"
              @input="handleSearch"
            />
            <button class="search-btn">
              <i class="fas fa-search"></i>
            </button>

            <!-- Search Overlay -->
            <div class="search-overlay" v-if="showSearchOverlay">
              <!-- Search Results -->
              <div class="search-section" v-if="searchQuery">
                <h3>Search Results</h3>
                <div v-if="searchResults.length" class="search-items">
                  <div
                    v-for="result in searchResults"
                    :key="result.id"
                    class="search-item"
                    @click="navigateToResult(result)"
                  >
                    <i :class="getIconForType(result.type)"></i>
                    <span v-html="highlightText(result.text)"></span>
                  </div>
                </div>
                <div v-else class="no-results">
                  <i class="fas fa-search"></i>
                  <p>No results found for "{{ searchQuery }}"</p>
                </div>
              </div>

              <!-- Recent Searches -->
              <div class="search-section" v-if="recentSearches.length">
                <h3>Recent Searches</h3>
                <div class="search-items">
                  <div v-for="(search, index) in recentSearches" :key="index" class="search-item">
                    <div class="search-item-content" @click="handleSearchItemClick(search)">
                      <i class="fas fa-history"></i>
                      <span v-html="highlightText(search.text)"></span>
                    </div>
                    <button
                      class="delete-search"
                      @click.stop="deleteFromRecentSearches(index)"
                      title="Remove from history"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Notification and Profile -->
          <div class="nav-actions">
            <!-- <button class="icon-btn notification-btn">
              <i class="fas fa-bell"></i>
            </button> -->
            <button class="icon-btn profile-btn">
              <i class="fas fa-user"></i>
            </button>
          </div>
        </div>
      </nav>

      <!-- Main Content Area -->
      <main class="content-area">
        <RouterView :isSidebarOpen="isSidebarOpen" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import SidebarAdmin from '../components/admin/SidebarAdmin.vue'
import { useRouter } from 'vue-router'

// Add these imports at the top of your script section
import { useKatalogStore } from '@/stores/KatalogStore'
import { useBlogStore } from '@/stores/BlogStore'
import { useOrderStore } from '@/stores/OrderStore'
import { usePartnerStore } from '@/stores/PartnerStore'
import { useStaffStore } from '@/stores/StaffStore'

const route = useRoute()
const isSidebarOpen = ref(true)
const isMobile = ref(false)
const router = useRouter()
const searchQuery = ref('')
const showSearchOverlay = ref(false)
const searchResults = ref([])
const recentSearches = ref([])

// Initialize stores
const katalogStore = useKatalogStore()
const blogStore = useBlogStore()
const orderStore = useOrderStore()
const partnerStore = usePartnerStore()
const staffStore = useStaffStore()

// Add computed property for dynamic page title
const currentPageTitle = computed(() => {
  switch (route.name) {
    case 'DashboardView':
      return 'DASHBOARD'
    case 'KatalogView':
      return 'KELOLA KATALOG'
    case 'BlogView':
      return 'KELOLA ARTIKEL'
    case 'OrderView':
      return 'KELOLA PESANAN'
    case 'ChatList':
      return 'KELOLA CHAT'
    case 'CreateKatalog':
      return 'TAMBAH KATALOG'
    case 'EditKatalog':
      return 'EDIT KATALOG'
    case 'CreateBlog':
      return 'TAMBAH ARTIKEL'
    case 'EditBlog':
      return 'EDIT ARTIKEL'
    case 'ChatView':
      return 'DETAIL CHAT'
    case 'SliderView':
      return 'KELOLA BANNER'
    case 'PartnerView':
      return 'KELOLA PARTNER'
    case 'StaffView':
      return 'KELOLA STAFF'
    default:
      return 'DASHBOARD'
  }
})

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    isSidebarOpen.value = false
  }
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)

  // Load recent searches
  const savedSearches = localStorage.getItem('recentSearches')
  if (savedSearches) {
    recentSearches.value = JSON.parse(savedSearches)
  }

  // Fetch data from all stores
  try {
    await Promise.all([
      katalogStore.fetchKatalog(),
      blogStore.fetchBlogs(),
      // orderStore.fetchOrders(),
      partnerStore.fetchPartners(),
      staffStore.fetchStaff(),
    ])
  } catch (error) {
    console.error('Error fetching data:', error)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// Click outside directive
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  },
}

const closeSearch = () => {
  showSearchOverlay.value = false
}

const deleteFromRecentSearches = (index) => {
  recentSearches.value.splice(index, 1)
  localStorage.setItem('recentSearches', JSON.stringify(recentSearches.value))
}

const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  const query = searchQuery.value.toLowerCase()
  const results = []

  // Tambahkan pengecekan null/undefined untuk setiap store
  if (katalogStore.katalogItems && katalogStore.katalogItems.length) {
    katalogStore.katalogItems.forEach((item) => {
      if (item.nama?.toLowerCase().includes(query)) {
        results.push({
          id: item.id,
          type: 'katalog',
          text: `Katalog: ${item.nama}`,
          route: '/admin/katalog',
        })
      }
    })
  }

  if (blogStore.blogItems && blogStore.blogItems.length) {
    blogStore.blogItems.forEach((item) => {
      if (item.title?.toLowerCase().includes(query)) {
        results.push({
          id: item.id,
          type: 'blog',
          text: `Blog: ${item.title}`,
          route: '/admin/blog',
        })
      }
    })
  }

  if (orderStore.orderItems && orderStore.orderItems.length) {
    orderStore.orderItems.forEach((item) => {
      if (item.orderNumber?.toLowerCase().includes(query)) {
        results.push({
          id: item.id,
          type: 'order',
          text: `Order #${item.orderNumber}`,
          route: `/admin/order/${item.id}`,
        })
      }
    })
  }

  if (partnerStore.partners && partnerStore.partners.length) {
    partnerStore.partners.forEach((item) => {
      if (item.name?.toLowerCase().includes(query)) {
        results.push({
          id: item.id,
          type: 'partner',
          text: `Partner: ${item.name}`,
          route: '/admin/partner',
        })
      }
    })
  }

  if (staffStore.staffItems && staffStore.staffItems.length) {
    staffStore.staffItems.forEach((item) => {
      if (item.name?.toLowerCase().includes(query)) {
        results.push({
          id: item.id,
          type: 'staff',
          text: `Staff: ${item.name}`,
          route: '/admin/staff',
        })
      }
    })
  }

  searchResults.value = results
}

const highlightText = (text) => {
  if (!searchQuery.value) return text
  const regex = new RegExp(`(${searchQuery.value})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

const getIconForType = (type) => {
  const icons = {
    katalog: 'fas fa-box',
    blog: 'fas fa-newspaper',
    order: 'fas fa-shopping-cart',
    partner: 'fas fa-handshake',
    staff: 'fas fa-user-tie',
  }
  return icons[type] || 'fas fa-search'
}

const saveToRecentSearches = (searchItem) => {
  const newSearch = {
    text: searchItem.text,
    type: searchItem.type,
    route: searchItem.route,
    timestamp: new Date().getTime(),
  }

  recentSearches.value = [
    newSearch,
    ...recentSearches.value.filter((s) => s.text !== searchItem.text),
  ].slice(0, 5) // Keep only last 5 searches

  localStorage.setItem('recentSearches', JSON.stringify(recentSearches.value))
}

const navigateToResult = (result) => {
  saveToRecentSearches(result)
  router.push(result.route)
  showSearchOverlay.value = false
  searchQuery.value = ''
}

const handleSearchItemClick = (search) => {
  router.push(search.route)
  showSearchOverlay.value = false
  searchQuery.value = ''
}
</script>

<style scoped>
.admin-layout {
  font-family: 'Montserrat', sans-serif;
  display: flex;
  min-height: 100vh;
  position: relative;
  background-color: #f8f9fa;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 15;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); /* Modified transition */
  width: calc(100% - 250px); /* Modified width */
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content.sidebar-open {
  margin-left: 250px;
  width: calc(100% - 250px);
}

.main-content:not(.sidebar-open) {
  margin-left: 80px;
  width: calc(100% - 80px);
}

.admin-navbar {
  font-family: 'Montserrat', serif;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  background-color: #e8ba38;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
  margin: 0;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dashboard-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.search-container {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 20px;
  padding: 0 0.5rem;
  width: 300px;
  position: relative;
}

.search-input {
  border: none;
  background: none;
  padding: 0.5rem 1rem;
  width: 100%;
  outline: none;
  font-family: inherit;
}

.search-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #666;
}

.nav-actions {
  display: flex;
  gap: 1rem;
}

.icon-btn {
  background: rgba(0, 0, 0, 0.2);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
}

.icon-btn:hover {
  background: rgba(0, 0, 0, 0.3);
}

.toggle-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: white;
}

.content-area {
  flex: 1;
  background-color: #f8f9fa;
  overflow-x: auto;
}

/* Add these new styles */
.hamburger-btn {
  background: none;
  border: none;
  width: 48px; /* Increased from 40px */
  height: 48px; /* Increased from 40px */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  margin-right: 10px;
}

.hamburger-btn i {
  font-size: 24px; /* Increased icon size */
  transition: transform 0.5s ease; /* Add transition for rotation */
}

.hamburger-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* Add rotation class */
.hamburger-btn i.rotate {
  transform: rotate(360deg);
}

/* Modify media queries */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0 !important;
    width: 100% !important;
  }

  .hamburger-btn {
    margin-right: 5px;
  }

  .sidebar-transition {
    position: fixed;
    left: -280px;
    transition: left 0.3s ease;
  }

  .sidebar-transition:not(.sidebar-collapsed) {
    left: 0;
  }

  .search-container {
    width: 200px;
  }

  .dashboard-title {
    display: none;
  }
}

.search-overlay {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 8px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
}

.search-section {
  padding: 12px;
}

.search-section h3 {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 8px;
  padding: 0 8px;
}

.search-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.search-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
  min-width: 0; /* Add this to enable text truncation */
}

.search-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0; /* Add this to enable text truncation */
}

.search-item span {
  flex: 1;
  font-size: 0.875rem;
  white-space: nowrap; /* Prevent line breaks */
  overflow: hidden; /* Hide overflow content */
  text-overflow: ellipsis; /* Add ellipsis */
  max-width: calc(100% - 40px); /* Leave space for delete button */
}

.delete-search {
  opacity: 0;
  background: none;
  border: none;
  color: #666;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0; /* Prevent button from shrinking */
  margin-left: 8px; /* Add some space between text and button */
}

.delete-search:hover {
  background-color: #e0e0e0;
  color: #dc3545;
}

.search-item:hover .delete-search {
  opacity: 1;
}

.search-item:hover {
  background-color: #f5f5f5;
}

.search-item i {
  color: #666;
  width: 16px;
}

.search-item span {
  flex: 1;
  font-size: 0.875rem;
}

mark {
  background-color: #ffe082;
  padding: 2px;
  border-radius: 2px;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  color: #666;
  text-align: center;
  border-radius: 4px;
  margin: 8px;
}

.no-results i {
  font-size: 24px;
  margin-bottom: 8px;
  color: #999;
}

.no-results p {
  margin: 0;
  font-size: 0.875rem;
}

.search-section + .search-section {
  border-top: 1px solid #eee;
  margin-top: 8px;
  padding-top: 16px;
}
</style>
