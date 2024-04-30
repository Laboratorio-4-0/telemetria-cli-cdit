import type { Linea } from './types'

//Iconos de cada estacion
import Estacion1 from '@/modules/svc-tren-ligero/images/estaciones/Tasquena.png'
import Estacion2 from '@/modules/svc-tren-ligero/images/estaciones/LasTorres.png'
import Estacion3 from '@/modules/svc-tren-ligero/images/estaciones/CiudadJardin.png'
import Estacion4 from '@/modules/svc-tren-ligero/images/estaciones/LaVirgen.png'
import Estacion5 from '@/modules/svc-tren-ligero/images/estaciones/Xotepingo.png'
import Estacion6 from '@/modules/svc-tren-ligero/images/estaciones/Nezahualpilli.png'
import Estacion7 from '@/modules/svc-tren-ligero/images/estaciones/RegistroFederal.png'
import Estacion8 from '@/modules/svc-tren-ligero/images/estaciones/Textitlan.png'
import Estacion9 from '@/modules/svc-tren-ligero/images/estaciones/ElVergel.png'
import Estacion10 from '@/modules/svc-tren-ligero/images/estaciones/EstadioAzteca.png'
import Estacion11 from '@/modules/svc-tren-ligero/images/estaciones/Huipulco.png'
import Estacion12 from '@/modules/svc-tren-ligero/images/estaciones/Xolami.png'
import Estacion13 from '@/modules/svc-tren-ligero/images/estaciones/PerifericoParticipacionCiudadana.png'
import Estacion14 from '@/modules/svc-tren-ligero/images/estaciones/Tepepan.png'
import Estacion15 from '@/modules/svc-tren-ligero/images/estaciones/LaNoria.png'
import Estacion16 from '@/modules/svc-tren-ligero/images/estaciones/Huichapan.png'
import Estacion17 from '@/modules/svc-tren-ligero/images/estaciones/FranciscoGoitia.png'
import Estacion18 from '@/modules/svc-tren-ligero/images/estaciones/Xochimilco.png'

//Imagenes de cada estacion
import estacion1Imagen from '@/modules/svc-tren-ligero/images/estaciones popup/1 taxqueña.jpg'
import estacion2Imagen from '@/modules/svc-tren-ligero/images/estaciones popup/2 torres.jpg'
import estacion3Imagen from '@/modules/svc-tren-ligero/images/estaciones popup/3 cjardin.jpg'
import estacion4Imagen from '@/modules/svc-tren-ligero/images/estaciones popup/4 virgen.jpg'
import estacion5Imagen from '@/modules/svc-tren-ligero/images/estaciones popup/5 xotepingo.jpg'
import estacion6Imagen from '@/modules/svc-tren-ligero/images/estaciones popup/6 nezahualpilli.jpg'
import estacion7Imagen from '@/modules/svc-tren-ligero/images/estaciones popup/7 registro.jpg'
import estacion8Imagen from '@/modules/svc-tren-ligero/images/estaciones popup/8 texitlan.jpg'
import estacion9Imagen from '@/modules/svc-tren-ligero/images/estaciones popup/9 vergel.jpg'
import estacion10Imagen from '@/modules/svc-tren-ligero/images/estaciones popup/10 estadio.jpg'
import estacion11Imagen from '@/modules/svc-tren-ligero/images/estaciones popup/11 hepulco.png'
import estacion12Imagen from '@/modules/svc-tren-ligero/images/estaciones popup/12 xolami.jpg'
import estacion13Imagen from '@/modules/svc-tren-ligero/images/estaciones popup/13 periferico.jpg'
import estacion14Imagen from '@/modules/svc-tren-ligero/images/estaciones popup/14 tepepan.jpg'
import estacion15Imagen from '@/modules/svc-tren-ligero/images/estaciones popup/15 noria.jpg'
import estacion16Imagen from '@/modules/svc-tren-ligero/images/estaciones popup/16 huichapan.jpg'
import estacion17Imagen from '@/modules/svc-tren-ligero/images/estaciones popup/18 xochimilco.jpg'
import estacion18Imagen from '@/modules/svc-tren-ligero/images/estaciones popup/18 xochimilco.jpg'

