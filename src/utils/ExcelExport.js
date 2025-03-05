// src/utils/excelExport.js
import * as XLSX from 'xlsx';

export const exportToExcel = async (data, filename) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Process each data type and add as separate worksheet
  if (data.katalog) {
    const katalogForExcel = data.katalog.map(item => ({
      'ID': item.id,
      'Nama Produk': item.nama,
      'Harga Standar': item.harga.standar,
      'Harga Premium': item.harga.premium,
      'Ukuran P×L×T': `${item.detail?.ukuran?.panjang || 0}×${item.detail?.ukuran?.lebar || 0}×${item.detail?.ukuran?.tinggi || 0} cm`,
      'Bahan Luar': item.detail?.bahanLuar || '-',
      'Bahan Dalam': item.detail?.bahanDalam || '-',
      'Aksesoris': item.detail?.aksesoris || '-',
      'Warna': item.detail?.warna || '-',
      'Pengerjaan 50-100 pcs': item.waktuPengerjaan?.pcs50_100 || '-',
      'Pengerjaan 200 pcs': item.waktuPengerjaan?.pcs200 || '-',
      'Pengerjaan 300 pcs': item.waktuPengerjaan?.pcs300 || '-',
      'Pengerjaan >300 pcs': item.waktuPengerjaan?.pcsAbove300 || '-',
      'Tanggal Dibuat': formatDate(item.createdAt),
      'Terakhir Diupdate': formatDate(item.updatedAt)
    }));
    
    addWorksheet(workbook, 'Katalog', katalogForExcel);
  }
  
  if (data.orders) {
    const ordersForExcel = data.orders.map(order => ({
      'ID Order': order.id,
      'Nama Customer': order.shippingDetails?.name || '-',
      'Email': order.shippingDetails?.email || '-',
      'Telepon': order.shippingDetails?.phone || '-',
      'Alamat': `${order.shippingDetails?.address || ''}, ${order.shippingDetails?.city || ''}, ${order.shippingDetails?.province || ''} ${order.shippingDetails?.zip || ''}`,
      'Produk': order.productName || '-',
      'Jumlah': order.quantity || 0,
      'Harga Satuan': order.price || 0,
      'Total': order.totalAmount || 0,
      'Status': order.status || '-',
      'Jenis Order': order.isBulkOrder ? 'Souvenir' : 'Satuan',
      'Tanggal Order': formatDate(order.createdAt),
      'Bahan Luar': order.customOptions?.bahanLuar || '-',
      'Bahan Dalam': order.customOptions?.bahanDalam || '-',
      'Aksesoris': Array.isArray(order.customOptions?.aksesoris) 
        ? order.customOptions.aksesoris.join(', ') 
        : order.customOptions?.aksesoris || '-',
      'Catatan': order.customOptions?.note || '-'
    }));
    
    addWorksheet(workbook, 'Pesanan', ordersForExcel);
  }

  if (data.blogs) {
    const blogsForExcel = data.blogs.map(blog => ({
      'ID': blog.id,
      'Judul': blog.title || '-',
      'Deskripsi': blog.description || '-',
      'Tanggal Dibuat': formatDate(blog.createdAt),
      'Terakhir Diupdate': formatDate(blog.updatedAt)
    }));
    
    addWorksheet(workbook, 'Blog', blogsForExcel);
  }

  if (data.partners) {
    const partnersForExcel = data.partners.map(partner => ({
      'ID': partner.id,
      'Nama': partner.name || '-',
      'Deskripsi': partner.description || '-',
      'Tanggal Dibuat': formatDate(partner.createdAt)
    }));
    
    addWorksheet(workbook, 'Partner', partnersForExcel);
  }

  if (data.staff) {
    const staffForExcel = data.staff.map(staff => ({
      'ID': staff.id,
      'Nama': staff.name || '-',
      'Email': staff.email || '-',
      'Role': staff.role || '-',
      'Tanggal Dibuat': formatDate(staff.createdAt)
    }));
    
    addWorksheet(workbook, 'Staff', staffForExcel);
  }

  if (data.vouchers) {
    const vouchersForExcel = data.vouchers.map(voucher => ({
      'ID': voucher.id,
      'Kode': voucher.code || '-',
      'Tipe Diskon': voucher.discountType === 'percentage' ? 'Persentase' : 'Nominal',
      'Nilai Diskon': voucher.discountValue || 0,
      'Maksimal Penggunaan': voucher.maxUses || 0,
      'Penggunaan Sekarang': voucher.currentUses || 0,
      'Status': voucher.isActive ? 'Aktif' : 'Nonaktif',
      'Berlaku Sampai': formatDate(voucher.validUntil),
      'Tanggal Dibuat': formatDate(voucher.createdAt)
    }));
    
    addWorksheet(workbook, 'Voucher', vouchersForExcel);
  }

  // Write to Excel file and trigger download
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

// Helper function to add a worksheet
function addWorksheet(workbook, sheetName, data) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Auto-size columns for better readability
  const colWidths = [];
  data.forEach(row => {
    Object.keys(row).forEach((key, i) => {
      const value = String(row[key] || '');
      colWidths[i] = Math.max(colWidths[i] || 10, key.length, value.length);
    });
  });
  
  // Apply column widths
  worksheet['!cols'] = colWidths.map(width => ({ wch: Math.min(width, 50) }));
  
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
}

// Helper function to format dates
function formatDate(dateValue) {
  if (!dateValue) return '-';
  
  try {
    // Handle Firestore Timestamps or Date objects
    const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
    return date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    console.error(e)
    return '-';
  }
}