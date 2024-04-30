<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  APiTypeService,
  type ApikeysModel,
  type CreateApiKeyModel,
  type UpdateStatusApiKeyModel
} from '../../types/apikeys'
import { ListaDependencias } from '@/modules/shared/types/dependencias'
import { useModalConfirmationMessage } from '@/modules/shared/store/useModalConfirmation'
import { SharedImages } from '@/modules/shared/images'
import * as Yup from 'yup'
import { useModalMessage } from '@/modules/shared/store/useModalMessage'
import { ApikeyService } from '../../services/apikeys-service'
import { buildErrorMessage } from '@/modules/shared/utils/error-handler'
import CustomLoading from '@/modules/shared/components/CustomLoading.vue'
import CustomSpinnerLoading from '@/modules/shared/components/CustomSpinnerLoading.vue'
import EmptyRecords from '@/modules/shared/components/EmptyContent.vue'
import { useUserStore } from '@/modules/svc-usuarios/store/useUserStore'
import { useTrenLigeroStore } from '@/modules/svc-tren-ligero/store/useTrenLigeroStore';
import { useAlcantarillasStore } from '@/modules/svc-alcantarillas/store/useAlcantarillasStore';


const nombreListaDependencias = Object.values(ListaDependencias)
const confirmationModal = useModalConfirmationMessage()
const basicModal = useModalMessage()
const apikeyService = new ApikeyService()
const userStore = useUserStore()
const { setApiKey:setTrenLigeroApiMapbox } = useTrenLigeroStore()
const { setApiKey:setAlcantarillasApiMapbox} = useAlcantarillasStore()

/**
 * Datos por default ligados al formulario para crear una api key
 */
const setFormDefault = (): CreateApiKeyModel => ({
  dependencia: '',
  description: '',
  activa: true,
  namekey: '',
  api: APiTypeService.TelemetriaApi,
  key: crypto.randomUUID().replace(/-/g, '')
})
const setFormMapboxDefault = (): CreateApiKeyModel => ({
  dependencia: '',
  description: '',
  activa: true,
  namekey: `Mapbox-${crypto.randomUUID().replace(/-/g, '')}`,
  api: APiTypeService.MapBoxApi,
  key: ''
})

let formDataTelemetria = ref<CreateApiKeyModel>(setFormDefault())
let formDataMapBox = ref<CreateApiKeyModel>(setFormMapboxDefault())

let nameKeyTemplate = ref('')
let isSavingAPIKey = ref<boolean>(false)
let isProcessingRequest = ref<boolean>(false)
let cargandoDatosTabla = ref<boolean>(false)
let processingMessage = ref<string>('')
let apikeysTelemetria = ref<ApikeysModel[]>([])
let apikeysMapbox = ref<ApikeysModel[]>([])

// Definición de las validaciones que se deberán seguir
const schemaForm = Yup.object({
  dependencia: Yup.string().required('La dependencia es un campo requerido'),
  description: Yup.string().required('La descripción es un campo requerido'),
  activa: Yup.string().required('El status es un campo requerido'),
  namekey: Yup.string().required('El nombre de la api es un campo requerido')
})

const mapboxSchemaForm = Yup.object({
  dependencia: Yup.string().required('La dependencia es un campo requerido'),
  description: Yup.string().required('La descripción es un campo requerido'),
  key: Yup.string()
    .min(90, 'El api key debe contener al menos 90 carácteres')
    .required('El mapbox key de la api es un campo requerido')
})
// Captura los errores de validacion del schemaForm
let formError = ref<Record<string, string>>({})

/**
 * Connecta con servicio para registrar los datos del formulario
 */
async function saveApiKeyTelemetria() {
  try {
    isSavingAPIKey.value = true
    // Valida formulario
    await schemaForm.validate(formDataTelemetria.value, { abortEarly: false })
    // Crea la api si la validación del formulario es correcta
    await crearAPiKey(formDataTelemetria.value)
    formDataTelemetria.value = setFormDefault()
    nameKeyTemplate.value = ''
    isSavingAPIKey.value = false
  } catch (error) {
    isSavingAPIKey.value = false
    let errorValidatormessage = ''
    const errorValidation = error as Yup.ValidationError
    errorValidation.inner.forEach((err) => {
      formError.value[`${err.path}`] = err.message
      errorValidatormessage += `*${err.message} `
    })
    basicModal.setMessage({
      title: 'Validación del formulario',
      message: errorValidatormessage,
      image: SharedImages.WarningImage
    })
    await basicModal.showModal()
  }
}

