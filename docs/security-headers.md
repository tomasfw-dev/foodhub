# Headers de seguridad HTTP — FoodHub

FoodHub usa [Helmet](https://helmetjs.github.io/) vía `backend/config/helmet.config.js`, aplicado al inicio de la cadena de middlewares en `backend/app.js`.

También se desactiva `X-Powered-By` con `app.disable('x-powered-by')`.

## Headers configurados

| Header | Valor / comportamiento |
|--------|-------------------------|
| `Content-Security-Policy` | Ver directivas abajo |
| `Strict-Transport-Security` | Solo `NODE_ENV=production` (1 año, `includeSubDomains`) |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` (vía `frameguard`) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Resource-Policy` | `same-site` |
| `X-DNS-Prefetch-Control` | `off` |

## Content-Security-Policy — orígenes permitidos

| Directiva | Orígenes |
|-----------|----------|
| `default-src` | `'self'` |
| `script-src` | `'self'`, `cdn.jsdelivr.net` |
| `style-src` | `'self'`, `fonts.googleapis.com`, `cdn.jsdelivr.net` |
| `font-src` | `'self'`, `fonts.gstatic.com`, `cdn.jsdelivr.net`, `data:` |
| `img-src` | `'self'`, `data:`, `https:` |
| `connect-src` | `'self'` |
| `form-action` | `'self'` |
| `frame-ancestors` | `'none'` |
| `object-src` | `'none'` |
| `worker-src` | `'none'` |

### Producción (`NODE_ENV=production`)

- `upgrade-insecure-requests` activo (HTTP → HTTPS en recursos mixtos).
- `Strict-Transport-Security` activo (requiere HTTPS en el reverse proxy).

### Desarrollo

- Sin HSTS ni `upgrade-insecure-requests` (`upgradeInsecureRequests: null` desactiva el default de Helmet).
- Permite `http://localhost` sin forzar HTTPS en recursos.

## Excepciones CSP (`unsafe-inline`)

Estas excepciones evitan romper el sitio actual sin refactor masivo. Conviene eliminarlas a futuro usando nonces o assets externos.

### `style-src 'unsafe-inline'`

1. **`partials/theme-vars.ejs`** — bloque `<style id="site-theme">` con variables CSS del tema configurable del negocio.
2. **Previews admin** — atributos `style="..."` en `<img>` de configuración, productos, promociones y hero.

### `script-src 'unsafe-inline'`

1. **`partials/admin/configuracion-form.ejs`** — script inline que sincroniza inputs `type="color"` con campos HEX del tema.

### `script-src-attr 'unsafe-inline'`

1. **`onerror` en imágenes** — fallback a placeholder (`food-card`, admin índices, formularios con preview).
2. **`onsubmit="return confirm(...)"`** — confirmación de borrado en tablas del panel admin.

## Recursos externos permitidos

| Recurso | Uso |
|---------|-----|
| `fonts.googleapis.com` | Hoja CSS de Google Fonts (público, admin, login) |
| `fonts.gstatic.com` | Archivos de fuente WOFF2 |
| `cdn.jsdelivr.net` | Bootstrap 5.3.3 CSS/JS e Bootstrap Icons (admin + login) |

## WhatsApp y enlaces externos

Los enlaces a `https://wa.me/...` y redes sociales son navegación (`<a href>`), no requieren directivas CSP adicionales. El carrito abre WhatsApp vía `window.open` / asignación de `location` hacia `wa.me` (permitido como navegación de nivel superior, no bloqueado por CSP de scripts propios).

## Imágenes HTTPS arbitrarias

`img-src https:` permite URLs externas guardadas en productos. Restringir a dominios concretos implicaría validar hosts en backend y acotar la directiva.

## Despliegue

1. Terminar TLS en nginx/Caddy/Cloudflare (`trust proxy` ya activo en producción).
2. `NODE_ENV=production` y `SITE_URL=https://...`
3. Verificar en DevTools → Network que no haya violaciones CSP en home, menú, admin y login.
