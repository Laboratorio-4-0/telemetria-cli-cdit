import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserModel } from '../types/users'

export const useUserStore = defineStore('userStore', () => {
  const listaUsuarios = ref<UserModel[]>([])

  const user = ref<UserModel>({
    nombre: '',
    dependenciasVisibles: [],
    apellidoMaterno: '',
    apellidoPaterno: '',
    rol: '',
    email: '',
    activo: true
  })

  //Para el color del avatar
  let colorAleatorio = ref('')

  function generarColorAleatorio() {
    const coloresMate = [
      '#f696af',
      '#aa77c3',
      '#6571ac',
      '#c7BDA7',
      '#2F617B',
      '#9B9B9B',
      '#BB9847'
    ]

    const colorAleatorio = coloresMate[Math.floor(Math.random() * coloresMate.length)]

    return colorAleatorio
  }

  colorAleatorio.value = generarColorAleatorio()

  function setUserProps(userProps: UserModel) {
    user.value = userProps
  }

  function cleanStore() {
    user.value = {
      nombre: '',
      dependenciasVisibles: [],
      apellidoMaterno: '',
      apellidoPaterno: '',
      rol: '',
      email: '',
      activo: true
    }
  }

  function setUserListProps(lista: UserModel[]) {
    listaUsuarios.value = lista
  }

  function updateUserPropsById(id: string, userUp: UserModel) {
    let idx = listaUsuarios.value.findIndex((user) => user.id === id)
    listaUsuarios.value[idx] = userUp
  }

  function addToUserListProps(user: UserModel) {
    listaUsuarios.value.unshift(user)
  }

  return {
    user,
    setUserProps,
    cleanStore,
    setUserListProps,
    updateUserPropsById,
    listaUsuarios,
    addToUserListProps,
    colorAleatorio
  }
})
