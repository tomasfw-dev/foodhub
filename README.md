# FoodHub

Plataforma gastronómica **white-label** para carta online y pedidos por WhatsApp.

Cada instalación corresponde a **un negocio**: un deploy, una base de datos, una configuración de marca y un dominio propio. El panel de administración usa la marca **FoodHub**; el sitio público muestra los datos del negocio configurados en base de datos.

## Stack

| Capa | Tecnología |
|------|------------|
| Runtime | Node.js 18+ |
| Servidor | Express |
| Vistas | EJS |
| Base de datos | Microsoft SQL Server |
| Panel admin | Bootstrap 5 (CDN) + Bootstrap Icons |
| Frontend público | CSS propio + jQuery |

## Módulos implementados

### Sitio público
- **Menú dinámico** — productos agrupados por categoría
- **Promociones** — vigentes en home y menú
- **Testimonios** — envío público con moderación admin
- **Información útil** — zonas de entrega, formas de pago, preguntas frecuentes
- **Hero administrable** — banner principal de la landing
- **Carrito WhatsApp** — armado de pedido y enlace a `wa.me`
- **SEO / Open Graph** — meta tags, `robots.txt`, `sitemap.xml`

### Panel admin (`/admin`)
- **Autenticación** — login, sesión, logout seguro (POST + CSRF)
- **Productos** — CRUD, imagen, destacados, activar/desactivar
- **Categorías** — CRUD y orden
- **Promociones** — CRUD con fechas de vigencia
- **Testimonios** — aprobación de pendientes, moderación
- **Hero home** — textos, botones e imagen
- **Configuración del negocio** — nombre, logo, contacto, WhatsApp, SEO
- **Tema visual configurable** — colores del negocio (CSS variables)
- **Perfil admin** — datos y cambio de contraseña

## Estructura del proyecto

```
comida-carito/
├── backend/                 # Servidor Express (API, rutas, lógica)
│   ├── server.js            # Punto de entrada
│   ├── app.js
│   ├── config/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middlewares/
│   └── utils/
├── frontend/
│   ├── views/               # Plantillas EJS
│   └── public/              # CSS, JS, imágenes, uploads
├── database/sqlserver/      # Scripts SQL (esquema y migraciones)
├── docs/                    # Documentación técnica adicional
├── package.json
└── .env.example
```

Documentación SQL detallada: [`database/sqlserver/README.md`](database/sqlserver/README.md)  
Headers de seguridad HTTP: [`docs/security-headers.md`](docs/security-headers.md)

---

## Variables de entorno

Copiar `.env.example` a `.env` y completar los valores.

| Variable | Descripción |
|----------|-------------|
| `NODE_ENV` | `development` o `production` |
| `PORT` | Puerto HTTP del servidor (default: `3000`) |
| `SITE_URL` | URL pública del sitio, **sin barra final**. En producción debe ser `https://...` |
| `SESSION_SECRET` | Secreto para firmar cookies de sesión. **Obligatorio en producción** (mín. 32 caracteres, valor único) |
| `SESSION_MAX_AGE_MS` | Duración de sesión admin en ms (default: 24 h) |
| `DB_SERVER` | Host de SQL Server |
| `DB_PORT` | Puerto SQL Server (default: `1433`) |
| `DB_NAME` | Nombre de la base de datos |
| `DB_USER` | Usuario SQL (no usar `sa` en producción) |
| `DB_PASSWORD` | Contraseña SQL |
| `DB_ENCRYPT` | Cifrado TLS hacia SQL Server (`true` / `false`) |
| `DB_TRUST_SERVER_CERTIFICATE` | Confiar en certificado autofirmado (`true` solo en dev local) |
| `MENU_FEATURED_LIMIT` | Máximo de productos destacados en home |
| `WHATSAPP_PHONE` | Número con código de país, **solo dígitos**, sin `+` ni espacios |
| `WHATSAPP_DEFAULT_MESSAGE` | Mensaje predeterminado del carrito |

> **Tip:** si `SESSION_SECRET` contiene caracteres especiales (`$`, `#`, etc.), encerrarlo entre comillas en `.env`.

En `NODE_ENV=production` la app valida la configuración al arrancar y **no inicia** si detecta valores inseguros (secreto débil, `SITE_URL` sin HTTPS, `DB_USER=sa`, contraseña trivial, etc.).

