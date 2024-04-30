export interface ApikeysModel {
  id: string
  namekey: string
  key: string
  description: string
  activa: boolean
  dependencia: string
  api:APiTypeService
  createdAt: string
  updatedAt: string
}

export enum APiTypeService{
  TelemetriaApi="TelemetriaApi",
  MapBoxApi="MapBoxApi"
}

export interface CreateApiKeyModel
  extends Omit<ApikeysModel, 'id' | 'createdAt' | 'updatedAt'> {}

export interface UpdateStatusApiKeyModel {
  id: string
  activa: boolean
}
