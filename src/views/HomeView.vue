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
      :loop="sliderStore.sliderItems.length > 1"
      :loopedSlides="2"
      class="mySwiper"
    >
      <SwiperSlide v-for="slide in sliderStore.sliderItems" :key="slide.id" class="swiper-slide">
        <div class="slide-wrapper">
          <div class="slide-overlay"></div>
          <img :src="slide.image" :alt="`Slider ${slide.id}`" class="slide-image" />
        </div>
      </SwiperSlide>
      <!-- Tambahkan fallback slide jika tidak ada slider -->
      <SwiperSlide v-if="!sliderStore.sliderItems.length">
        <div class="slide-wrapper">
          <div class="slide-overlay"></div>
          <img src="@/assets/Logo Difia Haki.png" alt="Default Slider" class="slide-image" />
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
          <br>
          <p>
            Difia sebuah brand lokal yang berdiri sejak 20 Agustus 2020.Pada saat Puncak pandemi
            covid-19,Perusahaan ini berbasis perorangan tergolong UMKM Home Industry di bidang
            fashion berbahan baku kulit sintetis diolah menjadi sendal dan tas terletak di kota
            Bogor
          </p>
        </div>
      </div>
      <div class="swipper">
        <p><b>PENGHARGAAN</b></p>
        <span class="ring"></span>
        <span class="bg-scroll"></span>
        <span class="side-color"> </span>
        <div class="swipper-controll">
          <Swiper :slides-per-view="4" :space-between="30" :modules="modules" :pagination="{ clickable: true }"
            :autoplay="{ delay: 2500, disableOnInteraction: false, }" :navigation="false" :speed="800" :loop="true"
            class="swipper-container">
            <SwiperSlide>
              <CardAchivement></CardAchivement>
            </SwiperSlide>
            <SwiperSlide>
              <CardAchivement></CardAchivement>
            </SwiperSlide>
            <SwiperSlide>
              <CardAchivement></CardAchivement>
            </SwiperSlide>
            <SwiperSlide>
              <CardAchivement></CardAchivement>
            </SwiperSlide>
            <SwiperSlide>
              <CardAchivement></CardAchivement>
            </SwiperSlide>
            <SwiperSlide>
              <CardAchivement></CardAchivement>
            </SwiperSlide>
            <SwiperSlide>
              <CardAchivement></CardAchivement>
            </SwiperSlide>
            <SwiperSlide>
              <CardAchivement></CardAchivement>
            </SwiperSlide>
            <SwiperSlide>
              <CardAchivement></CardAchivement>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </section>
    <section class="katalog" id="catalog">
      <span class="dot"></span>
      <h1><b>KATALOG</b></h1>
      <span class="dot"></span>
      <div class="catalog-grid">
        <CardCatalog
          v-for="(katalog, index) in visibleKatalog"
          :key="katalog.id"
          :item="katalog"
          :index="index"
        />
      </div>
      <div class="load-more-container" v-if="hasMoreItems">
        <button @click="loadMore" class="load-more-btn">See More</button>
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
    <h1><b>Thank You</b></h1>
    <ul>
      <li>
        <h1><b>Sosial Media</b></h1>
      </li>
      <li>
        <a href="https://www.instagram.com/difiasouvenir"
          ><i class="fas fa-brands fa-instagram"></i>difiasouvenir</a
        >
      </li>
      <br />
      <li>
        <a href="https://www.facebook.com/"><i class="fas fa-brands fa-facebook"></i>lorem</a>
      </li>
    </ul>
    <ul>
      <li>
        <h1><b>Online Shop</b></h1>
      </li>
      <li>
        <a href="https://shopee.co.id/tokonama"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="20"
            height="20"
            viewBox="0,0,256,256"
          >
            <g
              fill="#c1c1c1"
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
            </svg>lorem</a>
      </li>
    </ul>
    <ul>
      <li>
        <h1><b>Maps</b></h1>
      </li>
      <li>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d495.4244784058984!2d106.784147023424!3d-6.597629657338529!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c56b57e2cf67%3A0xc22cc0c46697779c!2sKonveksi%20Tas%20Souvenir%20Kantor%20Souvenir%20Acara%20Kota%20Bogor%20Tengah!5e0!3m2!1sid!2sid!4v1740230873607!5m2!1sid!2sid"
          width="300"
          height="250"
          style="border: 0"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </li>
    </ul>
    <p>Copyright &copy;2025</p>
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

const ITEMS_PER_PAGE = 6
const displayCount = ref(ITEMS_PER_PAGE)

const visibleKatalog = computed(() => {
  return katalogStore.katalogItems.slice(0, displayCount.value)
})

const loadMore = () => {
  displayCount.value += ITEMS_PER_PAGE
}

const hasMoreItems = computed(() => {
  return displayCount.value < katalogStore.katalogItems.length
})
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

header .mySwiper {
  width: 100%;
  height: 100vh;
}

header .swiper-slide {
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

.tentang-kami .swipper p {
  color: white;
  text-align: center;
  rotate: -90deg;
  position: absolute;
  left: -30px;
  font-size: 1.5rem;
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
  justify-content: right;
  align-items: center;
}

.swiper-container {
  width: 100%;
  height: 100%;
}

.swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;
  /* Tambahkan gaya sesuai kebutuhan */
}

.swipper-controll {
  width: 85%;
}

.tentang-kami .swipper .bg-scroll {
  position: absolute;
  width: 92%;
  height: 200px;
  background-color: #ffffff;
  z-index: -9;
  right: 0;
  border-radius: 10px 0 0 10px;
}

.tentang-kami .swipper .side-color {
  position: absolute;
  width: 200px;
  height: 300px;
  left: 0;
  background-color: #000000;
  box-shadow: 10px 0 150px black;
  border-radius: 0 20px 20px 0;
  z-index: -10;
}

.tentang-kami .swipper .ring {
  position: absolute;
  width: 450px;
  height: 450px;
  border: 1px solid #000000;
  border-radius: 50%;
  z-index: -10;
  left: -190px;
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
  background: rgba(0, 0, 0, 0.4);
  /* Adjust opacity as needed */
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

footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  /* align-items: center; */
  background: linear-gradient(180deg, #d9d9d9 0%, #02163b 100%);
  padding: 10px;
}

footer h1 {
  font-size: 4rem;
  width: 100%;
  text-align: center;
  color: black;
}

footer li {
  list-style: none;
  text-align: center;
}

footer a {
  color: #c1c1c1;
  text-decoration: none;
  transition: 700ms;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

footer i {
  font-size: 1.5rem;
}

footer li h1 {
  font-size: 2rem;
  color: #c1c1c1;
  text-align: justify;
}

footer a:hover {
  color: #ffffff;
}

footer p {
  color: #c1c1c1;
  text-align: center;
  width: 100%;
  font-size: small;
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

/* Add these new styles */
.load-more-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.load-more-btn {
  padding: 12px 32px;
  font-size: 1rem;
  font-weight: 600;
  border: 2px solid #e8ba38;
  color: #e8ba38;
  background-color: transparent;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-more-btn:hover {
  background-color: #02163b;
  color: white;
  border-color: transparent;
}
</style>