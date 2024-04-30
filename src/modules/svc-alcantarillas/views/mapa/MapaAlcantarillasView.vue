<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted } from 'vue'
import 'mapbox-gl/dist/mapbox-gl.css'
import Mapboxgl, { GeolocateControl, type MapboxOptions } from 'mapbox-gl'
import type { HashMapAlcantarillaLocation, AlcantarillaList } from './types'
import CustomLoadingVue from '@/modules/shared/components/CustomLoading.vue'
import { CoordsService } from '../../services/coords-service'
import indicador1 from '@/modules/svc-alcantarillas/images/indicador1.gif'
import indicador2 from '@/modules/svc-alcantarillas/images/indicador2.gif'
import {
  socketAlcantarillas,
  stateSocketEventsAlcantarillas
} from '../../store/useSocketAlcanarillas'
import NotMapApiKeyVue from '@/modules/shared/components/NotMapApiKeyService.vue'
import { useAlcantarillasStore } from '../../store/useAlcantarillasStore'

const mapDivElementAlcantarillas = ref<HTMLElement>()
const loading = ref<boolean>(true)
let map: Mapboxgl.Map
let mapboxConfig: MapboxOptions
const alcantarillasLocations = ref<HashMapAlcantarillaLocation>({})
const coordsService = new CoordsService()
let show = ref<boolean>(false)
let listaAlcantarilla = ref<AlcantarillaList[]>([])
let alcantarillaActual = ref<number>(0)
// store
const { mapApiKey } = useAlcantarillasStore()
Mapboxgl.accessToken = mapApiKey

async function buildMapbox() {
  cargarMapa()
}

function cargarMapa() {
  mapboxConfig = buildMapboxConfig()
  map = new Mapboxgl.Map(mapboxConfig)
  map.on('load', async () => {
    await cargarCoordsActuales()
    loading.value = false
  })
  map.addControl(new GeolocateControl({ showUserHeading: true }))
}

//Crea las configuraciones para la libraria Mapbox
function buildMapboxConfig(): MapboxOptions {
  return {
    container: mapDivElementAlcantarillas.value!,
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-99.11948046360428, 19.31975842462806],
    zoom: 9.7
  }
}

//funcion sgenrica para crear un marcardor con propiedades y las agrega al mapa
function crearMarcador(props: {
  header: string
  coords: { lat: number; long: number }
  color?: string
  alcantarillaProps?: { icono: string }
}) {
  const marker = new Mapboxgl.Marker({
    element: props.alcantarillaProps ? document.createElement('img') : undefined,
    anchor: 'bottom',
    color: props.color,
    offset: [0, 4]
  }) // OFFSET corrige que los marcadores no floten
  // Agregar un evento de clic al marcador
  marker.getElement().addEventListener('click', () => {
    // Hacer zoom al marcador
    map.flyTo({
      center: [props.coords.long, props.coords.lat],
      zoom: 16,
      speed: 1
    })
    //Encontramos la posicion de la alcantarilla en la lista para poder usarla en la función de siguiente y anterior
    for (let i = 0; i < listaAlcantarilla.value.length; i++) {
      if (`Alcantarilla ${listaAlcantarilla.value[i].idAlcantarilla}` === props.header) {
        alcantarillaActual.value = i
        break
      }
    }
    //Hacer visibles los botónes
    show.value = true
  })

  marker
    .setPopup(
      new Mapboxgl.Popup({
        offset: [0, -30],
        anchor: 'bottom'
      }).setHTML(`<h4>${props.header}</h4>`)
    )
    .setLngLat([props.coords.long, props.coords.lat])
    .addTo(map)
  if (props.alcantarillaProps) {
    marker.getElement().setAttribute('src', props.alcantarillaProps.icono)
  }
  return marker
}

//Funcion que actualiza la ubicación de la alcantarilla en caso de que se este moviendo
function actualizarUbicaion(props: {
  coords: { lat: number; lng: number }
  idAlcantarilla: string
  icono: string
}) {
  // Verificar si la alcantarilla con el 'idAlcantarilla' ya existe en la tabla hash
  if (`${props.idAlcantarilla}` in alcantarillasLocations.value) {
    // Accede a la alcantarilla y actualiza ubicación
    alcantarillasLocations.value[`${props.idAlcantarilla}`].marker
      .setLngLat([props.coords.lng, props.coords.lat])
      .getElement()
      .setAttribute('src', props.icono)
  } else {
    // Agregar nueva alcantarilla hashmap con clave 'idAlcantarilla' y valor alcantarillaLocation type
    alcantarillasLocations.value[`${props.idAlcantarilla}`] = {
      idAlcantarilla: props.idAlcantarilla,
      marker: crearMarcador({
        header: `Alcantarilla ${props.idAlcantarilla}`,
        coords: { long: props.coords.lng, lat: props.coords.lat },
        color: '#b2FF59',
        alcantarillaProps: {
          icono: props.icono
        }
      })
    }
  }
}

