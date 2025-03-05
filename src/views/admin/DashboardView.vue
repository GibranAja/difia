<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import { collection, query, orderBy, limit, getDocs, onSnapshot, where } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useRouter } from 'vue-router'

const router = useRouter()

// Register components
use([
  CanvasRenderer,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

// Data refs
const recentOrders = ref([])
const salesData = ref([])
const currentMonthIndex = ref(0)
const loading = ref(true)
const productDistribution = ref([])
const monthsToShow = 5 // Jumlah bulan yang ditampilkan

// Add these new refs for statistics
const totalSales = ref(0)
const totalOrders = ref(0)
const totalCustomers = ref(0)
const totalRevenue = ref(0)

// Add refs for percentage changes
const salesChange = ref(0)
const ordersChange = ref(0)
const customersChange = ref(0)
const revenueChange = ref(0)

// Get start and end date for current month view
const getMonthRange = (offset = 0) => {
  const date = new Date()
  date.setMonth(date.getMonth() - offset)
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return { startOfMonth, endOfMonth }
}

// Fetch orders for a specific month
const fetchMonthlyOrders = async (startOffset = 0) => {
  try {
    const months = []

    // Fetch data untuk 5 bulan
    for (let i = 0; i < monthsToShow; i++) {
      const offset = startOffset + i
      const { startOfMonth, endOfMonth } = getMonthRange(offset)

      const ordersRef = collection(db, 'orders')
      const q = query(ordersRef, orderBy('createdAt', 'desc'))

      const snapshot = await getDocs(q)
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      // Filter orders untuk bulan ini
      const monthlyOrders = orders.filter((order) => {
        const orderDate = order.createdAt.toDate()
        return orderDate >= startOfMonth && orderDate <= endOfMonth
      })

      // Hitung statistik bulanan
      const date = new Date()
      date.setMonth(date.getMonth() - offset)
      const monthName = date.toLocaleDateString('id-ID', { month: 'short' })

      months.push({
        month: monthName,
        satuan: monthlyOrders.filter((order) => !order.isBulkOrder).length,
        souvenir: monthlyOrders.filter((order) => order.isBulkOrder).length,
      })
    }

    return months.reverse() // Balik array agar urutan bulan benar
  } catch (error) {
    console.error('Error fetching monthly orders:', error)
    return []
  }
}

// Navigation methods
const previousMonth = () => {
  currentMonthIndex.value++
  updateDashboardData()
}

const nextMonth = () => {
  if (currentMonthIndex.value > 0) {
    currentMonthIndex.value--
    updateDashboardData()
  }
}

// Fetch recent orders
const fetchRecentOrders = async (monthOffset = 0) => {
  try {
    // Get date range for the selected month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset + 1, 0, 23, 59, 59)

    // Query orders within date range
    const ordersRef = collection(db, 'orders')
    const q = query(
      ordersRef,
      where('createdAt', '>=', startOfMonth),
      where('createdAt', '<=', endOfMonth),
      orderBy('createdAt', 'desc'),
      limit(3),
    )

    // Rest of the function remains similar but uses filtered data
    const snapshot = await getDocs(q)

    recentOrders.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      customer: doc.data().shippingDetails.name,
      product: doc.data().productName,
      type: doc.data().isBulkOrder ? 'Souvenir' : 'Satuan',
      status: doc.data().status,
      createdAt: doc.data().createdAt.toDate(),
    }))
  } catch (error) {
    console.error('Error fetching recent orders:', error)
  }
}

