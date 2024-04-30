import { TelemetriaApiConnections } from '@/modules/shared/utils/telemetria-api-connections'
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