/**
 * Connecta con servicio para registrar los datos del formulario
 */
async function saveApiKeyMapbox() {
  try {
    isSavingAPIKey.value = true
    // Valida formulario
    await mapboxSchemaForm.validate(formDataMapBox.value, { abortEarly: false })
    // valida que no exista una apikey para la misma dependencia
    const alreadyMapboxKey = apikeysMapbox.value.some(
      (apiItem) => apiItem.dependencia === formDataMapBox.value.dependencia
    )
    if (alreadyMapboxKey) {
      basicModal.setMessage({
        title: 'No es posible esta operación',
        message: `La dependencia "${formDataMapBox.value.dependencia}" ya tiene una apikey de mapbox asociada, si deseas remplazarla, primero deberás eliminarla y volverla a crear.`,
        image: SharedImages.InfoImage
      })
      await basicModal.showModal()
      isSavingAPIKey.value = false
      return
    }
    // Crea la api si la validación del formulario es correcta
    await crearAPiKey(formDataMapBox.value)
    formDataMapBox.value = setFormMapboxDefault()
    isSavingAPIKey.value = false
  } catch (error) {
    isSavingAPIKey.value = false
    let errorValidatormessage = ''
    const errorValidation = error as Yup.ValidationError
    errorValidation.inner.forEach((err) => {
      formError.value[`${err.path}`] = err.message
      errorValidatormessage += `*${err.message} `
    })
    basicModal.setMessage({
      title: 'Validación del formulario',
      message: errorValidatormessage,
      image: SharedImages.WarningImage
    })
    await basicModal.showModal()
  }
}

/**
 * consume el servicio apikeyService para crear una nueva apikey
 */
async function crearAPiKey(newApikey: CreateApiKeyModel) {
  try {
    // Uso de servicio para crear api key
    newApikey.key = newApikey.key.trim()
    const response = await apikeyService.crearAPIKey(newApikey)
    const { data: newCreatedKey, message } = response.data
    // Agregar el nuevo apikey a la tabla
    if (newCreatedKey.api === APiTypeService.TelemetriaApi) {
      apikeysTelemetria.value.unshift(newCreatedKey)
    } else {
      apikeysMapbox.value.unshift(newCreatedKey)
      if(newApikey.dependencia === ListaDependencias.TrenLigero){
        setTrenLigeroApiMapbox(newApikey.key)
      }else{
        setAlcantarillasApiMapbox(newApikey.key)
      }
    }
    // Preparar modal y mostrarlo al usuario con mensaje de creación exitosa
    basicModal.setMessage({
      title: 'Creación exitosa',
      message: message,
      image: SharedImages.SuccesImage
    })
    await basicModal.showModal()
  } catch (error) {
    const message = buildErrorMessage(error)
    basicModal.setMessage({
      title: 'Petición Fallida',
      message: message,
      image: SharedImages.ErrorImage
    })
    await basicModal.showModal()
  }
}

/**
 * Incia el proceso de eliminación de apikey si el usuario confirma los cambios
 * @param id
 */
async function deleteApiKey(api: ApikeysModel) {
  confirmationModal.setMessage({
    title: 'Confirmación de eliminación',
    message: `¿Deseas eliminar esta key '${api.id}'? Una vez eliminada ya no se podrá recuperar. Asegúrate de que no esté en uso`,
    image: SharedImages.TrashImage
  })
  const response = (await confirmationModal.showModal()) as boolean
  if (response) {
    await deleteApiById(api)
  }
}

/**
 * Incia el proceso de desactivación de apikey si el usuario confirma los cambios
 * @param id
 */
