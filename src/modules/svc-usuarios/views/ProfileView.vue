<script setup lang="ts">
import { getUserPayloadFromToken } from '@/modules/shared/utils/jwt-decode'
import { UserType } from '../types/users'
import { useModalConfirmationMessage } from '@/modules/shared/store/useModalConfirmation'
import { SharedImages } from '@/modules/shared/images'
import { useUserStore } from '../store/useUserStore'
import { useModalMessage } from '@/modules/shared/store/useModalMessage'
import type { UpdateUserModel } from '../types/users'
import { UserService } from '../services/user-service.js'
import type { UserModel } from '@/modules/svc-usuarios/types/users'
import { buildErrorMessage } from '@/modules/shared/utils/error-handler'
import * as Yup from 'yup'
import { ref, watch } from 'vue'

const infoUsuarioFromToken = getUserPayloadFromToken()
const useModalConfirmation = useModalConfirmationMessage()
let isUpdating = ref<boolean>(false)
const useModal = useModalMessage()
const updateservice = new UserService()
const userStore = useUserStore()

//Para mostrar la contraseña
let showPassword = ref<boolean>(true)

// Función para verificar si todos los campos están llenos
const isFormValid = ref(false)

//Validaciones del Formulario
const setFormDefault = (): UpdateUserModel => ({
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  email: '',
  password: ''
})

// Cuerpo de los campos que se validarán del formulario
let formData = ref<UpdateUserModel>(setFormDefault())

// Captura los errores de validacion del schemaForm
let formError = ref<Record<string, string>>({})

// Definición de las validaciones que se deberán seguir
const schemaForm = Yup.object({
  nombre: Yup.string().optional().max(30, 'El nombre debe contener como máximo 30 caracteres'),
  apellidoPaterno: Yup.string()
    .optional()
    .max(30, 'El apellido paterno debe contener como máximo 30 caracteres'),
  apellidoMaterno: Yup.string()
    .optional()
    .max(30, 'El apellido materno debe contener como máximo 30 caracteres'),
  email: Yup.string().email('Ingresar un email que sea válido').optional(),
  password: Yup.string().optional().max(20, 'La contraseña debe contener como máximo 20 caracteres')
})

// Actualizar el estado del botón
const updateBtnActualizarState = () => {
  isFormValid.value =
    formData.value.nombre.trim() !== '' ||
    formData.value.apellidoPaterno.trim() !== '' ||
    formData.value.apellidoMaterno.trim() !== '' ||
    formData.value.email.trim() !== '' ||
    formData.value.password.trim() !== ''
  //Si hay algun caracter en cualquier input del formulario el valor sera true
  if (isFormValid.value) {
    if (formData.value.nombre.trim() !== '') {
      if (formData.value.nombre.length < 2) isFormValid.value = false
    }
    if (formData.value.apellidoPaterno.trim() !== '') {
      if (formData.value.apellidoPaterno.length < 2) isFormValid.value = false
    }
    if (formData.value.apellidoMaterno.trim() !== '') {
      if (formData.value.apellidoMaterno.length < 2) isFormValid.value = false
    }
    if (formData.value.password.trim() !== '') {
      if (formData.value.password.length < 8) isFormValid.value = false
    }
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
    formData.value.password
  ],
  () => {
    updateBtnActualizarState()
  }
)

async function updateInfo() {
  try {
    isUpdating.value = true
    await schemaForm.validate(formData.value, { abortEarly: false })
    useModalConfirmation.setMessage({
      message: '¿Deseas continuar con los cambios?',
      title: 'Confirmación de cambios',
      image: SharedImages.QuestionImage
    })
    const response = (await useModalConfirmation.showModal()) as boolean
    if (response) {
      await update()
      formData.value = setFormDefault()
    }
    isUpdating.value = false
  } catch (error) {
    let errorValidatormessage = ''
    const errorValidation = error as Yup.ValidationError
    errorValidation.inner.forEach((err) => {
      formError.value[`${err.path}`] = err.message
      errorValidatormessage += `*${err.message} `
    })
    useModal.setMessage({
      title: 'Validación del formulario',
      message: errorValidatormessage,
      image: SharedImages.WarningImage
    })
    await useModal.showModal()
  }
}

//Función para la actualización de datos usando la api
const update = async () => {
  try {
    const { uid } = getUserPayloadFromToken()
    const { data } = await updateservice.actualizarDatosUsuario(
      {
        nombre: formData.value.nombre,
        apellidoPaterno: formData.value.apellidoPaterno,
        apellidoMaterno: formData.value.apellidoMaterno,
        email: formData.value.email,
        password: formData.value.password
      },
      uid
    )
    const userUpdated: UserModel = <UserModel>data.data
    userStore.setUserProps(userUpdated)
    useModal.setMessage({
      title: 'Actualización de datos',
      message: data.message,
      image: SharedImages.SuccesImage
    })
    await useModal.showModal()
  } catch (error) {
    const message = buildErrorMessage(error)
    useModal.setMessage({
      title: 'Error al actualizar los datos de perfil',
      message: message,
      image: SharedImages.ErrorImage
    })
    await useModal.showModal()
  }
}

//Funcion para mostrar contraseña
function mostrarPassword() {
  showPassword.value = !showPassword.value
}

