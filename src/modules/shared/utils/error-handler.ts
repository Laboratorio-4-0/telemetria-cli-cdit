import type { AxiosError } from 'axios'

interface ApiTelemetriaResponse {
  statusCode: number
  message?: string
  data?: any[]
}

export const buildErrorMessage = (err: any): string => {
   const mensajeErrorGenerico = '¡Hubo un error interno al tratar de realizar la petición!'
  if (err.response) {
    // Error al procesar información statuscode 2.x.x
    const error = err as AxiosError<ApiTelemetriaResponse>
    const detalles = error.response?.data.data ?? ""
    return (error.response?.data.message) ? `${error.response?.data.message} 
    ${detalles}` : mensajeErrorGenerico
  } else if (err.request) {
    // Error de conexión con el servidor
    return '¡Hubo un error al conectar con el servidor, intente más tarde!'
  } else {
    // Error interno
    return mensajeErrorGenerico
  }
}
