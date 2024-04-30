<script lang="ts" setup>
import CustomSpinnerLoading from '@/modules/shared/components/CustomSpinnerLoading.vue'
import { UserType, type UserModel } from '../../types/users'
import { UserService } from '../../services/user-service'
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { buildErrorMessage } from '@/modules/shared/utils/error-handler'
import { useModalMessage } from '@/modules/shared/store/useModalMessage'
import { SharedImages } from '@/modules/shared/images'
import CustomLoading from '@/modules/shared/components/CustomLoading.vue'
import ListaUsuariosDashboard from '@/modules/svc-usuarios/components/admin/ListaUsuariosDashboradHome.vue'
import { DependenciasService } from '../../services/dependencias-service'
import { ListaDependencias } from '@/modules/shared/types/dependencias'
import type { DependenciasInactivasModel } from '../../types/dependencias'
import { useModalConfirmationMessage } from '@/modules/shared/store/useModalConfirmation'
import { Chart, registerables } from 'chart.js'
import { type ExtractComponentData, PieChart } from 'vue-chart-3'
import type { ErrorRecordModel } from '../../types/errors-logs'
import { ErrorLogService } from '../../services/error-log-service'
import { socketAdminDashboard, stateSocketEventsAdminDashboard } from '../../store/useSocketAdmin'

let listaUsuariosActivos = ref<UserModel[]>([])
let listaUsuariosInactivos = ref<UserModel[]>([])
let showCustomSpinnerLoading = ref<boolean>(false)
let dependenciasInactivasLoading = ref<boolean>(false)
let listaDependenciasInactivas = ref<DependenciasInactivasModel[]>([])
let isProcessingRequest = ref<boolean>(false)
let processingMessage = ref<string>('')
const dependenciasRegistradas = Object.values(ListaDependencias)
const usersService = new UserService()
const errorService = new ErrorLogService()
const dependenciaService = new DependenciasService()
let listaErrorLogs = ref<ErrorRecordModel[]>([])
let loadingListaErrorLogs = ref(false)
//Modales
const confirmationModal = useModalConfirmationMessage()
const useModal = useModalMessage()
// chart
let pieChartGeneralInfo = ref<ExtractComponentData<typeof PieChart>>()
Chart.register(...registerables)
let dataSetPiechart = ref<number[]>([])
let pieChartGeneralInfoDataSet = ref({
  labels: dependenciasRegistradas,
  datasets: [
    {
      data: dataSetPiechart.value,
      backgroundColor: ['#77CEFF', '#0079AF', '#123E6B']
    }
  ]
})

function fillDataSetPieChart(users: UserModel[]) {
  for (const dependencia of dependenciasRegistradas) {
    dataSetPiechart.value.push(
      users.filter((u) => u.dependenciasVisibles.includes(dependencia)).length
    )
  }
}

async function getAllUsers() {
  try {
    showCustomSpinnerLoading.value = true
    const response = await usersService.recuperarUsuarios()
    const usuarios = <UserModel[]>response.data.data
    //Crear piechart
    fillDataSetPieChart(usuarios)
    //Filtrar usuarios por status
    listaUsuariosActivos.value = usuarios.filter((user) => user.activo === true).map((user, index) => ({ ...user, id: `${index + 1}` }));
    listaUsuariosInactivos.value = usuarios.filter((user) => user.activo === false).map((user, index) => ({ ...user, id: `${index + 1}` }));
    showCustomSpinnerLoading.value = false
  } catch (error) {
    showCustomSpinnerLoading.value = false
    const message = buildErrorMessage(error)
    useModal.setMessage({
      title: 'Error al recuperar usuarios',
      message: message,
      image: SharedImages.ErrorImage
    })
    await useModal.showModal()
  }
}
async function getDependenciasInactivas() {
  try {
    dependenciasInactivasLoading.value = true
    const response = await dependenciaService.getListaDependenciasInactivas()
    listaDependenciasInactivas.value = <DependenciasInactivasModel[]>response.data.data
    dependenciasInactivasLoading.value = false
  } catch (error) {
    dependenciasInactivasLoading.value = false
    const message = buildErrorMessage(error)
    useModal.setMessage({
      title: 'Error al recuperar usuarios',
      message: message,
      image: SharedImages.ErrorImage
    })
    await useModal.showModal()
  }
}

