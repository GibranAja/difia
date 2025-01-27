<template>
  <div class="detail-view">
    <div class="gambar-detail">
      <a href="" class="back"> <i class="fas fa-arrow-left"></i></a>
      <h1>Agenda</h1>
      <img src="../assets/Logo Difia Haki.PNG" alt="Example Image" />
      <a href="" class="hub">Hubungi Kami</a>
      <h1>Kunjungi Toko Kami:</h1>
      <div class="sosmed-link">
        <a href="" class="sosmed"><i class="fas fa-brands fa-instagram"></i>DIFIA.ID</a>
        <a href="" class="sosmed"><i class="fas fa-bag-shopping"></i>DIFIA OFFICIAL SHOP</a>
      </div>
    </div>
    <div class="detail-keterangan">
      <h1>Harga Per-Pcs</h1>
      <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores optio nulla laudantium culpa quae iusto,
        laboriosam corporis totam veniam nesciunt harum porro expedita asperiores tenetur voluptatibus alias voluptates,
        magnam quia esse. Dolorum qui maiores eaque minima cum! Quo, exercitationem amet.</p>
      <h1>DETAIL</h1>
      <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores optio nulla laudantium culpa quae iusto,
        laboriosam corporis totam veniam nesciunt harum porro expedita asperiores tenetur voluptatibus alias voluptates,
        magnam quia esse. Dolorum qui maiores eaque minima cum! Quo, exercitationem amet.</p>
      <h1>WAKTU PENGERJAAN</h1>
      <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores optio nulla laudantium culpa quae iusto,
        laboriosam corporis totam veniam nesciunt harum porro expedita asperiores tenetur voluptatibus alias voluptates,
        magnam quia esse. Dolorum qui maiores eaque minima cum! Quo, exercitationem amet.</p>
    </div>
  </div>
</template>
<script>
export default {

}
</script>
<style scoped>
.detail-view {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  font-family: 'Montserrat', sans-serif;
  background-color: #d9d9d9;
}

i {
  font-size: xx-large;
  color: #E8BA38;
  margin-right: 10px;
}

.gambar-detail {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  width: 35vw;
  gap: 10px;
  padding: 100px;
  height: 100vw;
}

.gambar-detail img {
  width: 500px;
  height: 500px;
  object-fit: cover;
  border-radius: 5px;
}

.gambar-detail a {
  text-decoration: none;
  color: black;
  padding: 10px;
  transition: all 700ms;
}

.gambar-detail h1 {
  width: 100%;
  font-size: xx-large;
}

.gambar-detail .hub {
  background-color: #E8BA38;
  padding: 10px;
  border-radius: 100px;
  width: 180px;
  text-align: center;
  color: white;
}

.gambar-detail .sosmed {
  padding: 10px;
  border-radius: 100px;
  width: 45%;
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.gambar-detail .sosmed-link {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  width: 100%;
}

.gambar-detail .sosmed i {
  font-size: x-large;
  width: 15%;
  text-align: center;
  padding: 10px;
  background-color: #E8BA38;
  color: white;
  border-radius: 100%;
}

.gambar-detail .sosmed a {
  width: 33%;
}

.detail-keterangan {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  width: 32.3vw;
  padding: 100px;
  height: 100vw;
  background-color: white;
  box-shadow: gray -20px 0px 25px -5px;
}
.detail-keterangan h1 {
  font-size: 2rem;
  color: white;
  background-color: #02163B;
  padding: 10px;
  width: 100%;
  text-align: center;
}
.detail-keterangan p {
  padding: 10px;
  font-size: 1.2rem;
  text-align: justify;
}

body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.back {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
