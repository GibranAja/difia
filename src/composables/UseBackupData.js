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

      // UPDATE: Enhanced customer backup functionality with destination support
      if (selectedDataTypes.includes('customers')) {
        try {
          // Get orders if not already loaded
          let orders = backupData.orders
          if (!orders) {
            orders = await orderStore.fetchAllOrders(1000)
          }

          // Create a map to deduplicate customers by email
          const customerMap = new Map()

          orders.forEach((order) => {
            const shipping = order.shippingDetails
            if (shipping && shipping.email) {
              // Use email as unique identifier
              const key = shipping.email.toLowerCase()

              if (!customerMap.has(key)) {
                // UPDATE: Create full address with priority to destination
                let fullAddress = ''
                
                if (shipping.destination?.label) {
                  // NEW: Use destination structure (Komerce API)
                  fullAddress = [
                    shipping.address || '',
                    shipping.destination.label
                  ].filter((part) => part).join(', ')
                } else {
                  // FALLBACK: Use old structure (RajaOngkir) for backward compatibility
                  fullAddress = [
                    shipping.address || '',
                    shipping.city || '',
                    shipping.province || '',
                    shipping.zip || '',
                  ].filter((part) => part).join(', ')
                }

                customerMap.set(key, {
                  name: shipping.name || '',
                  email: shipping.email || '',
                  phone: shipping.phone || '',
                  // UPDATE: Use computed full address instead of separate fields
                  address: fullAddress,
                  // LEGACY: Keep old fields for backward compatibility (will be used by existing Excel format)
                  city: shipping.destination?.label || shipping.city || '',
                  province: shipping.destination?.label || shipping.province || '',
                  zip: shipping.zip || '',
                })
              }
            }
          })

          // Convert map to array
          backupData.customers = Array.from(customerMap.values())
        } catch (err) {
          console.error('Error processing customer data:', err)
          backupData.customers = []
        }
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
