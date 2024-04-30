export type MedicionesEventUpdate = {
  datos: any
  /*id: string,
  nombre: string,
  mediciones: Array<number>,
  avg: number*/
}

export interface MedicionModel {
  avg: number
  id: string
  mediciones: number[]
  nombre: string
}
