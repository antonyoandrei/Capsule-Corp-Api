# Capsule Corp API

API pública de solo lectura para el catálogo de Capsule Corp. Usa Express 5, CORS y `db.json`, la única fuente de productos. El frontend consume esta API y no mantiene otro catálogo.

## Requisitos

- Node.js 24 LTS (versión fijada en `.nvmrc`)
- npm 10 o superior

## Inicio local

```bash
npm install
npm start
```

La API escucha en `http://localhost:3000`. Puedes cambiar el puerto con `PORT`.

Al editar `db.json`, el proceso local comprueba el mtime en la siguiente petición y solo relee el archivo cuando cambia. No hace falta reiniciarlo por cambios de datos. Un cambio de código del servidor sí requiere reiniciar el proceso local.

## Endpoints

| Método | Endpoint | Respuesta |
| --- | --- | --- |
| GET | `/health` | Estado y número total de productos |
| GET | `/clothes` | Todas las prendas |
| GET | `/items` | Todos los objetos |
| GET | `/clothes/:id` | Una prenda |
| GET | `/items/:id` | Un objeto |
| GET | `/api/clothes` | Alias de prendas |
| GET | `/api/items` | Alias de objetos |
| GET | `/product/:resource/:id/show` | Ruta compatible con la API anterior |

Las rutas de colección aceptan búsqueda y paginación:

```text
/items?q=dragon
/clothes?_page=1&_limit=10
```

## Verificación

```bash
npm run check
npm audit
```

## Despliegue

El repositorio exporta Express desde `api/server.js`. `vercel.json` dirige las rutas a `/api/server` e incluye expresamente `db.json` en esa función. Las comprobaciones viven en `scripts/`, fuera del directorio de funciones. No se configura memoria en el archivo, para ser compatible con Fluid compute. [Configuración de funciones](https://vercel.com/docs/project-configuration/vercel-json#functions).

En Vercel, comprueba estos valores del proyecto existente:

- Repositorio: `antonyoandrei/Capsule-Corp-Api`.
- Directorio raíz: raíz del repositorio.
- Rama de producción: `main`.
- Runtime: Node.js 24 LTS.
- Dominio de producción: `https://capsule-corp-api.vercel.app`.

Con la integración Git activa, publica un commit en la rama de producción para desplegar. Este repositorio solo publica la API. El frontend vive en `antonyoandrei/Capsule-Corp`, tiene su propio proyecto y usa `master`; los cambios de interfaz se publican allí por separado. [Integración Git de Vercel](https://vercel.com/docs/git).

Después de publicar el catálogo actual, comprueba:

| Ruta | Resultado esperado |
| --- | --- |
| `/health` | 48 productos |
| `/clothes` | 20 productos |
| `/items` | 28 productos |
| `/clothes/49` | Goku Black's Robes |
| `/clothes/50` | Goku Black's Pants |
| `/items/39` y `/items/43` | 404 |

El catálogo anterior también tenía 48 productos: verifica las colecciones e IDs, no solo `/health`. La consulta pública de GitHub del 11 de septiembre de 2026 confirmó un despliegue Production completado por `vercel[bot]` el 24 de agosto; no permite comprobar las variables actuales del panel.

## Cambios de catálogo y caché

Edita únicamente `db.json` en este repositorio. Conserva los IDs de productos existentes y añade nuevos IDs para productos nuevos. Las imágenes son URLs versionadas de Cloudinary; mantén `img` y `images[0]` alineados y conserva en `images` las vistas del mismo producto.

En Vercel el JSON forma parte del despliegue: publica la API para actualizarlo. El código no escribe en el filesystem desplegado. Las respuestas usan `Cache-Control: no-cache` y el ETag de Express, de modo que el navegador puede validar una copia sin volver a transferir el contenido cuando coincide.

El frontend muestra su última copia mientras consulta la API en cada carga completa. No necesita otro build cuando solo cambian productos ni espera cinco minutos tras recargar. Una pestaña que permanece abierta se actualiza al recargar; no hay polling. Si cambias el dominio de la API, actualiza `VITE_API_BASE_URL` en el entorno de Vercel del frontend y vuelve a desplegarlo, porque Vite incorpora esa URL durante su build.
