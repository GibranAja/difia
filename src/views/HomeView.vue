<template>
  <header id="header">
    <Swiper
      :spaceBetween="30"
      :centeredSlides="true"
      :autoplay="{
        delay: 2500,
        disableOnInteraction: false,
      }"
      :pagination="{
        clickable: "false",
      }"
      :navigation="false"
      :modules="modules"
      :allowTouchMove="false"
      :speed="800"
      class="mySwiper"
      @slideChange="handleSlideChange"
    >
      <SwiperSlide v-for="slide in randomSlides" :key="slide.id" class="swiper-slide">
        <div class="slide-wrapper" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
          <img :src="slide.images[0]" :alt="slide.nama" class="slide-image" />
          <div class="slide-overlay">
            <h2>{{ slide.nama }}</h2>
            <p>Rp {{ formatPrice(slide.harga.standar) }}</p>
            <router-link :to="`/detail/${slide.id}`" class="slide-btn"> Lihat Detail </router-link>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
    <div class="text">
      <h1>Welcome, User</h1>
    </div>
  </header>
  <NavigationBar :showLogout="isLoggedIn" @logout="handleLogout"></NavigationBar>
  <main>
    <section class="tentang-kami" id="about">
      <div class="gambar">
        <!-- <img src="../assets/header-dott.png" alt="background-tentang-kami" class="hiasan" /> -->
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
    <section class="katalog" id="catalog">
      <h1><b>KATALOG</b></h1>
      <div class="catalog-grid">
        <CardCatalog
          v-for="(katalog, index) in katalogStore.katalogItems"
          :key="katalog.id"
          :item="katalog"
          :index="index"
        />
      </div>
    </section>
    <section class="blog" id="articel">
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
      <CardMitra></CardMitra>
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
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'

import CardCatalog from '@/components/CardCatalog.vue'
import CardBlog from '@/components/CardBlog.vue'
import NavigationBar from '@/components/NavigationBar.vue'
import { useAuthStore } from '@/stores/AuthStore'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useKatalogStore } from '@/stores/KatalogStore'
import CardUlasan from '@/components/CardUlasan.vue'
import { usePartnerStore } from '@/stores/PartnerStore'
import CardMitra from '@/components/CardMitra.vue'

const authStore = useAuthStore()
const router = useRouter()
const isLoggedIn = computed(() => authStore.isLoggedIn)
const katalogStore = useKatalogStore()
const partnerStore = usePartnerStore()

const handleLogout = async () => {
  try {
    await authStore.logoutUser(router)
  } catch (error) {
    console.error('Logout error:', error)
  }
}

onMounted(async () => {
  await katalogStore.fetchKatalog()
  await partnerStore.fetchPartners()
})

const modules = [Autoplay, Pagination, Navigation]

// Add this computed property
const randomSlides = computed(() => {
  const allKatalog = [...katalogStore.katalogItems]
  return allKatalog.sort(() => Math.random() - 0.5).slice(0, 7)
})

const formatPrice = (price) => {
  return price.toLocaleString('id-ID')
}

const currentHoverState = ref(false)

const handleSlideChange = () => {
  // Maintain hover state during slide transition
  if (currentHoverState.value) {
    const slides = document.querySelectorAll('.swiper-slide')
    slides.forEach((slide) => {
      slide.classList.add('force-hover')
    })
  }
}

// Add mouseenter/mouseleave handlers
const handleMouseEnter = () => {
  currentHoverState.value = true
  const slides = document.querySelectorAll('.swiper-slide')
  slides.forEach((slide) => {
    slide.classList.add('force-hover')
  })
}

const handleMouseLeave = () => {
  currentHoverState.value = false
  const slides = document.querySelectorAll('.swiper-slide')
  slides.forEach((slide) => {
    slide.classList.remove('force-hover')
  })
}
</script>

<style scoped>
header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  position: relative;
  width: 100%;
  height: 100vh;
}

header .text {
  position: absolute;
  bottom: 0px;
  left: 0px;
  /* background: linear-gradient( to top, rgba(0, 0, 0, 0.482), rgba(255, 255, 255, 0)); */
  width: 100%;
  height: 10%;
  padding: 50px;
  /* backdrop-filter: blur(10px); */
  z-index: 10;
  /* background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent); */
  /* backdrop-filter: blur(5px); */
}
.mySwiper {
  width: 100%;
  height: 100vh;
}

.swiper-slide {
  width: 100%;
  height: 100vh;
}

.slide-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.slide-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 60%,
    transparent 100%
  );
  padding: 4rem 2rem 6rem;
  color: white;
  text-align: center;
  transform: translateY(20%);
  opacity: 0;
  transition: all 0.6s ease;
}

.swiper-slide:hover .slide-overlay {
  transform: translateY(0);
  opacity: 1;
}

.swiper-slide:hover .slide-image {
  transform: scale(1.1);
}

.slide-overlay h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.slide-overlay p {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #e8ba38;
}

.slide-btn {
  display: inline-block;
  padding: 0.8rem 2rem;
  background-color: #e8ba38;
  color: #02163b;
  text-decoration: none;
  border-radius: 30px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.slide-btn:hover {
  background-color: #02163b;
  color: #e8ba38;
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
  padding: 19px;
  text-align: center;
}

.tentang-kami .text {
  width: 50%;
  text-align: center;
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
  color: #02163b;
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
  max-width: 1200px;
  /* Optional: limits maximum width */
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
  color: #02163b;
}

.line {
  border: 1px solid #e8ba38;
  width: 50%;
}

.b-log {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
}

.partner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  padding: 100px;
}

.partner h1 {
  font-size: 4rem;
  width: 100%;
  text-align: center;
  color: #02163b;
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
  color: #02163b;
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
  align-items: center;
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

.force-hover .slide-overlay {
  transform: translateY(0) !important;
  opacity: 1 !important;
}

.force-hover .slide-image {
  transform: scale(1.1) !important;
}

/* Modify transition timing to match slide speed */
.slide-image,
.slide-overlay {
  transition: all 0.8s ease;
}

/* Optional: smooth out transition between slides */
.swiper-slide-active {
  z-index: 1;
}
</style>