async function getErrorsLog() {
  try {
    loadingListaErrorLogs.value = true
    const response = await errorService.getErrorLogs()
    listaErrorLogs.value = <ErrorRecordModel[]>response.data.data
    loadingListaErrorLogs.value = false
  } catch (error) {
    loadingListaErrorLogs.value = false
    const message = buildErrorMessage(error)
    useModal.setMessage({
      title: 'Error al recuperar la lista de errores',
      message: message,
      image: SharedImages.ErrorImage
    })
    await useModal.showModal()
  }
}

//Eliminar error por ID en tabla de errores
async function eliminarError(error: ErrorRecordModel) {
  confirmationModal.setMessage({
    title: 'Confirmación de eliminación',
    message: `¿Deseas eliminar el error? Una vez eliminado ya no se podrá recuperar.`,
    image: SharedImages.TrashImage
  })
  const response = (await confirmationModal.showModal()) as boolean
  if (response) {
    await deleteError(error)
  }
}

async function eliminarErrores() {
  confirmationModal.setMessage({
    title: 'Confirmación de eliminación',
    message: `¿Deseas eliminar todos los errores? Una vez eliminados ya no se podrán recuperar.`,
    image: SharedImages.TrashImage
  })
  const response = (await confirmationModal.showModal()) as boolean
  if (response) {
    await deleteErrores()
  }
}

async function habilitarDependencia(dependencia: ListaDependencias) {
  let propsModal = {
    title: 'Habilitar dependencia',
    message: `¿Deseas habilitar la dependencia '${dependencia}'? una vez activa los usuarios podrán acceder a ella`,
    image: SharedImages.TurnOnImage
  }
  confirmationModal.setMessage(propsModal)
  const response = (await confirmationModal.showModal()) as boolean
  if (response) {
    await enableDependencia(dependencia)
  }
}

async function inahabilitarDependencia(dependencia: ListaDependencias) {
  // Validar que la depenedencia no este inhabilitada
  const alreadyMapboxKey = listaDependenciasInactivas.value.some(
    (apiItem) => apiItem.dependencia === dependencia
  )
  if (alreadyMapboxKey) {
    useModal.setMessage({
      title: 'No es posible esta operación',
      message: `La dependencia "${dependencia}" ya está deshabilitada.`,
      image: SharedImages.InfoImage
    })
    await useModal.showModal()
    return
  }
  let propsModal = {
    title: 'Deshabilitar dependencia',
    message: `¿Deseas inahbilitar la dependencia '${dependencia}'? una vez inactiva los usuarios no podrán acceder a ella`,
    image: SharedImages.TurnOffImage
  }
  confirmationModal.setMessage(propsModal)
  const response = (await confirmationModal.showModal()) as boolean
  if (response) {
    await desableDependencia(dependencia)
  }
}

// servicios
async function enableDependencia(dependencia: ListaDependencias) {
  try {
    isProcessingRequest.value = true
    processingMessage.value = 'Habilitando dependencia...'
    const response = await dependenciaService.activarDependencia(dependencia)
    const { message } = response.data
    const idx = listaDependenciasInactivas.value.findIndex(
      (depe) => depe.dependencia === dependencia
    )
    listaDependenciasInactivas.value.splice(idx, 1)
    isProcessingRequest.value = false
  } catch (error) {
    isProcessingRequest.value = false
    const message = buildErrorMessage(error)
    useModal.setMessage({
      title: 'Error al habilitar la dependencia',
      message: message,
      image: SharedImages.ErrorImage
    })
    await useModal.showModal()
  }
}

async function desableDependencia(dependencia: ListaDependencias) {
  try {
    isProcessingRequest.value = true
    processingMessage.value = 'Deshabilitando dependencia...'
    const response = await dependenciaService.desactivarDependencia(dependencia)
    const { message } = response.data
    listaDependenciasInactivas.value.push(response.data.data)
    isProcessingRequest.value = false
  } catch (error) {
    isProcessingRequest.value = false
    const message = buildErrorMessage(error)
    useModal.setMessage({
      title: 'Error al deshabilitar la dependencia',
      message: message,
      image: SharedImages.ErrorImage
    })
    await useModal.showModal()
  }
}

