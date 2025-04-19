// router/index.js

// Admin Views
import DashboardView from '@/views/admin/DashboardView.vue'
import KatalogView from '@/views/admin/KatalogView.vue'
import CreateKatalog from '@/views/admin/CreateKatalog.vue'
import OrderView from '@/views/admin/OrderView.vue'
import BlogView from '@/views/admin/BlogView.vue'
import CreateBlog from '@/views/admin/CreateBlog.vue'
import PartnerView from '@/views/admin/PartnerView.vue'
import CreatePartnerView from '@/views/admin/CreatePartnerView.vue'
import StaffView from '@/views/admin/StaffView.vue'
import CreateStaff from '@/views/admin/CreateStaffView.vue'
import SliderView from '@/views/admin/SliderView.vue'
import VoucherView from '@/views/admin/VoucherView.vue'
import CreateVoucherView from '@/views/admin/CreateVoucherView.vue'
import AchievementView from '@/views/admin/AchievementView.vue'
import CreateAchievementView from '@/views/admin/CreateAchievementView.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

// Customer Views
import HomeView from '@/views/HomeView.vue'
import DetailKatalogView from '@/views/DetailKatalogView.vue'
import DetailBlogView from '@/views/BlogView.vue'
import CustomView from '@/views/CustomView.vue'
import CartView from '@/views/CartView.vue'
import CheckoutView from '@/views/CheckoutView.vue'
import ChatCustomer from '@/views/ChatCustomer.vue'
import NotificationVIew from '@/views/NotificationVIew.vue'
import TermsConditionView from '@/views/TermsConditionView.vue'

// Auth Views
import LoginPage from '@/views/LoginPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import ForgotPassword from '@/views/auth/ForgotPassword.vue'

// Account Views
import AccountLayout from '@/layouts/AccountLayout.vue'
import ProfileView from '@/views/account/ProfileView.vue'
import OrdersView from '@/views/account/OrdersView.vue'
import AddressView from '@/views/account/AddressView.vue'

// Other
import NotFoundView from '@/views/notfound/NotFound.vue'
import { useAuthStore } from '@/stores/AuthStore'
import { createRouter, createWebHistory } from 'vue-router'

// Lazy loaded components
const ChatListView = () => import('@/views/admin/ChatListView.vue')
const ChatDetailView = () => import('@/views/admin/ChatDetailView.vue')

