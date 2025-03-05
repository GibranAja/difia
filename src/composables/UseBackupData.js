// src/composables/useBackupData.js
import { ref } from 'vue'
import { useKatalogStore } from '@/stores/KatalogStore'
import { useOrderStore } from '@/stores/OrderStore'
import { useBlogStore } from '@/stores/BlogStore'
import { usePartnerStore } from '@/stores/PartnerStore'
import { useVoucherStore } from '@/stores/VoucherStore'
import { useStaffStore } from '@/stores/StaffStore'
import { exportToExcel } from '@/utils/excelExport'

export function useBackupData() {
  const isLoading = ref(false)
  const error = ref(null)
  
  // Initialize stores
  const katalogStore = useKatalogStore()
  const orderStore = useOrderStore()
  const blogStore = useBlogStore()
  const partnerStore = usePartnerStore()
  const staffStore = useStaffStore()
  const voucherStore = useVoucherStore()

  // Main backup function
  const backupSelectedData = async (selectedDataTypes) => {
    try {
      isLoading.value = true
      error.value = null
      const backupData = {}
      
      // Fetch data based on selections
      if (selectedDataTypes.includes('katalog')) {
        await katalogStore.fetchKatalog(1000) // Get more items
        backupData.katalog = katalogStore.katalogItems
      }
      
      if (selectedDataTypes.includes('orders')) {
        await orderStore.fetchOrders(500)
        backupData.orders = orderStore.orderItems
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
      
      // Generate Excel file
      await exportToExcel(backupData, `difia_backup_${new Date().toISOString().split('T')[0]}`)
      
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
    backupSelectedData
  }
}