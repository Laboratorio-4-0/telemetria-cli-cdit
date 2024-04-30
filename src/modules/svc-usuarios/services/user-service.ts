import { TelemetriaApiConnections } from '@/modules/shared/utils/telemetria-api-connections'
import type { AxiosPromise } from 'axios'
import type { UpdateUserModel, UserModel } from '../types/users'

export class UserService {
  constructor() {}

  public async actualizarDatosUsuario(datos: UpdateUserModel, uid: string): AxiosPromise {
    const endpoint = `/gestion/actualizar-usuario-common/${uid}`
    return await TelemetriaApiConnections.Instance.Patch({
      endpoint,
      data: datos,
      requiresRefreshToken: true
    })
  }

  public async recuperarUsuarioById(uid: string): AxiosPromise {
    const endpoint = `/gestion/info-usuario/${uid}`
    return await TelemetriaApiConnections.Instance.Get({
      endpoint,
      requiresRefreshToken: true
    })
  }

  public async recuperarUsuarios(): AxiosPromise {
    const endpoint = '/gestion/usuarios-registrados'
    return await TelemetriaApiConnections.Instance.Get({
      endpoint: endpoint,
      requiresRefreshToken: true
    })
  }

  public async crearUsuarios(newUser: UserModel): AxiosPromise {
    const endpoint = '/gestion/crear-usuario'
    return await TelemetriaApiConnections.Instance.Post({
      endpoint,
      data: newUser,
      requiresRefreshToken: true
    })
  }

  //Método para actualizar estatus de usuario
  public async actualizarEstatus(status:Boolean, uid:string): AxiosPromise {
    const endpoint='/gestion/actualizar-status'
    return await TelemetriaApiConnections.Instance.Patch({
      endpoint,
      data: {
        status: status,
        uid: uid 
      },
      requiresRefreshToken: true
    })
  }

  //Método para borrar de usuario
  public async eliminarUsuario(uid: string): AxiosPromise {
    const endpoint = `/gestion/delete-user/${uid}`
    return await TelemetriaApiConnections.Instance.Delete({
      endpoint,
      requiresRefreshToken: true
    })
  }

   //Método para resetear contraseña de usuario
   public async resetUserPassword(uid: string): AxiosPromise {
    const endpoint = `/gestion/reset-user-password/${uid}`
    return await TelemetriaApiConnections.Instance.Patch({
      endpoint,
      requiresRefreshToken: true
    })
  }
}
