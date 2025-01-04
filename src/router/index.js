import DashboardView from '@/views/admin/DashboardView.vue'
import HomeView from '@/views/HomeView.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { createRouter, createWebHistory } from 'vue-router'
import KatalogView from '@/views/admin/KatalogView.vue'
import OrderView from '@/views/admin/OrderView.vue'
import BlogView from '@/views/admin/BlogView.vue'
import ChatView from '@/views/admin/ChatView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'HomeView',
      component: HomeView,
    },
    {
      path: '/admin',
      component: AdminLayout,
      children: [
        {
          path: '',
          name: 'DashboardView',
          component: DashboardView,
        },
        {
          path: 'katalog',
          name: 'KatalogView',
          component: KatalogView,
        },
        {
          path: 'order',
          name: 'OrderView',
          component: OrderView,
        },
        {
          path: 'blog',
          name: 'BlogView',
          component: BlogView,
        },
        {
          path: 'chat',
          name: 'ChatView',
          component: ChatView,
        },
      ]
    },
  ],
})

export default router