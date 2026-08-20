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

## Trabajo en equipo y reporte de cambios

Cada miembro puede sumar su cuenta de GitHub como colaborador del repositorio y trabajar con branches propias.

Para generar un reporte real de cambios del repo desde cualquier máquina:

```bash
./scripts/reporte-cambios.sh
```

Ejemplo de cron para una máquina personal:

```bash
crontab -e
0 * * * * cd /ruta/al/repo/corta && ./scripts/reporte-cambios.sh > ~/corta-reporte.txt
```

Eso deja un resumen con commits nuevos, autores y archivos tocados.

## Memoria del agente

El repo incluye la memoria operativa en `AGENTS.md` y el comando de Claude Code en `.claude/commands/collect-memory.md`.

Cuando el equipo quiera actualizar la memoria del agente, se puede ejecutar esta instrucción:

```text
/collect-memory
```

La intención es resumir avances, decisiones y preferencias del equipo para que la próxima sesión arranque con contexto actualizado.

## Archivos clave

- `server.js`: servidor Express y lógica de negocio.
- `utils.js`: generación del código corto.
- `public/index.html`: interfaz para acortar URLs.
- `public/stats.html`: interfaz para ver estadísticas.
- `links.json`: respaldo local para desarrollo sin base de datos.
- `SPEC.md`: especificación funcional del proyecto.
- `AGENTS.md`: memoria operativa del proyecto.
- `scripts/reporte-cambios.sh`: reporta commits y cambios del repo.