async function desableApiKey(id: string) {
  confirmationModal.setMessage({
    title: 'Confirmación de desactivación',
    message: `¿Deseas inactivar ésta key '${id}'? Una vez inactiva no podrá usarse hasta que la vuelvas a activar.`,
    image: SharedImages.TurnOffImage
  })
  const response = (await confirmationModal.showModal()) as boolean
  if (response) {
    await actualizaStatusAPIKey({ id: id, activa: false })
  }
}

/**
 * Incia el proceso de activación de apikey si el usuario confirma los cambios
 * @param id
 */
async function enableApiKey(id: string) {
  confirmationModal.setMessage({
    title: 'Confirmación de activación',
    message: `¿Deseas activar ésta key '${id}'? Una vez activa la dependencia asociada podrá hacer uso de ella.`,
    image: SharedImages.TurnOnImage
  })
  const response = (await confirmationModal.showModal()) as boolean
  if (response) {
    await actualizaStatusAPIKey({ id: id, activa: true })
  }
}

const downloadApiRow = async (item: ApikeysModel) => {
  try {

    let csv = 'Nombre cabecera,valor\n'

    csv += item?.namekey + ','
    csv += item?.key + ','

    const anchor = document.createElement('a')
    anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    anchor.target = '_blank'
    anchor.download = 'ApiKey-' + item?.namekey + '.csv'
    anchor.click()
  } catch (error) {
    const message = buildErrorMessage(error)
    basicModal.setMessage({
      title: 'Error al generar csv del api key',
      message: message,
      image: SharedImages.ErrorImage
    })
    await basicModal.showModal()
  }
}

/**
 * Incia el proceso de regeneración de apikey si el usuario confirma los cambios
 * @param id
 */
async function refreshApiKey(id: string) {
  confirmationModal.setMessage({
    title: 'Confirmación de regeneración',
    message: `¿Deseas regenerar ésta key '${id}'? Esto generará otra llave para la dependencia asociada y tendrás que compartirla nuevamente.`,
    image: SharedImages.QuestionImage
  })
  const response = (await confirmationModal.showModal()) as boolean
  if (response) {
    await regenerarAPIKey(id)
  }
}

/**
 * Transforma el atributo namekey en uppercase unido por guinoes
 * bajos en cad evento keyup
 */
function setNameApiKeyFormat() {
  const prefijo = formDataTelemetria.value.dependencia.toUpperCase().replace(/ /g, '-')
  const sufijo = crypto.randomUUID().replace(/-/g, '')
  formDataTelemetria.value.namekey = `${prefijo}-${sufijo}`
}

/**
 * Conexión con el servicio de telemetria-api para obtener
 * todas las api keys
 */
async function getAllApiKeys() {
  try {
    cargandoDatosTabla.value = true
    processingMessage.value = 'Cargando datos, espere...'
    const response = await apikeyService.getApiKeys()
    const listApikeys = <ApikeysModel[]>response.data.data
    apikeysTelemetria.value = listApikeys.filter((api) => api.api === APiTypeService.TelemetriaApi)
    apikeysMapbox.value = listApikeys.filter((api) => api.api === APiTypeService.MapBoxApi)
    cargandoDatosTabla.value = false
  } catch (error) {
    cargandoDatosTabla.value = false
    const message = buildErrorMessage(error)
    basicModal.setMessage({
      title: 'Error al recuperar api keys',
      message: message,
      image: SharedImages.ErrorImage
    })
    await basicModal.showModal()
  }
}

/**
 * Conexión con el servicio de telemetria-api para eliminar
 * una apuikey en particular por id
 */
async function deleteApiById(api: ApikeysModel) {
  try {
    isProcessingRequest.value = true
    processingMessage.value = 'Eliminando datos...'
    const response = await apikeyService.eliminarApiKey(api.id)
    isProcessingRequest.value = false
    const { message } = response.data
    if (api.api === APiTypeService.TelemetriaApi) {
      apikeysTelemetria.value = apikeysTelemetria.value.filter((item) => item.id !== api.id)
    } else {
      apikeysMapbox.value = apikeysMapbox.value.filter((item) => item.id !== api.id)
      if(api.dependencia === ListaDependencias.TrenLigero){
        setTrenLigeroApiMapbox("")
      }else{
        setAlcantarillasApiMapbox("")
      }
    }
    basicModal.setMessage({
      title: 'Eliminación exitosa',
      message: message,
      image: SharedImages.SuccesImage
    })
    await basicModal.showModal()
  } catch (error) {
    isProcessingRequest.value = false
    const message = buildErrorMessage(error)
    basicModal.setMessage({
      title: 'Error al realizar la petición',
      message: message,
      image: SharedImages.ErrorImage
    })
    await basicModal.showModal()
  }
}

