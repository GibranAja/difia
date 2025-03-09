// src/utils/excelExport.js
import ExcelJS from 'exceljs'

export const exportToExcel = async (data, filename) => {
  try {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook()

    // Set workbook properties
    workbook.creator = 'Difia'
    workbook.lastModifiedBy = 'Difia Export Tool'
    workbook.created = new Date()
    workbook.modified = new Date()

    // Process each data type and add as separate worksheet
    if (data.katalog && Array.isArray(data.katalog) && data.katalog.length > 0) {
      const katalogForExcel = data.katalog.map((item) => ({
        ID: item.id || '-',
        'Nama Produk': item.nama || '-',
        'Harga Standar': item.harga?.standar || 0,
        'Harga Premium': item.harga?.premium || 0,
        'Ukuran P×L×T': `${item.detail?.ukuran?.panjang || 0}×${item.detail?.ukuran?.lebar || 0}×${item.detail?.ukuran?.tinggi || 0} cm`,
        'Bahan Luar': item.detail?.bahanLuar || '-',
        'Bahan Dalam': item.detail?.bahanDalam || '-',
        Aksesoris: String(item.detail?.aksesoris || '-'),
        Warna: String(item.detail?.warna || '-'),
        'Pengerjaan 50-100 pcs': String(item.waktuPengerjaan?.pcs50_100 || '-'),
        'Pengerjaan 200 pcs': String(item.waktuPengerjaan?.pcs200 || '-'),
        'Pengerjaan 300 pcs': String(item.waktuPengerjaan?.pcs300 || '-'),
        'Pengerjaan >300 pcs': String(item.waktuPengerjaan?.pcsAbove300 || '-'),
        'Tanggal Dibuat': formatDate(item.createdAt),
        'Terakhir Diupdate': formatDate(item.updatedAt),
      }))

      addWorksheetWithStyles(workbook, 'Katalog', katalogForExcel)
    }

    if (data.orders && Array.isArray(data.orders) && data.orders.length > 0) {
      const ordersForExcel = data.orders.map((order) => {
        // Ensure all addresses are strings to avoid undefined concatenation issues
        const address = [
          order.shippingDetails?.address || '',
          order.shippingDetails?.city || '',
          order.shippingDetails?.province || '',
          order.shippingDetails?.zip || '',
        ]
          .filter((part) => part)
          .join(', ')

        // Handle accessories properly - convert to string safely
        let aksesorisTxt = '-'
        if (order.customOptions?.aksesoris) {
          if (Array.isArray(order.customOptions.aksesoris)) {
            aksesorisTxt = order.customOptions.aksesoris.join(', ')
          } else {
            aksesorisTxt = String(order.customOptions.aksesoris)
          }
        }

        return {
          'ID Order': order.id || '-',
          'Nama Customer': String(order.shippingDetails?.name || '-'),
          Email: String(order.shippingDetails?.email || '-'),
          Telepon: String(order.shippingDetails?.phone || '-'),
          Alamat: address || '-',
          Produk: String(order.productName || '-'),
          Jumlah: Number(order.quantity || 0),
          'Harga Satuan': Number(order.price || 0),
          Total: Number(order.totalAmount || 0),
          Status: String(order.status || '-'),
          'Jenis Order': order.isBulkOrder ? 'Souvenir' : 'Satuan',
          'Tanggal Order': formatDate(order.createdAt),
          'Bahan Luar': String(order.customOptions?.bahanLuar || '-'),
          'Bahan Dalam': String(order.customOptions?.bahanDalam || '-'),
          Aksesoris: aksesorisTxt,
          Catatan: String(order.customOptions?.note || '-'),
        }
      })

      addWorksheetWithStyles(workbook, 'Pesanan', ordersForExcel)
    }

    if (data.blogs && Array.isArray(data.blogs) && data.blogs.length > 0) {
      const blogsForExcel = data.blogs.map((blog) => ({
        ID: blog.id || '-',
        Judul: String(blog.title || '-'),
        Deskripsi: String(blog.description || '-'),
        'Tanggal Dibuat': formatDate(blog.createdAt),
        'Terakhir Diupdate': formatDate(blog.updatedAt),
      }))

      addWorksheetWithStyles(workbook, 'Blog', blogsForExcel)
    }

    if (data.partners && Array.isArray(data.partners) && data.partners.length > 0) {
      const partnersForExcel = data.partners.map((partner) => ({
        ID: partner.id || '-',
        Nama: String(partner.name || '-'),
        Deskripsi: String(partner.description || '-'),
        'Tanggal Dibuat': formatDate(partner.createdAt),
      }))

      addWorksheetWithStyles(workbook, 'Partner', partnersForExcel)
    }

    if (data.staff && Array.isArray(data.staff) && data.staff.length > 0) {
      const staffForExcel = data.staff.map((staff) => ({
        ID: staff.id || '-',
        Nama: String(staff.name || '-'),
        Email: String(staff.email || '-'),
        Role: String(staff.role || '-'),
        'Tanggal Dibuat': formatDate(staff.createdAt),
      }))

      addWorksheetWithStyles(workbook, 'Staff', staffForExcel)
    }

    if (data.vouchers && Array.isArray(data.vouchers) && data.vouchers.length > 0) {
      const vouchersForExcel = data.vouchers.map((voucher) => ({
        ID: voucher.id || '-',
        Kode: String(voucher.code || '-'),
        'Tipe Diskon': voucher.discountType === 'percentage' ? 'Persentase' : 'Nominal',
        'Nilai Diskon': Number(voucher.discountValue || 0),
        'Maksimal Penggunaan': Number(voucher.maxUses || 0),
        'Penggunaan Sekarang': Number(voucher.currentUses || 0),
        Status: voucher.isActive ? 'Aktif' : 'Nonaktif',
        'Berlaku Sampai': formatDate(voucher.validUntil),
        'Tanggal Dibuat': formatDate(voucher.createdAt),
      }))

      addWorksheetWithStyles(workbook, 'Voucher', vouchersForExcel)
    }

    // Check if any worksheets were added - otherwise add a default one
    if (workbook.worksheets.length === 0) {
      const ws = workbook.addWorksheet('Info')
      ws.addRow(['Tidak ada data untuk ditampilkan'])
    }

    // Generate buffer and trigger download
    const buffer = await workbook.xlsx.writeBuffer()
    saveAsExcelFile(buffer, filename)

    return true
  } catch (error) {
    console.error('Excel export error:', error)
    throw new Error('Gagal membuat file Excel: ' + error.message)
  }
}

