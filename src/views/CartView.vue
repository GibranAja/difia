<template>
  <main class="cart-view">
    <a href="/" class="back">
      <i class="fas fa-arrow-left"></i>
    </a>
    <h1 class="judul">Keranjang</h1>
    <section class="product-list">
      <div class="card">
        <div class="product-img">
          <img src="../assets/bg-footer.jpeg" alt="Product">
        </div>
        <div class="text">
          <p class="head">Pouch</p>
          <div class="edit">
            <input type="number" name="" id="">
            <p>Rp 69.000</p>
          </div>
          <p class="nilai">Rp 69.000</p>
          <a href="">
            <i class="fas fa-trash"></i>
          </a>
        </div>
      </div>
    </section>
    <section class="Resi">
      <h1>Total Pembelian</h1>
      <p>Subtotal</p>
      <p class="right">Rp 69.000</p>
      <p>pengiriman</p>
      <p class="right">jne</p>
      <span class="arrow"></span>
      <p><b>Total</b></p>
      <p class="right"><b>Rp 500.00</b></p>
      <a href="">Lanjutkan Ke Pembayaran</a>
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

.cart-view {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  position: relative;
  padding: 100px;
}

.back {
  position: absolute;
  left: 0;
  font-size: xx-large;
  top: 10px;
  color: black;
  padding: 10px;
}

.product-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  width: 50%;
  border-radius: 10px;
  background-color: white;
  padding: 10px;
  box-shadow: 0 4px 5px rgba(0, 0, 0, 0.1);
}

.card img {
  width: 130px;
  border-radius: 10px;
}

.text {
  width: 70%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  /* gap: 0.5px; */
  /* white-space: nowrap; */
  word-spacing: 1px;
  letter-spacing: 1px;
}

.product-img {
  width: 20%;
}

.card {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: 10px;
  align-items: center;
  width: 100%;
  background-color: white;
  box-shadow: 0 4px 5px rgba(0, 0, 0, 0.1);
  position: relative;
}

.card p {
  width: 50%;
  text-align: left;
  padding: 10px;
}

.card input {
  width: 50px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid black;
}

.card a {
  position: absolute;
  right: 0;
  bottom: 0;
  font-size: x-large;
  padding: 10px;
  color: black;
}

.card .edit {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  width: 90%;
}

.edit p {
  width: 50%;
  text-align: right;
}

.card .head {
  width: 100%;
  text-align: left;
  padding: 10px;
  font-size: xx-large;

}
.text .nilai{
  width: 100%;
  text-align: left;
  font-size: large;
}
.edit p{
  font-size: x-large;
}
.judul {
  width: 100%;
  text-align: left;
  padding: 10px;
}

.Resi {
  width: 30%;
  background-color: white;
  padding: 50px;
  border-radius: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  box-shadow: 0 5px 5px rgba(0, 0, 0, 0.1);
}



.arrow {
  width: 100%;
  border-bottom: 1px solid black;
}



.Resi a {
  text-decoration: none;
  color: white;
  background-color: #E8BA38;
  padding: 10px;
  border-radius: 100px;
  width: 100%;
  text-align: center;
}

.Resi h1 {
  width: 100%;
  text-align: center;
}

.Resi p {
  width: 50%;
}

.Resi .right {
  text-align: right;
}
</style>
