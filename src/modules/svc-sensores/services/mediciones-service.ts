import { TelemetriaApiConnections } from '@/modules/shared/utils/telemetria-api-connections'
export class MedicionesService {
  constructor() {}

  /* conecta con la api telemetria-api para obtener las ultimas mediciones alamacenadas en la BD*/
  public async GetUltimasMediciones() {
    const endpoint = '/sensores/mediciones'
    const { data } = await TelemetriaApiConnections.Instance.Get({
      endpoint: endpoint,
      requiresRefreshToken: true
    })

    return data
  }
}
