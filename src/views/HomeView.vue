<template>
  <header>
    <div class="judul">
      <h1><b>DIFIA</b></h1>
      <p>Tas Berkualitas untuk Setiap Momen Spesial Anda.</p>
      <a href="">Chat Kami</a>
    </div>
    <div class="carousel">
      <img src="../assets/difia.jpg" alt="foto-katalog" />
      <!-- <img src="../assets/header-dott.png" alt="background-katalog" class="background"> -->
    </div>
  </header>
  <NavigationBar :showLogout="isLoggedIn" @logout="handleLogout"></NavigationBar>
  <main>
    <section class="tentang-kami">
      <div class="gambar">
        <img src="../assets/header-dott.png" alt="background-tentang-kami" class="hiasan" />
        <img
          src="../assets/Logo Difia Haki.PNG"
          alt="foto-tentang-kami"
          class="foto-tentang-kami"
        />
      </div>
      <div class="text">
        <h1><b>TENTANG KAMI</b></h1>
        <p>
          Difia sebuah brand lokal yang berdiri sejak 20 Agustus 2020.Pada saat Puncak pandemi
          covid-19,Perusahaan ini berbasis perorangan tergolong UMKM Home Industry di bidang fashion
          berbahan baku kulit sintetis diolah menjadi sendal dan tas terletak di kota Bogor
        </p>
      </div>
    </section>
    <section class="katalog">
      <h1><b>KATALOG</b></h1>
      <div class="catalog-grid">
        <CardCatalog
          v-for="katalog in katalogStore.katalogItems"
          :key="katalog.id"
          :item="katalog"
        />
      </div>
    </section>
    <section class="blog">
      <div class="b-log">
        <span class="line"></span>
        <h1><b>ARTIKEL</b></h1>
        <span class="line"></span>
      </div>
      <CardBlog></CardBlog>
    </section>
    <section class="partner">
      <div class="b-log">
        <span class="line"></span>
        <h1><b>Mitra Kami</b></h1>
        <span class="line"></span>
      </div>
    </section>
    <section class="ulasan">
      <div class="b-log">
        <span class="line"></span>
        <h1><b>ULASAN</b></h1>
        <span class="line"></span>
      </div>

      <CardUlasan></CardUlasan>
    </section>
  </main>
  <footer>
    <h1><b>Media Sosial Kami</b></h1>
    <img src="../assets/Logo Difia Haki.PNG" alt="" />
    <div class="medsos">
      <ul>
        <li>
          <a href=""><i class="fas fa-brands fa-square-instagram"></i>difiasouvenir</a>
        </li>
        <li>
          <a href=""><i class="fas fa-brands fa-square-instagram"></i>difiaindonesia</a>
        </li>
        <li>
          <a href=""><i class="fas fa-brands fa-square-facebook"></i>FlatShoes Made By Me</a>
        </li>
      </ul>
    </div>
  </footer>
</template>

<script setup>
import CardCatalog from '@/components/CardCatalog.vue'
import CardBlog from '@/components/CardBlog.vue'
import NavigationBar from '@/components/NavigationBar.vue'
import { useAuthStore } from '@/stores/AuthStore'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useKatalogStore } from '@/stores/KatalogStore'
import CardUlasan from '@/components/CardUlasan.vue'

const authStore = useAuthStore()
const router = useRouter()
const isLoggedIn = computed(() => authStore.isLoggedIn)
const katalogStore = useKatalogStore()

const handleLogout = async () => {
  try {
    await authStore.logoutUser(router)
  } catch (error) {
    console.error('Logout error:', error)
  }
}

onMounted(async () => {
  await katalogStore.fetchKatalog()
})
</script>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  padding: 160px;
  /* font-family: 'Times New Roman', Times, serif; */
}

.judul a {
  color: white;
  text-decoration: none;
  background-color: #02163b;
  padding: 10px;
  border-radius: 100px;
  transition: all 700ms;
  font-size: x-large;
}

.judul a:hover {
  background-color: white;
  color: #e8ba38;
}

.judul {
  width: 50%;
  word-spacing: 0%;
  letter-spacing: 0px;
  line-height: 1.5rem;
}

.judul h1 {
  font-size: 5rem;
  line-height: 1rem;
  letter-spacing: 40px;
}

.judul p {
  font-size: 1.5rem;
  margin-top: 0;
  line-height: 1.5rem;
}

.carousel {
  background-image: url('../assets/header-dott.png');
  width: 30%;
  padding: 40px;
}

.carousel img {
  width: fit-content;
  height: fit-content;
}

.tentang-kami {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  padding: 160px;
  /* font-family: 'Times New Roman', Times, serif; */
}

.tentang-kami .gambar {
  width: 30%;
  height: auto;
  background-color: #02163b;
  padding: 10px;
  text-align: center;
}

.tentang-kami .text {
  width: 50%;
}

.tentang-kami .gambar .hiasan {
  width: 200px;
  height: 200px;
  z-index: -1;
  position: absolute;
  left: 160px;
  bottom: -230px;
}

.tentang-kami h1 {
  font-size: 3rem;
  line-height: 1rem;
}

.foto-tentang-kami {
  width: 100%;
  height: 100%;
}

.katalog {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  padding: 100px;
  /* font-family: 'Times New Roman', Times, serif; */
}

.katalog h1 {
  font-size: 4rem;
  width: 100%;
  text-align: center;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
  padding: 20px;
  width: 100%;
  max-width: 1200px; /* Optional: limits maximum width */
  margin: 0 auto;
}

.blog {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  padding: 100px;
  /* font-family: 'Times New Roman', Times, serif; */
}

.blog h1 {
  font-size: 4rem;
  width: 100%;
  text-align: center;
}

.line {
  border: 1px solid black;
  width: 50%;
}

.b-log {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
}

.partner{
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  padding: 100px;
}
.partner h1{
  font-size: 4rem;
  width: 100%;
  text-align: center;
}

.ulasan {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  padding: 100px;
  /* font-family: 'Times New Roman', Times, serif; */
}

.ulasan h1 {
  text-align: center;
  width: 100%;
  font-size: 4rem;
}

footer {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  padding: 100px;
  background-image: url('../assets/bg-footer.jpeg');
  background-repeat: no-repeat;
  background-size: cover;
  /* font-family: 'Times New Roman', Times, serif; */
}

footer h1 {
  font-size: 3rem;
  width: 100%;
  text-align: center;
}

footer .medsos {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  width: 40%;
}

footer .medsos a {
  text-decoration: none;
  color: black;
  padding: 10px;
  transition: all 700ms;
  gap: 10px;
  display: flex;
  flex-wrap: wrap;
}

footer .medsos a:hover {
  color: white;
}

footer .medsos li {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

footer .medsos i {
  color: black;
  transition: all 700ms;
  font-size: xx-large;
}

footer img {
  width: 30%;
  border-radius: 40px;
  opacity: 50%;
}
</style>
