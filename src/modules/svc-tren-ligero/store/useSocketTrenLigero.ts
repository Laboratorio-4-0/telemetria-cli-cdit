import { reactive } from 'vue'
import { io } from 'socket.io-client'
import { ChannelsSocket, ServiceSocketRooms } from '@/modules/shared/types/socket'
import type { TrenLocationEventUpdate } from '../views/mapa/types'

type StateSocketEvent = {
  connected: boolean
  locationEvent: TrenLocationEventUpdate | undefined
}

export const stateSocketEventsTrenLigero = reactive<StateSocketEvent>({
  connected: false,
  locationEvent: undefined
})

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  import.meta.env.VITE_ENVIRONMENT === 'dev'
    ? import.meta.env.VITE_TELEMETERIA_API_BASE_SOCKET_DEV
    : import.meta.env.VITE_TELEMETERIA_API_BASE_SOCKET_PROD

/* export const socket = io(URL); */
export const socketTrenLigero = io(URL, {
  transports: ['websocket'],
  autoConnect: true,
  forceNew: true,
  query: {
    //'token':token,
    'service-room': ServiceSocketRooms.TrenLigeroCoordsRoom
  }
})

socketTrenLigero.on('connect', () => {
  stateSocketEventsTrenLigero.connected = true
})

socketTrenLigero.on('disconnect', () => {
  stateSocketEventsTrenLigero.connected = false
})

//Socket para las coordenadas del Tren Ligero
socketTrenLigero.on(ChannelsSocket.EmiteCoordsChannel, (event) => {
  stateSocketEventsTrenLigero.locationEvent = {
    idtren: event.idTren,
    latitude: event.latitude,
    longitude: event.longitude,
    velocidad: event.velocidad
  }
})
