<script setup lang="ts">
import { SharedImages } from '../images'
</script>
<template>
  <div class="col-xl-12 col-xxl-12 text-center" style="height: 400px;">
    <img :src="SharedImages.EmptyBox" alt="" />
    <h5 class="card-title mt-1">Sin registros por el momento</h5>
  </div>
</template>

<style scoped>
img{
    width: 25%;
    border-radius: 50%;
}
</style>