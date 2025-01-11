<template>
  <header>
    <div class="judul">
      <h1>DIFIA</h1>
      <p> Tas Berkualitas untuk Setiap Momen Spesial Anda.</p>
      <a href="">Chat Kami</a>
    </div>
    <div class="carousel">
      <img src="../assets/default-avatar-wm14gXiP.png" alt="foto-katalog">
      <!-- <img src="../assets/header-dott.png" alt="background-katalog" class="background"> -->
    </div>
  </header>
  <NavigationBar :showLogout="isLoggedIn" @logout="handleLogout"></NavigationBar>
  <main>
    <section class="tentang-kami">
      <div class="gambar">
        <img src="../assets/header-dott.png" alt="background-tentang-kami" class="hiasan">
        <img src="../assets/default-avatar-wm14gXiP.png" alt="foto-tentang-kami">
      </div>
      <div class="text">
        <h1>TENTANG KAMI</h1>
        <p>
          Difia sebuah brand lokal yang berdiri sejak 20 Agustus 2020.Pada saat Puncak pandemi covid-19,Perusahaan ini
          berbasis perorangan tergolong UMKM Home Industry di bidang fashion berbahan baku kulit sintetis diolah menjadi
          sendal dan tas terletak di kota Bogor
        </p>
      </div>


    </section>
  </main>
</template>

<script setup>
import NavigationBar from '@/components/NavigationBar.vue';
import { useAuthStore } from '@/stores/AuthStore';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const isLoggedIn = computed(() => authStore.isLoggedIn);

const handleLogout = async () => {
  try {
    await authStore.logoutUser(router);
  } catch (error) {
    console.error('Logout error:', error);
  }
};

</script>

<style scoped>
header {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  padding: 200px;
  font-family: 'Times New Roman', Times, serif;
}

.judul a {
  color: white;
  text-decoration: none;
  background-color: #AB886D;
  padding: 10px;
  border-radius: 100px;
  transition: all 700ms;
  font-size: x-large;
}

.judul a:hover {
  background-color: #F2E9E4;
  color: #AB886D;
}

.judul {
  width: 50%;
}
.judul h1 {
  font-size: 5rem;
}
.judul p {
  font-size: 1.5rem;
}

.carousel {
  background-image: url('../assets/header-dott.png');
  width: 50%;
  justify-content: center;
  align-items: center;
  text-align: center;
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
  padding: 100px;
}
.tentang-kami .gambar {
  width: 30%;
  background-color: #EAD8C0;
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
  left: 110px;
  bottom: -350px;
}
</style>
