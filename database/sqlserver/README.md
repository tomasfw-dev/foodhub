# SQL Server — FoodHub (plataforma gastronómica white-label)

## Instalación rápida (recomendada)

Ejecutar **un solo archivo** con esquema final + seeds demo:

```text
000_install_completo.sql
```

1. Descomentar `CREATE DATABASE` / `USE` en el script si hace falta.
2. Ejecutar en SSMS o Azure Data Studio.
3. Configurar `.env` (ver `.env.example` en la raíz).
4. Definir contraseña del admin (ver abajo).

### Vaciar la BD antes de reinstalar

Si querés borrar todas las tablas y volver a instalar desde cero:

```text
000_drop_all.sql   →   000_install_completo.sql
```

`000_drop_all.sql` elimina tablas y datos; **no** borra imágenes en `frontend/public/uploads/`.

## Instalación incremental (bases existentes)

Ejecutar scripts `001` … `019` en orden numérico.

| Script | Contenido |
|--------|-----------|
| `001` | Administradores, Categorías, Productos |
| `007` | ConfiguracionNegocio |
| `008` | Seed configuración demo |
| `009` | sesion_version en admin |
| `010` | Promociones |
| `011` | Productos.destacado |
| `012` | orden en categorías/productos |
| `013` | SEO en configuración |
| `014`–`015` | Hero home |
| `016`–`017` | Testimonios + estado |
| `018`–`019` | Información útil |
| `020`–`021` | Migración logo / desacople marca pública |
| `022` | Colores del tema en configuración |

Seeds sueltos: `003`, `006`, `008`, `015`, `019`.

## Marca pública vs plataforma

- **Sitio público:** nombre, slogan y logo desde `ConfiguracionNegocio`. Sin logo → se muestra el nombre del negocio.
- **Admin / login:** marca **FoodHub** (`/images/logo-default.png`).

Bases existentes con logo de plataforma en configuración:

```text
021_migrate_marca_publica.sql
```

## Administrador inicial

- Email demo: `admin@demo.local`
- El repositorio **no** incluye contraseñas en texto plano.

Generar hash bcrypt:

```bash
node backend/scripts/hash-password.js "tu_contraseña_segura"
```

Actualizar en SQL Server:

```sql
UPDATE dbo.Administradores
SET password_hash = N'...pegar_hash...'
WHERE email = N'admin@demo.local';
```

## Personalización por negocio

Tras instalar, configurar desde el panel admin:

- **Configuración** — nombre, logo, contacto, SEO, **colores del tema**
- **Hero home** — textos de la landing
- **Menú, promociones, testimonios, información útil**

Logo fallback interno (solo admin): `/images/logo-default.png`

## Modelo principal

```
ConfiguracionNegocio (singleton)
HeroHome (singleton)
Administradores

Categorias 1 ──────< N Productos
Promociones | Testimonios | ZonasEntrega | FormasPago | PreguntasFrecuentes
```
