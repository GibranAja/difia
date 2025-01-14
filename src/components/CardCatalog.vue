<template>
  <div class="card">
    <img src="../assets/difia.jpg" alt="foto-produk">
    <h1><b>Difia</b></h1>
    <a href="">Detail</a>
  </div>
</template>

<script>
  export default {

  }
</script>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  padding: 10px;
  background-color: white;
}
.card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 5px;
  border: 1px solid #A79277;
}
.card h1 {
  font-size: 2rem;
  margin: 10px 0;
  color: #A79277;
}
.card a{
  text-decoration: none;
  color: black;
  transition: all 700ms;
  background-color: #A79277;
  padding: 10px;
  border-radius: 100px;
}
</style>
