# Guía staging / demo — FoodHub

Esta guía valida una **instalación limpia** como la de un cliente nuevo, antes de producción.

**Tiempo estimado:** 30–45 minutos  
**Resultado esperado:** sitio público + panel admin funcionando con datos demo, listo para personalizar.

---

## Requisitos previos

| Herramienta | Versión |
|-------------|---------|
| Node.js | 18+ |
| npm | incluido con Node |
| SQL Server | 2016+ |
| SSMS o Azure Data Studio | cualquier versión reciente |

Clonar el repositorio y tener acceso de red al servidor SQL.

---

## Resumen del flujo

```
1. Crear BD nueva
2. Ejecutar 000_install_completo.sql  (esquema + seeds demo)
3. Definir contraseña admin
4. Configurar .env de staging
5. npm install && npm run dev (o npm start)
6. Checklist de verificación manual
```

> **Recomendado:** usar `000_install_completo.sql` en instalaciones nuevas. Los scripts `001`–`022` son para migraciones incrementales sobre bases existentes (ver [database/sqlserver/README.md](../database/sqlserver/README.md)).

---

## Paso 1 — Crear base SQL Server nueva

Usar un nombre dedicado al entorno staging, distinto de producción.

**Ejemplo en SSMS / Azure Data Studio:**

```sql
CREATE DATABASE FoodHub_Staging;
GO
```

Opcional: usuario SQL dedicado (recomendado si staging está en servidor compartido):

```sql
USE FoodHub_Staging;
GO
CREATE LOGIN foodhub_staging WITH PASSWORD = '<DB_PASSWORD>';
CREATE USER foodhub_staging FOR LOGIN foodhub_staging;
ALTER ROLE db_owner ADD MEMBER foodhub_staging;
GO
```

Anotar: `DB_SERVER`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.

---

## Paso 2 — Ejecutar migraciones desde cero

### Opción A — Instalación completa (recomendada)

1. Abrir `database/sqlserver/000_install_completo.sql`
2. Descomentar y ajustar al inicio del archivo:

```sql
CREATE DATABASE FoodHub_Staging;
GO
USE FoodHub_Staging;
GO
```

   Si la BD ya existe, usar solo `USE FoodHub_Staging;`

3. Ejecutar **el script completo** (F5)

**Incluye:**
- Esquema final (tablas, índices, triggers) — equivalente a `001`–`022`
- Seeds demo integrados (admin, configuración, hero, menú, información útil)

**No incluye datos demo de:**
- Promociones
- Testimonios aprobados

Esos se crean manualmente en el paso 7 para validar el flujo admin.

### Opción B — Scripts incrementales (solo si no usás `000`)

En una BD **vacía**, ejecutar en orden:

| Orden | Script | Tipo |
|-------|--------|------|
| 1 | `001_schema_bendita_comida.sql` | Esquema base |
| 2 | `007_schema_configuracion_negocio.sql` | Esquema |
| 3 | `009_schema_admin_sesion_version.sql` | Esquema |
| 4 | `010_schema_promociones.sql` | Esquema |
| 5 | `011_schema_productos_destacado.sql` | Esquema |
| 6 | `012_schema_orden_menu.sql` | Esquema |
| 7 | `013_schema_configuracion_seo.sql` | Esquema |
| 8 | `014_schema_hero_home.sql` | Esquema |
| 9 | `016_schema_testimonios.sql` | Esquema |
| 10 | `017_schema_testimonios_estado.sql` | Esquema |
| 11 | `018_schema_informacion_util.sql` | Esquema |
| 12 | `020_migrate_logo_foodhub.sql` | Migración |
| 13 | `021_migrate_marca_publica.sql` | Migración |
| 14 | `022_schema_configuracion_tema.sql` | Migración |

Los archivos `002`, `004` y `005` son **consultas de referencia** usadas por la app en código; **no se ejecutan** en la base.

---

## Paso 3 — Seeds demo

Si usaste **`000_install_completo.sql`**, los seeds ya están aplicados. Verificar:

```sql
USE FoodHub_Staging;
SELECT COUNT(*) AS categorias FROM dbo.Categorias;
SELECT COUNT(*) AS productos FROM dbo.Productos;
SELECT COUNT(*) AS zonas FROM dbo.ZonasEntrega;
SELECT email FROM dbo.Administradores;
SELECT nombre_negocio FROM dbo.ConfiguracionNegocio;
```

Valores esperados aproximados: 2 categorías, 4 productos, 2 zonas, admin `admin@demo.local`, negocio `Mi negocio`.

### Seeds adicionales (solo en opción B incremental)

Ejecutar en este orden:

```text
006_seed_administrador.sql
008_seed_configuracion_negocio.sql
003_seed_menu_ejemplo.sql
015_seed_hero_home.sql
019_seed_informacion_util.sql
```

---

## Paso 4 — Crear administrador inicial

