import type { AxiosPromise } from 'axios'
import { getRefreshToken, getUserPayloadFromToken } from '../utils/jwt-decode'
import { TelemetriaApiConnections } from '../utils/telemetria-api-connections'
import { TokenName } from '../types/jwt'

type AuthCredentials = {
  email: string
  password: string
}

export class AuthService {
  constructor() {}

  /* conecta con la api telemetria-api para autenticar usuario*/
  public async AutenticaUsuario(credenciales: AuthCredentials): AxiosPromise {
    const endpoint = '/gestion/login'
    const data = await TelemetriaApiConnections.Instance.Post({
      endpoint: endpoint,
      data: credenciales,
      requiresRefreshToken: false
    })
    TelemetriaApiConnections.Instance.updateHeaders({
      headers: [
        {
          key: TokenName.TokenSessionName,
          value: data.data.data.token
        },
        {
          key: TokenName.TokenSessionId,
          value: data.data.data.tokenId
        },

      ]
    })
    return data
  }

  public async cerrarSesion(): AxiosPromise {
    const tokenClaims = getUserPayloadFromToken()
    const refreshToken = getRefreshToken()
    const endpoint = '/gestion/logout'
    const payload = {
      refreshToken,
      userId: tokenClaims?.uid
    }
    const data = await TelemetriaApiConnections.Instance.Post({
      endpoint,
      data: payload,
      requiresRefreshToken: false
    })
    return data
  }
}