//Conexión con el servicio de telemetria-api para eliminar un error por id
async function deleteError(error: ErrorRecordModel ) {
  try {
    isProcessingRequest.value = true
    processingMessage.value = 'Eliminando datos...'
    const response = await errorService.deleteErrorById(error.id!)
    const { message } = response.data
    listaErrorLogs.value = listaErrorLogs.value.filter( u => u.id !== error.id)
    isProcessingRequest.value = false
    useModal.setMessage({
      title: 'Eliminación de error exitosa',
      message: message,
      image: SharedImages.SuccesImage
    })
    await useModal.showModal()
  } catch (error) {
    isProcessingRequest.value = false
    const message = buildErrorMessage(error)
    useModal.setMessage({
      title: 'Error al realizar la petición',
      message: message,
      image: SharedImages.ErrorImage
    })
    await useModal.showModal()
  }
}

async function deleteErrores() {
  try {
    isProcessingRequest.value = true
    processingMessage.value = 'Eliminando datos...'
    const response = await errorService.deleteErrorAll()
    const { message } = response.data
    isProcessingRequest.value = false
    listaErrorLogs.value = [];
    useModal.setMessage({
      title: 'Eliminación de errores exitosa',
      message: message,
      image: SharedImages.SuccesImage
    })
    await useModal.showModal()
  } catch (error) {
    isProcessingRequest.value = false
    const message = buildErrorMessage(error)
    useModal.setMessage({
      title: 'Error al realizar la petición',
      message: message,
      image: SharedImages.ErrorImage
    })
    await useModal.showModal()
  }
}

/**}
 * Monitorea los cambios de estado de 'stateSocketEvents'
 */
watch(stateSocketEventsAdminDashboard, (updateValue) => {
  if (stateSocketEventsAdminDashboard.NewExternalErrorEvent) {
    listaErrorLogs.value.unshift({
      id: updateValue.NewExternalErrorEvent!.id,
      updatedAt: updateValue.NewExternalErrorEvent!.updatedAt,
      createdAt: updateValue.NewExternalErrorEvent!.createdAt,
      description: updateValue.NewExternalErrorEvent!.description,
      service: updateValue.NewExternalErrorEvent!.service,
      category: updateValue.NewExternalErrorEvent!.category
    })
  }
})

onMounted(async () => {
  socketAdminDashboard.connect()
  await getAllUsers()
  await getDependenciasInactivas()
  await getErrorsLog()
})