const linea1: Linea = {
  coords_estaciones: [
    {
      id: '1',
      nombre: 'Taxqueña',
      coords: [-99.14051549899385, 19.343625038634695],
      iconoSrc: Estacion1,
      imgSrc: estacion1Imagen
    },
    {
      id: '2',
      nombre: 'Las torres',
      coords: [-99.14344646227231, 19.34082654347227],
      iconoSrc: Estacion2,
      imgSrc: estacion2Imagen
    },
    {
      id: '3',
      nombre: 'Ciudad jardín',
      coords: [-99.1418568976268, 19.33571959275373],
      iconoSrc: Estacion3,
      imgSrc: estacion3Imagen
    },
    {
      id: '4',
      nombre: 'La virgen',
      coords: [-99.14062179606358, 19.331695862009187],
      iconoSrc: Estacion4,
      imgSrc: estacion4Imagen
    },
    {
      id: '5',
      nombre: 'Xotepingo',
      coords: [-99.13929162854474, 19.327487731480332],
      iconoSrc: Estacion5,
      imgSrc: estacion5Imagen
    },
    {
      id: '6',
      nombre: 'Nezahualilli',
      coords: [-99.13817620406995, 19.323837662905493],
      iconoSrc: Estacion6,
      imgSrc: estacion6Imagen
    },
    {
      id: '7',
      nombre: 'Registro federal',
      coords: [-99.13879070944218, 19.31794102128078],
      iconoSrc: Estacion7,
      imgSrc: estacion7Imagen
    },
    {
      id: '8',
      nombre: 'Textitlán',
      coords: [-99.140582454692, 19.312559805839964],
      iconoSrc: Estacion8,
      imgSrc: estacion8Imagen
    },
    {
      id: '9',
      nombre: 'El vergel',
      coords: [-99.14299009968416, 19.3072825318787],
      iconoSrc: Estacion9,
      imgSrc: estacion9Imagen
    },
    {
      id: '10',
      nombre: 'Estadio Azteca',
      coords: [-99.14705831272369, 19.301821474916565],
      iconoSrc: Estacion10,
      imgSrc: estacion10Imagen
    },
    {
      id: '11',
      nombre: 'Huipulco',
      coords: [-99.15070796274486, 19.297484216872643],
      iconoSrc: Estacion11,
      imgSrc: estacion11Imagen
    },
    {
      id: '12',
      nombre: 'Xomali',
      coords: [-99.14678687647236, 19.288728348179486],
      iconoSrc: Estacion12,
      imgSrc: estacion12Imagen
    },
    {
      id: '13',
      nombre: 'Periférico, participación ciudadana',
      coords: [-99.13967437328094, 19.282742593882965],
      iconoSrc: Estacion13,
      imgSrc: estacion13Imagen
    },
    {
      id: '14',
      nombre: 'Tepepan',
      coords: [-99.13317637538299, 19.27952165708688],
      iconoSrc: Estacion14,
      imgSrc: estacion14Imagen
    },
    {
      id: '15',
      nombre: 'La noria',
      coords: [-99.12563213097941, 19.267932935476306],
      iconoSrc: Estacion15,
      imgSrc: estacion15Imagen
    },
    {
      id: '16',
      nombre: 'Huichapan',
      coords: [-99.1181258536112, 19.2642137048221],
      iconoSrc: Estacion16,
      imgSrc: estacion16Imagen
    },
    {
      id: '17',
      nombre: 'Francisco Goitia',
      coords: [-99.11126432788521, 19.26072292245018],
      iconoSrc: Estacion17,
      imgSrc: estacion17Imagen
    },
    {
      id: '18',
      nombre: 'Xochimilco',
      coords: [-99.10787979885181, 19.25938287809288],
      iconoSrc: Estacion18,
      imgSrc: estacion18Imagen
    }
  ]
}

export { linea1 }
