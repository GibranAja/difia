<template>
  <main>
    <div class="kepala">
      <a href="/">
        <i class="fas fa-chevron-left"></i>
      </a>
      <div class="head">
        <i class="fas fa-bag-shopping"></i>
        <h1>CHECKOUT</h1>
      </div>
    </div>

    <section class="informasi">
      <h1>Informasi Pemesanan</h1>
      <form action="">
        <label for="name">Nama</label>
        <input type="text" name="name" id="name">
        <label for="email">Email</label>
        <input type="email" name="email" id="email">
        <label for="phone">No Telp</label>
        <input type="number" name="phone" id="phone">
        <label for="address">Alamat Lengkap</label>
        <textarea name="address" id="address"></textarea>
        <div class="alamat">
          <div class="left">
            <label for="town">Kota</label>
            <select name="town" id="town"></select>
            <label for="province">Provinsi</label>
            <select name="provice" id="province"></select>
          </div>
          <div class="right">
            <label for="zip">Kode Pos</label>
            <input type="number" name="zip" id="zip">
          </div>

        </div>
        <span class="vector"></span>
        <div class="notif">
          <i class="fas fa-truck-fast"></i>
          <div class="text">
            <h1>Pengiriman via</h1>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt, sequi.</p>
          </div>

        </div>
      </form>
    </section>
    <section class="method">
      <h1>Metode Pembayaran</h1>
      <div class="other">
        <div class="class">
          <div class="select">
            <a href="">QRIS</a>
          </div>
        </div>

        <div class="qr">
          <img src="../assets/google.svg" alt="gg">
        </div>


      </div>
      <h2>Uploud bukti pembayaran</h2>
      <form action="">
        <input type="file" name="bukti" id="bukti">
      </form>
    </section>
    <section class="coupon">
      <h1>Voucher Tas</h1>
    </section>
    <section class="end">
      <h1>Ringkasan Order</h1>
      <div class="card">
        <div class="gambar">
          <img src="../assets/bg-footer.jpeg" alt="gg">
        </div>

        <div class="text">
          <h1>Pouch</h1>
          <p>20x Rp 3.300.000</p>
        </div>
      </div>
      <span class="vector"></span>
      <div class="about">
        <p>Subtotal</p>
        <p>Rp 5.300.000</p>
      </div>
      <div class="about">
        <p>Pengiriman</p>
        <p>Rp 50.000</p>
      </div>


      <span class="vector"></span>
      <div class="about">
        <p><b>Total</b></p>
        <p><b>Rp 5.300.000</b></p>
      </div>

      <a href="">Bayar Sekarang</a>
      <p>Dengan melakukan pembayaran, Anda menyetujui Syarat & Ketentuan kami</p>
    </section>
  </main>
</template>
<script>
export default {

}
</script>
<style scoped>
body {
  background-color: #f5f5f5;
}

main {
  padding: 100px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  gap: 10px;
}

.informasi {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  position: relative;
  padding: 100px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 5px rgba(0, 0, 0, 0.1);
  gap: 10px;
  width: 100%;
}

.informasi h1 {
  width: 100%;
}

.informasi form {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  gap: 10px;
}

.informasi label {
  font-size: 20px;
  width: 100%;
}

.informasi input {
  width: 100%;
  border-radius: 5px;
  border-style: none;
  border: 1px solid #d9d9d9;
  background-color: #f5f5f5;
  padding: 10px;
}

.informasi textarea {
  width: 100%;
  border-radius: 5px;
  border-style: none;
  border: 1px solid #d9d9d9;
  background-color: #f5f5f5;
}

.informasi select {
  width: 100%;
  border-radius: 5px;
  border-style: none;
  border: 1px solid #d9d9d9;
  background-color: #f5f5f5;
  padding: 10px;
}

.informasi .alamat {
  display: grid;
  width: 100%;
  gap: 10px;
}

.alamat .left {
  grid-column-start: 1;
  grid-column-end: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.right {
  grid-column-start: 2;
  grid-column-end: 2;
}

.vector {
  width: 100%;
  height: 1px;
  background-color: #d9d9d9;
  margin: 20px 0;
}

.notif {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  background-color: rgba(0, 247, 255, 0.296);
  padding: 10px;
  border-radius: 10px;
  border-style: 1px solid #00e1ff;
}

.notif i {
  font-size: 50px;
  width: 10%;
}

.text {
  width: 90%;
}

.method {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  position: relative;
  padding: 100px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 5px rgba(0, 0, 0, 0.1);
  gap: 10px;
  width: 100%;
}

.method h1 {
  width: 100%;
}

.other {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
}

.other a {
  text-decoration: none;
  text-align: center;
  padding: 5px;
  border-radius: 10px;
  background-color: #f5f5f5;
  color: black;
  font-size: 20px;
  text-align: center;
  width: 120px;
}

.select {
  width: 120px;
  text-align: center;
  background-color: #d9d9d9;
  padding: 10px;
  border-radius: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.class {
  width: 100%;
  text-align: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.other img {
  width: 300px;
}

.qr {
  width: 100%;
  text-align: center;
  padding: 10px;
}

.method h2 {
  width: 100%;
}

.method form {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
}

.method input {
  width: 100%;
  padding: 100px;
  text-align: center;
  border-radius: 5px;
  border-style: dashed;
  border: 1px dashed #d9d9d9;
  background-color: #f5f5f5;
}

.coupon {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  position: relative;
  padding: 100px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 5px rgba(0, 0, 0, 0.1);
  gap: 10px;
  width: 100%;
}

.coupon h1 {
  width: 100%;
}

.end {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  position: relative;
  padding: 100px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 5px rgba(0, 0, 0, 0.1);
  gap: 20px;
  width: 100%;
}

.end h1 {
  width: 100%;
}

.end .card {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  gap: 10px;
  width: 100%;
  background-color: #f5f5f5;
  box-shadow: 0 4px 5px rgba(0, 0, 0, 0.1);
  position: relative;
  border-radius: 10px;
}

.card img {
  width: 130px;
  border-radius: 10px;
  border: 2px solid #d9d9d9;
}

.card .text {
  width: 70%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  /* gap: 0.5px; */
  /* white-space: nowrap; */
  word-spacing: 1px;
  letter-spacing: 1px;
}

.card .gambar {
  width: 20%;
}

.about {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  width: 100%;
}

.end a {
  text-decoration: none;
  text-align: center;
  padding: 5px;
  border-radius: 10px;
  background-color: #E8BA38;
  border: 1px solid black;
  color: white;
  font-size: 20px;
  text-align: center;
  width: 100%;
}
.kepala{
  position: absolute;
  top: 1px;
  left: 1px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  width: 100%;
}
.kepala a{
  text-decoration: none;
  color: black;
  font-size: 30px;
  padding: 10px;

}
.head{
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.head i{
  font-size: 30px;
  color: #E8BA38;
}
</style>