onUnmounted(() => {
  // Cerramos conexión del socketAdminDashboard con el servidor
  socketAdminDashboard.disconnect();
})
</script>
<template>
  <CustomLoading v-if="isProcessingRequest" :message="processingMessage" />
  <div class="container-fluid p-4 animate__animated animate__fadeIn">
    <h1 class="h3 mb-3"><strong><i class="bi bi-terminal-dash"></i> Analytics</strong> Dashboard</h1>
    <hr>
    <div class="row">
      <div class="col-xl-6 col-xxl-6">
        <div class="card flex-fill w-100">
          <div class="card-header">
            <h5 class="card-title mb-0">Usuarios activos</h5>
          </div>
          <div class="card-body py-3">
            <div class="scrollable-component">
              <CustomSpinnerLoading v-if="showCustomSpinnerLoading"></CustomSpinnerLoading>
              <ListaUsuariosDashboard :users="listaUsuariosActivos" v-else></ListaUsuariosDashboard>
            </div>
          </div>
        </div>
      </div>
      <div class="col-xl-6 col-xxl-6">
        <div class="card flex-fill w-100">
          <div class="card-header">
            <h5 class="card-title mb-0">Usuarios desactivados</h5>
          </div>
          <div class="card-body py-3">
            <div class="scrollable-component">
              <CustomSpinnerLoading v-if="showCustomSpinnerLoading"></CustomSpinnerLoading>
              <ListaUsuariosDashboard
                :users="listaUsuariosInactivos"
                v-else
              ></ListaUsuariosDashboard>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-6">
        <div class="card flex-fill w-100">
          <div class="card-header">
            <h5 class="card-title mb-0">Dependencias inactivas</h5>
          </div>
          <div class="card-body d-flex">
            <div class="align-self-center w-100">
              <table class="table mb-0 h-100">
                <CustomSpinnerLoading v-if="dependenciasInactivasLoading"></CustomSpinnerLoading>
                <tbody v-else>
                  <tr v-for="(item, idx) of listaDependenciasInactivas" :key="idx">
                    <td>{{ item.dependencia }}</td>
                    <td class="text-end">
                      <button
                        @click="habilitarDependencia(item.dependencia)"
                        type="button"
                        class="btn btn-success m-2"
                        style="
                          --bs-btn-padding-y: 0.25rem;
                          --bs-btn-padding-x: 0.5rem;
                          --bs-btn-font-size: 0.75rem;
                        "
                      >
                        <i class="bi bi-check-square"></i>
                        Habilitar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="card flex-fill w-100">
          <div class="card-header">
            <h5 class="card-title mb-0">Dependencias registradas</h5>
          </div>
          <div class="card-body d-flex">
            <div class="align-self-center w-100">
              <table class="table mb-0 h-100">
                <CustomSpinnerLoading v-if="dependenciasInactivasLoading"></CustomSpinnerLoading>
                <tbody v-else>
                  <tr v-for="(item, idx) of dependenciasRegistradas" :key="idx">
                    <td>{{ item }}</td>
                    <td class="text-end">
                      <button
                        @click="inahabilitarDependencia(item)"
                        type="button"
                        class="btn btn-danger m-2"
                        style="
                          --bs-btn-padding-y: 0.25rem;
                          --bs-btn-padding-x: 0.5rem;
                          --bs-btn-font-size: 0.75rem;
                        "
                      >
                        <i class="bi bi-ban"></i>
                        Deshabilitar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-12 col-xxl-6">
        <div class="card flex-fill w-100">
          <div class="card-header">
            <h5 class="card-title mb-0">Usuarios por dependencia</h5>
          </div>
          <div class="card-body px-4">
            <PieChart ref="pieChartGeneralInfo" :chartData="pieChartGeneralInfoDataSet" />
          </div>
        </div>
      </div>
      <div class="col-md-12">
        <div class="card flex-fill">
          <div class="card-header text-center">
            <h5 class="card-title mb-0">Monitoreo de errores</h5>
          </div>
          <div class="card-body d-flex">
            <div class="align-self-center text-center scrollable-component">
              <CustomSpinnerLoading v-if="loadingListaErrorLogs"></CustomSpinnerLoading>
              <template v-else>
                <div class="text-center" v-if="listaErrorLogs.length !== 0">
                  <button
                    type="button"
                    class="btn btn-info m-2"
                    @click="eliminarErrores()"
                    style="
                      --bs-btn-padding-y: 0.25rem;
                      --bs-btn-padding-x: 0.5rem;
                      --bs-btn-font-size: 0.75rem;
                    "
                  >
                    <i class="bi bi-trash3"></i>
                    Eliminar todo
                  </button>
                </div>
                <table class="table table-hover" v-if="listaErrorLogs.length !== 0">
                  <thead>
                    <tr>
                      <th class="">id</th>
                      <th class="">Servicio</th>
                      <th class="">Descripción</th>
                      <th class="">Categoría</th>
                      <th class="">Fecha creación</th>
                      <th class="">Fecha de actualización</th>
                      <th class="">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(item, idx) in listaErrorLogs"
                      :key="idx"
                      class="animate__animated animate__bounceInRight"
                    >
                      <td class="">{{ idx + 1}}</td>
                      <td>
                        {{ item.service }}
                      </td>
                      <td class="">{{ item.description }}</td>
                      <td class="">{{ item.category }}</td>
                      <td class="">
                        {{ item.createdAt }}
                      </td>
                      <td class="">{{ item.updatedAt }}</td>
                      <td class="">
                        <button
                          v-if="item.id"
                          @click="eliminarError(item)"
                          type="button"
                          class="btn btn-info m-2"
                          style="
                            --bs-btn-padding-y: 0.25rem;
                            --bs-btn-padding-x: 0.5rem;
                            --bs-btn-font-size: 0.75rem;
                          "
                        >
                          <i class="bi bi-trash3"></i>
                          Eliminar
                        </button>
                        <p v-else>Evento sin registro en BDD</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <template v-else>
                  <img :src="SharedImages.NoErrorLogs" alt="" />
                  <p class="fs-4 mt-3">No hay errores registrados en el sistema</p>
                </template>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
img {
  width: 10%;
  border-radius: 50%;
}
</style>
