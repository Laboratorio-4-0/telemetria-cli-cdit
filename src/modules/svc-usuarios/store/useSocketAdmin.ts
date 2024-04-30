import { reactive } from 'vue'
import { io } from 'socket.io-client'
import { ChannelsSocket, ServiceSocketRooms } from '@/modules/shared/types/socket'
import type { ErrorRecordModel } from '../types/errors-logs'

type StateSocketEvent = {
  connected: boolean
  NewExternalErrorEvent: ErrorRecordModel | undefined
}

export const stateSocketEventsAdminDashboard = reactive<StateSocketEvent>({
  connected: false,
  NewExternalErrorEvent: undefined
})

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  import.meta.env.VITE_ENVIRONMENT === 'dev'
    ? import.meta.env.VITE_TELEMETERIA_API_BASE_SOCKET_DEV
    : import.meta.env.VITE_TELEMETERIA_API_BASE_SOCKET_PROD

/* export const socket = io(URL); */
export const socketAdminDashboard = io(URL, {
  transports: ['websocket'],
  autoConnect: true,
  forceNew: true,
  query: {
    //'token':token,
    'service-room': ServiceSocketRooms.AdminDashboardRoom
  }
})

socketAdminDashboard.on('connect', () => {
  stateSocketEventsAdminDashboard.connected = true
})

socketAdminDashboard.on('disconnect', () => {
  stateSocketEventsAdminDashboard.connected = false
})

// Socet para un nuevo error externo registrado
socketAdminDashboard.on(ChannelsSocket.EmiteNewErrorLog, (event) => {
  stateSocketEventsAdminDashboard.NewExternalErrorEvent = event
})
