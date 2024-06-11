<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted } from "vue";
import "mapbox-gl/dist/mapbox-gl.css";
import Mapboxgl, { type MapboxOptions } from "mapbox-gl";
import type { Linea, HashMapTrenLocation, LineaCompleta } from "./types";
import CustomLoadingVue from "@/modules/shared/components/CustomLoading.vue";
import {
  CoordsService,
  estimacionesService,
} from "../../services/coords-service";
import { LineaDelTrenCompleta } from "./coords-linea";
import { linea1 } from "./coords-estaciones";
import { useModalMessage } from "@/modules/shared/store/useModalMessage";
import { buildErrorMessage } from "@/modules/shared/utils/error-handler";
import { SharedImages } from "@/modules/shared/images";
import {
  socketTrenLigero,
  stateSocketEventsTrenLigero,
} from "@/modules/svc-tren-ligero/store/useSocketTrenLigero";
import NotMapApiKeyVue from "@/modules/shared/components/NotMapApiKeyService.vue";
import { useTrenLigeroStore } from "../../store/useTrenLigeroStore";
import { useUserStore } from "@/modules/svc-usuarios/store/useUserStore";

const userStore = useUserStore();

let show = ref<boolean>(false);
let show1 = ref<boolean>(false);
const mapDivElement = ref<HTMLElement>();
const loading = ref<boolean>(true);
const lineaTren = ref<Linea>();
const lineaTrenCompleta = ref<LineaCompleta>();
let map: Mapboxgl.Map;
let mapboxConfig: MapboxOptions;
const trenesLocations = ref<HashMapTrenLocation>({});
const coordsService = new CoordsService();
const estimacionesService1 = new estimacionesService();
// store
const { mapApiKey } = useTrenLigeroStore();
Mapboxgl.accessToken = mapApiKey;
// Modales
const basicModal = useModalMessage();

async function buildMapbox() {
  await getDatosLineaTrenLigero();
  cargarMapa();
}

function cargarMapa() {
  mapboxConfig = buildMapboxConfig();
  map = new Mapboxgl.Map(mapboxConfig);
  map.on("load", async () => {
    trazarRuta();
    ubicarEstaciones();
    await cargarCoordsActuales();
  });
}

/**
 * Crea las configuraciones para la libraria Mapbox
 */
function buildMapboxConfig(): MapboxOptions {
  return {
    container: mapDivElement.value!, // container ID
    style: "mapbox://styles/mapbox/streets-v12", // style URL
    center: [-99.12431375760976, 19.2711925954283], // starting position [lng, lat]
    zoom: 14, // starting zoom
  };
}

/**
 * funcione genérica para crear un marcador con propiedades y las agrega al mapa
 * @param props
 */
function crearMarcador(props: {
  header: string;
  subheader: string;
  coords: { lat: number; long: number };
  color?: string;
  estacionProps?: { icono: string; img: string };
  tipoMarcador: string;
}) {
  const marker = new Mapboxgl.Marker({
    element: props.estacionProps?.icono
      ? document.createElement("img")
      : undefined,
    anchor: "bottom",
    color: props.color,
    offset: [0, 4],
  }) // OFFSET corrige que los marcadores no floten
    .setLngLat([props.coords.long, props.coords.lat])
    .addTo(map);
  if (props.estacionProps?.icono) {
    marker.getElement().setAttribute("src", props.estacionProps.icono);
  }
  //Verificamos si el marcador es estación
  if (props.tipoMarcador == "estacion") {
    marker.setPopup(
      new Mapboxgl.Popup({
        offset: [0, -40],
        className: "custom-popup",
      }).setHTML(
        `<div style='border: 1px solid #A3CEEF; padding:10px;'><h4><b>Estación ${props.header}</b></h4> <hr> <p>Estacion Número ${props.subheader} del Tren Ligero de la Ciudad de México.</p> <img src='${props.estacionProps?.img}' width=200px /></div>`
      )
    );
  }
  //Verificamos si el marcador es un trenecito
  if (props.tipoMarcador == "tren") {
    marker.setPopup(
      new Mapboxgl.Popup().setHTML(
        `<div style='text-align:center;'><h5><br>Tren número ${props.header}</h5> <hr> <p>Viajando a ${props.subheader} kilómetros por hora.</p></div>`
      )
    );
  }
  return marker;
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
      tipoMarcador: "estacion",
    });
  }
}

