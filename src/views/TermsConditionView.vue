<template>
  <div class="terms-container">
    <header class="terms-header">
      <h1>TERMS AND CONDITIONS DIFIA SOUVENIR</h1>
    </header>

    <div class="terms-content">
      <!-- Quick Navigation -->
      <nav class="quick-nav">
        <h2>Daftar Isi</h2>
        <ul>
          <li><a href="#production">Produksi</a></li>
          <li><a href="#revisions">Revisi & Perubahan</a></li>
          <li><a href="#liability">Tanggung Jawab</a></li>
          <li><a href="#payment">Pembayaran & Pembatalan</a></li>
          <li><a href="#shipping">Pengiriman</a></li>
        </ul>
      </nav>

      <div class="terms-sections">
        <!-- Production Terms -->
        <section id="production" class="terms-section">
          <h2>Produksi</h2>
          <div class="section-content">
            <ul>
              <li>
                Produksi souvenir minimal 50 pcs <strong>estimasi 3-7 hari</strong> pengerjaan jika
                jumlah melebihi minimal estimasi berlaku kelipatan
              </li>
              <li>
                Estimasi dapat berubah jika sudah
                <strong>di sepakati oleh kedua belah pihak</strong>
              </li>
              <li>
                Klien dapat menambah jumlah souvenir maksimal <strong>2 minggu</strong> sebelum
                final produksi.
              </li>
              <li>
                Produksi souvenir akan diproses jika sudah
                <strong>melakukan DP awal minimal 50%</strong>
              </li>
            </ul>
          </div>
        </section>

        <!-- Revisions Terms -->
        <section id="revisions" class="terms-section">
          <h2>Revisi & Perubahan</h2>
          <div class="section-content">
            <ul>
              <li>Plat dan Embos Logo <strong>tidak dapat dirubah setelah approved</strong></li>
              <li>
                Revisi model dapat dilakukan <strong>maksimal sebanyak 3 kali</strong> sebelum
                proses produksi souvenir
              </li>
              <li><strong>Tidak menerima revisi</strong> setelah produksi berlangsung</li>
            </ul>
          </div>
        </section>

        <!-- Liability Terms -->
        <section id="liability" class="terms-section">
          <h2>Tanggung Jawab</h2>
          <div class="section-content">
            <ul>
              <li>
                Difia Souvenir akan bertanggung jawab sepenuhnya jika terjadi hal-hal tidak terduga
                disebabkan oleh <strong>kesalahan produksi</strong>
              </li>
              <li>
                Difia Souvenir tidak bertanggung jawab jika terjadi hal-hal tidak terduga yang
                disebabkan oleh <strong>kesalahan pihak klien</strong>
              </li>
              <li>
                Setelah terms & conditions ini terbit maka pembeli sudah setara dengan
                <strong>tanda tangan diatas materai</strong>
              </li>
            </ul>
          </div>
        </section>

        <!-- Payment Terms -->
        <section id="payment" class="terms-section">
          <h2>Pembayaran & Pembatalan</h2>
          <div class="section-content">
            <ul>
              <li><strong>Tidak dapat membatalkan pesanan</strong> jika sudah pembuatan sampel</li>
              <li>
                <strong>Cancelation Fee.</strong> Bila pihak klien secara sepihak membatalkan
                souvenir, maka
                <strong
                  >Merujuk pada UU KUHPerdata pasal 1464, bahwa jika pihak pembeli membatalkan
                  pembelian, maka DP yang telah dibayarkan tidak dapat dikembalikan.</strong
                >
              </li>
              <li>
                Terms & Condition dibuat secara sadar dengan kesepakatan dua belah pihak yaitu
                <strong>pihak klien & pihak difia souvenir</strong>
              </li>
            </ul>
          </div>
        </section>

        <!-- Shipping Terms -->
        <section id="shipping" class="terms-section">
          <h2>Pengiriman</h2>
          <div class="section-content">
            <ul>
              <li>
                Pengiriman souvenir akan dilakukan <strong>maksimal h+1 setelah pelunasan</strong>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>

    <footer class="terms-footer">
      <p>
        Dengan menandatangani dokumen ini, pelanggan setuju dengan layanan dan persyaratan yang
        tercantum dalam dokumen ini.
      </p>
    </footer>
  </div>
</template>

<script setup>
// Add any required functionality here
</script>

<style scoped>
/* Apply Montserrat font globally to the component */
* {
  font-family: 'Montserrat', sans-serif;
}

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
  font-weight: 700; /* Added for better header emphasis */
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
  font-weight: 600; /* Added semibold weight */
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
  font-weight: 500; /* Added medium weight for better readability */
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
  font-weight: 600; /* Added semibold weight */
}

.terms-section h3 {
  color: #02163b;
  font-size: 1.3rem;
  margin: 1.5rem 0 1rem;
  font-weight: 600; /* Added semibold weight */
}

.section-content {
  color: #444;
  line-height: 1.6;
  font-weight: 400; /* Regular weight for body text */
}

.section-content ul {
  padding-left: 1.5rem;
}

.section-content li {
  margin-bottom: 0.5rem;
}

.section-content strong {
  font-weight: 600; /* Semibold for emphasized text */
}

/* Update footer text */
.terms-footer p {
  font-weight: 500; /* Medium weight for footer text */
  font-size: 0.9rem;
  color: #666;
  text-align: center;
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