El seed crea `admin@demo.local` con un hash bcrypt **temporal**. Definir una contraseña conocida antes del primer login.

### 4.1 Generar hash

Desde la raíz del proyecto:

```bash
node backend/scripts/hash-password.js "<TU_PASSWORD_SEGURA>"
```

Copiar el hash de salida (empieza con `$2b$12$...`).

### 4.2 Actualizar en SQL Server

```sql
USE FoodHub_Staging;
GO

UPDATE dbo.Administradores
SET password_hash = N'$2b$12$...pegar_hash_aqui...'
WHERE email = N'admin@demo.local';
GO
```

Anotar email y contraseña para el paso 7.

> En producción usar contraseña distinta y eliminar cualquier credencial demo compartida.

---

## Paso 5 — Configurar `.env` de staging

```bash
cp .env.example .env
```

### Escenario A — Staging local (más simple)

Validaciones de producción **no bloquean** el arranque; se muestran advertencias.

```env
NODE_ENV=development
PORT=3000

SITE_URL=http://localhost:3000

SESSION_SECRET="<SESSION_SECRET>"
SESSION_MAX_AGE_MS=86400000

DB_SERVER=localhost
DB_PORT=1433
DB_NAME=FoodHub_Staging
DB_USER=sa
DB_PASSWORD=<DB_PASSWORD>
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true

MENU_FEATURED_LIMIT=4

WHATSAPP_PHONE=5491112345678
WHATSAPP_DEFAULT_MESSAGE=Hola! Quiero hacer un pedido.
```

### Escenario B — Staging en servidor (simula producción)

Usar `NODE_ENV=production` para activar validaciones reales (HTTPS obligatorio, secretos fuertes, etc.).

```env
NODE_ENV=production
PORT=3000

SITE_URL=https://staging.tudominio.com

SESSION_SECRET="<SESSION_SECRET>"
SESSION_MAX_AGE_MS=86400000

DB_SERVER=servidor-sql.interno
DB_PORT=1433
DB_NAME=FoodHub_Staging
DB_USER=foodhub_staging
DB_PASSWORD=<DB_PASSWORD>
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=false

MENU_FEATURED_LIMIT=4

WHATSAPP_PHONE=5491112345678
WHATSAPP_DEFAULT_MESSAGE=Hola! Quiero hacer un pedido.
```

**Requisitos escenario B:**
- Reverse proxy con HTTPS apuntando al puerto de la app
- `SESSION_SECRET` ≥ 32 caracteres, no valor de ejemplo
- `DB_USER` distinto de `sa`
- `DB_PASSWORD` no trivial (mín. 8 caracteres)
- `WHATSAPP_PHONE` solo dígitos, 10–15 caracteres

Si el arranque falla, la consola lista qué variable corregir.

---

## Paso 6 — Levantar la aplicación

```bash
npm install
npm run dev
```

Para staging en servidor:

```bash
npm install --omit=dev
npm start
```

**Salida esperada:**

```
[INFO] Servidor en http://localhost:3000 | {"env":"development"}
```

(o equivalente en staging remoto)

**Si falla «Puerto en uso»:** cerrar otra instancia de Node o cambiar `PORT` en `.env`.

**Carpetas de uploads:** se crean automáticamente al subir la primera imagen. Opcionalmente crearlas antes:

```text
frontend/public/uploads/productos/
frontend/public/uploads/promociones/
frontend/public/uploads/hero/
frontend/public/uploads/logos/
frontend/public/uploads/og/
```

---

## Paso 7 — Checklist de verificación

Marcar cada ítem. Anotar URL base: `http://localhost:3000` (local) o `https://staging.tudominio.com` (servidor).

### 7.1 Login admin

| # | Acción | OK |
|---|--------|----|
| 1 | Abrir `/auth/login` | ☐ |
| 2 | Ingresar `admin@demo.local` + contraseña del paso 4 | ☐ |
| 3 | Redirige a `/admin` (dashboard) | ☐ |
| 4 | Cerrar sesión desde el sidebar (POST, no enlace directo) | ☐ |
| 5 | Vuelve a `/auth/login` | ☐ |

### 7.2 Configuración del negocio

| # | Acción | OK |
|---|--------|----|
| 1 | Admin → **Configuración** | ☐ |
| 2 | Cambiar nombre del negocio → guardar | ☐ |
| 3 | Home pública muestra el nuevo nombre | ☐ |
| 4 | Completar teléfono, dirección, horarios, email | ☐ |

### 7.3 Logo

| # | Acción | OK |
|---|--------|----|
| 1 | Subir logo PNG/JPG/WebP (< 5 MB) en Configuración | ☐ |
| 2 | Logo visible en navbar del sitio público | ☐ |
| 3 | Sin logo → muestra nombre del negocio (fallback) | ☐ |

### 7.4 Tema visual

