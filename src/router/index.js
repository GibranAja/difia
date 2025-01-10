// router/index.js

import DashboardView from '@/views/admin/DashboardView.vue'
import LoginPage from '../views/LoginPage.vue'
import NotFoundView from '@/views/notfound/NotFound.vue'
import RegisterPage from '../views/RegisterPage.vue'
import HomeView from '@/views/HomeView.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useAuthStore } from '@/stores/AuthStore'
import { createRouter, createWebHistory } from 'vue-router'
import KatalogView from '@/views/admin/KatalogView.vue'
import OrderView from '@/views/admin/OrderView.vue'
import ChatViewPublic from '@/views/ChatView.vue'
import BlogView from '@/views/admin/BlogView.vue'
import ChatView from '@/views/admin/ChatView.vue'
// Add new imports for blog routes
import CreateBlog from '@/views/admin/CreateBlog.vue'
import CreateKatalog from '@/views/admin/CreateKatalog.vue'

const adminGuard = async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Pastikan hanya admin yang bisa akses
  if (!authStore.isLoggedIn || !authStore.currentUser?.isAdmin) {
    next({ name: 'notFound' })
    return
  }

  next()
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'HomeView',
      component: HomeView,
    },
    {
      path: '/chat',
      name: 'ChatViewPublic',
      component: ChatViewPublic,
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginPage
    },
    {
      path: '/register',
      name: 'Register',
      component: RegisterPage
    },

    {
      path: '/admin',
      component: AdminLayout,
      beforeEnter: adminGuard,
      children: [
        {
          path: '',
          name: 'DashboardView',
          component: DashboardView,
          meta: { requiresAdmin: true }
        },
        {
          path: 'katalog',
          name: 'KatalogView',
          component: KatalogView,
          meta: { requiresAdmin: true }
        },
        {
          path: 'katalog/create',
          name: 'CreateKatalog',
          component: CreateKatalog,
          meta: { requiresAdmin: true }
        },
        {
          path: 'katalog/edit/:id',
          name: 'EditKatalog',
          component: CreateKatalog,
          meta: { requiresAdmin: true }
        },
        {
          path: 'order',
          name: 'OrderView',
          component: OrderView,
          meta: { requiresAdmin: true }
        },
        {
          path: 'blog',
          name: 'BlogView',
          component: BlogView,
          meta: { requiresAdmin: true }
        },
        // Add new blog routes
        {
          path: 'blog/create',
          name: 'CreateBlog',
          component: CreateBlog,
          meta: { requiresAdmin: true }
        },
        {
          path: 'blog/edit/:id',
          name: 'EditBlog',
          component: CreateBlog,
          meta: { requiresAdmin: true }
        },
        {
          path: 'chat',
          name: 'ChatView',
          component: ChatView,
          meta: { requiresAdmin: true }
        },
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: NotFoundView
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    return { top: 0, behavior: 'smooth' }
  }
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if ((to.path === '/login' || to.path === '/register') && authStore.isLoggedIn) {
    if (authStore.currentUser?.isAdmin) {
      next({ name: 'DashboardView' })
    } else {
      next({ name: 'HomeView' })
    }
    return
  }

  // Check admin routes
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (!authStore.isLoggedIn || !authStore.currentUser?.isAdmin) {
      next({ name: 'notFound' })
      return
    }
  }

  next()
})

export default router