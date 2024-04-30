export enum UserType {
  Admin = 'ADMIN_USER',
  Common = 'COMMON_USER'
}
export interface UserModel {
  id?: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  email: string
  dependenciasVisibles: string[]
  rol: UserType | string
  activo?: boolean
}

export interface UpdateUserModel extends Omit<UserModel, 'rol' | 'dependenciasVisibles' | 'activo'> {
  password: string
}
