<template>
  <VoucherNotification />
  <Navbar />
  <main class="cart-view" :class="{ 'has-voucher': hasActiveVouchers }">
    <router-link to="/" class="back-button">
      <i class="fas fa-arrow-left"></i>
    </router-link>

    <h1 class="page-title">Keranjang</h1>

    <div class="cart-container">
      <section class="cart-items" v-if="cartStore.cartItems.length">
        <!-- Select All Checkbox -->
        <div class="select-all-container">
          <label class="custom-checkbox">
            <input
              type="checkbox"
              v-model="selectAll"
              @change="handleSelectAll"
              :checked="isAllSelected"
            />
            <span class="checkmark"></span>
            <span class="select-all-text">Pilih Semua</span>
          </label>
        </div>

        <div class="cart-card" v-for="item in cartStore.cartItems" :key="item.id">
          <!-- Item Checkbox -->
          <div class="item-checkbox">
            <label class="custom-checkbox">
              <input
                type="checkbox"
                v-model="selectedItems"
                :value="item.id"
                @change="handleItemSelection"
              />
              <span class="checkmark"></span>
            </label>
          </div>

          <!-- Product Image -->
          <div class="cart-card__image">
            <img :src="item.image" :alt="item.name" />
          </div>

          <!-- Product Details -->
          <div class="cart-card__content">
            <h2 class="cart-card__title">{{ item.name }}</h2>

            <div class="cart-card__options">
              <p>Bahan Luar: {{ item.customOptions.bahanLuar }}</p>
              <p>Bahan Dalam: {{ item.customOptions.bahanDalam }}</p>
              <p>Aksesoris: {{ item.customOptions.aksesoris.join(', ') }}</p>
            </div>

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

            <button class="cart-card__delete" @click="removeItem(item.id)" title="Hapus Item">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </section>

      <section class="empty-cart" v-else>
        <p>Keranjang belanja Anda kosong</p>
        <router-link to="/" class="continue-shopping">Lanjutkan Belanja</router-link>
      </section>

      <aside class="order-summary" v-if="cartStore.cartItems.length">
        <h2>Total Pembelian</h2>

        <div class="summary-details">
          <div class="summary-row">
            <span>Item Dipilih</span>
            <span>{{ selectedItems.length }} item</span>
          </div>

          <div class="summary-row">
            <span>Subtotal</span>
            <span>Rp {{ formatPrice(getSelectedItemsTotal) }}</span>
          </div>

          <div class="summary-row">
            <span>Pengiriman</span>
            <span>{{
              shippingCost ? `Rp ${formatPrice(shippingCost)}` : 'Dihitung saat checkout'
            }}</span>
          </div>

          <div class="summary-row total">
            <span>Total</span>
            <span>Rp {{ formatPrice(getSelectedItemsTotal + (shippingCost || 0)) }}</span>
          </div>
        </div>

        <button
          class="checkout-button"
          :disabled="selectedItems.length === 0"
          @click="proceedToCheckout"
        >
          Lanjutkan Ke Pembayaran
        </button>
      </aside>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch, onUnmounted } from 'vue'
import { useCartStore } from '@/stores/CartStore'
import { useAuthStore } from '@/stores/AuthStore'
import { useVoucherStore } from '@/stores/VoucherStore'
import { useRouter } from 'vue-router'
import Navbar from '@/components/NavigationBar.vue'
import VoucherNotification from '@/components/VoucherNotification.vue'
import { collection, query, onSnapshot, where, orderBy } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useToast } from 'vue-toastification'

const cartStore = useCartStore()
const authStore = useAuthStore()
const voucherStore = useVoucherStore()
const router = useRouter()
const toast = useToast()
const shippingCost = 0
const isLoading = ref(false)
const selectedItems = ref([])
const selectAll = ref(false)
const unsubscribeListener = ref(null)

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

