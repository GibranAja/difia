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
                <i class="fas fa-shopping-bag"></i>
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