async function getDatosLineaTrenLigero() {
  await Promise.resolve("Datos Cargados");
  lineaTren.value = linea1;
  lineaTrenCompleta.value = LineaDelTrenCompleta;
}

function actualizarUbicaion(props: {
  coords: { lat: number; lng: number };
  velocidad: number;
  idTren: number | string;
}) {
  // Verificar si el tren con el 'idTren' ya existe en la tabla hash
  if (`${props.idTren}` in trenesLocations.value) {
    // Accede al tren y actualiza ubicación
    const marker = trenesLocations.value[`${props.idTren}`].marker;
    // Actualiza la posición del marcador
    marker.setLngLat([props.coords.lng, props.coords.lat]);
    // Obtén la referencia al Popup asociado al marcador
    const popup = marker.getPopup();
    // Actualiza el contenido del Popup
    popup.setHTML(
      `<div style='text-align:center;'><h5><br>Tren número ${props.idTren}</h5> <hr> <p>Viajando a ${props.velocidad} kilómetros por hora.</p></div>`
    );
  } else {
    // Agregar nuevo tren al hashmap con clave 'idTren' y valor TrenLocation type
    trenesLocations.value[`${props.idTren}`] = {
      idTren: props.idTren,
      velocidad: props.velocidad,
      marker: crearMarcador({
        header: `${props.idTren}`,
        subheader: `${props.velocidad}`,
        coords: { long: props.coords.lng, lat: props.coords.lat },
        tipoMarcador: "tren",
        color: "#b2FF59", // generateRandomHexColorCode()
      }),
    };
  }
}

/***
 * Traza la ruta del tren ligero en el mapa
 */
function trazarRuta() {
  const lineaEstacionesCoords = lineaTrenCompleta.value!.coords_estaciones.map(
    (e) => e.coords
  );
  map.addSource("route", {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [...lineaEstacionesCoords],
      },
    },
  });
  map.addLayer({
    id: "route",
    type: "line",
    source: "route",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "#90CAF9",
      "line-width": 6,
    },
  });
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
        lng: updateValue.locationEvent!.longitude,
      },
    });
  }
});

/**
 * Obtiene las coordenadas actuales del server y las pinta en el
 * mapa
 */
async function cargarCoordsActuales() {
  try {
    loading.value = true;
    await Promise.resolve("Cargar datos");
    let response = await coordsService.GetCurrentCoordsTrenes();
    const trenes = response.data
      .filter((datos: any) => datos.activo == true)
      .map((train: any) => ({
        idtren: train.idTren,
        latitude: train.latitude,
        longitude: train.longitude,
        velocidad: train.velocidad,
      }));
    for (let tren of trenes) {
      actualizarUbicaion({
        velocidad: tren.velocidad,
        idTren: tren.idtren,
        coords: { lat: tren.latitude, lng: tren.longitude },
      });
    }
    loading.value = false;
  } catch (error) {
    loading.value = false;
    const message = buildErrorMessage(error);
    basicModal.setMessage({
      title: "Petición Fallida",
      message: message,
      image: SharedImages.ErrorImage,
    });
    await basicModal.showModal();
  }
}
// Monitora el puntero al componente div HTML
watch(mapDivElement, async () => {
  // Crear mapa cuando el componte div exista y el puntero no sea null
  if (mapDivElement !== undefined || mapDivElement !== null) {
    await buildMapbox();
  }
});

//Funcion para MOSTRAR ESTIMACIONES
function mostrarEstimaciones() {
  show.value = !show.value;
}

function limpiar() {
  show1.value = false;
}

let estacionSeleccionada = ref<string>("");
let sentidoSeleccionado = ref<string>("");

let proximaEstacion = ref<any>("");
let segundosEstimados = ref<any>("");

async function Calcular() {
  show1.value = true;

  let response = await estimacionesService1.estimacionesService(
    estacionSeleccionada.value,
    sentidoSeleccionado.value
  );

  proximaEstacion.value = response.data.data[0];
  segundosEstimados.value = response.data.data[1];
}

onMounted(async () => {
  // Establecemos conexión con el socket del servidor
  if (!socketTrenLigero.connected) {
    socketTrenLigero.connect();
  }
});

