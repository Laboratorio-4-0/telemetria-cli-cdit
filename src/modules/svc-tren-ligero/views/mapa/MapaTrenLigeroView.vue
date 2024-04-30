<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted } from 'vue'
import 'mapbox-gl/dist/mapbox-gl.css'
import Mapboxgl, { type MapboxOptions } from 'mapbox-gl'
import type { Linea, HashMapTrenLocation, LineaCompleta } from './types'
import CustomLoadingVue from '@/modules/shared/components/CustomLoading.vue'
import { CoordsService } from '../../services/coords-service'
import { LineaDelTrenCompleta } from './coords-linea'
import { linea1 } from './coords-estaciones'
import { useModalMessage } from '@/modules/shared/store/useModalMessage'
import { buildErrorMessage } from '@/modules/shared/utils/error-handler'
import { SharedImages } from '@/modules/shared/images'
import {
  socketTrenLigero,
  stateSocketEventsTrenLigero
} from '@/modules/svc-tren-ligero/store/useSocketTrenLigero'
import NotMapApiKeyVue from '@/modules/shared/components/NotMapApiKeyService.vue'
import { useTrenLigeroStore } from '../../store/useTrenLigeroStore'

const mapDivElement = ref<HTMLElement>()
const loading = ref<boolean>(true)
const lineaTren = ref<Linea>()
const lineaTrenCompleta = ref<LineaCompleta>()
let map: Mapboxgl.Map
let mapboxConfig: MapboxOptions
const trenesLocations = ref<HashMapTrenLocation>({})
const coordsService = new CoordsService()
// store
const { mapApiKey } = useTrenLigeroStore()
Mapboxgl.accessToken = mapApiKey
// Modales
const basicModal = useModalMessage()

async function buildMapbox() {
  await getDatosLineaTrenLigero()
  cargarMapa()
}

function cargarMapa() {
  mapboxConfig = buildMapboxConfig()
  map = new Mapboxgl.Map(mapboxConfig)
  map.on('load', async () => {
    trazarRuta()
    ubicarEstaciones()
    await cargarCoordsActuales()
  })
}

/**
 * Crea las configuraciones para la libraria Mapbox
 */
function buildMapboxConfig(): MapboxOptions {
  return {
    container: mapDivElement.value!, // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: [-99.12431375760976, 19.2711925954283], // starting position [lng, lat]
    zoom: 14 // starting zoom
  }
}

/**
 * funcione genérica para crear un marcador con propiedades y las agrega al mapa
 * @param props
 */
function crearMarcador(props: {
  header: string
  subheader: string
  coords: { lat: number; long: number }
  color?: string
  estacionProps?: { icono: string; img: string }
  tipoMarcador: string
}) {
  const marker = new Mapboxgl.Marker({
    element: props.estacionProps?.icono ? document.createElement('img') : undefined,
    anchor: 'bottom',
    color: props.color,
    offset: [0, 4]
  }) // OFFSET corrige que los marcadores no floten
    .setLngLat([props.coords.long, props.coords.lat])
    .addTo(map)
  if (props.estacionProps?.icono) {
    marker.getElement().setAttribute('src', props.estacionProps.icono)
  }
  //Verificamos si el marcador es estación
  if (props.tipoMarcador == 'estacion') {
    marker.setPopup(
      new Mapboxgl.Popup({ offset: [0, -40], className: 'custom-popup' }).setHTML(
        `<div style='border: 1px solid #A3CEEF; padding:10px;'><h4><b>Estación ${props.header}</b></h4> <hr> <p>Estacion Número ${props.subheader} del Tren Ligero de la Ciudad de México.</p> <img src='${props.estacionProps?.img}' width=200px /></div>`
      )
    )
  }
  //Verificamos si el marcador es un trenecito
  if (props.tipoMarcador == 'tren') {
    marker.setPopup(
      new Mapboxgl.Popup().setHTML(
        `<div style='text-align:center;'><h5><br>Tren número ${props.header}</h5> <hr> <p>Viajando a ${props.subheader} kilómetros por hora.</p></div>`
      )
    )
  }
  return marker
}

/**
 * crea marcadores por cada estacion y las ubica en el mapa
 */
function ubicarEstaciones() {
  for (const estacion of lineaTren.value!.coords_estaciones) {
    crearMarcador({
      header: `${estacion.nombre}`,
      subheader: `${estacion.id}`,
      coords: { long: estacion.coords[0], lat: estacion.coords[1] },
      estacionProps: { icono: estacion.iconoSrc, img: estacion.imgSrc },
      tipoMarcador: 'estacion'
    })
  }
}

