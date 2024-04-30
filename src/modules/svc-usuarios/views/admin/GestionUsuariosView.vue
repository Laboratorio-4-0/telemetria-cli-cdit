<script setup lang="ts">
import { ListaDependencias } from '@/modules/shared/types/dependencias'
import { ref, watch, onMounted } from 'vue'
import * as Yup from 'yup'
import { UserType, type UserModel } from '../../types/users'
import { buildErrorMessage } from '@/modules/shared/utils/error-handler'
import { SharedImages } from '@/modules/shared/images'
import { useModalMessage } from '@/modules/shared/store/useModalMessage'
import { UserService } from '../../services/user-service'
import CustomLoading from '@/modules/shared/components/CustomLoading.vue'
import CustomSpinnerLoading from '@/modules/shared/components/CustomSpinnerLoading.vue'
import { useModalConfirmationMessage } from '@/modules/shared/store/useModalConfirmation'
import EmptyRecords from '@/modules/shared/components/EmptyContent.vue'
import { useUserStore } from '@/modules/svc-usuarios/store/useUserStore'
const confirmationModal = useModalConfirmationMessage()
const userStore = useUserStore()
// Servicios
const usersService = new UserService()
let isLoading = ref<boolean>(false)
let showCustomSpinnerLoading = ref<boolean>(false)
let listaUsuarios = ref<UserModel[]>([])

let isProcessingRequest = ref<boolean>(false)
let processingMessage = ref<string>('')

// Modales
const useModal = useModalMessage()
const basicModal = useModalMessage()

// Lista de dependencias visibles
const dependencias = Object.values(ListaDependencias)

// Validaciones del formulario
interface UpdateDatosUsuario {
  id?: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  email: string
  dependenciasVisibles: string[]
  rol: string
  activo?: boolean
}

// Variable para recueperar el cuerpo del formulario
let formData = ref<UpdateDatosUsuario>({
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  email: '',
  dependenciasVisibles: [],
  rol: ''
})

// Esquema de validación
const schemaForm = Yup.object({
  nombre: Yup.string().required('El nombre es requerido'),
  apellidoPaterno: Yup.string().required('El apellido paterno es requerido'),
  apellidoMaterno: Yup.string().required('El apellido materno es requerido'),
  email: Yup.string().email().required('El email no tiene un formato adecuado y es requerido'),
  dependenciasVisibles: Yup.array().required(
    'El usuario debe tener por lo menos una dependencia visible'
  ),
  rol: Yup.string().required('El rol para este usuario es requerido')
})

// Datos por default ligados al formulario para crear un nuevo usuario
const setFormDefault = (): UpdateDatosUsuario => ({
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  email: '',
  dependenciasVisibles: [],
  rol: ''
})

// Variable para recuperar errores
let formError = ref<Record<string, string>>({})

// Funcion de validacion del formulario
const validateRegister = async () => {
  try {
    isLoading.value = true
    await schemaForm.validate(formData.value, { abortEarly: false })
    await register()
    isLoading.value = false
  } catch (error) {
    let errorValidatormessage = ''
    isLoading.value = false
    const errorValidation = error as Yup.ValidationError
    errorValidation.inner.forEach((err) => {
      formError.value[`${err.path}`] = err.message
      errorValidatormessage += `*${err.message} `
      if (errorValidatormessage == '*email must be a valid email ') {
        errorValidatormessage = 'El formato de email no es válido'
      }
    })
    useModal.setMessage({
      title: 'Validación del formulario',
      message: errorValidatormessage,
      image: SharedImages.WarningImage
    })
    await useModal.showModal()
  }
}