// Enhanced function to add a worksheet with styled headers using ExcelJS
function addWorksheetWithStyles(workbook, sheetName, data) {
  // Skip if no data
  if (!data || data.length === 0) return

  // Add worksheet
  const worksheet = workbook.addWorksheet(sheetName)

  // Get column headers from first data item
  const headers = Object.keys(data[0] || {})
  if (headers.length === 0) return

  try {
    // Add headers and data to worksheet
    worksheet.addRow(headers)

    // Add data with proper validation
    data.forEach((item) => {
      const values = headers.map((header) => {
        const value = item[header]
        // Handle null or undefined values
        if (value === null || value === undefined) return '-'
        return value
      })
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
        maxWidth = Math.max(maxWidth, Math.min(value.length, 100)) // Cap at 100 chars
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

      // Calculate row height
      row.height = 20 // Set a default height instead of calculating dynamically

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
  } catch (err) {
    console.error(`Error creating worksheet ${sheetName}:`, err)
    // Create a simple error sheet instead
    const errorWs = workbook.addWorksheet(`${sheetName}-Error`)
    errorWs.addRow(['Error creating worksheet', err.message])
  }
}

// Helper function to format dates
function formatDate(dateValue) {
  if (!dateValue) return '-'

  try {
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) return '-'

    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch (e) {
    console.error('Error formatting date:', e)
    return '-'
  }
}

// Helper function to save Excel file to the client
function saveAsExcelFile(buffer, fileName) {
  try {
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
    setTimeout(() => {
      window.URL.revokeObjectURL(link.href)
      document.body.removeChild(link)
    }, 100)
  } catch (err) {
    console.error('Error saving Excel file:', err)
    throw new Error('Gagal menyimpan file Excel')
  }
}
