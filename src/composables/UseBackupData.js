// src/composables/useBackupData.js
import { ref } from 'vue'
import { useKatalogStore } from '@/stores/KatalogStore'
import { useOrderStore } from '@/stores/OrderStore'
import { useBlogStore } from '@/stores/BlogStore'
import { usePartnerStore } from '@/stores/PartnerStore'
import { useVoucherStore } from '@/stores/VoucherStore'
import { useStaffStore } from '@/stores/StaffStore'
import { exportToExcel } from '@/utils/ExcelExport'

export function useBackupData() {
  const isLoading = ref(false)
  const error = ref(null)
  const orderType = ref('all') // 'all', 'regular', or 'souvenir'

  // Initialize stores
  const katalogStore = useKatalogStore()
  const orderStore = useOrderStore()
  const blogStore = useBlogStore()
  const partnerStore = usePartnerStore()
  const staffStore = useStaffStore()
  const voucherStore = useVoucherStore()

  // Function to set the order type
  const setOrderType = (type) => {
    orderType.value = type
  }

  // Main backup function
  const backupSelectedData = async (selectedDataTypes) => {
    try {
      isLoading.value = true
      error.value = null
      const backupData = {}

      // Fetch data based on selections
      if (selectedDataTypes.includes('katalog')) {
        await katalogStore.fetchKatalog(1000)
        backupData.katalog = katalogStore.katalogItems
      }

      if (selectedDataTypes.includes('orders')) {
        try {
          // Use the new fetchAllOrders function instead of fetchOrders
          let allOrders = await orderStore.fetchAllOrders(500)

          // Filter orders based on selected type
          if (orderType.value === 'regular') {
            backupData.orders = allOrders.filter((order) => !order.isBulkOrder)
          } else if (orderType.value === 'souvenir') {
            backupData.orders = allOrders.filter((order) => order.isBulkOrder)
          } else {
            // Default: include all orders
            backupData.orders = allOrders
          }

          console.log('Orders to export:', backupData.orders.length) // Add this for debugging
        } catch (err) {
          console.error('Error fetching orders:', err)
          backupData.orders = []
        }
      }

      if (selectedDataTypes.includes('blogs')) {
        await blogStore.fetchBlogs()
        backupData.blogs = blogStore.blogItems
      }

      if (selectedDataTypes.includes('partners')) {
        await partnerStore.fetchPartners()
        backupData.partners = partnerStore.partners
      }

      if (selectedDataTypes.includes('staff')) {
        await staffStore.fetchStaff()
        backupData.staff = staffStore.staffItems
      }

      if (selectedDataTypes.includes('vouchers')) {
        await voucherStore.fetchVouchers()
        backupData.vouchers = voucherStore.voucherItems
      }

      // Generate Excel file with order type in filename for clarity
      const orderTypeText = orderType.value !== 'all' ? `_${orderType.value}` : ''
      await exportToExcel(
        backupData,
        `difia_backup${orderTypeText}_${new Date().toISOString().split('T')[0]}`,
      )

      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    orderType,
    setOrderType,
    backupSelectedData,
  }
}
