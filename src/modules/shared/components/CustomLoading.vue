<script setup lang="ts">
import { SharedImages } from '../images';
const props = defineProps({
  message: String
})
</script>

<template>
  <div class="loading d-flex justify-content-center align-items-center animate__animated animate__fadeIn flex-column">
    <p class="fs-3">{{ props.message }}</p>
    <img :src="SharedImages.LoadImage" alt="">
  </div>
</template>

<style scoped>
.loading {
  background-color: rgba(249, 246, 246, 0.8);
  color: #431515;
  height: 100vh;
  left: 0;
  position: fixed;
  top: 0px;
  width: 100vw;
  z-index: 9999;
}
</style>
