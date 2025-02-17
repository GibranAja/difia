<template>
  <section>
    <main>
      <form action="">
        <input type="search" name="search" id="search" placeholder="Cari Berdasarkan ID atau status pesanan">
      </form>
      <div class="card-container">
        <CardNotification></CardNotification>
      </div>
    </main>
  </section>
</template>
<script setup>
import CardNotification from '@/components/CardNotification.vue';



</script>
<style scoped>
form input{
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 10px;
  border: 1px solid black;
}
form{
  padding: 10px;
}
.card-container{
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
}
</style>
