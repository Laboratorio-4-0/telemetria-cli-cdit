import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useModalConfirmationMessage = defineStore('confirmationModal', () => {
  const title = ref('')
  const message = ref('')
  const image = ref(undefined)

  function setMessage(props: { title: string; message: string; image: any }) {
    title.value = props.title
    message.value = props.message
    if (props.image) {
      image.value = props.image
    }
  }

  function cleanModal() {
    title.value = ''
    message.value = ''
    image.value = undefined
  }

  function showModal() {
    // Acceder al botón que muestra el modal
    const buttonEventModal = document.getElementById(
      'modalConfirmationButtonTrigger'
    ) as HTMLButtonElement
    // Triguerear el clik que muestra el modal
    buttonEventModal.click()
    // Esperar la confirmación o rechazo del proceso
    return new Promise((resolve) => {
      const onClick = (response: boolean) => {
        resolve(response)
        cleanModal()
      }
      const aceptBtn = document.getElementById('aceptConfirmationModal') as HTMLButtonElement
      const cancelBtn = document.getElementById('canelConfirmationModal') as HTMLButtonElement
      aceptBtn.addEventListener('click', onClick.bind(null, true))
      cancelBtn.addEventListener('click', onClick.bind(null, false))
    })
  }

  return { showModal, setMessage, title, message, image }
})
