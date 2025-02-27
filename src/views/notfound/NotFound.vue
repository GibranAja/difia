<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1>Halaman Tidak Ditemukan</h1>
      <p>Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.</p>

      <div class="actions">
        <router-link to="/" class="primary-button">
          <i class="fas fa-home"></i>
          Kembali ke Beranda
        </router-link>
        <button @click="goBack" class="secondary-button">
          <i class="fas fa-arrow-left"></i>
          Kembali ke Halaman Sebelumnya
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f5f5f5;
  font-family: 'Montserrat', sans-serif;
}

.not-found-content {
  max-width: 600px;
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.error-code {
  font-size: 8rem;
  font-weight: 700;
  color: #e8ba38;
  line-height: 1;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 2rem;
  color: #02163b;
  margin-bottom: 1rem;
}

p {
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.primary-button,
.secondary-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  text-decoration: none;
}

.primary-button {
  background-color: #e8ba38;
  color: white;
  border: none;
}

.secondary-button {
  background-color: white;
  color: #02163b;
  border: 2px solid #02163b;
}

.primary-button:hover {
  background-color: #d5a832;
  transform: translateY(-2px);
}

.secondary-button:hover {
  background-color: #02163b;
  color: white;
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 480px) {
  .error-code {
    font-size: 6rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .actions {
    flex-direction: column;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
