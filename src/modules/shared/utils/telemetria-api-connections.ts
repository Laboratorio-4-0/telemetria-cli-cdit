import axios, { type AxiosInstance, type AxiosPromise } from 'axios'
import { CookieNames, TokenName } from '../types/jwt'
import {
  getAuthToken,
  getAuthTokenId,
  getRefreshToken,
  getUserPayloadFromToken,
  isTokenExpired
} from './jwt-decode'
import { useCookies } from 'vue3-cookies'
const API_BASE =
  import.meta.env.VITE_ENVIRONMENT === 'dev'
    ? import.meta.env.VITE_TELEMETRIA_API_BASE_DEV
    : import.meta.env.VITE_TELEMETRIA_API_BASE_PROD

type PropRequest = {
  endpoint: string
  data?: object
  params?: object
  requiresRefreshToken: boolean
}

type Header = {
  key: string
  value: string
}

export class TelemetriaApiConnections {
  private apiBase = API_BASE
  private axiosInstance = axios.create({
    baseURL: this.apiBase,
    headers: {
      [TokenName.TokenSessionName]: getAuthToken(),
      [TokenName.TokenSessionId]: getAuthTokenId()
    },
    withCredentials: true
  })
  private static _instance: TelemetriaApiConnections

  private constructor() {}

  public static get Instance() {
    return this._instance || (this._instance = new this())
  }

  public updateHeaders(props: { headers: Header[] }) {
    for (const header of props.headers) {
      this.axiosInstance.defaults.headers[`${header.key}`] = header.value
    }
  }

  public async Get(request: PropRequest): Promise<AxiosPromise> {
    await this.refreshTokenIfNeeded(request.requiresRefreshToken)
    return this.axiosInstance.get(request.endpoint, { params: request.params })
  }

  public async Put(request: PropRequest): Promise<AxiosPromise> {
    await this.refreshTokenIfNeeded(request.requiresRefreshToken)
    return this.axiosInstance.put(request.endpoint, request.data, { params: request.params })
  }

  public async Post(request: PropRequest): Promise<AxiosPromise> {
    await this.refreshTokenIfNeeded(request.requiresRefreshToken)
    return this.axiosInstance.post(request.endpoint, request.data, { params: request.params })
  }

  public async Delete(request: PropRequest): Promise<AxiosPromise> {
    await this.refreshTokenIfNeeded(request.requiresRefreshToken)
    return this.axiosInstance.delete(request.endpoint, { params: request.params })
  }

  public async Patch(request: PropRequest): Promise<AxiosPromise> {
    await this.refreshTokenIfNeeded(request.requiresRefreshToken)
    return this.axiosInstance.patch(request.endpoint, request.data, { params: request.params })
  }

  private async refreshTokenIfNeeded(requiresRefreshToken: boolean): Promise<void> {
    if (requiresRefreshToken) {
      const token = getAuthToken()!
      const id = getAuthTokenId()!
      if (isTokenExpired(token)) {
        await this.refreshAccessToken()
      }
    }
  }

  public async refreshAccessToken() {
    try {
      // Preparar payload y realizar petición
      const { uid } = getUserPayloadFromToken()
      const endpoint = '/gestion/refresh-token'
      const refreshToken = getRefreshToken()
      const payload = { refreshToken, uid }
      const { data } = await this.Post({
        endpoint,
        data: payload,
        requiresRefreshToken: false
      })
      const newAccessToken = data.data.token
      const newRefreshToken = data.data.refreshToken
      const tokenId = data.data.tokenId
      // Actualizar cookies
      useCookies().cookies.set(CookieNames.SessionCookieName, newAccessToken)
      useCookies().cookies.set(CookieNames.RefreshTokenCookieName, newRefreshToken)
      useCookies().cookies.set(CookieNames.SessionTokenId, tokenId)
      // Actualizar headers de la peticion con el nuevo token
      this.updateHeaders({
        headers: [
          {
            key: TokenName.TokenSessionName,
            value: getAuthToken()!
          },
          {
            key: TokenName.TokenSessionId,
            value: getAuthTokenId()!
          }
        ]
      })
    } catch (error) {
      throw error
    }
  }
}
