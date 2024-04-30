import { DependenciasService } from '@/modules/svc-usuarios/services/dependencias-service'
import type { ListaDependencias } from '../types/dependencias'
const dependenciaService = new DependenciasService()
export const isDependenciaInactiva = async (dependencia: ListaDependencias) => {
  try {
    const { data } = await dependenciaService.getStatusDependencia(dependencia)
    const response = data.data.inactiva as boolean
    return response
  } catch (error) {
    return true
  }
}
