import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTrenLigeroStore = defineStore('trenLigeroStore', () => {
  const mapApiKey = ref<string>('')
  function setApiKey(api: string) {
    mapApiKey.value = api
  }

  return {
    mapApiKey,
    setApiKey,
  }
})
