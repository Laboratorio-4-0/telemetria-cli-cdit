import { type JwtPayload } from 'jwt-decode'

export type CustomJwtPayload = JwtPayload & {
  rol: string
  dependenciasVisibles: string[]
  uid: string
}

export interface UserInformationJwtPayload {
  rol: string
  uid: string
  dependenciasVisibles: string[]
}

export enum CookieNames {
  SessionCookieName = 'telemetria-session-token',
  RefreshTokenCookieName = 'telemetria-refresh-token',
  SessionTokenId = "telemetria-session-id"
}

export enum TokenName {
  TokenSessionName = "telemetria-jwt",
  TokenSessionId = "telemetria-jwt-id"
}
