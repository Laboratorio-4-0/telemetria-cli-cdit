<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { UserInformationJwtPayload } from '../types/jwt';
import { ref } from 'vue';
import { getUserPayloadFromToken, isUserDependenciaAllowed } from '../utils/jwt-decode';
import { UserType } from '@/modules/svc-usuarios/types/users';
import { ListaDependencias } from '../types/dependencias';
const informacionUsuarioToken = ref<UserInformationJwtPayload>(getUserPayloadFromToken()!)

</script>
<template>
  <nav id="sidebar" class="sidebar js-sidebar">
    <div class="sidebar-content js-simplebar">
      <a class="sidebar-brand" href="index.html">
        <span class="align-middle">
          
          <i class="icono_cabecera"></i>
        </span>
      </a>

      <div style="text-align: center;">
        <hr style="width: 80%; margin-left: auto; margin-right: auto;" />
      </div>

      <ul class="sidebar-nav">
        <li class="sidebar-header" style="color:#424242;">Inicio</li>

        <router-link v-if="informacionUsuarioToken?.rol == UserType.Admin" tag="li" active-class="sidebar-item active" :to="{ name: 'home' }" exact>
          <a class="sidebar-link">
            <i class="align-middle" data-feather="sliders"></i>
            <span class="align-middle" style="color:#424242;"><i class="bi bi-terminal-dash" style="color:#424242;"></i> Dashboard </span>
          </a>
        </router-link>

        <router-link tag="li" active-class="sidebar-item active" :to="{ name: 'profile' }">
          <a class="sidebar-link">
            <i class="align-middle" data-feather="sliders"></i>
            <span class="align-middle" style="color:#424242;"><i class="bi bi-person-circle" style="color:#424242;"></i> Mi perfil</span>
          </a>
        </router-link>

        <li class="sidebar-header" style="color:#424242;">Servicios</li>

        <router-link v-if="isUserDependenciaAllowed(ListaDependencias.TrenLigero)" tag="li" active-class="sidebar-item active" :to="{ name: 'mapa-tren-ligero' }">
          <a class="sidebar-link">
            <i class="align-middle" data-feather="sliders"></i>
            <span class="align-middle" style="color:#424242;"> <i class="bi bi-bus-front" style="color:#424242;"></i> Tren Ligero</span>
          </a>
        </router-link>

        <router-link v-if="isUserDependenciaAllowed(ListaDependencias.Sensores)" tag="li" active-class="sidebar-item active" :to="{ name: 'home-sensores' }">
          <a class="sidebar-link">
            <i class="align-middle" data-feather="sliders"></i>
            <span class="align-middle" style="color:#424242;"> <i class="bi bi-pie-chart-fill" style="color:#424242;"></i> Sensores </span>
          </a>
        </router-link>

        <li class="sidebar-item">
          <router-link v-if="isUserDependenciaAllowed(ListaDependencias.Alcantarillas)" tag="li" active-class="sidebar-item active" :to="{ name: 'home-alcantarillas' }">
            <a class="sidebar-link" href="charts-chartjs.html">
              <i class="align-middle" data-feather="sliders"></i>
              <span class="align-middle" style="color:#424242;">
                <i class="bi bi-router" style="color:#424242;" ></i>Alcantarillas
                </span>
            </a>
          </router-link>
        </li>

        <li v-if="informacionUsuarioToken?.rol == UserType.Admin" class="sidebar-header" style="color:#424242;">Administración</li>

        <li class="sidebar-item">
          <router-link v-if="informacionUsuarioToken?.rol == UserType.Admin" tag="li" active-class="sidebar-item active" :to="{ name: 'gestion-usuarios' }">
            <a class="sidebar-link" href="charts-chartjs.html">
              <i class="align-middle" data-feather="bar-chart-2"></i>
              <span class="align-middle" style="color:#424242;">
                <i class="bi bi-person-rolodex" style="color:#424242;"></i>Usuarios 
                </span>
            </a>
          </router-link>
        </li>

        <li class="sidebar-item">
          <router-link v-if="informacionUsuarioToken?.rol == UserType.Admin" tag="li" active-class="sidebar-item active" :to="{ name: 'gestion-apis' }">
            <a class="sidebar-link" href="maps-google.html">
              <i class="align-middle" data-feather="map"></i>
              <span class="align-middle" style="color:#424242;"> <i class="bi bi-plugin" style="color:#424242;"></i>Gestión de API's </span>
            </a>            
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
a {
  text-decoration: none;
}

.icono_cabecera{
  display: inline-block;
  width: 150px; /* Ancho de la imagen */
  height: 50px; /* Alto de la imagen */
  background: url("../images/media/barra_cabecera.png") no-repeat center center; /* Ruta de la imagen y configuración del fondo */
  background-size: cover; /* Ajustar la imagen al tamaño del contenedor */

}

</style>

