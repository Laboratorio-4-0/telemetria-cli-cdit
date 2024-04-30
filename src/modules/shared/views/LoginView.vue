<template>
  <main class="d-flex w-100" style="background-color: #eeeeee">
    <div class="container d-flex flex-column animate__animated animate__fadeInUp">
      <div class="row vh-100">
        <div class="col-sm-10 col-md-8 col-lg-6 mx-auto d-table h-100">
          <div class="d-table-cell align-middle">
            <div class="card">
              <div class="card-body">
                <div class="m-sm-4">
                  <div class="text-center">
                    <div class="text-center mt-4">
                      <h1 class="h2">
                        <img
                          :src="SharedImages.CdmxLogoImage"
                          alt="Logotipo de la Ciudad de México"
                          class="img-fluid rounded-circle"
                          width="40"
                          height="40"
                        />
                        Plataforma de telemetría
                      </h1>
                      <p class="lead">Ingresa tus credenciales para acceder al sistema.</p>
                    </div>
                  </div>
                  <hr />
                  <form action="" class="formLogin" @submit.prevent="iniciarSesion">
                    <div class="mb-3">
                      <label class="form-label">Correo electrónico</label>
                      <input
                        class="form-control form-control-lg"
                        type="email"
                        name="email"
                        placeholder="Ingresa tu correo electrónico"
                        v-model="formData.email"
                        :class="{ error: formError.email }"
                      />
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Contraseña</label>
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
                      <small>
                        <br />
                        <span style="color: #75293d"><u>Laboratorio de Industria 4.0</u></span>
                      </small>
                    </div>
                    <div>
                      <!-- <label class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          value="remember-me"
                          name="remember-me"
                          style="border-color: #75293d; background-color: #75293d"
                          checked
                        />
                        <span class="form-check-label">
                          Guardar las credenciales para la próxima ocasión
                        </span>
                      </label> -->
                    </div>
                    <div class="text-center mt-3">
                      <br />
                      <button
                        type="submit"
                        class="btn btn-lg btn-primary"
                        :disabled="isLoading"
                        style="border-color: #75293d; background-color: #75293d"
                      >
                        <template v-if="!isLoading">Iniciar sesión</template>
                        <template v-else="isLoading">
                          <span
                            class="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Verificando...
                        </template>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import * as Yup from 'yup'
import { buildErrorMessage } from '../utils/error-handler'
import { useModalMessage } from '../store/useModalMessage'
import { AuthService } from '../services/auth-service'
import router from '../router'
import { SharedImages } from '../images'
import { useCookies } from 'vue3-cookies'
import { CookieNames } from '../types/jwt'

//Para mostrar la contraseña
let showPassword = ref<boolean>(true)

const useModal = useModalMessage()
let isLoading = ref<boolean>(false)

interface LoginCredentials {
  email: string
  password: string
}

const authservice = new AuthService()

const setFormDefault = (): LoginCredentials => ({
  email: '',
  password: ''
})

// Cuerpo de los campos que se validarán del formulario
let formData = ref<LoginCredentials>(setFormDefault())
// Captura los errores de validacion del schemaForm
let formError = ref<Record<string, string>>({})

// Definición de las validaciones que se deberán seguir
const schemaForm = Yup.object({
  email: Yup.string().email().required('El email es requerido'),
  password: Yup.string().required('El password es requerido')
})

const iniciarSesion = async () => {
  try {
    isLoading.value = true
    await schemaForm.validate(formData.value, { abortEarly: false })
    await login()
    isLoading.value = false
    formData.value = setFormDefault()
  } catch (error) {
    let errorValidatormessage = ''
    isLoading.value = false
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

async function login() {
  try {
    const { data } = await authservice.AutenticaUsuario({
      email: formData.value.email,
      password: formData.value.password
    })
    // Get tokens
    const token = data.data.token
    const refreshToken = data.data.refreshToken
    const tokenId = data.data.tokenId
    // Save as cookies
    useCookies().cookies.set(CookieNames.SessionCookieName, token)
    useCookies().cookies.set(CookieNames.RefreshTokenCookieName, refreshToken)
    useCookies().cookies.set(CookieNames.SessionTokenId, tokenId)
    // Redirect to profile
    router.push({ path: '/dashborad/profile' })
  } catch (error) {
    const message = buildErrorMessage(error)
    useModal.setMessage({
      title: 'Error de autenticación',
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
</script>

<style lang="scss" scoped>
.h2 {
  text-align: left;
}
.lead {
  text-align: left;
}
.formLogin {
  input.error {
    border-color: #faa;
    background-color: #ffeded;
  }
}
.input-group-text {
  background: #e9ecef;
  border: 1;
  cursor: pointer;
  padding: 11;
}
</style>
