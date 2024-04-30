<script lang="ts" setup>
import { AuthService } from '../services/auth-service'
import { RouterLink } from 'vue-router'
import { SharedImages } from '../images'
import { buildErrorMessage } from '../utils/error-handler'
import { useModalMessage } from '../store/useModalMessage'
import router from '../router'
import { useUserStore } from '@/modules/svc-usuarios/store/useUserStore'
import { ref } from 'vue'
import CustomLoading from './CustomLoading.vue'
import { useCookies } from 'vue3-cookies'
import { CookieNames } from '../types/jwt'
import type { UserInformationJwtPayload } from '../types/jwt'
import { getUserPayloadFromToken, isUserDependenciaAllowed } from '../utils/jwt-decode'
import { UserType } from '@/modules/svc-usuarios/types/users'
import { ListaDependencias } from '../types/dependencias'

const informacionUsuarioToken = ref<UserInformationJwtPayload>(getUserPayloadFromToken()!)

//Para mostrar el contenido del SideBar
let show = ref<boolean>(false)

function showContenidoSidebar() {
  show.value = !show.value
}

const useModal = useModalMessage()
const userStore = useUserStore()
const authService = new AuthService()
let cerrandoSession = ref(false)
async function cerrarSesion() {
  try {
    cerrandoSession.value = true
    await authService.cerrarSesion()
    // Borrar cookies
    useCookies().cookies.remove(CookieNames.SessionCookieName)
    useCookies().cookies.remove(CookieNames.RefreshTokenCookieName)
    useCookies().cookies.remove(CookieNames.SessionTokenId)
    cerrandoSession.value = false
    router.push({ name: 'login' })
  } catch (error) {
    cerrandoSession.value = false
    const message = buildErrorMessage(error)
    useModal.setMessage({
      title: 'Error al cerrar sesión',
      message: message,
      image: SharedImages.ErrorImage
    })
    await useModal.showModal()
  }
}