// Tambahkan fungsi baru untuk fetch data produk
const fetchProductDistribution = async (monthOffset = 0) => {
  try {
    // Get date range for the selected month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset + 1, 0, 23, 59, 59)

    // Query orders within date range
    const ordersRef = collection(db, 'orders')
    const q = query(
      ordersRef,
      where('createdAt', '>=', startOfMonth),
      where('createdAt', '<=', endOfMonth),
      orderBy('createdAt', 'desc'),
    )

    // Rest of the function remains similar but uses filtered data
    const snapshot = await getDocs(q)

    // Buat map untuk menghitung total pembelian per produk
    const productMap = new Map()

    snapshot.docs.forEach((doc) => {
      const order = doc.data()
      const productName = order.productName
      const quantity = order.quantity || 1

      if (productMap.has(productName)) {
        productMap.set(productName, productMap.get(productName) + quantity)
      } else {
        productMap.set(productName, quantity)
      }
    })

    // Convert map ke array dan sort berdasarkan jumlah terbanyak
    const sortedProducts = Array.from(productMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) // Ambil 5 produk teratas
      .map(([name, value]) => ({
        name,
        value,
        itemStyle: {
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Generate random color
        },
      }))

    productDistribution.value = sortedProducts
  } catch (error) {
    console.error('Error fetching product distribution:', error)
  }
}

// Function to calculate statistics
const calculateStatistics = async (monthOffset = 0) => {
  try {
    // Define time ranges based on the monthOffset
    const now = new Date()

    // Current selected month range
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() - monthOffset + 1,
      0,
      23,
      59,
      59,
    )

    // Previous month range
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - monthOffset - 1, 1)
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth() - monthOffset, 0, 23, 59, 59)

    // Query orders for current month
    const currentMonthQuery = query(
      collection(db, 'orders'),
      where('createdAt', '>=', currentMonthStart),
      where('createdAt', '<=', currentMonthEnd),
    )

    // Query orders for previous month
    const prevMonthQuery = query(
      collection(db, 'orders'),
      where('createdAt', '>=', prevMonthStart),
      where('createdAt', '<=', prevMonthEnd),
    )

    const [currentSnapshot, prevSnapshot] = await Promise.all([
      getDocs(currentMonthQuery),
      getDocs(prevMonthQuery),
    ])

    // Process current month data
    const currentMonthOrders = currentSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Process previous month data
    const prevMonthOrders = prevSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Calculate total sales and revenue
    let currentSales = 0
    let currentRevenue = 0
    const currentCustomers = new Set()

    currentMonthOrders.forEach((order) => {
      currentSales += order.totalAmount || 0
      currentRevenue += order.totalAmount || 0
      if (order.userId) currentCustomers.add(order.userId)
    })

    let prevSales = 0
    let prevRevenue = 0
    const prevCustomers = new Set()

    prevMonthOrders.forEach((order) => {
      prevSales += order.totalAmount || 0
      prevRevenue += order.totalAmount || 0
      if (order.userId) prevCustomers.add(order.userId)
    })

    // Set the totals
    totalSales.value = currentSales
    totalOrders.value = currentMonthOrders.length
    totalCustomers.value = currentCustomers.size
    totalRevenue.value = currentRevenue

    // Calculate percentage changes
    salesChange.value = prevSales ? ((currentSales - prevSales) / prevSales) * 100 : 100
    ordersChange.value = prevMonthOrders.length
      ? ((currentMonthOrders.length - prevMonthOrders.length) / prevMonthOrders.length) * 100
      : 100
    customersChange.value = prevCustomers.size
      ? ((currentCustomers.size - prevCustomers.size) / prevCustomers.size) * 100
      : 100
    revenueChange.value = prevRevenue ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 100
  } catch (error) {
    console.error('Error calculating statistics:', error)
  }
}

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('IDR', 'Rp')
}

// Chart options
const lineChartOption = computed(() => ({
  xAxis: {
    type: 'category',
    data: salesData.value.map((item) => item.month),
    axisLabel: {
      rotate: 45,
    },
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: 'Satuan',
      type: 'line',
      data: salesData.value.map((item) => item.satuan),
      itemStyle: { color: '#02163b' },
      symbolSize: 8,
      smooth: true,
    },
    {
      name: 'Souvenir',
      type: 'line',
      data: salesData.value.map((item) => item.souvenir),
      itemStyle: { color: '#e8ba38' },
      symbolSize: 8,
      smooth: true,
    },
  ],
  tooltip: {
    trigger: 'axis',
  },
  legend: {
    data: ['Satuan', 'Souvenir'],
    bottom: 0,
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    top: '3%',
    containLabel: true,
  },
}))