| # | Acción | OK |
|---|--------|----|
| 1 | Configuración → colores del tema (primario, secundario, etc.) | ☐ |
| 2 | Guardar y recargar home | ☐ |
| 3 | Navbar / botones reflejan los colores elegidos | ☐ |

### 7.5 Productos

| # | Acción | OK |
|---|--------|----|
| 1 | Admin → **Productos** — listado con 4 demo | ☐ |
| 2 | Crear producto nuevo con imagen | ☐ |
| 3 | Aparece en `/menu` | ☐ |
| 4 | Editar precio → se refleja en menú | ☐ |
| 5 | Desactivar producto → no aparece en menú público | ☐ |
| 6 | Marcar destacado (respetar límite `MENU_FEATURED_LIMIT`) | ☐ |

### 7.6 Promociones

| # | Acción | OK |
|---|--------|----|
| 1 | Admin → **Promociones** → crear promoción con fechas vigentes | ☐ |
| 2 | Subir imagen de promoción | ☐ |
| 3 | Promoción visible en home (si está activa y vigente) | ☐ |

### 7.7 Testimonios

| # | Acción | OK |
|---|--------|----|
| 1 | Home → formulario «Dejar testimonio» → enviar | ☐ |
| 2 | Admin → **Testimonios pendientes** → aprobar | ☐ |
| 3 | Testimonio aparece en home | ☐ |

### 7.8 Información útil

| # | Acción | OK |
|---|--------|----|
| 1 | Abrir `/informacion-util` | ☐ |
| 2 | Se muestran zonas de entrega demo (2) | ☐ |
| 3 | Se muestran formas de pago demo (3) | ☐ |
| 4 | Se muestran preguntas frecuentes demo (3) | ☐ |
| 5 | Admin → editar una FAQ → cambio visible en sitio | ☐ |

### 7.9 SEO

| # | Acción | OK |
|---|--------|----|
| 1 | Configuración → completar título, descripción y keywords SEO | ☐ |
| 2 | Subir imagen Open Graph | ☐ |
| 3 | Ver código fuente de home: `<title>` y meta `description` correctos | ☐ |
| 4 | Abrir `/robots.txt` — incluye `Sitemap:` con dominio de `SITE_URL` | ☐ |
| 5 | Abrir `/sitemap.xml` — URLs con dominio de `SITE_URL` | ☐ |

### 7.10 Carrito WhatsApp

| # | Acción | OK |
|---|--------|----|
| 1 | `/menu` → agregar productos al carrito | ☐ |
| 2 | «Pedir por WhatsApp» abre enlace `wa.me/...` | ☐ |
| 3 | Número coincide con `WHATSAPP_PHONE` del `.env` | ☐ |
| 4 | Mensaje incluye productos y total | ☐ |

### 7.11 Uploads

| # | Acción | OK |
|---|--------|----|
| 1 | Subir JPG en producto → guarda en `/uploads/productos/` | ☐ |
| 2 | Subir PNG en promoción → `/uploads/promociones/` | ☐ |
| 3 | Subir imagen en hero → `/uploads/hero/` | ☐ |
| 4 | Subir logo + OG en configuración → `/uploads/logos/` y `/uploads/og/` | ☐ |
| 5 | Archivo > 5 MB → error claro en admin | ☐ |
| 6 | Archivo no imagen (ej. `.pdf`) → rechazado | ☐ |
| 7 | Editar sin cambiar imagen → conserva `imagenActual` correctamente | ☐ |

---

## Criterio de éxito staging

La instalación está **lista para personalización del cliente** cuando:

- [ ] Todos los ítems del paso 7 marcados
- [ ] Contraseña admin distinta al hash del seed original
- [ ] `.env` de staging documentado (sin commitear al repo)
- [ ] Backups de BD staging configurados si el entorno es persistente
- [ ] Equipo conoce la diferencia entre staging y producción (`SITE_URL`, `DB_NAME`, credenciales)

---

## Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| App no arranca en staging servidor | Validación `NODE_ENV=production` | Revisar mensajes `[ERROR]` en consola; corregir `.env` |
| Login falla | Hash no actualizado | Repetir paso 4 |
| Puerto en uso | Otra instancia Node | `taskkill` / cambiar `PORT` |
| SQL connection error | Credenciales o firewall | Verificar `.env`, TCP 1433, `DB_TRUST_SERVER_CERTIFICATE` en local |
| Imágenes no se ven | Carpeta uploads sin permisos | Verificar escritura en `frontend/public/uploads/` |
| Sitemap con localhost | `SITE_URL` incorrecto | Ajustar `.env` y reiniciar |
| Advertencia `SESSION_SECRET` corto | `$` en `.env` sin comillas | Encerrar valor entre comillas dobles |

---

## Próximo paso: producción

Cuando staging esté validado, seguir [README.md — Instalación en producción](../README.md#instalación-en-producción) con base de datos y dominio definitivos del cliente.