//Para el estilo del avatar
let estiloAvatar = {
  width: '25px',
  height: '25px',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  display: 'inline-flex',
  backgroundColor: userStore.colorAleatorio
}
</script>
<template>
  <CustomLoading v-if="cerrandoSession" :message="'Cerrando sesión, espere...'" />
  <nav v-else class="navbar navbar-expand-lg navbar-light navbar-bg">
    <span class="lab4"> &nbsp;&nbsp;Laboratorio de Industria 4.0 </span>
    <button
      class="navbar-toggler estilo-boton"
      type="button"
      @click="showContenidoSidebar()"
      data-toggle="collapse"
      data-target="#contenidoSidebar"
      aria-controls="navbarTogglerDemoLab40"
      aria-expanded="false"
      aria-label="Toggle navigation"
      style="border-color: rgb(254, 254, 254); box-shadow: none"
    >
      <i class="bi bi-list" style="color: #ffffff"></i>
    </button>

    <div class="collapse navbar-collapse">
      <ul class="navbar-nav navbar-align">
        <li class="nav-item dropdown">
          <a
            class="nav-icon dropdown-toggle d-inline-block d-sm-none"
            href="#"
            data-bs-toggle="dropdown"
          >
            <i class="align-middle" data-feather="settings"></i>
          </a>
          <a
            class="nav-link dropdown-toggle d-none d-sm-inline-block nombreUsuario"
            href="#"
            data-bs-toggle="dropdown"
          >
            <span class="">{{
              `${userStore.user.nombre} ${userStore.user.apellidoPaterno} ${userStore.user.apellidoMaterno}`
            }}</span>
            &nbsp;
            <span class="avatar-text" :style="estiloAvatar">
              {{ userStore.user.nombre.charAt(0) }}
            </span>
            &nbsp;
          </a>
          <div class="dropdown-menu dropdown-menu-end">
            <router-link tag="li" :to="{ name: 'profile' }">
              <a class="sidebar-link">
                <span class="align-middle" style="color: #424242"
                  ><i class="bi bi-person-circle" style="color: #424242"></i>Mi perfil</span
                >
              </a>
            </router-link>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item btn btn-secondary" @click="cerrarSesion()">
              <span class="align-middle" style="color: #424242"
                ><i class="bi bi-box-arrow-in-left"></i> Cerrar sesión</span
              >
            </button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Elementos a mostrar cuando el sidebar colapsa -->
    <div v-if="show" class="collapse navbar-collapse" id="contenidoSidebar">
      <hr style="color: #ffffff" />
      <ul class="sidebar-nav">
        <!-- Seccion de inicio -->
        <li class="estilos-de-menu-secundario">&emsp;Inicio</li>
        <!-- Dashboard -->
        <router-link
          v-if="informacionUsuarioToken?.rol == UserType.Admin"
          tag="li"
          active-class="sidebar-item active"
          :to="{ name: 'home' }"
          exact
        >
          <a class="estilos-de-menu-secundario">
            <i class="align-middle" data-feather="sliders"></i>
            <span class="align-middle" @click="showContenidoSidebar()"
              >&emsp;&emsp;<i class="bi bi-terminal-dash"></i> Dashboard</span
            >
          </a>
          <br />
        </router-link>
        <!-- Mi perfil -->
        <router-link tag="li" active-class="sidebar-item active" :to="{ name: 'profile' }">
          <a class="estilos-de-menu-secundario">
            <i class="align-middle" data-feather="sliders"></i>
            <span class="align-middle" @click="showContenidoSidebar()"
              >&emsp;&emsp;<i class="bi bi-person-circle"></i> Mi perfil</span
            >
          </a>
        </router-link>
        <br /><br />

        <!-- Seccion de servicios -->
        <li class="estilos-de-menu-secundario">&emsp;Servicios</li>
        <!-- Tren Ligero -->
        <router-link
          v-if="isUserDependenciaAllowed(ListaDependencias.TrenLigero)"
          tag="li"
          active-class="sidebar-item active"
          :to="{ name: 'mapa-tren-ligero' }"
        >
          <a class="estilos-de-menu-secundario">
            <i class="align-middle" data-feather="sliders"></i>
            <span class="align-middle" @click="showContenidoSidebar()"
              >&emsp;&emsp;<i class="bi bi-bus-front"></i> Tren Ligero</span
            >
          </a>
          <br />
        </router-link>
        <!-- Sensores -->
        <router-link
          v-if="isUserDependenciaAllowed(ListaDependencias.Sensores)"
          tag="li"
          active-class="sidebar-item active"
          :to="{ name: 'home-sensores' }"
        >
          <a class="estilos-de-menu-secundario">
            <i class="align-middle" data-feather="sliders"></i>
            <span class="align-middle" @click="showContenidoSidebar()"
              >&emsp;&emsp;<i class="bi bi-pie-chart-fill"></i> Sensores
            </span>
          </a>
          <br />
        </router-link>
        <!-- Alcantarillas -->
        <li class="sidebar-item">
          <router-link
            v-if="isUserDependenciaAllowed(ListaDependencias.Alcantarillas)"
            tag="li"
            active-class="sidebar-item active"
            :to="{ name: 'home-alcantarillas' }"
          >
            <a class="estilos-de-menu-secundario" href="charts-chartjs.html">
              <i class="align-middle" data-feather="sliders"></i>
              <span class="align-middle" @click="showContenidoSidebar()"
                >&emsp;&emsp;<i class="bi bi-router"></i> Alcantarillas</span
              >
            </a>
          </router-link>
          <br /><br />
        </li>

        <!-- Seccion de administración -->
        <li
          v-if="informacionUsuarioToken?.rol == UserType.Admin"
          class="estilos-de-menu-secundario"
        >
          &emsp;Administración
        </li>
        <!-- Usuarios -->
        <li class="sidebar-item">
          <router-link
            v-if="informacionUsuarioToken?.rol == UserType.Admin"
            tag="li"
            active-class="sidebar-item active"
            :to="{ name: 'gestion-usuarios' }"
          >
            <a class="estilos-de-menu-secundario" href="charts-chartjs.html">
              <i class="align-middle" data-feather="bar-chart-2"></i>
              <span class="align-middle" @click="showContenidoSidebar()"
                >&emsp;&emsp;<i class="bi bi-person-rolodex"></i> Usuarios</span
              >
            </a>
          </router-link>
          <br />
        </li>
        <!-- Gestion de APIS -->
        <li class="sidebar-item">
          <router-link
            v-if="informacionUsuarioToken?.rol == UserType.Admin"
            tag="li"
            active-class="sidebar-item active"
            :to="{ name: 'gestion-apis' }"
          >
            <a class="estilos-de-menu-secundario" href="maps-google.html">
              <i class="align-middle" data-feather="map"></i>
              <span class="align-middle" @click="showContenidoSidebar()"
                >&emsp;&emsp;<i class="bi bi-plugin"></i> Gestión de API's
              </span>
            </a>
          </router-link>
          <br /><br />
        </li>
        <!-- Cerrar sesion -->
        <button class="dropdown-item btn btn-secondary" @click="cerrarSesion()">
          <a class="estilos-de-menu-secundario">
            <i class="align-middle" data-feather="sliders"></i>
            <span class="align-middle"
              >&emsp;<i class="bi bi-box-arrow-in-left"></i> Cerrar sesión</span
            >
          </a>
        </button>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.fotoPerfil {
  width: 25px;
  /* Anchura deseada */
  height: 25px;
  /* Altura deseada */
}

.lab4 {
  /*font-size: 13px;*/
  color: white;
  font-weight: bold;
  /*font-family: "Ubuntu", Arial, sans-serif;*/
}
.nombreUsuario {
  color: white;
}
.nombreUsuario:hover {
  color: white;
}
.nombreUsuario:active {
  color: white;
}
.bhover:hover {
  cursor: pointer;
}
.avatar-text {
  font-family: 'Source Sans Pro', sans-serif;
  color: #ffffff;
}
.estilos-de-menu-secundario {
  text-decoration: none;
  color: #ffffff;
  font-size: 13px;
}
</style>
