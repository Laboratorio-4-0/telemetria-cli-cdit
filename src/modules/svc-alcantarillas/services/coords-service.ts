import { TelemetriaApiConnections } from '@/modules/shared/utils/telemetria-api-connections'
import type { AlcantarillaLocationEventUpdate } from '@/modules/svc-alcantarillas/views/mapa/types'

export class CoordsService {
  constructor() {}

  /* conecta con la api telemetria-api para obtener las coordenaas actuales*/
  public async GetCurrentCoordsTrenes() {
    const endpoint = '/alcantarillas/lista-alcantarillas' // del back
    const { data } = await TelemetriaApiConnections.Instance.Get({ endpoint: endpoint, requiresRefreshToken:true })
    
    const transformardData: AlcantarillaLocationEventUpdate[] = data.data.map((item: AlcantarillaLocationEventUpdate) => ({
      idAlcantarilla: item.idAlcantarilla,
      latitude: item.latitude,
      longitude: item.longitude
    }));

    return transformardData
  }
}
