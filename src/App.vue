<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
// import { computed } from 'vue';
// import { useRoute } from 'vue-router';

// const route = useRoute();

// Hide chat in admin pages
</script>

<style>
  body {
    margin: 0;
    padding: 0;
    font-family: 'Poppins', sans-serif;
    overflow-x: hidden;
    background-color: white ;
  }
</style>