// Add these two missing computed properties after your other computed properties
const isAllSelected = computed(() => {
  return cartStore.cartItems.length > 0 && selectedItems.value.length === cartStore.cartItems.length
})

const getSelectedItemsTotal = computed(() => {
  return cartStore.cartItems
    .filter((item) => selectedItems.value.includes(item.id))
    .reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0)
})

// Set up real-time listener for vouchers
const setupVoucherListener = () => {
  try {
    const vouchersRef = collection(db, 'vouchers')
    const vouchersQuery = query(
      vouchersRef,
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
    )

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

// Watch for changes in cart items to update selection state
watch(
  () => cartStore.cartItems.length,
  (newLength) => {
    if (newLength === 0) {
      selectedItems.value = []
      selectAll.value = false
    }
  },
)

// Handle select all checkbox
const handleSelectAll = (event) => {
  const isChecked = event.target.checked
  if (isChecked) {
    selectedItems.value = cartStore.cartItems.map((item) => item.id)
  } else {
    selectedItems.value = []
  }
}

// Handle individual item selection
const handleItemSelection = () => {
  selectAll.value = isAllSelected.value
}

// Updated proceedToCheckout function
const proceedToCheckout = () => {
  if (selectedItems.value.length === 0) {
    toast.warning('Pilih minimal satu item untuk checkout')
    return
  }

  // Get selected items data
  const selectedItemsData = cartStore.cartItems
    .filter((item) => selectedItems.value.includes(item.id))
    .map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      customOptions: item.customOptions,
    }))

  try {
    // Store all selected items in localStorage for checkout
    localStorage.setItem(
      'checkout_items',
      JSON.stringify({
        items: selectedItemsData, // Store all selected items
        timestamp: Date.now(),
        userId: authStore.currentUser?.id,
      }),
    )

    // Navigate to checkout
    router.push('/checkout')
  } catch (error) {
    console.error('Error preparing checkout:', error)
    toast.error('Gagal memproses checkout')
  }
}

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

// Modify onMounted to use cache and setup voucher listener
onMounted(async () => {
  if (!authStore.isLoggedIn) return

  isLoading.value = true
  try {
    // Try to load cart from cache first
    const cachedCart = getCartFromCache()
    if (cachedCart) {
      cartStore.cartItems = cachedCart
    }

    // Fetch fresh cart data in background
    const freshData = await cartStore.fetchCartItems()
    if (freshData) {
      saveCartToCache(cartStore.cartItems)
    }

    // Fetch vouchers and setup real-time listener
    await voucherStore.fetchVouchers()
    setupVoucherListener()
  } catch (error) {
    console.error('Error loading cart:', error)
    toast.error('Gagal memuat keranjang')
  } finally {
    isLoading.value = false
  }
})

// Clean up listener when component unmounts
onUnmounted(() => {
  if (unsubscribeListener.value) {
    unsubscribeListener.value()
  }
})

// Handle quantity change
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

// Update quantity
const updateQuantity = async (itemId, quantity) => {
  const item = cartStore.cartItems.find((item) => item.id === itemId)
  const minQuantity = item.customOptions.purchaseType === 'Satuan' ? 1 : 20

  if (quantity < minQuantity) {
    quantity = minQuantity
  }

  await cartStore.updateQuantity(itemId, quantity)
  saveCartToCache(cartStore.cartItems)
}

// Remove item
const removeItem = async (itemId) => {
  if (confirm('Apakah Anda yakin ingin menghapus item ini?')) {
    // Remove item from selected items if it was selected
    selectedItems.value = selectedItems.value.filter((id) => id !== itemId)
    // Update selectAll state
    selectAll.value = isAllSelected.value

    await cartStore.removeFromCart(itemId)
    saveCartToCache(cartStore.cartItems)
    toast.success('Item berhasil dihapus')
  }
}

// Fix the formatPrice function to handle undefined values
const formatPrice = (price) => {
  if (price === undefined || price === null) {
    return '0'
  }
  return price.toLocaleString('id-ID')
}
</script>

