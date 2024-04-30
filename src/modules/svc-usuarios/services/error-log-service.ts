import { TelemetriaApiConnections } from '@/modules/shared/utils/telemetria-api-connections'
import type { AxiosPromise } from 'axios'

export class ErrorLogService {
  constructor() {}

  public async getErrorLogs(): AxiosPromise {
    const endpoint = `/gestion/lita-errores`
    return await TelemetriaApiConnections.Instance.Get({
      endpoint,
      requiresRefreshToken: true
    })
  }

  public async deleteErrorById(uid: string): AxiosPromise {
    const endpoint = `/gestion/elimina-error/${uid}`
    return await TelemetriaApiConnections.Instance.Delete({
      endpoint,
      requiresRefreshToken: true
    })
  }

  public async deleteErrorAll(): AxiosPromise {
    const endpoint = `/gestion/truncate-errores`
    return await TelemetriaApiConnections.Instance.Delete({
      endpoint,
      requiresRefreshToken: true
    })
  }

}

