import type { ListaDependencias } from '@/modules/shared/types/dependencias'

export interface DependenciasInactivasModel {
  id: string
  dependencia: ListaDependencias
  createdAt: string
  updatedAt: string
}