//Funcion para centrar el mapa
function centrarMapa() {
  map.flyTo({
    center: [-99.11948046360428, 19.31975842462806],
    zoom: 9.7,
    speed: 1
  })
  show.value = false
}

// Función para navegar a la siguiente alcantarilla
function siguienteAlcantarilla() {
  if (listaAlcantarilla.value.length === 0) {
    return
  }

  alcantarillaActual.value =
    (alcantarillaActual.value - 1 + listaAlcantarilla.value.length) % listaAlcantarilla.value.length

  map.flyTo({
    center: [
      listaAlcantarilla.value[alcantarillaActual.value].coords.lng,
      listaAlcantarilla.value[alcantarillaActual.value].coords.lat
    ],
    zoom: 16,
    speed: 1
  })
}

// Función para navegar a la alcantarilla anterior
function alcantarillaAnterior() {
  if (listaAlcantarilla.value.length === 0) {
    return
  }

  alcantarillaActual.value = (alcantarillaActual.value + 1) % listaAlcantarilla.value.length

  map.flyTo({
    center: [
      listaAlcantarilla.value[alcantarillaActual.value].coords.lng,
      listaAlcantarilla.value[alcantarillaActual.value].coords.lat
    ],
    zoom: 16,
    speed: 1
  })
}

//Monitorea los cambios de estado de 'stateSocketEventsAlcantarillas'
watch(stateSocketEventsAlcantarillas, (updateValue) => {
  if (stateSocketEventsAlcantarillas.locationEventAlcantarilla) {
    actualizarUbicaion({
      idAlcantarilla: updateValue.locationEventAlcantarilla!.idAlcantarilla,
      coords: {
        lat: updateValue.locationEventAlcantarilla!.latitude,
        lng: updateValue.locationEventAlcantarilla!.longitude
      },
      icono: indicador2
    })
  }
})

//Obtiene las coordenadas actuales del server, las pinta en el mapa y los agrega al array que se usara para navegar entre ellas
async function cargarCoordsActuales() {
  const alcantarillas = await coordsService.GetCurrentCoordsTrenes()
  for (let alcantarilla of alcantarillas) {
    const nuevaAlcantarilla = {
      idAlcantarilla: alcantarilla.idAlcantarilla,
      coords: { lat: alcantarilla.latitude, lng: alcantarilla.longitude },
      icono: indicador1
    }
    actualizarUbicaion(nuevaAlcantarilla)
    //Guardamos las alcantarillas en la lista para despúes movernos entre ellas
    listaAlcantarilla.value.unshift(nuevaAlcantarilla)
  }
}

// Monitora el puntero al componente div HTML
watch(mapDivElementAlcantarillas, async () => {
  // Crear mapa cuando el componte div exista y el puntero no sea null
  if (mapDivElementAlcantarillas !== undefined || mapDivElementAlcantarillas !== null) {
    await buildMapbox()
  }
})

onMounted(async () => {
  // Establecemos conexión con el scoket del servidor
  if (!socketAlcantarillas.connected) {
    socketAlcantarillas.connect()
  }
})

onUnmounted(() => {
  // Cerramos conexión del socketAlcantarillas con el servidor
  if (!socketAlcantarillas.disconnected) {
    socketAlcantarillas.disconnect()
  }
})
</script>

<template>
  <div ref="mapDivElementAlcantarillas" class="map-container"></div>
  <CustomLoadingVue v-if="loading" :message="'Cargando mapa...'" />
  <!-- Agrega los botones flotantes -->
  <div class="floating-buttons">
    <button v-if="show" @click="alcantarillaAnterior()" class="rounded-left">
      <i class="bi bi-caret-left-fill"></i> Anterior
    </button>
    <button v-if="show" @click="centrarMapa()">Centrar mapa</button>
    <button v-if="show" @click="siguienteAlcantarilla()" class="rounded-right">
      Siguiente <i class="bi bi-caret-right-fill"></i>
    </button>
  </div>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
/* Estilos para los botones flotantes */
.floating-buttons {
  position: fixed;
  bottom: 40px; /* Alinear los botones en la parte inferior */
  left: 57.4%; /* Alinear al centro horizontal */
  transform: translateX(-50%); /* Centrar horizontalmente */
  display: flex;
  justify-content: center; /* Alinear los botones en línea horizontalmente */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}
.floating-buttons button {
  padding: 4px 40px; /* Ajusta el ancho de los botones (10px de arriba y abajo, 20px de izquierda y derecha) */
  background-color: #ffffff;
  color: #020202;
  border: 1px solid #ced4da;
  cursor: pointer;
  margin: 0 8px; /* Espacio entre los botones */
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.2);
}
.rounded-left {
  border-top-left-radius: 13px;
  border-bottom-left-radius: 13px;
}
.rounded-right {
  border-top-right-radius: 13px;
  border-bottom-right-radius: 13px;
}
.floating-buttons button:hover {
  background-color: #e9ecef;
}
</style>