async function getDatosLineaTrenLigero() {
  await Promise.resolve('Datos Cargados')
  lineaTren.value = linea1
  lineaTrenCompleta.value = LineaDelTrenCompleta
}

function actualizarUbicaion(props: {
  coords: { lat: number; lng: number }
  velocidad: number
  idTren: number | string
}) {
  // Verificar si el tren con el 'idTren' ya existe en la tabla hash
  if (`${props.idTren}` in trenesLocations.value) {
    // Accede al tren y actualiza ubicación
    const marker = trenesLocations.value[`${props.idTren}`].marker
    // Actualiza la posición del marcador
    marker.setLngLat([props.coords.lng, props.coords.lat])
    // Obtén la referencia al Popup asociado al marcador
    const popup = marker.getPopup()
    // Actualiza el contenido del Popup
    popup.setHTML(
      `<div style='text-align:center;'><h5><br>Tren número ${props.idTren}</h5> <hr> <p>Viajando a ${props.velocidad} kilómetros por hora.</p></div>`
    )
  } else {
    // Agregar nuevo tren al hashmap con clave 'idTren' y valor TrenLocation type
    trenesLocations.value[`${props.idTren}`] = {
      idTren: props.idTren,
      velocidad: props.velocidad,
      marker: crearMarcador({
        header: `${props.idTren}`,
        subheader: `${props.velocidad}`,
        coords: { long: props.coords.lng, lat: props.coords.lat },
        tipoMarcador: 'tren',
        color: '#b2FF59' // generateRandomHexColorCode()
      })
    }
  }
}

/***
 * Traza la ruta del tren ligero en el mapa
 */
function trazarRuta() {
  const lineaEstacionesCoords = lineaTrenCompleta.value!.coords_estaciones.map((e) => e.coords)
  map.addSource('route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [...lineaEstacionesCoords]
      }
    }
  })
  map.addLayer({
    id: 'route',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#90CAF9',
      'line-width': 6
    }
  })
}

/**}
 * Monitorea los cambios de estado de 'stateSocketEvents'
 */
watch(stateSocketEventsTrenLigero, (updateValue) => {
  if (stateSocketEventsTrenLigero.locationEvent) {
    actualizarUbicaion({
      velocidad: updateValue.locationEvent!.velocidad,
      idTren: updateValue.locationEvent!.idtren,
      coords: {
        lat: updateValue.locationEvent!.latitude,
        lng: updateValue.locationEvent!.longitude
      }
    })
  }
})

/**
 * Obtiene las coordenadas actuales del server y las pinta en el
 * mapa
 */
async function cargarCoordsActuales() {
  try {
    loading.value = true
    await Promise.resolve('Cargar datos')
    let response = await coordsService.GetCurrentCoordsTrenes()
    const trenes = response.data
      .filter((datos: any) => datos.activo == true)
      .map((train: any) => ({
        idtren: train.idTren,
        latitude: train.latitude,
        longitude: train.longitude,
        velocidad: train.velocidad
      }))
    for (let tren of trenes) {
      actualizarUbicaion({
        velocidad: tren.velocidad,
        idTren: tren.idtren,
        coords: { lat: tren.latitude, lng: tren.longitude }
      })
    }
    loading.value = false
  } catch (error) {
    loading.value = false
    const message = buildErrorMessage(error)
    basicModal.setMessage({
      title: 'Petición Fallida',
      message: message,
      image: SharedImages.ErrorImage
    })
    await basicModal.showModal()
  }
}
// Monitora el puntero al componente div HTML
watch(mapDivElement, async () => {
  // Crear mapa cuando el componte div exista y el puntero no sea null
  if (mapDivElement !== undefined || mapDivElement !== null) {
    await buildMapbox()
  }
})

onMounted(async () => {
  // Establecemos conexión con el socket del servidor
  if (!socketTrenLigero.connected) {
    socketTrenLigero.connect()
  }
})

onUnmounted(() => {
  // Cerramos conexión del socketTrenLigero con el servidor
  if (!socketTrenLigero.disconnected) {
    socketTrenLigero.disconnect()
  }
  Mapboxgl.accessToken = ''
})
</script>

<template>
  <div ref="mapDivElement" class="map-container"></div>
  <CustomLoadingVue v-if="loading" :message="'Cargando mapa...'" />
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>
