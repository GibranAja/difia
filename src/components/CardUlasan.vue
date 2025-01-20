<template>
  <div class="card">
    <div class="head">
      <img src="../assets/default-avatar-wm14gXiP.png" alt="avatar">
      <div class="bio">
        <h1>Name</h1>
        <span>1</span>
      </div>
    </div>
    <div class="keterangan">
      <img src="../assets/Logo Difia Haki.PNG" alt="">
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque obcaecati dolores cum! Esse blanditiis unde.</p>
    </div>
  </div>
</template>

<script>
export default {

}
</script>

<style scoped>
.head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.head img {
  width: 20%;
}

.card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-around;
  padding: 10px;
  width: 35%;
  border-radius: 30px;
  background-color: #d9d9d9;
}

.keterangan {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-around;
}

.keterangan img {
  width: 20%;
  border-radius: 10px;
}

.keterangan p {
  width: 70%;
}
</style>
