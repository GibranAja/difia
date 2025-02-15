<template>
  <Navbar />
  <main class="cart-view">
    <!-- Back Button -->
    <router-link to="/" class="back-button">
      <i class="fas fa-arrow-left"></i>
    </router-link>

    <!-- Page Title -->
    <h1 class="page-title">Keranjang</h1>

    <!-- Cart Items Section -->
    <div class="cart-container">
      <!-- Product List -->
      <section class="cart-items" v-if="cartStore.cartItems.length">
        <div class="cart-card" v-for="item in cartStore.cartItems" :key="item.id">
          <!-- Product Image -->
          <div class="cart-card__image">
            <img :src="item.image" :alt="item.name" />
          </div>

          <!-- Product Details -->
          <div class="cart-card__content">
            <h2 class="cart-card__title">{{ item.name }}</h2>

            <!-- Custom Options -->
            <div class="cart-card__options">
              <p>Bahan Luar: {{ item.customOptions.bahanLuar }}</p>
              <p>Bahan Dalam: {{ item.customOptions.bahanDalam }}</p>
              <p>Aksesoris: {{ item.customOptions.aksesoris.join(', ') }}</p>
            </div>

            <!-- Quantity and Price -->
            <div class="cart-card__controls">
              <div class="quantity-control">
                <button
                  class="quantity-btn"
                  :disabled="
                    item.quantity <= (item.customOptions.purchaseType === 'Satuan' ? 1 : 20)
                  "
                  @click="updateQuantity(item.id, item.quantity - 1)"
                >
                  <i class="fas fa-minus"></i>
                </button>

                <input
                  type="number"
                  v-model.number="item.quantity"
                  :min="item.customOptions.purchaseType === 'Satuan' ? 1 : 20"
                  @change="handleQuantityChange(item.id, item.quantity)"
                />

                <button class="quantity-btn" @click="updateQuantity(item.id, item.quantity + 1)">
                  <i class="fas fa-plus"></i>
                </button>

                <span class="unit-price">Rp {{ formatPrice(item.price) }}</span>
              </div>
              <p class="subtotal">Rp {{ formatPrice(item.price * item.quantity) }}</p>
            </div>

            <!-- Delete Button -->
            <button class="cart-card__delete" @click="removeItem(item.id)" title="Hapus Item">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </section>

      <!-- Empty Cart Message -->
      <section class="empty-cart" v-else>
        <p>Keranjang belanja Anda kosong</p>
        <router-link to="/" class="continue-shopping"> Lanjutkan Belanja </router-link>
      </section>

      <!-- Order Summary -->
      <aside class="order-summary" v-if="cartStore.cartItems.length">
        <h2>Total Pembelian</h2>

        <div class="summary-details">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>Rp {{ formatPrice(cartTotal) }}</span>
          </div>

          <div class="summary-row">
            <span>Pengiriman</span>
            <span>{{
              shippingCost ? `Rp ${formatPrice(shippingCost)}` : 'Dihitung saat checkout'
            }}</span>
          </div>

          <div class="summary-row total">
            <span>Total</span>
            <span>Rp {{ formatPrice(cartTotal + (shippingCost || 0)) }}</span>
          </div>
        </div>

        <router-link to="/checkout" class="checkout-button"> Lanjutkan Ke Pembayaran </router-link>
      </aside>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useCartStore } from '@/stores/CartStore'
import { useAuthStore } from '@/stores/AuthStore'
import Navbar from '@/components/NavigationBar.vue'
import { useToast } from 'vue-toastification'

const cartStore = useCartStore()
const authStore = useAuthStore()
const toast = useToast()
const shippingCost = 0
const isLoading = ref(false)
const cartTotal = computed(() => cartStore.getCartTotal())

// Add function to save cart to localStorage
const saveCartToCache = (cartData) => {
  try {
    localStorage.setItem(
      'cached_cart',
      JSON.stringify({
        items: cartData,
        timestamp: Date.now(),
        userId: authStore.currentUser?.id,
      }),
    )
  } catch (error) {
    console.error('Error saving cart to cache:', error)
  }
}

// Add function to get cart from localStorage
const getCartFromCache = () => {
  try {
    const cached = localStorage.getItem('cached_cart')
    if (!cached) return null

    const { items, timestamp, userId } = JSON.parse(cached)

    // Check if cache is for current user
    if (userId !== authStore.currentUser?.id) return null

    // Check if cache is less than 5 minutes old
    if (Date.now() - timestamp > 5 * 60 * 1000) {
      localStorage.removeItem('cached_cart')
      return null
    }

    return items
  } catch (error) {
    console.error('Error reading cart from cache:', error)
    return null
  }
}

