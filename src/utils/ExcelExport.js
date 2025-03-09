// src/utils/excelExport.js
import ExcelJS from 'exceljs'

export const exportToExcel = async (data, filename) => {
  // Create a new workbook
  const workbook = new ExcelJS.Workbook()

  // Set workbook properties
  workbook.creator = 'Difia'
  workbook.lastModifiedBy = 'Difia Export Tool'
  workbook.created = new Date()
  workbook.modified = new Date()

  // Process each data type and add as separate worksheet
  if (data.katalog) {
    const katalogForExcel = data.katalog.map((item) => ({
      ID: item.id,
      'Nama Produk': item.nama,
      'Harga Standar': item.harga.standar,
      'Harga Premium': item.harga.premium,
      'Ukuran P×L×T': `${item.detail?.ukuran?.panjang || 0}×${item.detail?.ukuran?.lebar || 0}×${item.detail?.ukuran?.tinggi || 0} cm`,
      'Bahan Luar': item.detail?.bahanLuar || '-',
      'Bahan Dalam': item.detail?.bahanDalam || '-',
      Aksesoris: item.detail?.aksesoris || '-',
      Warna: item.detail?.warna || '-',
      'Pengerjaan 50-100 pcs': item.waktuPengerjaan?.pcs50_100 || '-',
      'Pengerjaan 200 pcs': item.waktuPengerjaan?.pcs200 || '-',
      'Pengerjaan 300 pcs': item.waktuPengerjaan?.pcs300 || '-',
      'Pengerjaan >300 pcs': item.waktuPengerjaan?.pcsAbove300 || '-',
      'Tanggal Dibuat': formatDate(item.createdAt),
      'Terakhir Diupdate': formatDate(item.updatedAt),
    }))

    addWorksheetWithStyles(workbook, 'Katalog', katalogForExcel)
  }

  if (data.orders) {
    const ordersForExcel = data.orders.map((order) => ({
      'ID Order': order.id,
      'Nama Customer': order.shippingDetails?.name || '-',
      Email: order.shippingDetails?.email || '-',
      Telepon: order.shippingDetails?.phone || '-',
      Alamat: `${order.shippingDetails?.address || ''}, ${order.shippingDetails?.city || ''}, ${order.shippingDetails?.province || ''} ${order.shippingDetails?.zip || ''}`,
      Produk: order.productName || '-',
      Jumlah: order.quantity || 0,
      'Harga Satuan': order.price || 0,
      Total: order.totalAmount || 0,
      Status: order.status || '-',
      'Jenis Order': order.isBulkOrder ? 'Souvenir' : 'Satuan',
      'Tanggal Order': formatDate(order.createdAt),
      'Bahan Luar': order.customOptions?.bahanLuar || '-',
      'Bahan Dalam': order.customOptions?.bahanDalam || '-',
      Aksesoris: Array.isArray(order.customOptions?.aksesoris)
        ? order.customOptions.aksesoris.join(', ')
        : order.customOptions?.aksesoris || '-',
      Catatan: order.customOptions?.note || '-',
    }))

    addWorksheetWithStyles(workbook, 'Pesanan', ordersForExcel)
  }

  if (data.blogs) {
    const blogsForExcel = data.blogs.map((blog) => ({
      ID: blog.id,
      Judul: blog.title || '-',
      Deskripsi: blog.description || '-',
      'Tanggal Dibuat': formatDate(blog.createdAt),
      'Terakhir Diupdate': formatDate(blog.updatedAt),
    }))

    addWorksheetWithStyles(workbook, 'Blog', blogsForExcel)
  }

  if (data.partners) {
    const partnersForExcel = data.partners.map((partner) => ({
      ID: partner.id,
      Nama: partner.name || '-',
      Deskripsi: partner.description || '-',
      'Tanggal Dibuat': formatDate(partner.createdAt),
    }))

    addWorksheetWithStyles(workbook, 'Partner', partnersForExcel)
  }

  if (data.staff) {
    const staffForExcel = data.staff.map((staff) => ({
      ID: staff.id,
      Nama: staff.name || '-',
      Email: staff.email || '-',
      Role: staff.role || '-',
      'Tanggal Dibuat': formatDate(staff.createdAt),
    }))

    addWorksheetWithStyles(workbook, 'Staff', staffForExcel)
  }

  if (data.vouchers) {
    const vouchersForExcel = data.vouchers.map((voucher) => ({
      ID: voucher.id,
      Kode: voucher.code || '-',
      'Tipe Diskon': voucher.discountType === 'percentage' ? 'Persentase' : 'Nominal',
      'Nilai Diskon': voucher.discountValue || 0,
      'Maksimal Penggunaan': voucher.maxUses || 0,
      'Penggunaan Sekarang': voucher.currentUses || 0,
      Status: voucher.isActive ? 'Aktif' : 'Nonaktif',
      'Berlaku Sampai': formatDate(voucher.validUntil),
      'Tanggal Dibuat': formatDate(voucher.createdAt),
    }))

    addWorksheetWithStyles(workbook, 'Voucher', vouchersForExcel)
  }

  // Generate buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer()
  saveAsExcelFile(buffer, filename)
}

// Enhanced function to add a worksheet with styled headers using ExcelJS
function addWorksheetWithStyles(workbook, sheetName, data) {
  // Skip if no data
  if (!data || data.length === 0) return

  // Add worksheet
  const worksheet = workbook.addWorksheet(sheetName)

  // Get column headers from first data item
  const headers = Object.keys(data[0] || {})

  // Add headers and data to worksheet
  worksheet.addRow(headers)
  data.forEach((item) => {
    const values = headers.map((header) => (item[header] !== undefined ? item[header] : '-'))
    worksheet.addRow(values)
  })

  // Auto-size columns based on content
  worksheet.columns.forEach((column, i) => {
    // Get the header name from headers array
    const headerName = headers[i]

    // Calculate max width based on data and header
    let maxWidth = headerName.length
    data.forEach((item) => {
      const value = String(item[headerName] || '')
      maxWidth = Math.max(maxWidth, value.length)
    })

    // Set column width (min 10, max 50)
    column.width = Math.min(Math.max(maxWidth + 2, 10), 50)

    // Enable text wrapping for the entire column
    column.alignment = { wrapText: true }
  })

  // Style the header row
  const headerRow = worksheet.getRow(1)

  // Set header row height
  headerRow.height = 30

  // Apply header styling
  headerRow.eachCell((cell) => {
    // Excel's built-in yellow fill
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' }, // Yellow in ARGB format
    }

    cell.font = {
      bold: true,
      size: 12,
      color: { argb: 'FF000000' }, // Black
    }

    cell.alignment = {
      vertical: 'middle', // Middle align vertically
      horizontal: 'center', // Center align horizontally
      wrapText: true, // Enable text wrapping
    }

    // Add border
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    }
  })

  // Add styling to all data cells
  for (let i = 2; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i)

    // Set row height to better accommodate wrapped text
    row.height = 22

    row.eachCell((cell) => {
      // Add borders
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      }

      // Add middle vertical alignment and text wrapping
      cell.alignment = {
        vertical: 'middle', // Middle align vertically
        wrapText: true, // Enable text wrapping
      }
    })
  }
}

// Helper function to format dates (unchanged)
function formatDate(dateValue) {
  if (!dateValue) return '-'
  const date = new Date(dateValue)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Helper function to save Excel file to the client
function saveAsExcelFile(buffer, fileName) {
  const data = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  // Create download link
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(data)
  link.download = `${fileName}.xlsx`

  // Trigger download
  document.body.appendChild(link)
  link.click()

  // Cleanup
  document.body.removeChild(link)
}