/**
 * Conexión con el servicio de telemetria-api para actualizar
 * una apikey en particular por id y propiedad 'activa'
 */
async function actualizaStatusAPIKey(data: UpdateStatusApiKeyModel) {
  try {
    isProcessingRequest.value = true
    processingMessage.value = 'Actualizando datos...'
    const response = await apikeyService.actualizaStatus(data)
    isProcessingRequest.value = false
    const { message } = response.data
    const idx = apikeysTelemetria.value.findIndex((api) => api.id === data.id)
    apikeysTelemetria.value[idx].activa = data.activa
    basicModal.setMessage({
      title: 'Actualización exitosa',
      message: message,
      image: SharedImages.SuccesImage
    })
    await basicModal.showModal()
  } catch (error) {
    isProcessingRequest.value = false
    const message = buildErrorMessage(error)
    basicModal.setMessage({
      title: 'Error al realizar la petición',
      message: message,
      image: SharedImages.ErrorImage
    })
    await basicModal.showModal()
  }
}

/**
 * Conexión con el servicio de telemetria-api para regenerar
 * una apikey en particular por id
 */
async function regenerarAPIKey(id: string) {
  try {
    isProcessingRequest.value = true
    processingMessage.value = 'Actualizando datos...'
    const response = await apikeyService.regenerarApiKey(id)
    isProcessingRequest.value = false
    const { data, message } = response.data
    const idx = apikeysTelemetria.value.findIndex((api) => api.id === id)
    apikeysTelemetria.value[idx].key = data.key
    basicModal.setMessage({
      title: 'Actualización exitosa',
      message: message,
      image: SharedImages.SuccesImage
    })
    await basicModal.showModal()
  } catch (error) {
    isProcessingRequest.value = false
    const message = buildErrorMessage(error)
    basicModal.setMessage({
      title: 'Error al realizar la petición',
      message: message,
      image: SharedImages.ErrorImage
    })
    await basicModal.showModal()
  }
}

