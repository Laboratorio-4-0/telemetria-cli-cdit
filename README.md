# telemetria-cli

Cliente frontend para la aplicación de telemetría implementada en vue 3 mediante vite y typescript

## Project Setup

```sh
npm install
```

# Ejecutar en entorno de desarrollo DEV

- Moverse a rama `dev` del proyecto
- Configura el archivo `.env` con las variables de ambiente correspondientes

```sh
npm run dev
```

### Crear build de producción

```sh
npm run build
```

### Crear preview de producción

```sh
npm run preview
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

# Deploy de producción

- Clonar repo en el server de despliegue
- Moverse a rama `main` del proyecto
- Cambiar las variables `.env` de acuerdo a los datos de producción
- vite deploy
Mas info [Vite deploy](https://vitejs.dev/guide/static-deploy.html).

# Agregar nuevas features

- mover a rama `dev`
- actualizar cambios `git pull`
- crear nueva rama mediante la nomenclatura `feat/<nombre-de-la-feature>` o si es fix `fix/<nombre-de-fix-a-solucionar>`
  Mas info [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

- instalar dependencias

```sh
npm install
```
