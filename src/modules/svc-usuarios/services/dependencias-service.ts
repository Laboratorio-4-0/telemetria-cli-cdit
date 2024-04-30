import type { ListaDependencias } from '@/modules/shared/types/dependencias'
import { TelemetriaApiConnections } from '@/modules/shared/utils/telemetria-api-connections'
import type { AxiosPromise } from 'axios'

export class DependenciasService {
  constructor() {}

  public async getListaDependencias(): AxiosPromise {
    const endpoint = `/gestion/lista-dependencias`
    return await TelemetriaApiConnections.Instance.Get({
      endpoint,
      requiresRefreshToken: true
    })
  }

  public async getListaDependenciasInactivas(): AxiosPromise {
    const endpoint = `/gestion/lista-dependencias-inactivas`
    return await TelemetriaApiConnections.Instance.Get({
      endpoint,
      requiresRefreshToken: true
    })
  }

  public async activarDependencia(nombreDependencia: ListaDependencias): AxiosPromise {
    const endpoint = `/gestion/activar-dependencia/${nombreDependencia}`
    return await TelemetriaApiConnections.Instance.Get({
      endpoint,
      requiresRefreshToken: true
    })
  }

  public async desactivarDependencia(nombreDependencia: ListaDependencias): AxiosPromise {
    const endpoint = `/gestion/desactivar-dependencia/${nombreDependencia}`
    return await TelemetriaApiConnections.Instance.Get({
      endpoint,
      requiresRefreshToken: true
    })
  }

  public async getStatusDependencia(nombreDependencia: ListaDependencias): AxiosPromise {
    const endpoint = `/gestion/status-dependencia/${nombreDependencia}`
    return await TelemetriaApiConnections.Instance.Get({
      endpoint,
      requiresRefreshToken: true
    })
  }


}