// Navigate to order details
const goToOrder = (orderId) => {
  router.push(`/admin/order/${orderId}`)
}

// Tambah computed untuk pie chart data
const pieChartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} pcs ({d}%)',
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    type: 'scroll',
  },
  series: [
    {
      name: 'Distribusi Produk',
      type: 'pie',
      radius: '70%',
      data: productDistribution.value,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
      label: {
        formatter: '{b}: {c} pcs',
      },
    },
  ],
}))

// New function to update all dashboard data
const updateDashboardData = async () => {
  loading.value = true
  try {
    // Update chart data
    const monthsData = await fetchMonthlyOrders(currentMonthIndex.value)
    salesData.value = monthsData

    // Update statistics for the selected month
    await calculateStatistics(currentMonthIndex.value)

    // Update product distribution for the selected month
    await fetchProductDistribution(currentMonthIndex.value)

    // Update recent orders for the selected month
    await fetchRecentOrders(currentMonthIndex.value)
  } catch (error) {
    console.error('Error updating dashboard data:', error)
  } finally {
    loading.value = false
  }
}

// Add a ref for the unsubscribe function
const unsubscribe = ref(null)

// Update when month changes to reset the listener
watch(currentMonthIndex, () => {
  setupOrdersListener()
})

// Function to setup Firestore listeners based on selected month
const setupOrdersListener = () => {
  // Clear previous listener if exists
  if (unsubscribe.value) {
    unsubscribe.value()
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth() - currentMonthIndex.value, 1)
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() - currentMonthIndex.value + 1,
    0,
    23,
    59,
    59,
  )

  const ordersRef = collection(db, 'orders')
  const q = query(
    ordersRef,
    where('createdAt', '>=', startOfMonth),
    where('createdAt', '<=', endOfMonth),
  )

  unsubscribe.value = onSnapshot(q, () => {
    updateDashboardData() // Re-fetch all data when changes occur
  })
}

onMounted(async () => {
  await updateDashboardData()

  // Set up real-time listener for orders within the current selected month
  setupOrdersListener()
})
</script>

<template>
  <div class="dashboard">
    <!-- Global Month Navigation -->
    <div class="global-controls">
      <h1>Dashboard</h1>
      <div class="month-navigation">
        <button @click="previousMonth" class="nav-btn">
          <i class="fas fa-chevron-left"></i>
        </button>
        <span class="current-month">
          {{
            new Date(
              new Date().setMonth(new Date().getMonth() - currentMonthIndex),
            ).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
          }}
        </span>
        <button @click="nextMonth" class="nav-btn" :disabled="currentMonthIndex === 0">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Top Stats -->
    <div class="stats-container">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-shopping-bag"></i>
        </div>
        <div class="stat-content">
          <p class="stat-label">Total Penjualan</p>
          <h3 class="stat-value">{{ formatCurrency(totalSales) }}</h3>
          <p :class="['stat-change', salesChange >= 0 ? 'positive' : 'negative']">
            <i :class="['fas', salesChange >= 0 ? 'fa-arrow-up' : 'fa-arrow-down']"></i>
            {{ salesChange.toFixed(1) }}% dari bulan lalu
          </p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-box"></i>
        </div>
        <div class="stat-content">
          <p class="stat-label">Total Pesanan</p>
          <h3 class="stat-value">{{ totalOrders }}</h3>
          <p :class="['stat-change', ordersChange >= 0 ? 'positive' : 'negative']">
            <i :class="['fas', ordersChange >= 0 ? 'fa-arrow-up' : 'fa-arrow-down']"></i>
            {{ ordersChange.toFixed(1) }}% dari bulan lalu
          </p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <p class="stat-label">Total Pelanggan</p>
          <h3 class="stat-value">{{ totalCustomers }}</h3>
          <p :class="['stat-change', customersChange >= 0 ? 'positive' : 'negative']">
            <i :class="['fas', customersChange >= 0 ? 'fa-arrow-up' : 'fa-arrow-down']"></i>
            {{ customersChange.toFixed(1) }}% dari bulan lalu
          </p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-credit-card"></i>
        </div>
        <div class="stat-content">
          <p class="stat-label">Pendapatan</p>
          <h3 class="stat-value">{{ formatCurrency(totalRevenue) }}</h3>
          <p :class="['stat-change', revenueChange >= 0 ? 'positive' : 'negative']">
            <i :class="['fas', revenueChange >= 0 ? 'fa-arrow-up' : 'fa-arrow-down']"></i>
            {{ revenueChange.toFixed(1) }}% dari bulan lalu
          </p>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-container">
      <div class="chart-card">
        <h3 class="chart-title">Perbandingan Penjualan Satuan vs Souvenir</h3>
        <v-chart :option="lineChartOption" class="chart" />
      </div>

      <div class="chart-card">
        <h3 class="chart-title">Distribusi Kategori Produk</h3>
        <v-chart :option="pieChartOption" class="chart" />
      </div>
    </div>

    <!-- Recent Orders Table -->
    <div class="table-card">
      <h3 class="table-title">Pesanan Terbaru</h3>
      <table class="orders-table">
        <thead>
          <tr>
            <th>ID Pesanan</th>
            <th>Pelanggan</th>
            <th>Produk</th>
            <th>Tipe</th>
            <th>Status</th>
            <th>Tanggal</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in recentOrders" :key="order.id" @click="goToOrder(order.id)">
            <td>{{ order.id }}</td>
            <td>{{ order.customer }}</td>
            <td>{{ order.product }}</td>
            <td>{{ order.type }}</td>
            <td>
              <span :class="['status-badge', order.status]">
                {{ order.status }}
              </span>
            </td>
            <td>{{ order.createdAt.toLocaleDateString('id-ID') }}</td>
            <td>
              <button class="view-btn" @click.stop="goToOrder(order.id)">
                <i class="fas fa-eye"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  background-color: rgba(2, 22, 59, 0.1);
  color: #02163b;
  padding: 15px;
  border-radius: 8px;
  margin-right: 15px;
}

