import type mapboxgl from 'mapbox-gl'

export type Linea = {
  nombre?: string
  coords_estaciones: CoordsEstaciones[]
}

export type CoordsEstaciones = {
  id: string
  nombre: string
  coords: Array<number>
  iconoSrc: string
  imgSrc: string
}

export type LineaCompleta = {
  coords_estaciones: CoordsLineaDelTren[]
}

export type CoordsLineaDelTren = {
  coords: Array<number>
}

export type HashMapTrenLocation = {
  [index: string]: TrenLocation
}

export type TrenLocation = {
  idTren: string | number
  marker: mapboxgl.Marker
  velocidad: number
}

export type TrenLocationEventUpdate = {
  idtren: number | string
  latitude: number
  longitude: number
  velocidad: number
}

export enum SocketEventTypes {
  UpdateLocation,
  SocketConnected,
  SocketDisconnected
}