// Modify onMounted to use cache
onMounted(async () => {
  if (!authStore.isLoggedIn) return

  isLoading.value = true
  try {
    // Try to load from cache first
    const cachedCart = getCartFromCache()
    if (cachedCart) {
      cartStore.cartItems = cachedCart
    }

    // Fetch fresh data in background
    const freshData = await cartStore.fetchCartItems()
    if (freshData) {
      saveCartToCache(cartStore.cartItems)
    }
  } catch (error) {
    console.error('Error loading cart:', error)
    toast.error('Gagal memuat keranjang')
  } finally {
    isLoading.value = false
  }
})

// Update other functions to maintain cache
const handleQuantityChange = async (itemId, quantity) => {
  const item = cartStore.cartItems.find((item) => item.id === itemId)
  const minQuantity = item.customOptions.purchaseType === 'Satuan' ? 1 : 20

  if (quantity < minQuantity) {
    toast.info(`Tidak bisa diganti dengan ${quantity}, minimal ${minQuantity} pembelian`)
    quantity = minQuantity
  }
  await updateQuantity(itemId, quantity)
  saveCartToCache(cartStore.cartItems)
}

const updateQuantity = async (itemId, quantity) => {
  const item = cartStore.cartItems.find((item) => item.id === itemId)
  const minQuantity = item.customOptions.purchaseType === 'Satuan' ? 1 : 20

  if (quantity < minQuantity) {
    quantity = minQuantity
  }

  await cartStore.updateQuantity(itemId, quantity)
  saveCartToCache(cartStore.cartItems)
}

const removeItem = async (itemId) => {
  if (confirm('Apakah Anda yakin ingin menghapus item ini?')) {
    await cartStore.removeFromCart(itemId)
    saveCartToCache(cartStore.cartItems) // Update cache after item removal
  }
}

const formatPrice = (price) => {
  return price.toLocaleString('id-ID')
}
</script>

<style scoped>
.cart-view {
  max-width: 1200px;
  margin: 4rem auto;
  padding: 2rem;
}

.cart-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

/* Back Button */
.back-button {
  position: absolute;
  left: 2rem;
  top: 6rem;
  font-size: 1.5rem;
  color: #000;
  text-decoration: none;
  transition: color 0.2s;
}

.back-button:hover {
  color: #e8ba38;
}

/* Page Title */
.page-title {
  margin: 3rem 0 2rem;
  text-align: center;
  font-size: 2rem;
  color: #02163b;
}

/* Cart Items Section */
.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-card {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
}

.cart-card__image img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.cart-card__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-card__title {
  font-size: 1.25rem;
  margin: 0;
  color: #02163b;
}

.cart-card__options {
  display: grid;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.cart-card__controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-control input {
  width: 60px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  text-align: center;
  appearance: textfield; /* Safari */
  -moz-appearance: textfield; /* Firefox */
}

quantity-control input::-webkit-outer-spin-button,
.quantity-control input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  color: #02163b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.quantity-btn:hover:not(:disabled) {
  background: #f5f5f5;
  color: #e8ba38;
}

.quantity-btn:disabled {
  background: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
}

.cart-card__delete {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s;
}

.cart-card__delete:hover {
  color: #c82333;
}

/* Order Summary */
.order-summary {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.order-summary h2 {
  margin: 0 0 1.5rem;
  text-align: center;
  color: #02163b;
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-row.total {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #eee;
  font-weight: bold;
  font-size: 1.1rem;
}

.checkout-button {
  display: block;
  width: 100%;
  padding: 1rem 0;
  margin-top: 1.5rem;
  background-color: #e8ba38;
  color: white;
  text-decoration: none;
  text-align: center;
  border-radius: 8px;
  transition: background-color 0.2s;
  font-weight: 500;
}

.checkout-button:hover {
  background-color: #d4a832;
}

/* Empty Cart */
.empty-cart {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.continue-shopping {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #02163b;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.continue-shopping:hover {
  background-color: #032456;
}

/* Responsive Design */
@media (max-width: 768px) {
  .cart-container {
    grid-template-columns: 1fr;
  }

  .cart-card {
    grid-template-columns: 100px 1fr;
    gap: 1rem;
  }

  .cart-card__image img {
    height: 100px;
  }

  .order-summary {
    position: static;
    margin-top: 1.5rem;
  }

  .quantity-control {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }
}
</style>
