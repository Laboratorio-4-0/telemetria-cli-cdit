import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './modules/shared/router'

/* Import scss bootstrap */
import './styles/styles.scss'
/* Bootstrp icons */
import 'bootstrap-icons/font/bootstrap-icons.css'
/* Animaciones y efectos https://animate.style/ */
import 'animate.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