---

## Instalación local

### Requisitos
- Node.js 18+
- SQL Server 2016+ (local, Docker o remoto)
- npm

### Pasos

1. **Clonar e instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar entorno**
   ```bash
   cp .env.example .env
   ```
   Editar `.env` con credenciales SQL Server y `SITE_URL=http://localhost:3000`.

3. **Crear base de datos**
   
   Ejecutar en SSMS o Azure Data Studio:
   ```text
   database/sqlserver/000_install_completo.sql
   ```
   Descomentar `CREATE DATABASE` / `USE` al inicio del script si corresponde.

4. **Definir contraseña del administrador**
   ```bash
   node backend/scripts/hash-password.js "tu_contraseña_segura"
   ```
   Actualizar el hash en SQL Server:
   ```sql
   UPDATE dbo.Administradores
   SET password_hash = N'...pegar_hash...'
   WHERE email = N'admin@demo.local';
   ```

5. **Iniciar en desarrollo**
   ```bash
   npm run dev
   ```
   Abrir [http://localhost:3000](http://localhost:3000)  
   Admin: [http://localhost:3000/auth/login](http://localhost:3000/auth/login) — usuario demo: `admin@demo.local`

---

## Instalación en producción

### Requisitos adicionales
- Servidor Linux o Windows con Node.js 18+
- SQL Server accesible desde el servidor de aplicación
- Dominio con **HTTPS** (nginx, Caddy, IIS, Cloudflare, etc.)
- Proceso manager recomendado: PM2, systemd o equivalente

### Pasos

1. **Desplegar código** en el servidor (git clone, CI/CD, etc.).

2. **Instalar dependencias de producción**
   ```bash
   npm install --omit=dev
   ```

3. **Configurar `.env` de producción**
   ```env
   NODE_ENV=production
   PORT=3000
   SITE_URL=https://tudominio.com
   SESSION_SECRET="generar_secreto_aleatorio_de_32_o_mas_caracteres"
   DB_SERVER=...
   DB_USER=foodhub_app          # usuario dedicado, no sa
   DB_PASSWORD=...
   DB_ENCRYPT=true
   DB_TRUST_SERVER_CERTIFICATE=false
   WHATSAPP_PHONE=549XXXXXXXXXX
   ```

4. **Ejecutar script SQL** (`000_install_completo.sql` o migraciones incrementales) y cambiar contraseña admin.

5. **Configurar reverse proxy** con TLS terminado en el proxy:
   - Redirigir HTTP → HTTPS
   - Proxy pass a `http://127.0.0.1:PORT`
   - La app usa `trust proxy` en producción para IP real y cookies seguras

6. **Crear carpeta de uploads** con permisos de escritura para el usuario del proceso:
   ```text
   frontend/public/uploads/productos/
   frontend/public/uploads/promociones/
   frontend/public/uploads/hero/
   frontend/public/uploads/logos/
   frontend/public/uploads/og/
   ```

7. **Iniciar la aplicación**
   ```bash
   npm start
   ```
   Ejemplo con PM2:
   ```bash
   pm2 start backend/server.js --name foodhub
   pm2 save
   ```

8. **Verificar arranque** — la consola debe mostrar el servidor en el puerto configurado sin errores de validación de entorno.

---

## Orden de migraciones SQL

### Instalación nueva (recomendada)

Un solo script con esquema + seeds demo:

```text
database/sqlserver/000_install_completo.sql
```

### Instalación incremental (bases existentes)

Ejecutar en orden numérico:

| Script | Contenido |
|--------|-----------|
| `001` | Administradores, categorías, productos |
| `002` | Queries de menú |
| `003` | Seed menú de ejemplo *(opcional)* |
| `004` | Queries dashboard |
| `005` | Queries autenticación |
| `006` | Seed administrador *(opcional)* |
| `007` | ConfiguracionNegocio |
| `008` | Seed configuración demo *(opcional)* |
| `009` | sesion_version en admin |
| `010` | Promociones |
| `011` | Productos.destacado |
| `012` | Orden en categorías/productos |
| `013` | SEO en configuración |
| `014`–`015` | Hero home + seed *(015 opcional)* |
| `016`–`017` | Testimonios + estado |
| `018`–`019` | Información útil + seed *(019 opcional)* |
| `020` | Migración logo FoodHub |
| `021` | Desacople marca pública |
| `022` | Colores del tema en configuración |

Detalle y modelo de datos: [`database/sqlserver/README.md`](database/sqlserver/README.md)

---

## Checklist de seguridad antes de entregar al cliente

### Entorno y credenciales
- [ ] `NODE_ENV=production`
- [ ] `SITE_URL` con `https://` y sin barra final
- [ ] `SESSION_SECRET` único, ≥ 32 caracteres, no valor de ejemplo
- [ ] `DB_USER` dedicado (no `sa`) con permisos mínimos sobre la BD
- [ ] `DB_PASSWORD` fuerte
- [ ] `DB_TRUST_SERVER_CERTIFICATE=false`
- [ ] `WHATSAPP_PHONE` configurado y válido
- [ ] Contraseña del admin demo **cambiada** (no usar seed de desarrollo)
- [ ] `.env` **no** commiteado al repositorio

### Infraestructura
- [ ] HTTPS activo en el dominio (certificado válido)
- [ ] Reverse proxy configurado correctamente
- [ ] Firewall: SQL Server no expuesto públicamente
- [ ] Backups automatizados (ver sección siguiente)

### Aplicación (implementado en FoodHub)
- [ ] Headers HTTP con Helmet ([detalle](docs/security-headers.md))
- [ ] Protección CSRF en formularios POST
- [ ] Rate limiting (login, testimonios, global)
- [ ] Errores 500 sin filtrar detalles internos al cliente
- [ ] Uploads validados (tipo MIME, magic bytes con sharp, rutas permitidas)
- [ ] Cookies de sesión `httpOnly`, `secure` en producción

### Verificación funcional
- [ ] Login / logout admin
- [ ] Formularios admin (productos, configuración, hero)
- [ ] Carrito WhatsApp abre el número correcto
- [ ] `/robots.txt` y `/sitemap.xml` responden con el dominio correcto

---

## Checklist de backups

Programar backups **antes del go-live** y verificar restauración periódicamente.

### SQL Server
- [ ] Backup **completo** de la base de datos del negocio (diario recomendado)
- [ ] Backup de **log de transacciones** si aplica (recuperación point-in-time)
- [ ] Copia off-site o en otro servidor / storage
- [ ] Probar restauración en entorno de prueba al menos una vez

### Carpeta uploads
Los archivos subidos **no están en la base de datos**; viven en disco:

```text
frontend/public/uploads/
├── productos/
├── promociones/
├── hero/
├── logos/
└── og/
```

- [ ] Backup periódico de `frontend/public/uploads/` (rsync, zip, blob storage, etc.)
- [ ] Incluir uploads en el mismo cronograma que la BD o snapshot del servidor
- [ ] Tras restaurar BD + código, verificar que las rutas `/uploads/...` sigan existiendo en disco

---

## Recomendaciones post-instalación (entrega al cliente)

Completar desde el panel admin antes de abrir el sitio al público:

1. **Cambiar contraseña admin** — Perfil → contraseña nueva (cierra otras sesiones)
2. **Configurar logo** — Configuración → logo del negocio (PNG/JPG/WebP, máx. 5 MB)
3. **Configurar SEO** — título, descripción, palabras clave e imagen Open Graph
4. **Configurar WhatsApp** — número en `.env` y mensaje por defecto en configuración del negocio
5. **Personalizar tema** — colores primario, secundario, fondo, texto y acento
6. **Revisar hero** — textos, botones e imagen de la landing
7. **Cargar menú** — categorías, productos e imágenes
8. **Verificar SEO técnico**
   - [https://tudominio.com/robots.txt](https://tudominio.com/robots.txt)
   - [https://tudominio.com/sitemap.xml](https://tudominio.com/sitemap.xml)
9. **Probar pedido** — agregar productos al carrito y confirmar enlace WhatsApp

---

## Scripts npm

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo con recarga automática (`node --watch`) |
| `npm start` | Producción |

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page |
| `/menu` | Menú de productos |
| `/informacion-util` | Zonas, pagos, FAQ |
| `/auth/login` | Login admin |
| `/admin` | Panel de administración |
| `/robots.txt` | Directivas para buscadores |
| `/sitemap.xml` | Mapa del sitio |

## Licencia

ISC
