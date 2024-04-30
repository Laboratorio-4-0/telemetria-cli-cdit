import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ListaDependencias } from '@/modules/shared/types/dependencias'

export const useDependenciasStore = defineStore('dependenciasStore', () => {
  const listaDependencias = ref<ListaDependencias[]>([])
  const dependenciasInactivas = ref<ListaDependencias[]>([])

  function setListaDependencias(lista: ListaDependencias[]) {
    listaDependencias.value = lista
  }
  function setListaDependenciasInactivas(lista: ListaDependencias[]) {
    dependenciasInactivas.value = lista
  }

  return {
    listaDependencias,
    dependenciasInactivas,
    setListaDependencias,
    setListaDependenciasInactivas
  }
})
