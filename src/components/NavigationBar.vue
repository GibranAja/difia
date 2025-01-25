<template>
  <nav>
    <div class="link">
      <a href=""><b>Beranda</b></a>
      <a href=""><b>Tentang Kami</b></a>
      <a href=""><b>Katalog</b></a>
      <a href=""><b>Artikel</b></a>
    </div>

    <a href="">
      <i class="fas fa-bell"></i>
    </a>

    <a href="">
      <i class="fas fa-cart-shopping"></i>
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
        <a href="" class="keluar" @click.prevent="handleLogout">Log out</a>
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
  gap: 5px;
  z-index: 10;
  justify-content: space-around;
  align-items: center;
  font-family: 'Montserrat', sans-serif;
}

.link {
  display: flex;
  gap: 50px;
  align-items: center;
  justify-content: center;
  border-radius: 100px;
  background-color: #02163b;
  padding: 5px;
  width: 60%;
  font-size: large;
}

.link a{
  font-size: xx-large;
}

a {
  text-decoration: none;
  color: white;
  padding: 10px;
  transition: all 700ms;
}

a.masuk {
  background-color: #e8ba38;
  padding: 10px;
  border-radius: 10px;
  width: 10%;
  text-align: center;
}

.login {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  width: 25%;
  gap: 50px;
  /* background-color: #D1BB9E; */
  padding: 10px;
  border-radius: 100px;
}

i {
  color: #e8ba38;
  transition: all 700ms;
  font-size: 3rem;
}

i:hover {
  color: #02163b;
}



a.keluar:hover {
  color: #e8ba38;
  background-color: white;
  border-radius: 100px;
  border: solid 1px #e8ba38;
}

a.masuk:hover {
  color: #e8ba38;
  background-color: white;
  border-radius: 100px;
  border: solid 1px #e8ba38;
}

.link a:hover {
  /* color: #e8ba38; */
  background-color: #e8ba38;
  border-radius: 100px;
  padding: 10px;
}

a.keluar {
  color: white;
  background-color: #e8ba38;
  text-align: center;
  padding: 10px;
  width: 120px;
  height: 20px;
  border-radius: 50px;
  justify-content: center;
  align-items: center;
  display: flex;
}
</style>
