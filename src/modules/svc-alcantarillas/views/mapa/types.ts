import type mapboxgl from 'mapbox-gl'

export type HashMapAlcantarillaLocation = {
  [index:string]:AlcantarillaLocation
}

export type AlcantarillaLocation = {
  idAlcantarilla: string
  marker: mapboxgl.Marker
}

export type AlcantarillaLocationEventUpdate = {
  idAlcantarilla: string
  latitude: number
  longitude: number
}

export type AlcantarillaList = {
  idAlcantarilla: string,
  coords: { 
    lat: number, 
    lng: number },
  icono: string
}


export enum SocketEventTypes {
  UpdateLocation,
  SocketConnected,
  SocketDisconnected
}