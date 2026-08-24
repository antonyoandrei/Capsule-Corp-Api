# Capsule Corp API

API pública de solo lectura para el catálogo de Capsule Corp. Usa Express 5, CORS y la base de datos local `db.json`.

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Inicio local

```bash
npm install
npm start
```

La API escucha en `http://localhost:3000`. Puedes cambiar el puerto con `PORT`.

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

El repositorio incluye `vercel.json` y exporta la aplicación Express desde `api/server.js`. Tras desplegar en Vercel, comprueba `/health` antes de configurar `VITE_API_BASE_URL` en el frontend.
