import { reactive } from 'vue'
import { io } from 'socket.io-client'
import { ChannelsSocket, ServiceSocketRooms } from '@/modules/shared/types/socket'
import type { AlcantarillaLocationEventUpdate } from '../views/mapa/types'

type StateSocketEvent = {
  connected: boolean
  locationEventAlcantarilla: AlcantarillaLocationEventUpdate | undefined
}

export const stateSocketEventsAlcantarillas = reactive<StateSocketEvent>({
  connected: false,
  locationEventAlcantarilla: undefined
})

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  import.meta.env.VITE_ENVIRONMENT === 'dev'
    ? import.meta.env.VITE_TELEMETERIA_API_BASE_SOCKET_DEV
    : import.meta.env.VITE_TELEMETERIA_API_BASE_SOCKET_PROD

/* export const socket = io(URL); */
export const socketAlcantarillas = io(URL, {
  transports: ['websocket'],
  autoConnect: true,
  forceNew: true,
  query: {
    //'token':token,
    'service-room': ServiceSocketRooms.AlcantarillasCoordsRoom
  }
})

socketAlcantarillas.on('connect', () => {
  stateSocketEventsAlcantarillas.connected = true
})

socketAlcantarillas.on('disconnect', () => {
  stateSocketEventsAlcantarillas.connected = false
})

//Socket para las coordenadas de las alcantarillas
socketAlcantarillas.on(ChannelsSocket.EmiteCoordsAlcantarillas, (event) => {
  stateSocketEventsAlcantarillas.locationEventAlcantarilla = {
    idAlcantarilla: event.idAlcantarilla,
    latitude: event.latitude,
    longitude: event.longitude
  }
})
