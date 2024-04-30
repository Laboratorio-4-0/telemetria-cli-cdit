import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useModalMessage = defineStore('basicModal', () => {
  const title = ref('')
  const message = ref('')
  const image = ref(undefined)

  function setMessage(props: { title: string; message: string; image?: any }) {
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
    const buttonEventModal = document.getElementById('basicModalButtonTrigger') as HTMLButtonElement
    buttonEventModal.click()
    return new Promise((resolve) => {
      const onClouseModalClick = (response: boolean) => {
        resolve(response)
        cleanModal()
      }
      const closeBtn = document.getElementById('closeBasicModal') as HTMLButtonElement
      closeBtn.addEventListener('click', onClouseModalClick.bind(null, true))
    })
  }
  return { setMessage, title, message, image, showModal }
})
