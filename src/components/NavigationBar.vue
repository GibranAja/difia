<template>
  <nav>
    <div class="link">
      <a href="">Beranda</a>
      <a href="">Tentang Kami</a>
      <a href="">Katalog</a>
      <a href="">Blog</a>
    </div>

    <a href="">
      <i class="fas fa-bell"></i>
    </a>

    <!-- Show login button when user is not logged in -->
    <template v-if="!authStore.isLoggedIn">
      <a href="/login" class="masuk">Login</a>
    </template>

    <!-- Show user icon and logout when user is logged in -->
    <template v-if="authStore.isLoggedIn">
      <div class="login">
        <a href="">
          <i class="fas fa-circle-user"></i>
        </a>
        <a href="#" class="keluar" @click.prevent="handleLogout">Log out</a>
      </div>
    </template>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/AuthStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logoutUser(router)
}
</script>

<style scoped>
nav {
  display: flex;
  flex-wrap: wrap;
  position: fixed;
  top: 0;
  width: 100%;
  padding: 10px;
  z-index: 999;
  justify-content: space-around;
  align-items: center;
  font-family: 'Times New Roman', Times, serif;
}

.link {
  display: flex;
  gap: 100px;
  align-items: center;
  justify-content: center;
  border-radius: 100px;
  background-color: #D1BB9E;
  padding: 10px;
  width: 60%;
  font-size: large;
}

a {
  text-decoration: none;
  color: black;
  padding: 10px;
  transition: all 700ms;
}

a.masuk {
  background-color: #D1BB9E;
  padding: 10px;
  border-radius: 10px;
  width: 10%;
  text-align: center;
}

.login {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  width: 15%;
  /* background-color: #D1BB9E; */
  padding: 10px;
  border-radius: 100px;
}

i {
  color: white;
  transition: all 700ms;
  font-size: xx-large;
}

i:hover {
  color: #D1BB9E;
}

a.keluar {
  background-color: #D1BB9E;
  padding: 10px;
  border-radius: 100px;
}

a.keluar:hover {
  color: #A79277;
  background-color: white;
  border-radius: 100px;
  border: solid 1px #A79277;
}

a.masuk:hover {
  color: #A79277;
  background-color: white;
  border-radius: 100px;
  border: solid 1px #A79277;
}

.link a:hover {
  color: white;
  background-color: #A79277;
  border-radius: 100px;
  padding: 10px;
}

a.keluar {
  color: white;
  background-color: #D1BB9E;
  text-align: center;
  padding: 14px;
  width: 100px;
  border-radius: 100px;
}
</style>
