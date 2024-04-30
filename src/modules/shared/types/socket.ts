export enum ChannelsSocket {
  PingChannel = 'ping-from-server',
  EmiteCoordsChannel = 'coordenadas-from-server',
  EmiteMediciones = 'mediciones-from-server',
  EmiteCoordsAlcantarillas = 'coordenadas-alcantarillas',
  EmiteNewErrorLog = 'new-error-log'
}

export enum ServiceSocketRooms {
  TrenLigeroCoordsRoom = 'tren-ligero-coords-room',
  AlcantarillasCoordsRoom = 'alcantarillas-coords-room',
  SesonresGraficasRoom = 'sensores-graficas-room',
  AdminDashboardRoom = 'admin-dashborad-room'
}