onUnmounted(() => {
  // Cerramos conexión del socketTrenLigero con el servidor
  if (!socketTrenLigero.disconnected) {
    socketTrenLigero.disconnect();
  }
  Mapboxgl.accessToken = "";
});
</script>

<template>
  <div ref="mapDivElement" class="map-container"></div>
  <CustomLoadingVue v-if="loading" :message="'Cargando mapa...'" />

  <!--PARA EL BOTÓN DEL MENÚ DE LAS ESTIMACIONES-->
  <div class="floating-buttons">
    <button v-if="true" @click="mostrarEstimaciones()" class="rounded-left">
      <b>Estimaciones <br />de Tiempo</b>
    </button>
  </div>

  <!--PARA EL MENÚ DE LAS ESTIMACIONES-->
  <div class="floating-card" v-if="show">
    Hola {{ userStore.user.nombre }}, selecciona la estación de partida:
    <br />
    <select v-model="estacionSeleccionada">
      <option disabled value="">Estación</option>
      <option value="Tasqueña">Tasqueña</option>
      <option value="Las Torres">Las Torres</option>
      <option value="Ciudad Jardín">Ciudad Jardín</option>
      <option value="La Virgen">La Virgen</option>
      <option value="Xotepingo">Xotepingo</option>
      <option value="Nezahualpili">Nezahualpili</option>
      <option value="Registro Federal">Registro Federal</option>
      <option value="Textiplan">Textiplan</option>
      <option value="El Vergel">El Vergel</option>
      <option value="Estadio Azteca">Estadio Azteca</option>
      <option value="Huipulco">Huipulco</option>
      <option value="Xomali">Xomali</option>
      <option value="Periférico">Periférico</option>
      <option value="Tepepan">Tepepan</option>
      <option value="La Noria">La Noria</option>
      <option value="Huichapan">Huichapan</option>
      <option value="Francisco Goita">Francisco Goita</option>
      <option value="Xochimilco">Xochimilco</option>
    </select>

    <br /><br /><br />
    Ahora indica el sentido del viaje:
    <br />
    <select v-model="sentidoSeleccionado">
      <option disabled value="">Sentido</option>
      <option value="IDA">Ida (Dirección Xochimilco)</option>
      <option value="VUELTA">Vuelta (Dirección Tasqueña)</option>
    </select>

    <br /><br /><br />
    <span @click="Calcular()" class="interactive-text" v-show="!show1"
      ><i class="bi bi-stopwatch"></i> Calcular</span
    >
    <br /><br /><br />

    <!--PARA MOSTRAR LOS RESULTADOS-->
    <div v-if="show1">
      El tren sleccionado llegará a la estación <b>{{ proximaEstacion }}</b> en
      <b>{{ segundosEstimados }}</b> segundos aproximadamente.
      <br />
      <br />
      <br />
      <span @click="limpiar()" class="interactive-text"
        ><i class="bi bi-stars"></i> Limpiar</span
      >
    </div>
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
  left: 92%; /* Alinear al centro horizontal */
  transform: translateX(-50%); /* Centrar horizontalmente */
  display: flex;
  justify-content: center; /* Alinear los botones en línea horizontalmente */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
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
  border-top-right-radius: 13px;
  border-bottom-right-radius: 13px;
}
.floating-buttons button:hover {
  background-color: #e9ecef;
}

.floating-card {
  position: absolute;
  top: 70px;
  right: 20px;
  background-color: white;
  border: 1px solid #ccc;
  padding: 15px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  width: 220px; /* Ancho de la tarjeta */
  height: 550px; /* Altura de la tarjeta */
  max-width: 100%; /* Máximo ancho, útil para hacerlo responsivo */
  max-height: 100%; /* Máxima altura, útil para hacerlo responsivo */
  overflow: auto; /* Añade barras de desplazamiento si el contenido excede la tarjeta */
}

.floating-card select {
  width: 100%;
  padding: 5px;
  margin-top: 10px;
}

.interactive-text {
  cursor: pointer; /* Cambia el cursor al pasar sobre el texto */
  color: #6499d2; /* Color del texto */
  text-align: center;
}

.interactive-text:hover {
  text-decoration: underline; /* Subraya el texto al pasar el cursor */
}
</style>
