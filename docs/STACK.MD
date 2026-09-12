# Stack — VentasFix Backoffice

## Decisión

Monolito **Next.js App Router**: UI React y Route Handlers en el mismo proceso. Un repo, un deploy. Sin Nest/Express separado.

```
Browser → UI (cookie httpOnly) → Route Handlers → Prisma → PostgreSQL
Integradores (Softland) → misma API HTTP con Bearer JWT
```

---

## Tecnologías

| Capa | Tecnología | Por qué |
|------|------------|---------|
| Framework | **Next.js** (App Router) + TypeScript | UI + API en un solo proyecto |
| UI | React + **Tailwind CSS** | Sidebar y formularios propios (template Drive no aplica) |
| Toasts | **sonner** | Feedback UX sin `alert` nativo |
| API | Route Handlers (`app/api/...`) | REST para UI y terceros |
| Validación | **Zod** | Misma regla en API y forms; sin vacíos; email `@ventasfix.cl` |
| ORM / BD | **Prisma** + **PostgreSQL 16** | Modelos claros; migrate + seed reproducibles |
| Auth | **jose** (JWT) | Bearer en API; cookie httpOnly en UI |
| Hash | **@node-rs/argon2** (Argon2id) | Password cifrada en BD |
| Contenedores | Docker + **docker-compose** | `db` + `app` con un comando |

---

## Librerías clave (`package.json`)

| Paquete | Uso |
|---------|-----|
| `next`, `react`, `react-dom` | App |
| `typescript`, `@types/node` | Tipado |
| `tailwindcss` (+ tooling Next) | Estilos |
| `prisma`, `@prisma/client` | ORM |
| `zod` | Schemas |
| `jose` | JWT sign/verify |
| `@node-rs/argon2` | Hash/verify |
| `sonner` | Toasts |
| `tsx` (dev) | Seed / scripts |

---

## Variables de entorno

| Variable | Ejemplo / nota |
|----------|----------------|
| `DATABASE_URL` | `postgresql://…` (Postgres 16) |
| `JWT_SECRET` | ≥ 32 caracteres |
| `NODE_ENV` | `development` / `production` |

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
| Middleware | Protege backoffice; libera `/login` y login API |
| Seed | `admin@ventasfix.cl` / `Admin123!` (solo seed) |

---

## Reglas de dominio

- Emails de **usuario**: terminan en `@ventasfix.cl`
- Email de **cliente** (`emailContacto`): email válido; **no** exigir `@ventasfix.cl`
- `precioNeto` entero **≥ 1**; stocks (`stockActual`, `stockMinimo`, `stockBajo`, `stockAlto`) enteros **≥ 0**
- `precioVenta = round(precioNeto * 1.19)` a **peso entero** (CLP)
- `imagen`: archivo en disco (`public/uploads/`); en BD un `String` con la ruta pública (ej. `/uploads/sku-….jpg`). Create = `multipart` con archivo; PUT sin archivo = no cambiar. jpeg/png/webp; inválido o ausente en create → **400**. No bytes/base64 en PostgreSQL.
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

Contexto **Chile**: IVA 19 %, precios en **CLP enteros** (sin centavos).

### Schema

- Precios (`precioNeto`, `precioVenta`): `Int` — pesos enteros.
- Stocks: `Int` ≥ 0 (validar en Zod, no hace falta check SQL).
- `imagen`: `String` (ruta al archivo en disco, no URL externa ni blob).
- Uniques: `User.email`, `User.rut`, `Product.sku`, `Client.rutEmpresa`.
- RUT: validar DV en Zod/`lib` (no en SQL).

```prisma
model User {
  email String @unique
  rut   String @unique
}

model Product {
  sku         String @unique
  imagen      String
  precioNeto  Int
  precioVenta Int
  stockActual Int
  stockMinimo Int
  stockBajo   Int
  stockAlto   Int
}

model Client {
  rutEmpresa    String @unique
  emailContacto String
}
```

### Seed (`prisma/seed.ts`)

el admin de login: `admin@ventasfix.cl` / `Admin123!`. Su `rut` debe ser **válido** según el módulo 11.

## Contenedores

```yaml
services:
  db:
    image: postgres:16
  app:
    build: .
    ports: ["3000:3000"]
    volumes:
      - uploads_data:/app/public/uploads
    depends_on:
      db:
        condition: service_healthy

volumes:
  uploads_data:
```

App: migrate deploy + seed + `next start` (preferir `output: "standalone"`).

---

## Mapa de carpetas

```
app/(auth)/login/
app/(backoffice)/          # layout sidebar, dashboard, CRUD pages
app/api/auth|users|products|clients|dashboard/
components/                # forms, tables, toaster
lib/                       # prisma, password, auth, validators, api helpers
public/uploads/            # imágenes de productos (volumen Docker)
prisma/schema.prisma
prisma/seed.ts
Dockerfile
docker-compose.yml
README.md                  # instrucciones en español
```

---

## Cómo levantar

```bash
docker compose up --build
# App en http://localhost:3000
# Login seed: admin@ventasfix.cl / Admin123!
```
