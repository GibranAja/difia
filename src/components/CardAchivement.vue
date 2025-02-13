<template>
  <div class="card">
    <div class="picture">
      <img src="../assets/difia.jpg" alt="">
    </div>
    <div class="text">
      <h1>Nama Penghargaan</h1>
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae, obcaecati!</p>
    </div>
  </div>
</template>
<script>
export default {

}
</script>
<style scoped>
.card{
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-around;
  width: 33%;
  background-color: white;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 0 20px black;
}
.card .picture img{
  width: 100px;
  border-radius: 10px;
}
.card .text{
  width: 60%;
  text-align: justify;
}
.card .picture{
  width: 30%;
}
</style>
