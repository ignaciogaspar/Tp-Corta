# AGENTS.md

## Proyecto

Corta es un acortador interno de URLs con:
- creación de links cortos,
- redirección a la URL original,
- contador de clicks,
- endpoint de estadísticas por código,
- UI web para acortar y consultar datos,
- despliegue en Railway con PostgreSQL.

## Estado actual

- Milestone 1: registro histórico del repo inicial completado.
- Milestone 2: repositorio ordenado, documentación añadida y archivos duplicados archivados.
- Milestone 3: correcciones funcionales implementadas y validadas con tests.
- Milestone 4: stats de links conectadas a la UI y al backend.
- Milestone 5: despliegue de producción configurado en Railway con base de datos PostgreSQL.
- URL pública en producción: https://corta-production-656f.up.railway.app

## Reglas del equipo

- Mantener `SPEC.md` como documento de verdad del comportamiento esperado.
- Antes de implementar una corrección o feature, derivar tests desde `SPEC.md`.
- No guardar secretos ni credenciales en el repositorio.
- Usar `DATABASE_URL` de Railway en producción; el archivo local `links.json` solo sirve como respaldo de desarrollo.
- Mantener la estructura limpia: archivos viejos en `legacy/`, scripts útiles en `scripts/`, pruebas en `tests/`.
- Ejecutar `npm test -- --test-reporter=spec` antes de cerrar cambios funcionales.
- Preferir commits claros por milestone con mensajes descriptivos.

## Convenciones

- El código corto tiene 3 caracteres alfanuméricos minúsculas y dígitos.
- Una URL inválida debe devolver `400`.
- Un código inexistente debe devolver `404`.
- La redirección debe incrementar `clicks` una sola vez por visita exitosa.
- El endpoint `/api/links/:codigo/stats` devuelve exactamente `codigo`, `url`, `clicks` y `creado`.

## Archivos clave

- `server.js`: servidor principal y lógica de negocio.
- `utils.js`: generación de códigos.
- `public/index.html`: UI para acortar URLs.
- `public/stats.html`: UI para consultar estadísticas.
- `SPEC.md`: especificación funcional.
- `.claude/commands/collect-memory.md`: instrucción para actualizar la memoria del agente.

## Trabajo en equipo

- Cada integrante debe trabajar con una branch propia y commits con autor real.
- Para reportar cambios del repo, se puede usar `./scripts/reporte-cambios.sh` o un cron local que lo ejecute periódicamente.
- La invitación a colaboradores se hace desde GitHub con cuentas reales de cada integrante.
