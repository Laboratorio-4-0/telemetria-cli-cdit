<script lang="ts" setup>
import { SharedImages } from '../images';

</script>
<template>
    <div class="wrapper">
    <div class="main">
      <main class="content animate__animated animate__fadeIn">
        <div class="container-fluid p-4">
          <div class="mb-3">
            <h1 class="h4 d-inline align-middle" style="color: dimgray">
             Servicio no disponible
            </h1>
            <hr />
          </div>
          <div class="row justify-content-center d-flex my-4 text-center">
              <img :src="SharedImages.NotAvailable" alt="">
              <p class="fs-2 mt-5">Por el momento el servicio no está disponible, <br> puede que esté deshabilitado o en mantenimiento.</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
img{
    width: 25%;
    border-radius: 50%;
}
</style>