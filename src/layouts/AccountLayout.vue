<template>
  <!-- Add VoucherNotification above NavigationBar -->
  <VoucherNotification />
  <NavigationBar />

  <div class="account-layout" :class="{ 'has-voucher': hasActiveVouchers }">
    <div class="account-container">
      <div class="account-sidebar">
        <div class="sidebar-header">
          <div class="user-avatar" :style="{ backgroundImage: `url(${userProfilePhoto})` }">
            <div class="avatar-overlay"></div>
          </div>
          <h3 class="user-name">{{ authStore.currentUser?.name }}</h3>
          <p class="user-email">{{ authStore.currentUser?.email }}</p>
        </div>
        <div class="sidebar-divider"></div>
        <nav class="sidebar-nav">
          <router-link
            to="/my-account/orders"
            class="nav-item"
            :class="{ active: $route.path.includes('/orders') }"
          >
            <i class="fas fa-shopping-bag"></i>
            <span>Pesanan</span>
          </router-link>
          <router-link
            to="/my-account/profile"
            class="nav-item"
            :class="{ active: $route.path.includes('/profile') }"
          >
            <i class="fas fa-user"></i>
            <span>Profil</span>
          </router-link>
          <router-link
            to="/my-account/address"
            class="nav-item"
            :class="{ active: $route.path.includes('/address') }"
          >
            <i class="fas fa-map-marker-alt"></i>
            <span>Alamat</span>
          </router-link>
          <!-- Add this new payment link -->
          <router-link
            to="/my-account/payment"
            class="nav-item"
            :class="{ active: $route.path.includes('/payment') }"
          >
            <i class="fas fa-credit-card"></i>
            <span>Pembayaran</span>
          </router-link>
        </nav>
      </div>
      <div class="account-content">
        <router-view></router-view>
      </div>
    </div>
  </div>

  <!-- Add FooterComponent at the bottom -->
  <FooterComponent />
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useAuthStore } from '@/stores/AuthStore'
import { useVoucherStore } from '@/stores/VoucherStore'
import defaultAvatarImage from '@/assets/default-avatar-wm14gXiP.png'
import NavigationBar from '@/components/NavigationBar.vue'
import FooterComponent from '@/components/FooterComponent.vue'
import VoucherNotification from '@/components/VoucherNotification.vue'
import { collection, query, onSnapshot, where } from 'firebase/firestore'
import { db } from '@/config/firebase'

const authStore = useAuthStore()
const voucherStore = useVoucherStore()
const unsubscribeListener = ref(null)

const userProfilePhoto = computed(() => {
  return authStore.currentUser?.profilePhoto || defaultAvatarImage
})

// Compute if there are active vouchers
const hasActiveVouchers = computed(() => {
  return voucherStore.voucherItems.some((voucher) => {
    const now = new Date()
    const validUntilDate = new Date(voucher.validUntil)
    const isNotExpired = validUntilDate > now
    const hasRemainingUses = voucher.currentUses < voucher.maxUses
    return voucher.isActive && isNotExpired && hasRemainingUses
  })
})

// Set up real-time listener for vouchers
const setupVoucherListener = () => {
  try {
    const vouchersRef = collection(db, 'vouchers')
    const vouchersQuery = query(vouchersRef, where('isActive', '==', true))

    unsubscribeListener.value = onSnapshot(
      vouchersQuery,
      (snapshot) => {
        const vouchers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        voucherStore.voucherItems = vouchers
      },
      (error) => {
        console.error('Error in voucher listener:', error)
      },
    )
  } catch (error) {
    console.error('Error setting up voucher listener:', error)
  }
}

onMounted(() => {
  // Fetch vouchers and setup real-time listener
  voucherStore.fetchVouchers().then(() => {
    setupVoucherListener()
  })
})

onUnmounted(() => {
  // Clean up listener when component is unmounted
  if (unsubscribeListener.value) {
    unsubscribeListener.value()
  }
})
</script>

<style scoped>
.account-layout {
  background-color: #f8f9fa;
  min-height: calc(100vh - 110px);
  padding: 2rem 0;
  margin-top: 70px; /* Default margin for navbar height */
  transition: margin-top 0.3s ease;
}

/* Adjust margin when voucher notification is present */
.account-layout.has-voucher {
  margin-top: 110px; /* Increased to accommodate both navbar and voucher notification */
}

.account-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 2rem;
  padding: 0 1rem;
}

.account-sidebar {
  width: 280px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  padding-bottom: 1rem;
  height: fit-content;
  /* Add sticky positioning */
  position: sticky;
  top: 90px; /* Default top position (navbar height + some padding) */
  transition: top 0.3s ease; /* Smooth transition when voucher appears/disappears */
  align-self: flex-start; /* Ensures the sidebar doesn't stretch */
}

/* Adjust top position when voucher notification is present */
.has-voucher .account-sidebar {
  top: 130px; /* Increased to accommodate voucher notification */
}

.sidebar-header {
  background: linear-gradient(135deg, #02163b, #02265e);
  padding: 2rem 1.5rem;
  color: white;
  text-align: center;
  position: relative;
}

.user-avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  margin: 0 auto 1rem;
  background-size: cover;
  background-position: center;
  border: 4px solid rgba(255, 255, 255, 0.2);
  position: relative;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
  border-radius: 50%;
  opacity: 0.4;
}

.user-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.user-email {
  font-size: 0.9rem;
  margin: 0.5rem 0 0;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-divider {
  height: 1px;
  background-color: #eee;
  margin: 0;
}

.sidebar-nav {
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.8rem 1.5rem;
  color: #444;
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-item:hover {
  background-color: #f5f5f5;
  color: #02163b;
}

.nav-item.active {
  background-color: rgba(232, 186, 56, 0.1);
  color: #02163b;
  border-left: 4px solid #e8ba38;
}

.nav-item i {
  margin-right: 12px;
  width: 20px;
  text-align: center;
}

.account-content {
  flex: 1;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  min-height: 500px;
}

@media (max-width: 768px) {
  .account-container {
    flex-direction: column;
  }

  .account-sidebar {
    width: 100%;
    position: relative; /* Remove sticky on mobile */
    top: 0;
  }

  /* Adjust the margin for mobile when voucher is present */
  .account-layout.has-voucher {
    margin-top: 100px;
  }
}
</style>