.stat-content {
  flex-grow: 1;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.stat-value {
  color: #02163b;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 5px 0;
}

.stat-change {
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.stat-change.positive {
  color: #28a745;
}

.stat-change.negative {
  color: #dc3545;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-title {
  color: #02163b;
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.chart {
  height: 300px;
  width: 100%;
}

.table-card {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-title {
  color: #02163b;
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th,
.orders-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.orders-table th {
  color: #02163b;
  font-weight: 600;
}

.status-badge {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
}

.status-badge.completed {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.status-badge.processing {
  background-color: rgba(232, 186, 56, 0.1);
  color: #e8ba38;
}

@media (max-width: 768px) {
  .charts-container {
    grid-template-columns: 1fr;
  }

  .orders-table {
    display: block;
    overflow-x: auto;
  }
}

/* Add to existing styles */
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-btn {
  background: none;
  border: 1px solid #02163b;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #02163b;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.current-month {
  font-size: 0.9rem;
  color: #666;
  min-width: 120px;
  text-align: center;
}

.view-btn {
  background: none;
  border: none;
  color: #02163b;
  cursor: pointer;
  padding: 5px;
}

.view-btn:hover {
  color: #e8ba38;
}

.orders-table tr {
  cursor: pointer;
}

.orders-table tr:hover {
  background-color: rgba(2, 22, 59, 0.05);
}

/* Update status badge styles */
.status-badge {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
}

.status-badge.pending {
  background-color: rgba(232, 186, 56, 0.1);
  color: #e8ba38;
}

.status-badge.process {
  background-color: rgba(0, 123, 255, 0.1);
  color: #0d6efd;
}

.status-badge.delivery {
  background-color: rgba(111, 66, 193, 0.1);
  color: #6f42c1;
}

.status-badge.complete {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.status-badge.cancelled {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.global-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background-color: white;
  padding: 15px 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 15px;
}

.current-month {
  font-size: 1.2rem;
  font-weight: 500;
  color: #02163b;
  min-width: 180px;
  text-align: center;
}

.nav-btn {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #02163b;
  transition: all 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background-color: #02163b;
  color: white;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
