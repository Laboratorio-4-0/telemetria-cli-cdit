<script lang="ts" setup>
import NotAvailableVue from '@/modules/shared/components/NotAvailable.vue'
import NotMapApiKeyVue from '@/modules/shared/components/NotMapApiKeyService.vue'
import { getUserPayloadFromToken } from '@/modules/shared/utils/jwt-decode'
import { UserType } from '@/modules/svc-usuarios/types/users'
import { RouterView } from 'vue-router'
import { ref, onMounted } from 'vue'
import { isDependenciaInactiva } from '@/modules/shared/utils/validate-status-dependencia'
import { ListaDependencias } from '@/modules/shared/types/dependencias'
import CustomLoading from '@/modules/shared/components/CustomLoading.vue'
import { ApikeyService } from '@/modules/svc-usuarios/services/apikeys-service'
import { useAlcantarillasStore } from '../store/useAlcantarillasStore'
import { useModalMessage } from '@/modules/shared/store/useModalMessage'
import { buildErrorMessage } from '@/modules/shared/utils/error-handler'
import { SharedImages } from '@/modules/shared/images'

const userRole = ref(getUserPayloadFromToken().rol)
const notAvailable = ref(true)
const mapApiKeyFound = ref(false)
const loadingVerification = ref(false)
const apiKeysService = new ApikeyService()
const { setApiKey } = useAlcantarillasStore()
const basicModal = useModalMessage()

async function verifyStatusDependencia() {
  notAvailable.value = await isDependenciaInactiva(ListaDependencias.Alcantarillas)
}

async function VerifyMapboxApiKeyExist() {
  const response = await apiKeysService.getMapApiKeyByDependencia(ListaDependencias.Alcantarillas)
  const apikey = response.data.data.key
  if (apikey !== null) {
    mapApiKeyFound.value = true
    setApiKey(apikey)
  } else {
    mapApiKeyFound.value = false
  }
}

onMounted(async () => {
  try {
    loadingVerification.value = true
    await verifyStatusDependencia()
    await VerifyMapboxApiKeyExist()
    loadingVerification.value = false
  } catch (error) {
    basicModal.setMessage({
      title: 'Error',
      message: buildErrorMessage(error),
      image: SharedImages.ErrorImage
    })
    basicModal.showModal()
    loadingVerification.value = false
  }
})
</script>
<template>
  <CustomLoading
    v-if="loadingVerification"
    :message="'Verificando disponibilidad del servicio'"
  ></CustomLoading>
  <template v-else>
    <NotAvailableVue v-if="notAvailable && userRole === UserType.Common"></NotAvailableVue>
    <template v-else>
      <NotMapApiKeyVue v-if="!mapApiKeyFound" />
      <RouterView v-else />
    </template>
  </template>
</template>
