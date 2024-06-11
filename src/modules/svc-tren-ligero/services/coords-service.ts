import { TelemetriaApiConnections } from '@/modules/shared/utils/telemetria-api-connections'
import type { Axios, AxiosPromise } from 'axios'

export class CoordsService {
  constructor() {}

  /* conecta con la api telemetria-api para obtener las coordenaas actuales*/
  public async GetCurrentCoordsTrenes() {
    const endpoint = '/tren-ligero/lista-trenes'
    const { data } = await TelemetriaApiConnections.Instance.Get({
      endpoint: endpoint,
      requiresRefreshToken: true
    })

    return data
  }
}

export class estimacionesService {
  constructor() {}

  /* conecta con la api telemetria-api para obtener las coordenaas actuales*/
  public async estimacionesService(estacion: any, sentido: any): AxiosPromise {
    const endpoint = '/tren-ligero/estimacion-tren'
    return await TelemetriaApiConnections.Instance.Post({
      endpoint,
      data: {"estacion": estacion, "sentido": sentido},
      requiresRefreshToken: true
    })
  }
}