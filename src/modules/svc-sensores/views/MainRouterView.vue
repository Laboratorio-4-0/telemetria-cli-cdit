<script lang="ts" setup>
import NotAvailableVue from '@/modules/shared/components/NotAvailable.vue'
import { getUserPayloadFromToken } from '@/modules/shared/utils/jwt-decode'
import { UserType } from '@/modules/svc-usuarios/types/users'
import { RouterView } from 'vue-router'
import { ref, onMounted } from 'vue'
import { isDependenciaInactiva } from '@/modules/shared/utils/validate-status-dependencia'
import { ListaDependencias } from '@/modules/shared/types/dependencias'
import CustomLoading from '@/modules/shared/components/CustomLoading.vue'
const userRole = ref(getUserPayloadFromToken().rol)
const notAvailable = ref(true)
const loadingVerification = ref(false)

onMounted(async () => {
  loadingVerification.value = true
  notAvailable.value = await isDependenciaInactiva(ListaDependencias.Sensores)
  loadingVerification.value = false
})
</script>
<template>
  <CustomLoading
    v-if="loadingVerification"
    :message="'Verificando disponibilidad del servicio'"
  ></CustomLoading>
  <NotAvailableVue v-if="notAvailable && userRole === UserType.Common"></NotAvailableVue>
  <RouterView v-else />
</template>