<style scoped>
.cart-view {
  max-width: 1200px;
  margin: 4rem auto;
  padding: 2rem;
  transition: margin-top 0.3s ease;
}

.cart-view.has-voucher {
  margin-top: 6rem; /* Additional margin to account for voucher notification */
}

.back-button {
  position: absolute;
  left: 2rem;
  top: 6rem;
  transition: top 0.3s ease;
}

.has-voucher .back-button {
  top: 8rem; /* Move back button down when voucher notification is visible */
}

/* Adjust page title spacing too */
.has-voucher .page-title {
  margin-top: 4rem;
}

/* Rest of your existing styles... */

/* Update media queries for responsive design */
@media (max-width: 768px) {
  .cart-view.has-voucher {
    margin-top: 5rem;
  }

  .has-voucher .back-button {
    top: 6rem;
  }
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
  gap: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.select-all-container {
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px 12px 0 0;
  margin-bottom: 0;
  border-bottom: 1px solid #eee;
}

.select-all-text {
  margin-left: 0.5rem;
  font-weight: 500;
  color: #02163b;
}

.cart-card {
  display: grid;
  grid-template-columns: auto 150px 1fr;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 0;
  box-shadow: none;
  border-bottom: 1px solid #eee;
  position: relative;
}

.cart-card:last-child {
  border-bottom: none;
  border-radius: 0 0 12px 12px;
}

.item-checkbox {
  display: flex;
  align-items: center;
  margin-right: 1rem;
}

/* Custom Checkbox Styles */
.custom-checkbox {
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  user-select: none;
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: relative;
  height: 24px;
  width: 24px;
  background-color: #fff;
  border: 2px solid #ddd;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.custom-checkbox:hover input ~ .checkmark {
  border-color: #02163b;
}

.custom-checkbox input:checked ~ .checkmark {
  background-color: #02163b;
  border-color: #02163b;
}

.checkmark:after {
  content: '';
  position: absolute;
  display: none;
  left: 50%;
  top: 50%;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: translate(-50%, -65%) rotate(45deg);
}

.custom-checkbox input:checked ~ .checkmark:after {
  display: block;
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
  appearance: textfield;
  -moz-appearance: textfield;
}

.quantity-control input::-webkit-outer-spin-button,
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
  border: none;
  cursor: pointer;
}

.checkout-button:hover:not(:disabled) {
  background-color: #d4a832;
}

.checkout-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
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
    grid-template-columns: auto 100px 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  .cart-card__image img {
    height: 100px;
  }

  .order-summary {
    position: static;
    margin-top: 1.5rem;
  }

  .quantity-control {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .unit-price {
    font-size: 0.9rem;
  }

  .cart-card__controls {
    flex-direction: column;
    gap: 1rem;
  }

  .subtotal {
    align-self: flex-end;
  }

  .back-button {
    top: 4rem;
    left: 1rem;
  }

  .page-title {
    margin: 2rem 0 1.5rem;
    font-size: 1.5rem;
  }

  .select-all-container {
    padding: 0.75rem 1rem;
  }

  .checkmark {
    height: 20px;
    width: 20px;
  }

  .checkmark:after {
    left: 6px;
    top: 3px;
    width: 4px;
    height: 8px;
  }
}

/* Add loading state styles */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #e8ba38;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Add focus styles for accessibility */
.custom-checkbox input:focus ~ .checkmark {
  outline: 2px solid #4a90e2;
  outline-offset: 2px;
}

.quantity-btn:focus,
.cart-card__delete:focus,
.checkout-button:focus,
.continue-shopping:focus {
  outline: 2px solid #4a90e2;
  outline-offset: 2px;
}

/* Add transition for smoother interactions */
.cart-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.cart-card:hover {
  transform: none;
  box-shadow: none;
  background-color: #f8f9fa;
}
</style>
