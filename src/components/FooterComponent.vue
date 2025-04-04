<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-logo-section">
        <h2 class="footer-title">Thank You</h2>
        <p class="footer-tagline">For shopping with us</p>
      </div>

      <div class="footer-columns">
        <div class="footer-column">
          <h3 class="column-title">Social Media</h3>
          <ul class="footer-links">
            <li>
              <a href="https://www.instagram.com/difiasouvenir" target="_blank" rel="noopener">
                <i class="fas fa-brands fa-instagram"></i>
                <span>difiasouvenir</span>
              </a>
            </li>
            <li>
              <a href="https://www.facebook.com/" target="_blank" rel="noopener">
                <i class="fas fa-brands fa-facebook"></i>
                <span>lorem</span>
              </a>
            </li>
            <li>
              <a href="https://wa.me/+6281234567890" target="_blank" rel="noopener">
                <i class="fas fa-brands fa-whatsapp"></i>
                <span>WhatsApp</span>
              </a>
            </li>
          </ul>
        </div>

        <div class="footer-column">
          <h3 class="column-title">Online Shop</h3>
          <ul class="footer-links">
            <li>
              <a href="https://shopee.co.id/tokonama" target="_blank" rel="noopener">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0,0,256,256"
                >
                  <g
                    fill="currentColor"
                    fill-rule="nonzero"
                    stroke="none"
                    stroke-width="1"
                    stroke-linecap="butt"
                    stroke-linejoin="miter"
                    stroke-miterlimit="10"
                    stroke-dasharray=""
                    stroke-dashoffset="0"
                    font-family="none"
                    font-weight="none"
                    font-size="none"
                    text-anchor="none"
                    style="mix-blend-mode: normal"
                  >
                    <g transform="scale(5.12,.12)">
                      <path
                        d="M25,1c-5.32713,0 -9.39588,4.95314 -9.83398,11h-10.10742c-1.135,0 -2.05922,0.981 -1.99609,2.11328l1.72461,30.17188c0.14947,2.63699 2.34979,4.71484 4.99023,4.71484h30.44531c2.64119,0 4.84078,-2.07817 4.99023,-4.71484l1.72461,-30.16992c0.06514,-1.13309 -0.86109,-2.11523 -1.99609,-2.11523h-10.10742c-0.43811,-6.04686 -4.50685,-11 -9.83398,-11zM25,3c4.03694,0 7.40892,3.88679 7.83594,9h-15.67188c0.42701,-5.11321 3.799,-9 7.83594,-9zM5.05859,14h10.77344c0.10799,0.01785 0.21818,0.01785 0.32617,0h17.67383c0.10799,0.01785 0.21818,0.01785 0.32617,0h10.7832l-1.72461,30.17188c-0.09054,1.59732 -1.39334,2.82813 -2.99414,2.82813h-30.44531c-1.59956,0 -2.90362,-1.23111 -2.99414,-2.82812l-1.72461,-30.16992zM25.07422,18.00195c-4.314,0 -7.56641,2.68795 -7.56641,6.25195c0,4.03 3.74769,5.39942 7.05469,6.60742c4.004,1.463 6.43555,2.58019 6.43555,5.74219c0,2.442 -2.73089,4.42969 -6.08789,4.42969c-3.755,0 -6.93675,-2.74153 -6.96875,-2.76953l-1.11523,1.64258c0.812,0.658 4.09498,3.10156 8.08398,3.10156c4.52,0 8.06255,-2.8133 8.06055,-6.4043c0,-4.77 -4.10647,-6.2727 -7.73047,-7.5957c-3.583,-1.311 -5.75977,-2.28291 -5.75977,-4.75391c0,-2.478 2.35275,-4.27734 5.59375,-4.27734c2.161,0 4.0415,0.81814 5.0625,1.36914c0.172,0.092 0.62495,0.3642 0.87695,0.5332l1.02148,-1.66211c-0.234,-0.152 -3.11394,-2.21484 -6.96094,-2.21484z"
                      ></path>
                    </g>
                  </g>
                </svg>
                <span>Shopee</span>
              </a>
            </li>
            <li>
              <a href="https://tokopedia.com/" target="_blank" rel="noopener">
                <i class="fas fa-shopping-bag"></i>
                <span>Tokopedia</span>
              </a>
            </li>
          </ul>
        </div>

        <div class="footer-column map-column">
          <h3 class="column-title">Find Us</h3>
          <div class="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d495.4244784058984!2d106.784147023424!3d-6.597629657338529!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c56b57e2cf67%3A0xc22cc0c46697779c!2sKonveksi%20Tas%20Souvenir%20Kantor%20Souvenir%20Acara%20Kota%20Bogor%20Tengah!5e0!3m2!1sid!2sid!4v1740230873607!5m2!1sid!2sid"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            >
            </iframe>
          </div>
          <p class="address">
            <i class="fas fa-map-marker-alt"></i>
            <span>Kota Bogor, Jawa Barat, Indonesia</span>
          </p>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="copyright">
        <p>Copyright &copy; {{ currentYear }} Difia Souvenir. All Rights Reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

// Dynamic year for copyright
const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  background: linear-gradient(to bottom, #333333, #121212);
  color: #f4f4f4;
  position: relative;
  font-family: 'Montserrat', sans-serif;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.1);
}

.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(to right, #02163b, #e8ba38, #02163b);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.footer-logo-section {
  text-align: center;
  margin-bottom: 2.5rem;
  position: relative;
}

.footer-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #f4f4f4, #e8ba38);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
}

.footer-tagline {
  color: #c1c1c1;
  font-size: 1rem;
  margin-top: 0.5rem;
}

.footer-columns {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 2rem;
}

.footer-column {
  flex: 1;
  min-width: 200px;
}

.map-column {
  flex: 1.5;
}

.column-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 0.75rem;
  color: #e8ba38;
}

.column-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 2px;
  background-color: #e8ba38;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 1rem;
}

.footer-links a {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #c1c1c1;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  padding: 0.25rem 0;
}

.footer-links a:hover {
  color: #f4f4f4;
  transform: translateX(5px);
}

.footer-links i,
.footer-links svg {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e8ba38;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.footer-links a:hover i,
.footer-links a:hover svg {
  transform: scale(1.2);
}

.map-container {
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  height: 200px;
  margin-bottom: 1rem;
}

.map-container iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.address {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  color: #c1c1c1;
  font-size: 0.9rem;
  line-height: 1.5;
}

.address i {
  color: #e8ba38;
  margin-top: 3px;
}

.footer-bottom {
  background-color: rgba(0, 0, 0, 0.3);
  padding: 1.25rem 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.copyright p {
  color: #a0a0a0;
  font-size: 0.85rem;
  margin: 0;
  text-align: center;
}

/* Responsive styles */
@media (max-width: 992px) {
  .footer-columns {
    gap: 3rem;
  }

  .footer-column {
    flex: 1 1 40%;
    min-width: 250px;
  }

  .map-column {
    flex: 1 1 100%;
  }
}

@media (max-width: 768px) {
  .footer-container {
    padding: 2.5rem 1.5rem;
  }

  .footer-column {
    flex: 1 1 100%;
  }

  .footer-title {
    font-size: 2rem;
  }

  .column-title {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .footer-container {
    padding: 2rem 1rem;
  }

  .footer-title {
    font-size: 1.75rem;
  }

  .footer-tagline {
    font-size: 0.9rem;
  }

  .map-container {
    height: 180px;
  }

  .footer-bottom {
    padding: 1rem;
  }
}
</style>
