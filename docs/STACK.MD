# Stack — VentasFix Backoffice

## Decisión

Front y API **separados**, como pide el enunciado de cliente-servidor. Un repo, tres contenedores.

```
Browser → Front React (nginx :3000)
           fetch /api y /uploads (proxy) + cookie httpOnly
         API Express :3001
           Prisma → PostgreSQL 16
Integradores (Softland / Postman) → API :3001 con Bearer JWT
```

---

## Tecnologías

| Capa | Tecnología | Por qué |
|------|------------|---------|
| Front | **Vite** + **React** + React Router + **Tailwind CSS** | UI del backoffice, sin Route Handlers |
| Toasts | **sonner** | Feedback UX sin `alert` nativo |
| API | **Express** + TypeScript | REST para UI y terceros |
| Validación | **Zod** | Misma regla en API; sin vacíos; email `@ventasfix.cl` |
| ORM / BD | **Prisma** + **PostgreSQL 16** | Modelos claros; migrate + seed reproducibles |
| Auth | **jose** (JWT) | Bearer en API; cookie httpOnly en UI |
| Hash | **@node-rs/argon2** (Argon2id) | Password cifrada en BD |
| Contenedores | Docker Compose | `db` + `api` + `web` |

---

## Librerías clave

| Paquete | Uso |
|---------|-----|
| `express`, `cookie-parser`, `cors`, `multer` | API HTTP, cookie, uploads |
| `react`, `react-dom`, `react-router-dom`, `vite` | Front |
| `typescript` | Tipado |
| `tailwindcss` | Estilos |
| `prisma`, `@prisma/client` | ORM |
| `zod` | Schemas |
| `jose` | JWT sign/verify |
| `@node-rs/argon2` | Hash/verify |
| `sonner` | Toasts |
| `tsx` | Arranque y seed de la API |

---

## Variables de entorno

| Variable | Ejemplo / nota |
|----------|----------------|
| `DATABASE_URL` | `postgresql://…` (Postgres 16) |
| `JWT_SECRET` | ≥ 32 caracteres |
| `NODE_ENV` | `development` / `production` |
| `COOKIE_SECURE` | `true` solo en HTTPS |
| `UPLOADS_DIR` | Directorio de imágenes de producto |

Ver `.env.example` (no versionar `.env`).

---

## Auth

| Pieza | Detalle |
|-------|---------|
| Login OK | `POST /api/auth/login` → **200** `{ token }` + Set-Cookie |
| Login fallido | Credenciales incorrectas → **401** `{ "error": "…" }` (no 400) |
| Cookie | `ventasfix_token`, httpOnly, ~8h |
| API | `Authorization: Bearer <token>` **o** cookie |
| Token | Ausente, inválido o expirado → **401** |
| Logout | `POST /api/auth/logout` → **200**; limpia cookie |
| Front | `GET /api/auth/me` para proteger rutas; `/login` público |
| Seed | `admin@ventasfix.cl` / `Admin123!` (solo seed) |

El proxy de nginx (y el de Vite en dev) reenvía `/api` y `/uploads` a la API para que la cookie viva en el mismo origen que el front (`localhost:3000`).

---

## Reglas de dominio

- Emails de **usuario**: terminan en `@ventasfix.cl`
- Email de **cliente** (`emailContacto`): email válido; **no** exigir `@ventasfix.cl`
- `precioNeto` entero **≥ 1**; stocks (`stockActual`, `stockMinimo`, `stockBajo`, `stockAlto`) enteros **≥ 0**
- `precioVenta = round(precioNeto * 1.19)` a **peso entero** (CLP)
- `imagen`: archivo en disco (`uploads/`); en BD un `String` con la ruta pública (ej. `/uploads/sku-….jpg`). Create = `multipart` con archivo; PUT sin archivo = no cambiar. jpeg/png/webp; inválido o ausente en create → **400**. No bytes/base64 en PostgreSQL.
- **RUT** (`User.rut`, `Client.rutEmpresa`): `String` único; validar **dígito verificador módulo 11** (Chile). Inválido → **400**.
- Nunca devolver `passwordHash` en JSON
- **Password:** create exige `password`; **PUT** opcional (vacía o omitida → no se cambia)
- **Unicidad** (índices Prisma; 409 si choca): `User.email`, `User.rut`, `Product.sku`, `Client.rutEmpresa`
- **Actualizar = PUT** (cuerpo completo). No hay PATCH.

### RUT (dígito verificador)

Aplica a usuario y a `rutEmpresa`. Aceptar con o sin puntos; guion opcional; `K` mayúscula o minúscula.

1. Quitar puntos y espacios; separar **cuerpo** (solo dígitos) y **DV** (último carácter: `0–9` o `K`).
2. Recorrer el cuerpo **de derecha a izquierda**.
3. Multiplicar cada dígito por la serie `2, 3, 4, 5, 6, 7` y repetir.
4. `resto = suma % 11`; `dv = 11 - resto`.
5. Si `dv === 11` → `0`; si `dv === 10` → `K`.
6. Comparar con el DV informado. Si no coincide → **400** `{ "error": "Validación", "details": { "rut": "…" } }`.

Duplicado con DV correcto → **409**, no 400.

### Cuerpo de error (todas las rutas)

```json
{ "error": "mensaje" }
```

Validación **400**:

```json
{ "error": "Validación", "details": { "email": "Debe terminar en @ventasfix.cl" } }
```

### Códigos HTTP

| Acción | Código | Cuerpo |
|--------|--------|--------|
| Login / logout OK, listar, obtener por ID, **PUT** actualizar | **200** | JSON |
| Create | **201** | Recurso creado |
| Delete | **204** | Sin cuerpo |
| Validación (vacíos, email usuario no `@ventasfix.cl`, RUT DV, `precioNeto` / stocks, imagen, etc.) | **400** | `{ error, details }` |
| Sin JWT / cookie; token inválido o expirado; credenciales incorrectas | **401** | `{ error }` |
| Recurso inexistente | **404** | `{ error }` |
| Conflicto (email / RUT / SKU duplicado) | **409** | `{ error }` |

---

## Prisma

Contexto **Chile**: IVA 19 %, precios en **CLP enteros** (sin centavos). Schema en `api/prisma`.

### Seed (`api/prisma/seed.ts`)

Admin de login: `admin@ventasfix.cl` / `Admin123!`. Su `rut` es válido según el módulo 11.

## Contenedores

```yaml
services:
  db:
    image: postgres:16
  api:
    build: ./api
    ports: ["3001:3001"]
    volumes:
      - uploads_data:/app/uploads
  web:
    build: ./web
    ports: ["3000:80"]
```

API: migrate deploy + seed + Express. Front: nginx sirve el build de Vite y proxea `/api` y `/uploads`.

---

## Mapa de carpetas

```
web/                       # Vite + React (backoffice)
api/src/                   # Express, validadores, JWT, uploads
api/src/routes/            # auth, users, products, clients, dashboard
api/prisma/                # schema, migrate, seed
docker-compose.yml
README.md
```

---

## Cómo levantar

```bash
docker compose up --build
# Front: http://localhost:3000
# API:  http://localhost:3001
# Login seed: admin@ventasfix.cl / Admin123!
```
