<template>
  <div class="card">
    <div class="text">
      <h1>Order</h1>
      <p>Tanggal</p>
      <p>Total</p>
    </div>
    <div class="aside">
      <p>Status</p>
      <a href="">
        <i class="fas fa-chevron-down"></i>
      </a>
    </div>
  </div>
</template>
<script>
export default {

}
</script>
<style scoped>
.card {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  position: relative;
  padding: 10px;
  border: 1px solid black;
  border-radius: 10px;
}

.card .text {
  width: 80%;
}
.card .aside {
  float: right;
  display: grid;
  width: 15%;
  position: relative;
  grid-column-start: 2;
  grid-column-end: 2;
}
.card .aside a {
  font-size: x-large;
  text-decoration: none;
  color: black;
  grid-column-start: 2;
  grid-column-end: 2;
  grid-row-start: 2;
  grid-row-start: 2;
}
.card .aside p{
  background-color: blue;
  width: 50%;
  border-radius: 10px;
  padding: 10px;
  text-align: center;
  grid-column-start: 1;
  grid-column-end: 1;
  color: white;
}
</style>
