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
             Sin servicio de mapas Mapbox
            </h1>
            <hr />
          </div>
          <div class="row justify-content-center d-flex my-4 text-center">
              <img :src="SharedImages.NotMapService" alt="">
              <p class="fs-2 mt-5">No se encontró un servicio de mapas registrado en el sistema. <br> Para vincular el servicio de mapas, <br> Asegúrate de proporcionar el <i>Access token API key</i> de <a href="https://docs.mapbox.com/api/accounts/tokens/">Mapbox</a> con el administrador. <br> </p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
img{
    width: 20%;
    border-radius: 30%;
}
</style>