//Para el estilo del avatar
let estiloAvatar = {
  width: '140px',
  height: '140px',
  borderRadius: '50%', //'15px 0 15px 0',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: userStore.colorAleatorio
}
</script>
<template>
  <div class="wrapper">
    <div class="main">
      <main class="content">
        <div class="container-fluid p-4">
          <div class="mb-3">
            <h1 class="h4 d-inline align-middle" style="color: dimgray">
              &nbsp;Hola
              <b>{{ userStore.user.nombre }} {{ userStore.user.apellidoPaterno }}</b>
              te damos la bienvenida!
            </h1>
            <hr />
          </div>
          <div class="row justify-content-center my-4">
            <div class="col-md-4 animate__animated animate__bounceInLeft">
              <div class="card mb-3 card-with-border1">
                <div class="card-header">
                  <h5 class="card-title mb-0">
                    <i class="bi bi-layout-text-sidebar-reverse"></i>&nbsp;&nbsp;Detalles del perfil
                  </h5>
                </div>
                <div class="card-body text-center">
                  <div style="display: flex; justify-content: center; align-items: center">
                    <div class="card" :style="estiloAvatar">
                      <span class="avatar-text">
                        {{
                          userStore.user.nombre.charAt(0) + userStore.user.apellidoPaterno.charAt(0)
                        }}
                      </span>
                    </div>
                  </div>
                  <h5 class="card-title mb-0">
                    {{
                      `${userStore.user.nombre} ${userStore.user.apellidoPaterno} ${userStore.user.apellidoMaterno}`
                    }}
                  </h5>
                  <br />
                  <div>
                    <span class="badge bg-info text-white me-1 my-1">
                      <div class="">
                        {{
                          infoUsuarioFromToken?.rol === UserType.Admin
                            ? 'Administrador'
                            : 'Usuario común'
                        }}
                      </div>
                    </span>
                  </div>
                </div>
                <hr class="my-0" />
                <div class="card-body">
                  <h5 class="h6 card-title">Dependencias visibles:</h5>
                  <span
                    v-for="(dependencia, idx) of userStore.user.dependenciasVisibles"
                    :key="idx"
                    class="badge bg-secondary me-1 my-1"
                    ><i class="bi bi-check2"></i>&nbsp;{{ dependencia }}
                  </span>
                </div>
                <hr class="my-0" />
                <div class="card-body">
                  <h5 class="h6 card-title">Informacion general del usuario</h5>
                  <p>
                    <b>Nombre: </b>
                    {{
                      `${userStore.user.nombre} ${userStore.user.apellidoPaterno} ${userStore.user.apellidoMaterno}`
                    }}
                  </p>
                  <p><b>Email: </b> {{ userStore.user.email }}</p>
                  <p>
                    <b>Rol: </b>
                    {{
                      infoUsuarioFromToken?.rol === UserType.Admin
                        ? 'Administrador'
                        : 'Usuario común'
                    }}
                  </p>
                </div>
              </div>
            </div>
            <!-- Formulario de configuración -->
            <div class="col-md-8 mt-4 mt-lg-0 animate__animated animate__bounceInRight">
              <div class="card card-with-border3">
                <div class="card-header">
                  <h5 class="card-title mb-0">
                    <i class="bi bi-gear"></i>&nbsp;&nbsp;Ajustes de mi perfil
                  </h5>
                </div>
                <div class="card-body">
                  <!-- Nombre completo -->
                  <label class="form-label">Nombre</label>
                  <input
                    class="form-control form-control-lg"
                    type="text"
                    name="nombre"
                    placeholder="Nombre(s)"
                    :maxlength="30"
                    v-model="formData.nombre"
                  />
                  <br />
                  <div class="row">
                    <div class="col-6">
                      <label class="form-label">Apellido paterno</label>
                      <input
                        class="form-control form-control-lg"
                        type="text"
                        name="apellidoPaterno"
                        placeholder="Apellido paterno"
                        :maxlength="30"
                        v-model="formData.apellidoPaterno"
                      />
                    </div>
                    <div class="col-6">
                      <label class="form-label">Apellido materno</label>
                      <input
                        class="form-control form-control-lg"
                        type="texto"
                        name="apellidoMaterno"
                        placeholder="Apellido materno"
                        :maxlength="30"
                        v-model="formData.apellidoMaterno"
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
                    placeholder="Ingresa el nuevo correo electrónico"
                    v-model="formData.email"
                  />
                  <br />
                  <!-- Contraseña -->
                  <label class="form-label">Constraseña</label>
                  <div class="input-group">
                    <input
                      class="form-control form-control-lg"
                      :type="showPassword ? 'password' : 'text'"
                      name="password"
                      placeholder="Ingresa tu contraseña"
                      v-model="formData.password"
                      :class="{ error: formError.password }"
                    />
                    <span class="input-group-text">
                      <i
                        @click="mostrarPassword()"
                        :class="showPassword ? 'bi bi-eye' : 'bi bi-eye-slash'"
                      ></i>
                    </span>
                  </div>
                  <br />
                  <!-- Botón de registro -->
                  <div class="" style="display: flex; justify-content: flex-end">
                    <button
                      @click="updateInfo()"
                      type="button"
                      class="btn btn-lg btn-primary"
                      style="border-color: #b0d56a; background-color: #b0d56a"
                      :disabled="!isFormValid"
                    >
                      <template v-if="!isUpdating">Actualizar</template>
                      <template v-else="isUpdating">
                        <span
                          class="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Actualizando...
                      </template>
                    </button>
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
.avatar-text {
  font-size: 46px;
  font-family: 'Source Sans Pro', sans-serif;
  color: #ffffff;
}
.input-group-text {
  background: #ffffff;
  border: 1;
  cursor: pointer;
  padding: 11;
  border-left: none;
}
</style>