// Función para registrar al usuario
async function register() {
  try {
    const response = await usersService.crearUsuarios(formData.value)
    const { message } = response.data
    const newUser = response.data.data
    listaUsuarios.value.unshift(newUser)
    // Preparar modal y mostrarlo al usuario con mensaje de Registro exitoso
    basicModal.setMessage({
      title: 'Registro exitoso',
      message: message,
      image: SharedImages.SuccesImage
    })
    await basicModal.showModal()
    formData.value = setFormDefault()
    formError = ref<Record<string, string>>({})
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

// FUNCION PARA MANEJAR LAS DEPENDENCIAS VISIBLES
const updateDependenciasVisibles = (dependencia: string) => {
  if (formData.value.dependenciasVisibles.includes(dependencia)) {
    // SI LA DEPENDENCIA YA ESTÁ EN EL ARRAY, LA ELIMINAMOS
    formData.value.dependenciasVisibles = formData.value.dependenciasVisibles.filter(
      (d) => d !== dependencia
    )
  } else {
    // SI LA DEPENDENCIA NO ESTÁ EN EL ARRAY, LA AGREGAMOS
    formData.value.dependenciasVisibles.push(dependencia)
  }
  updateBtnRegistrarState() // Actualizar el estado del botón después de modificar las dependencias
}

//PARA OCULTAR O MOSTRAR EL FORMULARIO DE DEPENDENCIAS VISIBLES
let noIsAdmin = false

const isAdmin = () => {
  noIsAdmin = false
  formData.value.dependenciasVisibles = dependencias
}
const isCommun = () => {
  noIsAdmin = true
}

// Función para verificar si todos los campos están llenos
const isFormValid = ref(false)

// Actualizar el estado del botón
const updateBtnRegistrarState = () => {
  if (formData.value.rol === 'ADMIN_USER') {
    //Si es admin ya no evaluara el formulario en el DependenciasVisibles
    isFormValid.value =
      formData.value.nombre.trim() !== '' &&
      formData.value.apellidoPaterno.trim() !== '' &&
      formData.value.apellidoMaterno.trim() !== '' &&
      formData.value.email.trim() !== ''
  } else if (formData.value.rol === 'COMMON_USER') {
    //Si NO es admin evaluara el formulario en el DependenciasVisibles
    isFormValid.value =
      formData.value.nombre.trim() !== '' &&
      formData.value.apellidoPaterno.trim() !== '' &&
      formData.value.apellidoMaterno.trim() !== '' &&
      formData.value.email.trim() !== '' &&
      formData.value.dependenciasVisibles.length > 0
  } else {
    isFormValid.value = false
  }
}

// Observar cambios en los campos del formulario para actualizar el estado del botón
watch(
  () => [
    formData.value.nombre,
    formData.value.apellidoPaterno,
    formData.value.apellidoMaterno,
    formData.value.email,
    formData.value.dependenciasVisibles,
    formData.value.rol
  ],
  () => {
    updateBtnRegistrarState()
  }
)

async function getAllUsers() {
  try {
    showCustomSpinnerLoading.value = true
    const response = await usersService.recuperarUsuarios()
    const usuarios = <UserModel[]>response.data.data
    listaUsuarios.value = usuarios
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

// Acciones tabla de usuarios
async function eliminarUsuario(user: UserModel) {
  confirmationModal.setMessage({
    title: 'Confirmación de eliminación',
    message: `¿Deseas eliminar al usuario '${user.email}'? Una vez eliminado ya no se podrá recuperar. Asegúrate de que no esté en uso`,
    image: SharedImages.TrashImage
  })
  const response = (await confirmationModal.showModal()) as boolean
  if (response) {
    await deleteUser(user)
  }
}

async function resetearPasswordUsuario(user: UserModel) {
  confirmationModal.setMessage({
    title: 'Confirmación de actualización',
    message: `¿Deseas actualizar el password del usuario '${user.email}'? Esto enviará al usuario sus nuevas credenciales de acceso`,
    image: SharedImages.WarningImage
  })
  const response = (await confirmationModal.showModal()) as boolean
  if (response) {
    await resetPassword(user)
  }
}

async function actualizarStatusUsuario(props: { disable: boolean; user: UserModel }) {
  let propsModal = {
    title: 'Desactivar usuario',
    message: `¿Deseas inactivar al usuario '${props.user.email}'? una vez inactivo el usuario no podrá acceder al sistema hasta que vuelva a ser activado`,
    image: SharedImages.TurnOffImage
  }
  if (!props.disable) {
    propsModal = {
      title: 'Activar usuario',
      message: `¿Deseas activar al usuario '${props.user.email}'? una vez activado el usuario podrá acceder a la sistema `,
      image: SharedImages.TurnOnImage
    }
  }
  confirmationModal.setMessage(propsModal)
  const response = (await confirmationModal.showModal()) as boolean
  if (response) {
    await updateUserStatus(props.user)
  }
}

//------Consumo de servicios para acciones tabla de usuarios-----//

//Conexión con el servicio de telemetria-api para eliminar un usuario por id
async function deleteUser(user: UserModel) {
  try {
    isProcessingRequest.value = true
    processingMessage.value = 'Eliminando datos...'
    const response = await usersService.eliminarUsuario(user.id!)
    const { message } = response.data
    listaUsuarios.value = listaUsuarios.value.filter((u) => u.id !== user.id!)
    isProcessingRequest.value = false
    basicModal.setMessage({
      title: 'Eliminación de usuario exitosa',
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

//Conexión con el servicio de telemetria-api para resetear password de un usuario
async function resetPassword(user: UserModel) {
  try {
    isProcessingRequest.value = true
    processingMessage.value = 'Actualizando datos...'
    const response = await usersService.resetUserPassword(user.id!)
    isProcessingRequest.value = false
    const { message } = response.data
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

//Conexión con el servicio de telemetria-api para actualizar el estatus de un usuario
async function updateUserStatus(user: UserModel) {
  try {
    isProcessingRequest.value = true
    processingMessage.value = 'Actualizando datos...'
    const response = await usersService.actualizarEstatus(!user.activo, user.id!)
    const { message } = response.data
    const index = listaUsuarios.value.findIndex((ind) => ind.id === user.id)
    listaUsuarios.value[index].activo = !user.activo
    isProcessingRequest.value = false
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
  await getAllUsers()
})
</script>

<template>
  <CustomLoading v-if="isProcessingRequest" :message="processingMessage" />
  <div class="wrapper">
    <div class="main">
      <main class="content">
        <div class="container-fluid p-4 animate__animated animate__fadeIn">
          <h1 class="h3 mb-3"><i class="bi bi-people"></i>&nbsp;Gestión de usuarios</h1>
          <div class="row">
            <div class="col-12">
              <div class="card card-with-border3">
                <div class="card-header">
                  <h5 class="card-title mb-0">Panel de administración</h5>
                </div>
              </div>
            </div>

            <div class="row">
              <!-- Formulario de registro -->
              <div class="col-md-12">
                <div class="card card-with-border1">
                  <div class="card-header">
                    <h5 class="card-title mb-0">
                      <i class="bi bi-person-add"></i>&nbsp;&nbsp;Alta de usuarios
                    </h5>
                  </div>
                  <div class="card-body">
                    <form action="" class="formValid" @submit.prevent="validateRegister">
                      <!-- Nombre completo -->
                      <label class="form-label">Nombre completo</label>
                      <input
                        class="form-control form-control-lg"
                        type="text"
                        name="nombre"
                        placeholder="Nombre(s)"
                        v-model="formData.nombre"
                        maxlength="20"
                      />
                      <br />
                      <div class="row">
                        <div class="col-6">
                          <input
                            class="form-control form-control-lg"
                            type="text"
                            name="apellidoPaterno"
                            placeholder="Apellido paterno"
                            v-model="formData.apellidoPaterno"
                            maxlength="11"
                          />
                        </div>
                        <div class="col-6">
                          <input
                            class="form-control form-control-lg"
                            type="texto"
                            name="apellidoMaterno"
                            placeholder="Apellido materno"
                            v-model="formData.apellidoMaterno"
                            maxlength="11"
                          />
                        </div>
                      </div>
                      <br />
                      <!-- Correo electrónico -->
                      <label class="form-label">Correo electrónico</label>
                      <input
                        class="form-control form-control-lg"
                        type="email"
                        name="email"
                        placeholder="Ingresa el correo electrónico"
                        v-model="formData.email"
                        maxlength="40"
                        :class="{ error: formError.email }"
                      />
                      <br />
                      <!-- Rol -->
                      <label class="form-label">Rol de este nuevo usuario:</label>
                      <ul class="">
                        <!-- administrador -->
                        <li class="list-group-item">
                          <input
                            type="radio"
                            id="opcion1"
                            name="opcion"
                            :value="UserType.Admin"
                            v-model="formData.rol"
                            @input="isAdmin"
                          />
                          <label for="opcion1">&nbsp;&nbsp;Administrador</label>
                        </li>
                        <!-- usuario común -->
                        <li class="list-group-item">
                          <input
                            type="radio"
                            id="opcion2"
                            name="opcion"
                            :value="UserType.Common"
                            v-model="formData.rol"
                            @input="isCommun"
                          />
                          <label for="opcion2">&nbsp;&nbsp;Usuario común</label>
                        </li>
                      </ul>
                      <!-- Dependencias Visibles -->
                      <div v-if="noIsAdmin" class="animate__animated animate__flipInX">
                        <label class="form-label"
                          >Dependencias que serán visibles para este usuario:</label
                        >
                        <ul class="list-group">
                          <li
                            class="list-group-item"
                            v-for="(dependencia, idx) of dependencias"
                            :key="idx"
                          >
                            <input
                              type="checkbox"
                              :id="`${idx}`"
                              :name="dependencia"
                              :checked="formData.dependenciasVisibles.includes(dependencia)"
                              @input="updateDependenciasVisibles(dependencia)"
                            />
                            <label :for="dependencia">&nbsp;&nbsp;{{ dependencia }}</label>
                          </li>
                        </ul>
                      </div>
                      <!-- Información de contraseña -->
                      <hr />
                      * Una contraseña temporal será generada y enviada automáticamente al correo
                      electrónico proporcionado para su posterior modificación.
                      <hr />
                      <!-- Botón de registro -->
                      <div class="" style="display: flex; justify-content: flex-end">
                        <button
                          type="submit"
                          class="btn btn-lg"
                          :disabled="!isFormValid"
                          :class="{
                            'btn-habilitado': isFormValid,
                            'btn-deshabilitado': !isFormValid
                          }"
                          @click.prevent="validateRegister"
                          ref="btnRegistrar"
                        >
                          <template v-if="!isLoading">Registrar</template>
                          <template v-else="isLoading">
                            <span
                              class="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Registrando...
                          </template>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <!-- Tabla de usuarios disponibles -->
              <div class="col-md-12 mt-4 mt-lg-0">
                <div class="card card-with-border2">
                  <div class="card-header">
                    <h5 class="card-title mb-0">
                      <i class="bi bi-person-bounding-box"></i>&nbsp;&nbsp;Usuarios registrados en
                      el sistema:
                    </h5>
                  </div>
                  <div class="card-body">
                    A continuación se enlistan todos los usuarios dados de alta en el sistema, desde
                    este panel podrás realizar algunas acciones para la gestión del sistema.
                    <br /><br />
                    <div class="scrollable-component">
                      <CustomSpinnerLoading v-if="showCustomSpinnerLoading"></CustomSpinnerLoading>
                      <template v-else>
                        <EmptyRecords v-if="listaUsuarios.length === 0"></EmptyRecords>
                        <table v-else class="table table-hover">
                          <thead>
                            <tr>
                              <th class="">Estado&emsp;</th>
                              <th class="">Nombre</th>
                              <th class="">Apellidos</th>
                              <th class="">Correo electronico</th>
                              <th class="">Rol</th>
                              <th class="">Servicios visibles</th>
                              <th class="">Acciones</th>
                              <th class=""></th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr class="animate__animated animate__bounceInRight" style="">
                              <td>
                                <span class="badge bg-success"
                                  ><i class="bi bi-check-circle"></i
                                ></span>
                                Activo
                              </td>
                              <td>
                                {{ userStore.user.nombre }}
                              </td>
                              <td>
                                {{ userStore.user.apellidoPaterno }}
                                {{ userStore.user.apellidoMaterno }}
                              </td>
                              <td>
                                {{ userStore.user.email }}
                              </td>
                              <td>
                                <span v-if="userStore.user.rol == 'ADMIN_USER'">Administrador</span>
                                <span v-else>Usuario común</span>
                              </td>
                              <td>
                                <ul style="list-style-type: none; padding-left: 0">
                                  <li
                                    v-for="(itemm, idxx) of userStore.user.dependenciasVisibles"
                                    :key="idxx"
                                  >
                                    <i class="bi bi-check"></i> {{ itemm }}
                                  </li>
                                </ul>
                              </td>
                              <td>
                                <i class="bi bi-person-vcard"></i> Sesión iniciada con este perfil
                              </td>
                            </tr>
                            <tr
                              v-for="(item, idx) in listaUsuarios"
                              :key="idx"
                              class="animate__animated animate__bounceInRight"
                              v-show="item.email != userStore.user.email"
                            >
                              <td>
                                <span v-if="item.activo" class="badge bg-success"
                                  ><i class="bi bi-check-circle"></i
                                ></span>
                                <span v-else class="badge bg-danger"
                                  ><i class="bi bi-x-circle"></i
                                ></span>
                                {{ item.activo ? 'Activo' : 'Inactivo' }}
                              </td>
                              <td class="">{{ item.nombre }}</td>
                              <td class="">
                                {{ item.apellidoPaterno + ' ' + item.apellidoMaterno }}
                              </td>
                              <td class="">{{ item.email }}</td>
                              <td class="">
                                {{
                                  item.rol === UserType.Admin ? 'Administrador' : 'Usuario común'
                                }}
                              </td>
                              <td class="">
                                <ul style="list-style-type: none; padding-left: 0">
                                  <li
                                    v-for="(itemm, idxx) of item.dependenciasVisibles"
                                    :key="idxx"
                                  >
                                    <i class="bi bi-check"></i> {{ itemm }}
                                  </li>
                                </ul>
                              </td>
                              <td class="">
                                <button
                                  @click="eliminarUsuario(item)"
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
                                  v-if="item.activo"
                                  @click="actualizarStatusUsuario({ disable: true, user: item })"
                                  type="button"
                                  class="btn btn-danger"
                                  style="
                                    --bs-btn-padding-y: 0.25rem;
                                    --bs-btn-padding-x: 0.5rem;
                                    --bs-btn-font-size: 0.75rem;
                                  "
                                >
                                  Desactivar
                                  <i class="bi bi-x-lg"></i>
                                </button>
                                <button
                                  v-else
                                  @click="actualizarStatusUsuario({ disable: false, user: item })"
                                  type="button"
                                  class="btn btn-info"
                                  style="
                                    --bs-btn-padding-y: 0.25rem;
                                    --bs-btn-padding-x: 0.5rem;
                                    --bs-btn-font-size: 0.75rem;
                                  "
                                >
                                  Activar
                                  <i class="bi bi-check-lg"></i>
                                </button>
                                <button
                                  @click="resetearPasswordUsuario(item)"
                                  type="button"
                                  class="btn btn-info m-2"
                                  style="
                                    --bs-btn-padding-y: 0.25rem;
                                    --bs-btn-padding-x: 0.5rem;
                                    --bs-btn-font-size: 0.75rem;
                                  "
                                >
                                  Reset password
                                  <i class="bi bi-arrow-clockwise"></i>
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
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Estilo para el botón habilitado */
.btn-habilitado {
  border-color: #90caf9;
  background-color: #90caf9;
  color: #fff;
}

/* Estilo para el botón deshabilitado */
.btn-deshabilitado {
  border-color: #ccc;
  background-color: #ccc;
  color: #888;
}
.table-responsive {
  overflow-x: auto;
}
</style>
