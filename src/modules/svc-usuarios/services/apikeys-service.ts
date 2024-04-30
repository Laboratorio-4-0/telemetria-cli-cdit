import type { AxiosPromise } from 'axios'
import { TelemetriaApiConnections } from '@/modules/shared/utils/telemetria-api-connections'
import type { CreateApiKeyModel, UpdateStatusApiKeyModel } from '../types/apikeys'
import type { UserModel } from '../types/users'
import type { ListaDependencias } from '@/modules/shared/types/dependencias'

export class ApikeyService {
  constructor() {}

  public async crearAPIKey(newKey: CreateApiKeyModel): AxiosPromise {
    const endpoint = '/gestion/crear-api-key'
    return await TelemetriaApiConnections.Instance.Post({
      endpoint,
      data: newKey,
      requiresRefreshToken: true
    })
  }

  public async getApiKeys(): AxiosPromise {
    const endpoint = '/gestion/obtener-api-keys-registradas'
    return await TelemetriaApiConnections.Instance.Get({
      endpoint,
      requiresRefreshToken: true
    })
  }

  public async eliminarApiKey(id: string): AxiosPromise {
    const endpoint = `/gestion/delete-api-key/${id}`
    return await TelemetriaApiConnections.Instance.Delete({
      endpoint,
      requiresRefreshToken: true
    })
  }

  public async actualizaStatus(data: UpdateStatusApiKeyModel): AxiosPromise {
    const endpoint = '/gestion/update-status-apikey'
    return await TelemetriaApiConnections.Instance.Patch({
      endpoint,
      data: data,
      requiresRefreshToken: true
    })
  }

  public async regenerarApiKey(id: string): AxiosPromise {
    const endpoint = `/gestion/regenerar-apiley/${id}`
    return await TelemetriaApiConnections.Instance.Patch({
      endpoint,
      requiresRefreshToken: true
    })
  }

  public async getMapApiKeyByDependencia(dependencia: ListaDependencias): AxiosPromise {
    const endpoint = `/gestion/get-api-mapbox/${dependencia}`
    return await TelemetriaApiConnections.Instance.Get({
      endpoint,
      requiresRefreshToken: true
    })
  }
}
