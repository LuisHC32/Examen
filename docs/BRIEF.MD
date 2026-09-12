# Brief
## Contexto

VentasFix moderniza su venta online. Se necesita un **backoffice** para trabajadores y una **API** HTTP para integrarse con Softland. 

## Administrar:
- Control de **usuarios** del sistema
- Control de **productos** (con impuestos)
- Control de **clientes** empresa
- **Dashboard** con conteos

**Alcance:** backoffice + API autenticada.

---

## Entidades (escritura: todos obligatorios)

**Password en usuarios:** create exige `password`; update la deja **opcional** (si viene vacía o no se envía, no se cambia). El resto de campos sigue obligatorio.

### Usuarios (administradores)

`id`, `rut` (**único**; dígito verificador **módulo 11**), `nombre`, `apellido`, `email` (username; dominio **@ventasfix.cl**; **único**), `password` (**cifrada** en BD)

### Productos (IVA 19%)

`id`, `sku` (**único**), `nombre`, `descripción corta`, `descripción larga`, `imagen` (1 archivo por producto, **en disco**; en BD solo la **ruta** `String`), `precio neto` (`Int` **≥ 1**) y `precio de venta` (**enteros CLP**, `Int`; venta = `round(neto × 1.19)` al peso), `stock actual`, `stock mínimo`, `stock bajo`, `stock alto` (enteros **≥ 0**)

### Clientes (empresas)

`id`, `rut empresa` (**único**; mismo dígito verificador **módulo 11**), `rubro`, `razón social`, `teléfono`, `dirección`, `nombre contacto`, `email contacto` (email válido; **no** exigir `@ventasfix.cl`)

---

## Funcionalidades

### CRUD (UI + API) — Usuarios, Productos, Clientes

1. Listar todos (`GET`)
2. Obtener por ID (`GET`)
3. Agregar (`POST` → 201)
4. Actualizar por ID (`PUT` recurso completo; **sin PATCH**). Password en usuarios: opcional.
5. Eliminar por ID (`DELETE` → 204)

### Dashboard

- Conteo de usuarios, productos y clientes

---

## Restricciones técnicas

1. **Login** de acceso
2. Escritura: **no guardar vacíos**
3. **Password cifrada** en BD (Argon2id)
4. API con **autenticación** (JWT Bearer; cookie httpOnly en UI)
5. Tablas, modelos, rutas/handlers y vistas
6. Códigos HTTP de la API:

   | Acción | Código |
   |--------|--------|
   | Login / logout OK, listar, obtener por ID, **PUT** actualizar | **200** |
   | Create | **201** + recurso |
   | Delete | **204** sin cuerpo |
   | Validación (vacíos, email usuario no `@ventasfix.cl`, RUT inválido, números, etc.) | **400** |
   | Sin JWT / cookie; token inválido o expirado; credenciales incorrectas | **401** |
   | Recurso inexistente | **404** |
   | Conflicto (email / RUT / SKU duplicado) | **409** |

7. **Cuerpo de error uniforme** (todas las rutas):

   - Genérico: `{ "error": "mensaje" }`
   - Validación (400): `{ "error": "Validación", "details": { "email": "..." } }`

8. **Unicidad** (409 si ya existe): usuario `email` y `rut`; producto `sku`; cliente `rut empresa`.

9. **Actualizar = PUT** (recurso completo; todos los campos obligatorios salvo `password` en usuarios). No implementar PATCH.

10. UI en **español**; feedback con **toasts** (sin `alert`)

11. **Prisma:** precios **enteros CLP** (`Int`); `@unique` en schema. **Seed:** 1 admin de login (su `rut` debe pasar el dígito verificador).

12. **Validación (400):** `precioNeto` entero **≥ 1**; stocks enteros **≥ 0**; imagen: archivo de imagen en **create** (jpeg/png/webp); email de **cliente** válido (sin dominio VentasFix); **RUT** de usuario y de empresa con dígito verificador (módulo 11). RUT inválido → **400**, no 409.

13. **Imagen:** el archivo se guarda **en disco** (`public/uploads/`). En PostgreSQL solo la ruta (ej. `/uploads/…`). **Create** exige archivo (`multipart`); **PUT** opcional (si no viene, se mantiene). **No** guardar bytes ni base64 en la BD. Al eliminar el producto, borrar el archivo.

---

## Fuera de alcance

- Carrito / pedidos
- Softland real más allá de la API REST

---

## Checklist rápido

- [ ] Login + middleware (credenciales malas / token inválido → 401)
- [ ] CRUD Usuarios / Productos / Clientes (web)
- [ ] Mismo CRUD vía API autenticada: GET / POST / **PUT** / DELETE + HTTP 200 / 201 / 204 / 400 / 401 / 404 / 409
- [ ] Error JSON uniforme; unicidad email / rut / sku / rut empresa
- [ ] Dashboard con conteos
- [ ] Passwords cifradas; create exige password, update opcional; sin vacíos; emails `@ventasfix.cl`
- [ ] `precioVenta` = `round(neto × 1.19)` a peso entero; `precioNeto ≥ 1`; stocks `≥ 0`
- [ ] UI español + toasts
- [ ] Imagen en disco (`public/uploads`); BD solo ruta; email cliente válido; RUT con dígito verificador (módulo 11)
- [ ] Prisma: precios `Int` CLP, uniques en schema, seed solo admin
- [ ] Docker Compose + README ES
