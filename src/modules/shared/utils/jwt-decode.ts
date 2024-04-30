import {
  CookieNames,
  type CustomJwtPayload,
  type UserInformationJwtPayload
} from '@/modules/shared/types/jwt'
import jwt_decode from 'jwt-decode'
import { useCookies } from 'vue3-cookies'
import { TelemetriaApiConnections } from './telemetria-api-connections'
import type { ListaDependencias } from '../types/dependencias'

/**
 * Recupera  el token de la cokie
 * @returns {string|null}
 */
export const getAuthToken = (): string | null => {
  return useCookies().cookies.get(CookieNames.SessionCookieName) || null
}

/**
 * Recupera  el id token de la session
 * @returns {string|null}
 */
export const getAuthTokenId = (): string | null => {
  return useCookies().cookies.get(CookieNames.SessionTokenId) || null
}

export const getRefreshToken = (): string => {
  return useCookies().cookies.get(CookieNames.RefreshTokenCookieName)
}

/**
 * Recupera las cabeceras del token
 * @returns {Object}
 */
export const getHeadersOnHTTP = (): object => {
  let token = getAuthToken()
  return {
    headers: {
      Authorization: `${token}`
    }
  }
}

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean}
 */
export const verifyIfUserIsLoggedIn = async (): Promise<boolean> => {
  try {
    const authToken = getAuthToken()
    if (!authToken) return false
    if (isTokenExpired(authToken)) {
      await TelemetriaApiConnections.Instance.refreshAccessToken()
    }
    return true
  } catch (error) {
    return false
  }
}

/**
 * Verifica si el token ha expirado
 * @param token
 * @returns {boolean}
 */
export const isTokenExpired = (token: string) => {
  let expirationDate = getTokenExpirationDate(token)
  return !expirationDate ? false : expirationDate < new Date()
}

/**
 * Recupera la fecha de expiración del token
 * @param encodedToken
 * @returns {Date|null}
 */
const getTokenExpirationDate = (encodedToken: string) => {
  const token = jwt_decode<CustomJwtPayload>(encodedToken)
  if (!token.exp) {
    return null
  }

  let date = new Date(0)
  date.setUTCSeconds(token.exp)

  return date
}

/**
 * Recupera la información del usuario que vienen dentro del payload del token
 * @returns {UserInformationJwtPayload}
 */
export const getUserPayloadFromToken = (): UserInformationJwtPayload => {
  const token = getAuthToken()
  const decodedPayload = jwt_decode<CustomJwtPayload>(token!)
  const response: UserInformationJwtPayload = {
    rol: decodedPayload.rol,
    uid: decodedPayload.uid,
    dependenciasVisibles: decodedPayload.dependenciasVisibles
  }
  return response
}

export const isUserDependenciaAllowed = (dependencia: ListaDependencias): boolean => {
  const { dependenciasVisibles } = getUserPayloadFromToken()
  return dependenciasVisibles.includes(dependencia)
}
