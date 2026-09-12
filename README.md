# VentasFix — Backoffice y API

Monolito Next.js (App Router) con UI en español y API REST autenticada para integrarse con Softland.

## Levantar

```bash
docker compose up --build
```

- App: http://localhost:3000
- Login seed: `admin@ventasfix.cl` / `Admin123!`

PostgreSQL 16 corre dentro de Compose (servicio `db`). No publica el puerto 5432 en el host para no chocar con otras instancias locales.

## Variables de entorno

Copia `.env.example` si necesitas valores locales. En Docker Compose ya van definidas:

| Variable | Uso |
|----------|-----|
| `DATABASE_URL` | PostgreSQL 16 |
| `JWT_SECRET` | Firma JWT (≥ 32 caracteres) |
| `NODE_ENV` | `development` / `production` |

## API

Autenticación: `Authorization: Bearer <token>` o cookie httpOnly `ventasfix_token`.

| Recurso | Métodos |
|---------|---------|
| `/api/auth/login` | `POST` → 200 `{ token }` |
| `/api/auth/logout` | `POST` → 200 |
| `/api/users` | `GET`, `POST` |
| `/api/users/:id` | `GET`, `PUT`, `DELETE` |
| `/api/products` | `GET`, `POST` (multipart + imagen) |
| `/api/products/:id` | `GET`, `PUT`, `DELETE` |
| `/api/clients` | `GET`, `POST` |
| `/api/clients/:id` | `GET`, `PUT`, `DELETE` |
| `/api/dashboard` | `GET` → `{ users, products, clients }` |

Códigos: 200 / 201 / 204 / 400 / 401 / 404 / 409. Errores `{ "error": "…" }`; validación 400 `{ "error": "Validación", "details": { ... } }`.

Alta de producto: `multipart/form-data` con archivo `imagen` (jpeg/png/webp). El archivo queda en `public/uploads`; en PostgreSQL solo se guarda la ruta.

## Tests

Los tests de dominio (RUT módulo 11, IVA, Zod) se ejecutan dentro del contenedor de Node del proyecto:

```bash
pnpm test
```
