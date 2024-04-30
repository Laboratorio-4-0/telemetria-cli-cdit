<script lang="ts" setup>
import { Chart, registerables } from 'chart.js'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { type ExtractComponentData, LineChart } from 'vue-chart-3'
import type { MedicionModel } from './types'
import { socketSensores, stateSocketEventsSensores } from '../store/useSocketSensores'
import { MedicionesService } from '../services/mediciones-service'
const medicionesService = new MedicionesService()

const GRID_CHART_LENGTH = 4
const NUM_SENSORS = 15
let horaActual = ref<String>('-')
let estadoDeSensores = ref<boolean>(false)

//Para los Labels de las gráficas
let labelCo2 = ref<String[]>([])
let labelHumedad = ref<String[]>([])
let labelTemperatura = ref<String[]>([])

//Variables para las gráficas
let co2 = ref<number[]>([])
let humedad = ref<number[]>([])
let temperatura = ref<number[]>([])
let medicionesEvent = ref<MedicionModel[]>([])
let medicionesMatrixSensores = ref<number[][]>()

let lineChartCo2 = ref<ExtractComponentData<typeof LineChart>>()
let lineChartHumedad = ref<ExtractComponentData<typeof LineChart>>()
let lineChartTemperatura = ref<ExtractComponentData<typeof LineChart>>()

// Monitorea los cambios de estado de 'stateSocketEvents'
watch(stateSocketEventsSensores, (updateValue) => {
  if (stateSocketEventsSensores.MedicionesEvent) {
    const event = updateValue.MedicionesEvent as MedicionModel[]
    if (event) {
      medicionesEvent.value = event
      actualizarMediciones()
      horaActual.value = new Date().toLocaleTimeString()
      estadoDeSensores.value = true
    }
  } else {
    consultarUltimasMediciones()
    estadoDeSensores.value = false
  }
})

function pushToDataChart(mediciones: number[], avg: number): number[] {
  if (mediciones.length > GRID_CHART_LENGTH) {
    mediciones.shift()
  }
  mediciones.push(avg)
  return mediciones
}

function updateMatrixSensores() {
  const [co2, temperatura, humedad] = medicionesEvent.value
  medicionesMatrixSensores.value = Array.from({ length: NUM_SENSORS }, () => new Array(3))
  for (let i = 0; i < co2.mediciones.length; i++) {
    medicionesMatrixSensores.value[i] = [
      co2.mediciones[i],
      temperatura.mediciones[i],
      humedad.mediciones[i]
    ]
  }
}

function actualizarMediciones() {
  updateMatrixSensores()
  for (const e of medicionesEvent.value) {
    switch (e.nombre) {
      case 'co2':
        co2.value = pushToDataChart(co2.value, e.avg)
        break
      case 'temperatura':
        temperatura.value = pushToDataChart(temperatura.value, e.avg)
        break
      case 'humedad':
        humedad.value = pushToDataChart(humedad.value, e.avg)
        break
    }
  }
  /*Actualizar la hora de la lectura de cada Label, Si labelCo2 ya tiene 5 elementos, recorre los 4 primeros 
  y coloca el nuevo valor en el cuarto lugar*/
  if (labelCo2.value.length == GRID_CHART_LENGTH + 1) {
    for (let i = 0; i < GRID_CHART_LENGTH; i++) {
      labelCo2.value[i] = labelCo2.value[i + 1]
      labelHumedad.value[i] = labelHumedad.value[i + 1]
      labelTemperatura.value[i] = labelTemperatura.value[i + 1]
    }
    labelCo2.value[GRID_CHART_LENGTH] = horaActual.value
    labelHumedad.value[GRID_CHART_LENGTH] = horaActual.value
    labelTemperatura.value[GRID_CHART_LENGTH] = horaActual.value
  } else {
    // Si labelCo2 tiene menos de 4 elementos, simplemente agrega la hora actual al final del array
    labelCo2.value.push(horaActual.value)
    labelHumedad.value.push(horaActual.value)
    labelTemperatura.value.push(horaActual.value)
  }
}

onMounted(async () => {
  // Establecemos conexión con el scoket del servidor
  socketSensores.connect()
})

onUnmounted(() => {
  // Cerramos conexión del socket con el servidor
  socketSensores.disconnect()
})

//Trae los datos de la DB y los mapea
async function consultarUltimasMediciones() {
  let response = await medicionesService.GetUltimasMediciones()
  medicionesEvent.value = response.data
  actualizarMediciones()
  horaActual.value = new Date().toLocaleTimeString()
}

Chart.register(...registerables)

const linechartData_Co2 = ref({
  labels: labelCo2,
  datasets: [
    {
      label: 'Co2',
      data: co2.value,
      fill: true,
      borderColor: '#A3A990',
      tension: 0.4
    }
  ]
})

const linechartData2_Humedad = ref({
  labels: labelHumedad,
  datasets: [
    {
      label: 'Humedad',
      data: humedad.value,
      fill: true,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.4
    }
  ]
})

const linechartData_Temperatura = ref({
  labels: labelTemperatura,
  datasets: [
    {
      label: 'Temperatura',
      data: temperatura.value,
      fill: true,
      borderColor: '#AA003D',
      tension: 0.4
    }
  ]
})
</script>

