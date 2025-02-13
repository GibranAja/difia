<template>
  <header id="home">
    <Swiper
      :spaceBetween="30"
      :centeredSlides="true"
      :autoplay="{
        delay: 2500,
        disableOnInteraction: false,
      }"
      :pagination="{
        clickable: true,
      }"
      :navigation="false"
      :modules="modules"
      :allowTouchMove="false"
      :speed="800"
      :loop="true"
      :loopAdditionalSlides="3"
      class="mySwiper"
    >
      <SwiperSlide v-for="slide in sliderStore.sliderItems" :key="slide.id" class="swiper-slide">
        <div class="slide-wrapper">
          <div class="slide-overlay"></div>
          <img :src="slide.image" :alt="`Slider ${slide.id}`" class="slide-image" />
        </div>
      </SwiperSlide>
    </Swiper>
    <div class="scroll-indicator">
      <i class="fas fa-chevron-down"></i>
    </div>
  </header>
  <NavigationBar :showLogout="isLoggedIn" @logout="handleLogout"></NavigationBar>
  <main>
    <section class="tentang-kami" id="about">
      <div class="about">
        <div class="gambar">
          <span class="kotak"></span>
          <span class="bulet"></span>
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
            covid-19,Perusahaan ini berbasis perorangan tergolong UMKM Home Industry di bidang
            fashion berbahan baku kulit sintetis diolah menjadi sendal dan tas terletak di kota
            Bogor
          </p>
        </div>
      </div>
      <div class="swipper">
        <span class="bg-scroll"></span>
        <span class="side-color"></span>
        <CardAchivement></CardAchivement>
      </div>
    </section>
    <section class="katalog" id="catalog">
      <span class="dot"></span>
      <h1><b>KATALOG</b></h1>
      <span class="dot"></span>
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
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useKatalogStore } from '@/stores/KatalogStore'
import CardUlasan from '@/components/CardUlasan.vue'
import { usePartnerStore } from '@/stores/PartnerStore'
import CardMitra from '@/components/CardMitra.vue'
import CardAchivement from '@/components/CardAchivement.vue'
import { useSliderStore } from '@/stores/SliderStore'

const authStore = useAuthStore()
const router = useRouter()
const isLoggedIn = computed(() => authStore.isLoggedIn)
const katalogStore = useKatalogStore()
const partnerStore = usePartnerStore()
const sliderStore = useSliderStore()

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
  await sliderStore.fetchSliders()
})

const modules = [Autoplay, Pagination, Navigation]
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

.mySwiper {
  width: 100%;
  height: 100vh;
}

.swiper-slide {
  width: 100%;
  height: 100vh;
  width: 100vh;
  text-align: center;
}

header .text {
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 100%;
  height: 10%;
  padding: 50px;
  z-index: 10;
}

.tentang-kami {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  row-gap: 50px;
  align-items: center;
  flex-wrap: wrap;
}
.about {
  padding: 150px;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  row-gap: 50px;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
}
.tentang-kami .gambar {
  width: 30%;
  height: auto;
  background-color: #d3d3d3;
  padding: 19px;
  text-align: center;
  position: relative;
}

.tentang-kami .text {
  width: 50%;
  text-align: justify;
}

.tentang-kami .gambar .kotak {
  position: absolute;
  width: 5px;
  left: -100px;
  top: -100px;
  background-color: black;
  border: 100px solid #e8ba38;
  z-index: -10;
}

.tentang-kami .gambar .bulet {
  position: absolute;
  width: 5px;
  right: -100px;
  bottom: -100px;
  background-color: black;
  border: 100px solid #02163b;
  z-index: -10;
  border-radius: 100px;
}

.tentang-kami h1 {
  font-size: 3rem;
  line-height: 1rem;
  color: #02163b;
  text-align: center;
}

.swipper {
  width: 100%;
  position: relative;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
}

.tentang-kami .swipper .bg-scroll {
  position: absolute;
  width: 100%;
  height: 150px;
  background-color: #d9d9d9;
  z-index: -10;
  right: 0;
}
.tentang-kami .swipper .side-color {
  position: absolute;
  width: 200px;
  height: 200px;
  left: 0;
  background-color: white;
  box-shadow: 10px 0 25px black;
  border-radius: 0 10px 10px 0;
  z-index: -10;
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
  width: 33.3%;
  text-align: center;
}

.katalog .dot {
  width: 30%;
  border: 2px dotted #e8ba38;
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
  padding: 10px;
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
  width: 50%;
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
  width: 10%;
  border-radius: 40px;
  opacity: 50%;
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
}

/* Add dark overlay */
.slide-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4); /* Adjust opacity as needed */
  z-index: 1;
}

/* Style for scroll indicator */
.scroll-indicator {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  z-index: 10;
}

.scroll-indicator i {
  font-size: 2rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
}
</style>
