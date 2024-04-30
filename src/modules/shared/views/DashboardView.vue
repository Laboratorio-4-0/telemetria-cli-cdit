<script lang="ts" setup>
import { RouterView } from 'vue-router'
import Navbar from '@/modules/shared/components/Navbar.vue'
import Footer from '@/modules/shared/components/Footer.vue'
import SideBar from '@/modules/shared/components/SideBar.vue'
import { onMounted, ref } from 'vue'
import { useModalMessage } from '@/modules/shared/store/useModalMessage'
import { buildErrorMessage } from '@/modules/shared/utils/error-handler'
import { SharedImages } from '@/modules/shared/images'
import { UserService } from '../../svc-usuarios/services/user-service'
import type { UserModel } from '@/modules/svc-usuarios/types/users'
import { useUserStore } from '@/modules/svc-usuarios/store/useUserStore'
import CustomLoadingVue from '@/modules/shared/components/CustomLoading.vue'
import { getUserPayloadFromToken } from '../../shared/utils/jwt-decode'

// Servicios
const userService = new UserService()

// Modales
const useModal = useModalMessage()

const userStore = useUserStore()

const cargandoStore = ref<boolean>(false)

async function getUserById() {
  try {
    cargandoStore.value = true
    const { uid } = getUserPayloadFromToken()
    const response = await userService.recuperarUsuarioById(uid)
    const userInfoId: UserModel = <UserModel>response.data.data
    userStore.setUserProps(userInfoId)
    cargandoStore.value = false
  } catch (error) {
    cargandoStore.value = false
    const message = buildErrorMessage(error)
    useModal.setMessage({
      title: 'Error al recuperar usuario por ID',
      message: message,
      image: SharedImages.ErrorImage
    })
    await useModal.showModal()
  }
}

onMounted(async () => {
  await getUserById()
})
</script>

<template>
  <CustomLoadingVue v-if="cargandoStore" :message="'Obteniendo datos del usuario...'" />
  <div class="wrapper" v-else>
    <SideBar />
    <div class="main">
      <Navbar />
      <main class="content">
        <RouterView />
      </main>
      <!--<Footer />-->
    </div>
  </div>
</template>