<template>
  <main class="content">
    <div class="container-fluid p-4 animate__animated animate__fadeIn">
      <div class="mb-3">
        <h1 class="h3 d-inline align-middle">
          <i class="bi bi-graph-up"></i> Monitoreo de la concentracion de Co2, humedad y temperatura
        </h1>
      </div>
      <div class="row">
        <!-- Info del laboratorio -->
        <div class="col-md-4 animate__animated animate__bounceInLeft">
          <div class="card flex-fill w-100 card-with-border1">
            <div class="card-header">
              <h5 class="card-title">Locación: laboratorio de industria 4.0</h5>
            </div>
            <div class="card-body">
              <div class="chart">
                <div class="zoom-image">
                  <img
                    src="../images/laboratorio-sensores.png"
                    alt=""
                    class="img-fluid"
                    id="zoomed-img"
                  />
                </div>
                <br />
                <br />
                El laboratorio de Industria 4.0 se encuentra en las instalaciones de SECTEI en CDIT
                - vallejo I.
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de sensores -->
        <div class="col-md-8 animate__animated animate__bounceInRight">
          <div class="card card-with-border2">
            <div class="card-header">
              <h5 class="card-title">Sensores</h5>
              <h6 class="card-subtitle text-muted">
                La red de sensores que se encuentra en funcionamiento tiene una distribución como la
                que se muestra en la imagen, puedes usarla como referencia para conocer las
                mediciones de un sensor en específico. Todas las mediciones corresponden al día de
                hoy.
              </h6>
            </div>
            <div class="card-body">
              <div class="scrollable-component">
                <table class="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th class=""><i class="bi bi-clock-history"></i> Última hora de registro</th>
                      <th class=""><i class="bi bi-globe-americas"></i> Co2</th>
                      <th class=""><i class="bi bi-cloud-drizzle"></i> Húmedad</th>
                      <th class=""><i class="bi bi-thermometer-half"></i>Temperatura</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(e, idx) in medicionesMatrixSensores" :key="idx">
                      <td>{{ 'Nodo ' + (idx + 1) }}</td>
                      <td>{{ horaActual }} hrs.</td>
                      <td>
                        <span class="badge bg-success" style="align-content: center"
                          >{{ e[0] }}%</span
                        >
                      </td>
                      <td>
                        <span class="badge bg-info" style="align-content: center">{{ e[1] }}%</span>
                      </td>
                      <td>
                        <span class="badge bg-danger" style="align-content: center"
                          >{{ e[2] }}°C</span
                        >
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12">
          <div class="card card-with-border3">
            <div class="card-header">
              <h5 class="card-title mb-0">
                En las siguientes gráficas se observa el promedio general de la concentración de
                Co2, húmedad y temperatura en todo el ambiente del Laboratorio de Industria 4.0
              </h5>
            </div>
          </div>
        </div>

        <!-- Para la grafica de Co2 -->
        <div class="col-md-4 animate__animated animate__bounceInUp">
          <div class="card card-with-floor1">
            <div class="card-header">
              <h5 class="card-title">
                <i class="bi bi-globe-americas"></i>&nbsp;&nbsp;Concentración de Co2 ->
                {{ co2[co2.length - 1] }} %
              </h5>
              <h6 class="card-subtitle text-muted"></h6>
            </div>
            <div class="card-body">
              <div class="chart">
                <LineChart ref="lineChartCo2" :chartData="linechartData_Co2" />
              </div>
              <br />
              <div class="card-title mb-0" style="text-align: center">Hora de registro</div>
            </div>
          </div>
        </div>

        <!-- Para la grafica de Humedad -->
        <div class="col-md-4 animate__animated animate__bounceInUp">
          <div class="card card-with-floor2">
            <div class="card-header">
              <h5 class="card-title">
                <i class="bi bi-cloud-drizzle"></i>&nbsp;&nbsp;Concentración de Humedad ->
                {{ humedad[humedad.length - 1] }}%
              </h5>
              <h6 class="card-subtitle text-muted"></h6>
            </div>
            <div class="card-body">
              <div class="chart">
                <LineChart ref="lineChartHumedad" :chartData="linechartData2_Humedad" />
              </div>
              <br />
              <div class="card-title mb-0" style="text-align: center">Hora de registro</div>
            </div>
          </div>
        </div>

        <!-- Para la grafica de temperatura -->
        <div class="col-md-4 animate__animated animate__bounceInUp">
          <div class="card card-with-floor3">
            <div class="card-header">
              <h5 class="card-title">
                <i class="bi bi-thermometer-half"></i>&nbsp;&nbsp;Concentración de Temperatura ->
                {{ temperatura[temperatura.length - 1] }} °C
              </h5>
              <h6 class="card-subtitle text-muted"></h6>
            </div>
            <div class="card-body">
              <div class="chart">
                <LineChart ref="lineChartTemperatura" :chartData="linechartData_Temperatura" />
              </div>
              <br />
              <div class="card-title mb-0" style="text-align: center">Hora de registro</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.scrollable-component {
  max-height: 250px;
  overflow-y: auto;
}
.chart {
  position: relative;
  overflow: hidden;
}

.zoom-image {
  overflow: hidden;
  position: relative;
  cursor: zoom-out; /* Establece el cursor inicial al pasar el ratón */
}

#zoomed-img {
  transition: transform 0.3s;
  cursor: grab; /* Cambia el cursor cuando pasas el ratón sobre la imagen zoomed */
}

.zoom-image:hover #zoomed-img {
  transform: scale(1.5);
  cursor: zoom-in; /* Cambia el cursor al hacer zoom en la imagen */
}
</style>