onMounted(async () => {
  // Obtener todas las api key cuando el componente sea montado
  await getAllApiKeys()
})
</script>
<template>
  <CustomLoading v-if="isProcessingRequest" :message="processingMessage" />
  <div class="wrapper">
    <div class="main">
      <main class="content">
        <div class="container-fluid p-4 animate__animated animate__fadeIn">
          <h1 class="h3 mb-3"><i class="bi bi-clipboard2-check"></i> Gestión de API's</h1>
          <div class="row p-3">

            <!-- Info para el administrador -->
            <div class="col-12">
          <div class="card card-with-border1">
            <div class="card-header">
              <h5 class="card-title mb-0">
                Hola {{ userStore.user.nombre }}, en el siguiente panel podrás administrar las API's que permiten la comunicación entre este sistema
                y los servicios de cada una de las dependencias registras. Así mismo, podrás gestionar el servicio de MapBox en la plataforma.
              </h5>
            </div>
          </div>
        </div>

            <!-- Telemetria API’S -->
            <div class="col-md-12">
              <div class="card card-with-border3">
                <div class="card-header">
                  <h5 class="card-title">
                    <i class="bi bi-toggles"></i>&nbsp;Telemetría API’s
                  </h5>
                  <br>
                  En este apartado podrás gestionar las API's que, como administrador del sistema, debes proporcionar al personal 
                  de cada dependencia registrada para que esta plataforma pueda recibir la información proveniente de los 
                  dispositivos de cada una de estas instituciones.
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="card card-with-border6">
                        <div class="card-header">
                          <h5 class="card-title">
                            <i class="bi bi-key-fill"></i>&nbsp;&nbsp;Crear nueva apikey
                          </h5>
                        </div>
                        <div class="card-body">
                          <!-- Descripcion -->
                          <label for="form-label">Descripción de la API key</label>
                          <textarea
                            class="form-control form-control-md"
                            placeholder="Descripción de la api key, max 90 carácteres"
                            id="floatingTextarea"
                            v-model="formDataTelemetria.description"
                            maxlength="90"
                          ></textarea>
                          <br />
                          <!-- Status -->
                          <label class="form-label">Status</label>
                          <ul class="">
                            <li class="list-group-item">
                              <input
                                type="radio"
                                id="activo"
                                name="opcion"
                                :value="true"
                                v-model="formDataTelemetria.activa"
                              />
                              <label for="activo">&nbsp;&nbsp;Activa</label>
                            </li>

                            <li class="list-group-item">
                              <input
                                type="radio"
                                id="inactivo"
                                name="opcion"
                                :value="false"
                                v-model="formDataTelemetria.activa"
                              />
                              <label for="inactivo">&nbsp;&nbsp;Inactiva</label>
                            </li>
                          </ul>
                          <br />
                          <!-- Dependencia -->
                          <label class="form-label">Dependencia</label>
                          <ul class="">
                            <li
                              v-for="(dependencia, idx) of nombreListaDependencias"
                              :key="idx"
                              class="list-group-item"
                            >
                              <input
                                type="radio"
                                :id="dependencia"
                                :name="dependencia"
                                :value="dependencia"
                                v-model="formDataTelemetria.dependencia"
                                @change="setNameApiKeyFormat()"
                              />
                              <label :for="dependencia">&nbsp;&nbsp;{{ dependencia }}</label>
                            </li>
                          </ul>
                          <br />
                          <!-- Botón de registro -->
                          <div class="" style="display: flex; justify-content: flex-start">
                            <button
                              class="btn btn-lg btn-info"
                              @click="saveApiKeyTelemetria()"
                              :disabled="isSavingAPIKey"
                            >
                              <template v-if="!isSavingAPIKey">Guardar</template>
                              <template v-else="isSavingAPIKey">
                                <span
                                  class="spinner-border spinner-border-sm"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                Guardando...
                              </template>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- Card datos a guardar -->
                    <div class="col-md-6">
                      <div class="card card-with-border7 mb-3">
                        <h5 class="card-title m-2">
                          <i class="bi bi-info-circle-fill"></i>&nbsp;&nbsp;Datos de la API a crear
                          <br />
                        </h5>
                        <p>&nbsp;&nbsp;Los datos se guardarán de la siguiente manera:</p>
                        <div class="card-body fs-4">
                          <p class="card-text"><b>Nombre:</b> {{ formDataTelemetria.namekey }}</p>
                          <p class="card-text"><b>API:</b> {{ formDataTelemetria.api }}</p>
                          <p class="card-text">
                            <b>Descripción:</b> {{ formDataTelemetria.description }}
                          </p>
                          <p class="card-text">
                            <b>Status por default:</b>
                            {{ formDataTelemetria.activa ? 'Activa' : 'Inactiva' }}
                          </p>
                          <p class="card-text">
                            <b>Dependencia:</b> {{ formDataTelemetria.dependencia }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Tabla de keys grestradas para telemetria api -->
                  <div class="col-md-12">
                    <div class="card card-with-border8">
                      <div class="card-header">
                        <h5 class="card-title mb-0">
                          <i class="bi bi-collection"></i>&nbsp;&nbsp;API keys registradas
                          en el sistema:
                        </h5><br>
                        A continuación se enlistan todas las apikeys dados de alta en el sistema.
                      </div>
                      <div class="card-body">
                        <div class="scrollable-component">
                          <CustomSpinnerLoading v-if="cargandoDatosTabla" />
                          <template v-else>
                            <EmptyRecords v-if="apikeysTelemetria.length === 0"></EmptyRecords>
                            <table v-else class="table">
                              <thead>
                                <tr>
                                  <th class="">Estado</th>
                                  <th class="">Dependencia</th>
                                  <th class="">Tipo de API</th>
                                  <th class="">Nombre</th>
                                  <th class="">Descripción</th>
                                  <th class="">Key</th>
                                  <th class="">Creada</th>
                                  <th class="">Actualizada</th>
                                  <th class="">Acciones</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr
                                  v-for="(item, idx) of apikeysTelemetria"
                                  :key="idx"
                                  class="animate__animated animate__bounceInRight"
                                >
                                  <td>
                                    <span class="badge bg-success" v-if="item.activa"
                                      ><i class="bi bi-check-circle"></i>
                                      {{ item.activa ? 'Activa' : 'Inactiva' }}</span
                                    >
                                    <span class="badge bg-danger" v-else
                                      ><i class="bi bi-x-circle"></i>
                                      {{ item.activa ? 'Activa' : 'Inactiva' }}</span
                                    >
                                  </td>
                                  <td class="">{{ item.dependencia }}</td>
                                  <td class="">{{ item.api }}</td>
                                  <td class="">{{ item.namekey }}</td>
                                  <td class="">{{ item.description }}</td>
                                  <td class="">{{ item.key }}</td>
                                  <td class="">{{ item.createdAt }}</td>
                                  <td class="">{{ item.updatedAt }}</td>
                                  <td class="">
                                    <button
                                      type="button"
                                      class="btn btn-info"
                                      @click="refreshApiKey(item.id)"
                                      style="
                                        --bs-btn-padding-y: 0.25rem;
                                        --bs-btn-padding-x: 0.5rem;
                                        --bs-btn-font-size: 0.75rem;
                                      "
                                    >
                                      <i class="bi bi-arrow-clockwise"></i>
                                      Regenerar
                                    </button>
                                    <button
                                      @click="deleteApiKey(item)"
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
                                    <button
                                      v-if="item.activa"
                                      @click="desableApiKey(item.id)"
                                      type="button"
                                      class="btn btn-danger"
                                      style="
                                        --bs-btn-padding-y: 0.25rem;
                                        --bs-btn-padding-x: 0.5rem;
                                        --bs-btn-font-size: 0.75rem;
                                      "
                                    >
                                      <i class="bi bi-x-lg"></i>
                                      Desactivar
                                    </button>
                                    <button
                                      v-else
                                      type="button"
                                      class="btn btn-info"
                                      @click="enableApiKey(item.id)"
                                      style="
                                        --bs-btn-padding-y: 0.25rem;
                                        --bs-btn-padding-x: 0.5rem;
                                        --bs-btn-font-size: 0.75rem;
                                      "
                                    >
                                      <i class="bi bi-check-lg"></i>
                                      Activar
                                    </button>

                                    <button
                                      type="button"
                                      class="btn btn-info m-2"
                                      @click="downloadApiRow(item)"
                                      style="
                                        --bs-btn-padding-y: 0.25rem;
                                        --bs-btn-padding-x: 0.5rem;
                                        --bs-btn-font-size: 0.75rem;
                                      "
                                    >
                                      <i class="bi bi-download"></i>
                                      Descargar
                                    </button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </template>
                        </div>
                      
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <hr>
            <!-- Mapbox API’S -->
            <div class="col-md-12">
              <div class="card card-with-border2">
                <div class="card-header">
                  <h5 class="card-title"><i class="bi bi-key-fill"></i>&nbsp;&nbsp;MapBox API’s</h5>
                  <br>
                  En este apartado podrás registrar las API's de MapBox para cada servicio que requeriera el uso de mapas. Es
                  importante que el personal de cada dependencia proporcione una API propia para que su servicio
                  pueda ser visualizado en esta plataforma.
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="card card-with-border1">
                        <div class="card-header">
                          <h5 class="card-title">
                            <i class="bi bi-key-fill"></i>&nbsp;&nbsp;Agregar nueva apikey de mapbox
                          </h5>
                        </div>
                        <div class="card-body">
                          <!-- Descripcion -->
                          <label for="form-label">Descripción de la API key</label>
                          <textarea
                            class="form-control form-control-md"
                            placeholder="Descripción de la api key, max 90 carácteres"
                            id="floatingTextarea"
                            v-model="formDataMapBox.description"
                            maxlength="90"
                          ></textarea>
                          <br />
                          <!-- apikey -->
                          <label class="form-label">Mapbox api key</label>
                          <input
                            class="form-control form-control-lg"
                            type="text"
                            name="opcion"
                            placeholder="Pega aquí el api key"
                            v-model="formDataMapBox.key"
                          />
                          <br />
                          <!-- Dependencia -->
                          <label class="form-label">Dependencia</label>
                          <ul class="">
                            <li
                              v-for="(dependencia, idx) of nombreListaDependencias.filter(
                                (e) => e !== ListaDependencias.Sensores
                              )"
                              :key="idx"
                              class="list-group-item"
                            >
                              <input
                                type="radio"
                                :id="dependencia + 'mapbox'"
                                :name="dependencia + 'mapbox'"
                                :value="dependencia"
                                v-model="formDataMapBox.dependencia"
                                @change="setNameApiKeyFormat()"
                              />
                              <label :for="dependencia + 'mapbox'"
                                >&nbsp;&nbsp;{{ dependencia }}</label
                              >
                            </li>
                          </ul>
                          <br />
                          <!-- Botón de registro -->
                          <div class="" style="display: flex; justify-content: flex-start">
                            <button
                              class="btn btn-lg btn-info"
                              @click="saveApiKeyMapbox()"
                              :disabled="isSavingAPIKey"
                            >
                              <template v-if="!isSavingAPIKey">Guardar</template>
                              <template v-else="isSavingAPIKey">
                                <span
                                  class="spinner-border spinner-border-sm"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                Guardando...
                              </template>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- Card datos a guardar -->
                    <div class="col-md-6">
                      <div class="card card-with-border7 mb-3">
                        <h5 class="card-title m-2">
                          <i class="bi bi-info-circle-fill"></i>&nbsp;&nbsp;Datos de la API a crear
                          <br />
                        </h5>
                        <p>&nbsp;&nbsp;Los datos se guardarán de la siguiente manera:</p>
                        <div class="card-body fs-4">
                          <p class="card-text"><b>Mapbox key:</b> {{ formDataMapBox.key }}</p>
                          <p class="card-text"><b>API:</b> {{ formDataMapBox.api }}</p>
                          <p class="card-text">
                            <b>Descripción:</b> {{ formDataMapBox.description }}
                          </p>
                          <p class="card-text">
                            <b>Status por default:</b>
                            {{ formDataMapBox.activa ? 'Activa' : 'Inactiva' }}
                          </p>
                          <p class="card-text">
                            <b>Dependencia:</b> {{ formDataMapBox.dependencia }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Tabla de keys grestradas para telemetria api -->
                  <div class="col-md-12">
                    <div class="card card-with-border8">
                      <div class="card-header">
                        <h5 class="card-title mb-0">
                          <i class="bi bi-collection"></i>&nbsp;&nbsp;API keys registradas
                          en el sistema:
                        </h5>
                        <br>A continuación se enlistan todos las apikeys dados de alta en el sistema.
                      </div>
                      <div class="card-body">
                        <div class="scrollable-component">
                          <CustomSpinnerLoading v-if="cargandoDatosTabla" />
                          <template v-else>
                            <EmptyRecords v-if="apikeysMapbox.length === 0"></EmptyRecords>
                            <table v-else class="table">
                              <thead>
                                <tr>
                                  <th class="">Dependencia</th>
                                  <th class="">API</th>
                                  <th class="">Descripción</th>
                                  <th class="">Key</th>
                                  <th class="">Fecha de registro</th>
                                  <th class="">Acciones</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr
                                  v-for="(item, idx) of apikeysMapbox"
                                  :key="idx"
                                  class="animate__animated animate__bounceInRight"
                                >
                                  <td class="">{{ item.dependencia }}</td>
                                  <td class="">{{ item.api }}</td>
                                  <td class="">{{ item.description }}</td>
                                  <td class="">{{ item.key }}</td>
                                  <td class="">{{ item.createdAt }}</td>
                                  <td class="">
                                    <button
                                      @click="deleteApiKey(item)"
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
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </template>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
