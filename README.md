# Corta

Corta es un acortador interno de URLs. Permite crear links cortos, redirigirlos al destino real y consultar estadísticas básicas sobre clics, URL original y fecha de creación.

## Requisitos

- Node.js 20+
- npm

## Instalación

```bash
npm install
```

## Ejecución local

```bash
npm start
```

La aplicación escucha en el puerto configurado por `PORT` o en `3000` por defecto.

## API

### Crear un link corto

```bash
curl -X POST http://localhost:3000/api/links \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com/una-url-larga"}'
```

Respuesta esperada:

```json
{ "codigo": "a3k", "corta": "/a3k" }
```

### Redirigir

```bash
curl -I http://localhost:3000/a3k
```

### Estadísticas

```bash
curl http://localhost:3000/api/links/a3k/stats
```

## Producción

En Railway la base de datos se configura como un servicio PostgreSQL y la aplicación consume `DATABASE_URL` como variable de entorno. No se guardan credenciales ni secretos en el repositorio.

## Archivos clave

- `server.js`: servidor Express y lógica de negocio.
- `utils.js`: generación del código corto.
- `public/index.html`: interfaz para acortar URLs.
- `public/stats.html`: interfaz para ver estadísticas.
- `links.json`: respaldo local para desarrollo sin base de datos.
- `SPEC.md`: especificación funcional del proyecto.
