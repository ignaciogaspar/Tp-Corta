# SPEC de Corta

## Propósito

Corta es el acortador interno de URLs de la empresa. Permite convertir una URL larga en un código corto, redirigir a la URL original y conservar estadísticas básicas: cantidad de clics, URL original y fecha de creación.

La aplicación debe poder usarse desde la web y desde llamadas HTTP a la API.

## Modelo de datos

Cada registro corto representa una URL original asociada a un código único.

Estructura esperada:

- `codigo`: identificador corto, letras minúsculas y/o números, 3 caracteres.
- `url`: URL original válida con protocolo `http://` o `https://`.
- `clicks`: contador entero no negativo.
- `creado`: fecha ISO 8601 UTC de creación.

Reglas:

- El `codigo` debe generarse de manera única. Dos URLs distintas nunca deben compartir el mismo código corto.
- Si una URL ya existe en el sistema, puede reutilizar el mismo código o generar otro; lo importante es que la API sea consistente y no rompa la lógica de redirección.
- Los datos deben persistir entre reinicios del proceso en entorno local y en producción. En producción vivirá una base de datos de Railway y no se guardan credenciales en el repositorio.

## Endpoints

### POST /api/links

Crea un nuevo link corto a partir de una URL recibida en JSON.

Request:

```json
{ "url": "https://example.com/a/b" }
```

Respuestas esperadas:

- `201 Created` con JSON:

```json
{ "codigo": "a3k", "corta": "/a3k" }
```

- `400 Bad Request` si `url` falta o no es una URL válida.

Requisitos:

- Debe validar que la URL tenga protocolo `http` o `https`.
- Debe generar un `codigo` único.
- Debe guardar la fecha de creación.
- Debe responder con el código corto y la ruta relativa que representa el acceso público.

### GET /:codigo

Redirige el navegador a la URL original asociada al código corto.

Casos:

- Código válido: respuesta HTTP 302/307 y redirección a la URL original.
- Código inexistente: `404 Not Found` con texto simple.

Requisitos:

- La redirección debe incrementar `clicks` exactamente una vez por visita exitosa.
- El contador debe reflejar la verdad de las estadísticas.

### GET /api/links/:codigo/stats

Devuelve el estado actual de un código corto.

Respuesta esperada:

```json
{
  "codigo": "a3k",
  "url": "https://example.com/a/b",
  "clicks": 42,
  "creado": "2026-03-02T14:11:09.000Z"
}
```

- `404 Not Found` si el código no existe.
- El `creado` debe ser el valor original guardado al crear el link.

## Casos borde

### URLs inválidas

- Faltan o están vacías: `400 Bad Request`.
- Sin protocolo (`example.com`): `400 Bad Request`.
- Con protocolos no soportados (`ftp://...`): `400 Bad Request`.

### Códigos repetidos

Los códigos deben ser únicos. Si dos URLs distintas generan el mismo código aleatorio, el sistema debe volver a generar uno nuevo hasta encontrar un código libre. No debe haber colisiones ni un link apuntando a dos destinos distintos bajo la misma ruta corta.

### Links inexistentes

- `GET /codigo-no-existe` devuelve un `404` claro.
- `GET /api/links/codigo-no-existe/stats` devuelve un `404` claro.

## Estadísticas

La página de estadísticas (`public/stats.html`) debe consultar el endpoint de stats y mostrar:

- cantidad de clicks,
- URL original,
- fecha de creación.

La información que se muestre en la UI debe ser exactamente la que devuelve el backend; no puede haber "estadísticas de mentira" ni valores hardcodeados.

## Seguridad y configuración

- No se deben incluir secretos ni credenciales en el repositorio.
- Las variables de entorno se leen desde el entorno del proceso.
- La base de datos de producción vive en Railway y se accede por `DATABASE_URL`.
- En desarrollo local puede existir un archivo JSON como respaldo.

## Criterio de aceptación

Se consideran correctos estos comportamientos:

1. El usuario puede acortar una URL válida desde la web o la API.
2. El link corto redirige correctamente a la URL original.
3. Los clicks se registran y no se duplican erróneamente.
4. El endpoint de stats devuelve los datos reales del link.
5. La UI de stats refleja los datos reales.
6. La aplicación funciona con un repositorio limpio, documentación clara y historial Git trazable.
