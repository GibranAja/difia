import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/config/firebase'
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore'

export const useBlogStore = defineStore('blog', () => {
  const blogItems = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  // Validate image size and type
  const validateImage = (file) => {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

    if (file.size > maxSize) {
      throw new Error('Image size must be less than 5MB')
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPEG, PNG, GIF, and WebP images are allowed')
    }

    return true
  }

  // Process image for upload
  const processImage = async (file) => {
    try {
      validateImage(file)
      const base64String = await fileToBase64(file)
      return base64String
    } catch (error) {
      throw new Error(`Error processing image: ${error.message}`)
    }
  }

  // Cache mechanism
  const cache = {
    data: new Map(),
    timestamp: new Map(),
    maxAge: 5 * 60 * 1000, // 5 minutes cache

    set(key, value) {
      this.data.set(key, value)
      this.timestamp.set(key, Date.now())
    },

    get(key) {
      const timestamp = this.timestamp.get(key)
      if (!timestamp) return null

      if (Date.now() - timestamp > this.maxAge) {
        this.data.delete(key)
        this.timestamp.delete(key)
        return null
      }

      return this.data.get(key)
    },

    clear() {
      this.data.clear()
      this.timestamp.clear()
    }
  }

  // Fetch all blogs with caching
  const fetchBlogs = async (forceFetch = false) => {
    try {
      isLoading.value = true
      error.value = null

      // Check cache if forceFetch is false
      if (!forceFetch) {
        const cachedBlogs = cache.get('blogs')
        if (cachedBlogs) {
          blogItems.value = cachedBlogs
          return
        }
      }

      const blogsQuery = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(blogsQuery)
      
      const blogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString()
      }))

      blogItems.value = blogs
      cache.set('blogs', blogs)

    } catch (err) {
      error.value = err.message
      throw new Error(`Error fetching blogs: ${err.message}`)
    } finally {
      isLoading.value = false
    }
  }

  // Add new blog
  const addBlog = async (blogData) => {
    try {
      isLoading.value = true
      error.value = null

      if (blogData.imageFile) {
        blogData.image = await processImage(blogData.imageFile)
        delete blogData.imageFile
      }

      const docRef = await addDoc(collection(db, 'blogs'), {
        ...blogData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      // Update cache with new data
      cache.clear()
      await fetchBlogs()

      return { success: true, id: docRef.id }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Update blog
  const updateBlog = async (id, blogData) => {
    try {
      isLoading.value = true
      error.value = null

      if (blogData.imageFile) {
        blogData.image = await processImage(blogData.imageFile)
        delete blogData.imageFile
      }

      const blogRef = doc(db, 'blogs', id)
      await updateDoc(blogRef, {
        ...blogData,
        updatedAt: serverTimestamp()
      })

      // Update cache with new data
      cache.clear()
      await fetchBlogs()

      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Delete blog
  const deleteBlog = async (id) => {
    try {
      isLoading.value = true
      error.value = null

      await deleteDoc(doc(db, 'blogs', id))
      
      // Update local state and cache
      blogItems.value = blogItems.value.filter(blog => blog.id !== id)
      cache.clear()

      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Get single blog
  const getBlogById = (id) => {
    return blogItems.value.find(blog => blog.id === id) || null
  }

  // Clear cache manually if needed
  const clearCache = () => {
    cache.clear()
  }

  return {
    blogItems,
    isLoading,
    error,
    fetchBlogs,
    addBlog,
    updateBlog,
    deleteBlog,
    getBlogById,
    clearCache
  }
})