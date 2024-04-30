import { reactive } from 'vue'
import { io } from 'socket.io-client'
import type { MedicionModel } from '@/modules/svc-sensores/views/types'
import { ChannelsSocket, ServiceSocketRooms } from '@/modules/shared/types/socket'

type StateSocketEvent = {
  connected: boolean
  MedicionesEvent: MedicionModel[] | undefined
}

export const stateSocketEventsSensores = reactive<StateSocketEvent>({
  connected: false,
  MedicionesEvent: undefined
})

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  import.meta.env.VITE_ENVIRONMENT === 'dev'
    ? import.meta.env.VITE_TELEMETERIA_API_BASE_SOCKET_DEV
    : import.meta.env.VITE_TELEMETERIA_API_BASE_SOCKET_PROD

/* export const socket = io(URL); */
export const socketSensores = io(URL, {
  transports: ['websocket'],
  autoConnect: true,
  forceNew: true,
  query: {
    //'token':token,
    'service-room': ServiceSocketRooms.SesonresGraficasRoom
  }
})

socketSensores.on('connect', () => {
  stateSocketEventsSensores.connected = true
})

socketSensores.on('disconnect', () => {
  stateSocketEventsSensores.connected = false
})

//Socket para las mediciones de los sensores de Co2
socketSensores.on(ChannelsSocket.EmiteMediciones, (evento) => {
  stateSocketEventsSensores.MedicionesEvent = evento
})
