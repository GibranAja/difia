<!--  views/LoginPage.vue -->
<template>
  <div class="login-container">
    <AuthComponent :isLogin="true" />
  </div>
</template>

<script setup>
import AuthComponent from '@/components/AuthComponent.vue'
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #ffffff;
}
</style>