const adminGuard = async (to, from, next) => {
  const authStore = useAuthStore()

  if (
    !authStore.isLoggedIn ||
    (!authStore.currentUser?.isAdmin && !authStore.currentUser?.isStaff)
  ) {
    next({ name: 'notFound' })
    return
  }

  next()
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Customer Routes
    {
      path: '/',
      name: 'HomeView',
      component: HomeView,
    },
    {
      path: '/Notification',
      name: 'NotificationVIew',
      component: NotificationVIew,
    },
    {
      path: '/detail/:id',
      name: 'DetailKatalog',
      component: DetailKatalogView,
    },
    {
      path: '/blog/:id',
      name: 'DetailBlogView',
      component: DetailBlogView,
    },
    {
      path: '/custom/:id',
      name: 'CustomView',
      component: CustomView,
    },
    {
      path: '/cart',
      name: 'CartView',
      component: CartView,
    },
    {
      path: '/checkout',
      name: 'CheckoutView',
      component: CheckoutView,
    },
    {
      path: '/terms',
      name: 'TermsView',
      component: TermsConditionView,
    },
    {
      path: '/chat',
      name: 'ChatCustomer',
      component: ChatCustomer,
    },

    // Auth Routes
    {
      path: '/login',
      name: 'Login',
      component: LoginPage,
    },
    {
      path: '/register',
      name: 'Register',
      component: RegisterPage,
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: ForgotPassword,
    },
    {
      path: '/verify-email',
      name: 'VerifyEmail',
      component: () => import('@/views/auth/VerifyEmail.vue'),
      meta: {
        requiresAuth: false,
        title: 'Verify Email - DIFIA',
      },
    },

    // Account Routes
    {
      path: '/my-account',
      component: AccountLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'profile',
          name: 'Profile',
          component: ProfileView,
        },
        {
          path: 'orders',
          name: 'Orders',
          component: OrdersView,
        },
        {
          path: 'address',
          name: 'Address',
          component: AddressView,
        },
        // Default redirect
        {
          path: '',
          redirect: { name: 'Profile' },
        },
      ],
    },

    // Admin Routes
    {
      path: '/admin',
      component: AdminLayout,
      beforeEnter: adminGuard,
      children: [
        {
          path: '',
          name: 'DashboardView',
          component: DashboardView,
          meta: { requiresAuth: true },
        },
        // Katalog Management
        {
          path: 'katalog',
          name: 'KatalogView',
          component: KatalogView,
          meta: { requiresAdmin: true },
        },
        {
          path: 'katalog/create',
          name: 'CreateKatalog',
          component: CreateKatalog,
          meta: { requiresAdmin: true },
        },
        {
          path: 'katalog/edit/:id',
          name: 'EditKatalog',
          component: CreateKatalog,
          meta: { requiresAdmin: true },
        },
        // Blog Management
        {
          path: 'blog',
          name: 'BlogView',
          component: BlogView,
          meta: { requiresAdmin: true },
        },
        {
          path: 'blog/create',
          name: 'CreateBlog',
          component: CreateBlog,
          meta: { requiresAdmin: true },
        },
        {
          path: 'blog/edit/:id',
          name: 'EditBlog',
          component: CreateBlog,
          meta: { requiresAdmin: true },
        },
        // Staff Management
        {
          path: 'staff',
          name: 'StaffView',
          component: StaffView,
          meta: { requiresAdmin: true },
        },
        {
          path: 'staff/create',
          name: 'CreateStaff',
          component: CreateStaff,
          meta: { requiresAdmin: true },
        },
        {
          path: 'staff/edit/:id',
          name: 'EditStaff',
          component: CreateStaff,
          meta: { requiresAdmin: true },
        },
        // Partner Management
        {
          path: 'Partner',
          name: 'PartnerView',
          component: PartnerView,
          meta: { requiresAdmin: true },
        },
        {
          path: 'partner/create',
          name: 'CreatePartnerBlog',
          component: CreatePartnerView,
          meta: { requiresAdmin: true },
        },
        {
          path: 'partner/edit/:id',
          name: 'CreatePartnerView',
          component: CreatePartnerView,
          meta: { requiresAdmin: true },
        },
        // Other Admin Routes
        {
          path: 'order',
          name: 'OrderView',
          component: OrderView,
          meta: { requiresAuth: true },
        },
        {
          path: 'slider',
          name: 'SliderView',
          component: SliderView,
          meta: { requiresAdmin: true },
        },
        {
          path: 'voucher',
          name: 'VoucherView',
          component: VoucherView,
          meta: { requiresAuth: true },
        },
        {
          path: 'voucher/create',
          name: 'CreateVoucherView',
          component: CreateVoucherView,
          meta: { requiresAdmin: true },
        },
        {
          path: 'voucher/edit/:id',
          name: 'EditVoucherView',
          component: CreateVoucherView,
          meta: { requiresAdmin: true },
        },
        {
          path: 'chat',
          name: 'ChatList',
          component: ChatListView,
          meta: { requiresAuth: true },
        },
        {
          path: 'chat/:id',
          name: 'ChatDetail',
          component: ChatDetailView,
          meta: { requiresAuth: true },
        },
        {
          path: 'achievement',
          name: 'AchievementView',
          component: AchievementView,
          meta: { requiresAdmin: true },
        },
        {
          path: 'achievement/create',
          name: 'CreateAchievement',
          component: CreateAchievementView,
          meta: { requiresAdmin: true },
        },
        {
          path: 'achievement/edit/:id',
          name: 'EditAchievement',
          component: CreateAchievementView,
          meta: { requiresAdmin: true },
        },
      ],
    },
    // 404 Route
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: NotFoundView,
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  },
})

// Auth Guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if ((to.path === '/login' || to.path === '/register') && authStore.isLoggedIn) {
    if (authStore.currentUser?.isAdmin || authStore.currentUser?.isStaff) {
      next({ name: 'DashboardView' })
    } else {
      next({ name: 'HomeView' })
    }
    return
  }

  // Check authentication for protected routes
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!authStore.isLoggedIn) {
      next({ name: 'Login' }) // Redirect to login instead of 404
      return
    }

    // Only check admin/staff status for routes that specifically require it
    if (to.matched.some((record) => record.meta.requiresAdmin)) {
      if (!authStore.currentUser?.isAdmin) {
        next({ name: 'notFound' })
        return
      }
    }
  }

  next()
})

export default router
