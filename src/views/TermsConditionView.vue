<template>
  <div class="terms-container">
    <header class="terms-header">
      <h1>Syarat & Ketentuan</h1>
    </header>

    <div class="terms-content">
      <!-- Quick Navigation -->
      <nav class="quick-nav">
        <h2>Daftar Isi</h2>
        <ul>
          <li><a href="#general">Ketentuan Umum</a></li>
          <li><a href="#order">Pemesanan & Pembayaran</a></li>
          <li><a href="#shipping">Pengiriman</a></li>
          <li><a href="#return">Pengembalian</a></li>
          <li><a href="#privacy">Privasi</a></li>
        </ul>
      </nav>

      <div class="terms-sections">
        <!-- General Terms -->
        <section id="general" class="terms-section">
          <h2>Ketentuan Umum</h2>
          <div class="section-content">
            <p>Selamat datang di Difia. Dengan menggunakan layanan kami, Anda menyetujui syarat dan ketentuan berikut:</p>
            <ul>
              <li>Anda harus berusia minimal 17 tahun atau mendapat izin dari wali</li>
              <li>Informasi yang Anda berikan harus akurat dan lengkap</li>
              <li>Anda bertanggung jawab untuk menjaga kerahasiaan akun Anda</li>
            </ul>
          </div>
        </section>

        <!-- Order Terms -->
        <section id="order" class="terms-section">
          <h2>Pemesanan & Pembayaran</h2>
          <div class="section-content">
            <h3>Pemesanan</h3>
            <ul>
              <li>Pemesanan minimal untuk produk satuan adalah 1 pcs</li>
              <li>Pemesanan untuk souvenir minimal 20 pcs</li>
              <li>Harga dapat berubah sewaktu-waktu tanpa pemberitahuan</li>
            </ul>
            
            <h3>Pembayaran</h3>
            <ul>
              <li>Pembayaran dilakukan melalui QRIS</li>
              <li>Pesanan akan diproses setelah pembayaran terverifikasi</li>
              <li>Bukti pembayaran wajib diunggah saat checkout</li>
            </ul>
          </div>
        </section>

        <!-- Add more sections... -->
      </div>
    </div>
  </div>
</template>

<script setup>
// Add any required functionality here
</script>

<style scoped>
.terms-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #fff;
}

.terms-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.terms-header h1 {
  color: #02163b;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.last-updated {
  color: #666;
  font-size: 0.9rem;
}

.terms-content {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
}

.quick-nav {
  position: sticky;
  top: 2rem;
  height: fit-content;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.quick-nav h2 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #02163b;
}

.quick-nav ul {
  list-style: none;
  padding: 0;
}

.quick-nav li {
  margin-bottom: 0.75rem;
}

.quick-nav a {
  color: #666;
  text-decoration: none;
  transition: color 0.2s;
}

.quick-nav a:hover {
  color: #e8ba38;
}

.terms-section {
  margin-bottom: 3rem;
  scroll-margin-top: 2rem;
}

.terms-section h2 {
  color: #02163b;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e8ba38;
}

.terms-section h3 {
  color: #02163b;
  font-size: 1.3rem;
  margin: 1.5rem 0 1rem;
}

.section-content {
  color: #444;
  line-height: 1.6;
}

.section-content ul {
  padding-left: 1.5rem;
}

.section-content li {
  margin-bottom: 0.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .terms-content {
    grid-template-columns: 1fr;
  }

  .quick-nav {
    position: relative;
    top: 0;
    margin-bottom: 2rem;
  }
}

/* Print styles */
@media print {
  .quick-nav {
    display: none;
  }

  .terms-content {
    grid-template-columns: 1fr;
  }

  .terms-section {
    break-inside: avoid;
  }
}
</style>