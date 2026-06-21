# Plan de Pruebas QA — FoodHub

**Tipo:** Auditoría funcional · Matriz de casos de prueba  
**Alcance:** Sitio público + panel admin (`/admin`)  
**Versión documento:** 1.0  
**Instrucción:** No modificar código — solo ejecutar y registrar resultados

---

## 1. Convenciones

### Prioridades

| Prioridad | Significado | Cuándo ejecutar |
|-----------|-------------|-----------------|
| **P0** | Crítico | Bloquea seguridad, login o flujo principal de venta. Siempre antes de release. |
| **P1** | Alto | Funcionalidad core del negocio o regla de negocio importante. |
| **P2** | Medio | Funcionalidad secundaria, validaciones, edge cases. |
| **P3** | Bajo | UX, textos, casos raros, compatibilidad extendida. |

### Columnas de la matriz

| Columna | Descripción |
|---------|-------------|
| **ID** | Identificador único del caso |
| **Caso de prueba** | Qué se prueba |
| **Pasos (resumen)** | Secuencia mínima para reproducir |
| **Resultado esperado** | Comportamiento correcto |
| **Prioridad** | P0–P3 |
| **Módulo** | Área funcional afectada |

### Estados de ejecución (completar al testear)

| Estado | Significado |
|--------|-------------|
| ☐ Pendiente | No ejecutado |
| ✅ Pass | Cumple resultado esperado |
| ❌ Fail | No cumple — registrar bug |
| ⚠️ Blocked | No se puede ejecutar (dependencia, entorno) |
| ⏭️ N/A | No aplica en este entorno |

### Entornos recomendados

| Entorno | Propósito |
|---------|-----------|
| **Dev local** | Regresión funcional completa |
| **Staging** | Pre-producción con datos realistas |
| **Producción** | Smoke test post-deploy (solo lectura + casos no destructivos) |

### Navegadores / dispositivos (Responsive)

- Chrome desktop (última versión)
- Firefox desktop
- Safari iOS (iPhone)
- Chrome Android
- Viewport: 375px, 768px, 1280px

---

## 2. Resumen por módulo

| Módulo | Casos | P0 | P1 | P2 | P3 |
|--------|-------|----|----|----|-----|
| Login | 12 | 6 | 4 | 2 | 0 |
| Logout | 4 | 2 | 2 | 0 | 0 |
| Configuración | 18 | 2 | 8 | 6 | 2 |
| Productos | 22 | 4 | 10 | 6 | 2 |
| Categorías | 12 | 1 | 6 | 4 | 1 |
| Promociones | 16 | 2 | 8 | 4 | 2 |
| Hero | 12 | 1 | 6 | 4 | 1 |
| Testimonios | 18 | 3 | 9 | 4 | 2 |
| Información útil | 15 | 1 | 8 | 5 | 1 |
| SEO | 10 | 0 | 4 | 4 | 2 |
| Uploads | 20 | 5 | 8 | 5 | 2 |
| WhatsApp / Carrito | 14 | 3 | 7 | 3 | 1 |
| Seguridad | 18 | 12 | 4 | 2 | 0 |
| Responsive | 12 | 2 | 6 | 3 | 1 |
| **Total** | **203** | **44** | **95** | **52** | **12** |

---

## 3. Login

| ID | Caso de prueba | Pasos (resumen) | Resultado esperado | Prioridad | Módulo |
|----|----------------|-----------------|-------------------|-----------|--------|
| QA-LOGIN-001 | Login exitoso con credenciales válidas | Ir a `/auth/login` → email + contraseña correctos → Iniciar sesión | Redirección a `/admin` (Dashboard). Sesión activa. | P0 | Login |
| QA-LOGIN-002 | Login con email incorrecto | Credenciales inválidas (email inexistente) | Mensaje genérico: credenciales inválidas. No revela si el email existe. | P0 | Login |
| QA-LOGIN-003 | Login con contraseña incorrecta | Email válido + contraseña errónea | Mismo mensaje genérico de credenciales inválidas. | P0 | Login |
| QA-LOGIN-004 | Login con campos vacíos | Enviar formulario sin email o sin contraseña | Validación HTML5 o mensaje de error. No ingresa al panel. | P1 | Login |
| QA-LOGIN-005 | Login con email inválido (formato) | Email sin `@` o mal formado | Error: email válido requerido. | P1 | Login |
| QA-LOGIN-006 | Login con contraseña corta | Contraseña &lt; 6 caracteres | Error: mínimo 6 caracteres. | P1 | Login |
| QA-LOGIN-007 | Acceso a `/admin` sin sesión | Navegar a `/admin` sin cookie de sesión | Redirección a `/auth/login` con mensaje de sesión requerida. | P0 | Login |
| QA-LOGIN-008 | Usuario ya logueado accede a login | Con sesión activa, ir a `/auth/login` | Redirección automática a `/admin`. | P2 | Login |
| QA-LOGIN-009 | Rate limit de login | 6+ intentos fallidos en 15 min (misma IP) | Bloqueo temporal con mensaje de demasiados intentos. | P1 | Login |
| QA-LOGIN-010 | Email con espacios / mayúsculas | `" Admin@Demo.Local "` | Email normalizado (trim + lowercase). Login OK si credenciales correctas. | P2 | Login |
| QA-LOGIN-011 | Admin inactivo intenta login | Cuenta con `activo=0` | Login rechazado con credenciales inválidas o sesión destruida. | P0 | Login |
| QA-LOGIN-012 | Sesión expirada por cambio de contraseña | Login en 2 pestañas → cambiar contraseña en una → usar la otra | Segunda pestaña pierde sesión al navegar; redirect a login con mensaje. | P0 | Login |

---

## 4. Logout

| ID | Caso de prueba | Pasos (resumen) | Resultado esperado | Prioridad | Módulo |
|----|----------------|-----------------|-------------------|-----------|--------|
| QA-LOGOUT-001 | Cerrar sesión (POST) | En panel → botón **Cerrar sesión** en sidebar | Sesión destruida. Redirect a `/auth/login?message=Sesión cerrada...` | P0 | Logout |
| QA-LOGOUT-002 | Acceso post-logout a admin | Tras logout, ir a `/admin` | Redirect a login. No hay acceso al panel. | P0 | Logout |
| QA-LOGOUT-003 | GET `/auth/logout` no cierra sesión | Navegar directo a GET `/auth/logout` estando logueado | **No** destruye sesión. Redirect a `/admin`. (Comportamiento esperado, no bug.) | P1 | Logout |
| QA-LOGOUT-004 | Logout sin token CSRF | POST logout sin `_csrf` | Error CSRF. Sesión no cerrada o redirect con error de seguridad. | P1 | Logout |

---

## 5. Configuración del negocio

| ID | Caso de prueba | Pasos (resumen) | Resultado esperado | Prioridad | Módulo |
|----|----------------|-----------------|-------------------|-----------|--------|
| QA-CFG-001 | Guardar configuración mínima válida | Completar nombre + slogan obligatorios → Guardar | Éxito. Datos visibles en sitio público (navbar, footer, meta). | P0 | Configuración |
| QA-CFG-002 | Nombre de negocio vacío | Enviar sin `nombre_negocio` | Error de validación. No guarda. | P1 | Configuración |
| QA-CFG-003 | Slogan vacío | Enviar sin slogan | Error de validación. No guarda. | P1 | Configuración |
| QA-CFG-004 | Email de contacto inválido | Email mal formado | Error de validación. | P2 | Configuración |
| QA-CFG-005 | Instagram / Facebook URL inválida | URL sin `https://` | Error de validación. | P2 | Configuración |
| QA-CFG-006 | Teléfono con guiones y espacios | `011 1234-5678` | Se guardan solo dígitos. Se muestra formateado o limpio según vista. | P2 | Configuración |
| QA-CFG-007 | WhatsApp solo dígitos | `5491112345678` | Guardado correcto. Botón WhatsApp público funcional. | P1 | Configuración |
| QA-CFG-008 | Mensaje WhatsApp predeterminado | Completar mensaje → guardar → abrir carrito | Mensaje del carrito incluye texto configurado. | P1 | Configuración |
| QA-CFG-009 | Horarios y dirección | Completar y guardar | Visibles en sitio público (footer/contacto). | P2 | Configuración |
| QA-CFG-010 | Cambiar logo | Subir JPG/PNG válido → guardar | Logo nuevo en navbar/footer público. Logo anterior eliminado del disco. | P1 | Configuración |
| QA-CFG-011 | Sin subir logo nuevo | Guardar otros campos sin tocar logo | Logo anterior se mantiene. | P1 | Configuración |
| QA-CFG-012 | Color primario HEX válido | `#FF5733` → guardar | Sitio público refleja color en botones/navbar. | P1 | Configuración |
| QA-CFG-013 | Color HEX inválido | `#GGGGGG` o texto libre | Error: color HEX válido. No guarda color inválido. | P2 | Configuración |
| QA-CFG-014 | Color vacío | Dejar campo color en blanco | Usa valor predeterminado del tema. | P2 | Configuración |
| QA-CFG-015 | Todos los colores del tema | Configurar primario, secundario, fondo, texto, acento | Coherencia visual en home, menú, footer. | P2 | Configuración |
| QA-CFG-016 | SEO title / description / keywords | Completar campos SEO → guardar | Meta tags en `<head>` del sitio público reflejan valores. | P1 | Configuración / SEO |
| QA-CFG-017 | Imagen OG | Subir imagen horizontal → guardar | Preview OG en meta tags. Al compartir link, usa imagen OG (puede cachear WhatsApp). | P1 | Configuración / SEO |
| QA-CFG-018 | Cache de configuración | Cambiar nombre → ver sitio inmediato | Cambio visible en ≤60 s (TTL cache). Refresh fuerza actualización. | P3 | Configuración |

---

## 6. Categorías

| ID | Caso de prueba | Pasos (resumen) | Resultado esperado | Prioridad | Módulo |
|----|----------------|-----------------|-------------------|-----------|--------|
| QA-CAT-001 | Crear categoría válida | Admin → Categorías → Nueva → nombre + activa → Guardar | Aparece en listado admin y en menú público. | P0 | Categorías |
| QA-CAT-002 | Crear sin nombre | Enviar formulario vacío | Error: nombre requerido. | P1 | Categorías |
| QA-CAT-003 | Editar categoría | Cambiar nombre/descripción → guardar | Cambio reflejado en admin y menú público. | P1 | Categorías |
| QA-CAT-004 | Desactivar categoría | Desmarcar "Categoría activa" → guardar | No visible en menú público. Productos de esa categoría no listados. | P1 | Categorías |
| QA-CAT-005 | Orden de categorías | Asignar orden 1, 2, 3 a tres categorías | Menú público respeta orden ASC (nulls al final). | P1 | Categorías |
| QA-CAT-006 | Eliminar categoría (soft delete) | Eliminar desde listado | Desaparece de listado. `fecha_baja` seteada. No visible en público. | P1 | Categorías |
| QA-CAT-007 | Editar ID inexistente | URL `/admin/categorias/99999/edit` | Redirect con error o 404. | P2 | Categorías |
| QA-CAT-008 | Descripción max length | Texto &gt; 500 caracteres | Validación rechaza o trunca según regla. | P2 | Categorías |
| QA-CAT-009 | API list categorías | GET `/admin/categorias/api/list` autenticado | JSON con categorías activas/no dadas de baja. | P2 | Categorías |
| QA-CAT-010 | API create sin CSRF | POST `/admin/categorias/api` sin token | Rechazado por CSRF. | P1 | Categorías / Seguridad |
| QA-CAT-011 | Categoría sin productos | Crear categoría vacía | Sección visible en menú solo si tiene productos activos (verificar regla de menú). | P2 | Categorías |
| QA-CAT-012 | Toggle activo vía formulario | Editar → desactivar → reactivar | Comportamiento consistente en menú público. | P2 | Categorías |

---

## 7. Productos

| ID | Caso de prueba | Pasos (resumen) | Resultado esperado | Prioridad | Módulo |
|----|----------------|-----------------|-------------------|-----------|--------|
| QA-PROD-001 | Crear producto completo | Nombre + categoría + precio + imagen + activo → Guardar | Visible en menú público con foto y precio. | P0 | Productos |
| QA-PROD-002 | Crear sin categoría | Omitir categoría | Error: categoría requerida. | P1 | Productos |
| QA-PROD-003 | Crear sin nombre | Omitir nombre | Error: nombre requerido. | P1 | Productos |
| QA-PROD-004 | Precio cero | Precio = 0 | Aceptado. Muestra $0 o "Consultar" según vista. | P2 | Productos |
| QA-PROD-005 | Precio negativo | Precio = -100 | Rechazado por validación. | P1 | Productos |
| QA-PROD-006 | Precio con coma decimal | `1250,50` | Parseado como 1250.50. | P2 | Productos |
| QA-PROD-007 | Precio máximo | 99.999.999,99 | Aceptado. | P2 | Productos |
| QA-PROD-008 | Precio sobre máximo | &gt; 99.999.999,99 | Rechazado. | P2 | Productos |
| QA-PROD-009 | Producto sin imagen | Crear sin subir foto | Placeholder `/images/placeholder-food.svg` en público. | P1 | Productos |
| QA-PROD-010 | Desactivar producto | Toggle desactivar en listado | Badge "Inactivo". No visible en menú público. | P1 | Productos |
| QA-PROD-011 | Reactivar producto | Toggle activar | Vuelve al menú público. | P1 | Productos |
| QA-PROD-012 | Destacar producto | Marcar destacado (dentro del límite) | Aparece en "Nuestras Recomendaciones" en home. | P1 | Productos |
| QA-PROD-013 | Límite de destacados | Intentar destacar producto N+1 (límite default 6) | Error: máximo de destacados alcanzado. Toggle deshabilitado en UI. | P0 | Productos |
| QA-PROD-014 | Destacado + inactivo | Producto destacado pero inactivo | No visible en home como recomendación. | P1 | Productos |
| QA-PROD-015 | Quitar destacado | Toggle off destacado | Desaparece de home. Sigue en menú si activo. | P1 | Productos |
| QA-PROD-016 | Orden dentro de categoría | Orden 1, 2, 3 en misma categoría | Menú público respeta orden dentro de la sección. | P1 | Productos |
| QA-PROD-017 | Editar producto — cambiar precio | Editar precio → guardar | Precio actualizado en menú inmediato (post-cache). | P0 | Productos |
| QA-PROD-018 | Eliminar producto | Soft delete desde listado | No visible en admin/público. Imagen eliminada del disco. | P1 | Productos |
| QA-PROD-019 | Badge / etiqueta | Badge "Popular" | Badge visible en tarjeta de producto público. | P2 | Productos |
| QA-PROD-020 | Categoría inexistente | Enviar categoriaId inválido | Error 404 o validación. | P2 | Productos |
| QA-PROD-021 | imagenActual path traversal | Editar con hidden `imagenActual=../../../etc/passwd` | Rechazado. Error de ruta no permitida. | P0 | Productos / Seguridad |
| QA-PROD-022 | imagenActual URL externa | `imagenActual=https://evil.com/x.jpg` | Rechazado. Solo rutas `/uploads/...` locales. | P0 | Productos / Seguridad |

---

## 8. Promociones

| ID | Caso de prueba | Pasos (resumen) | Resultado esperado | Prioridad | Módulo |
|----|----------------|-----------------|-------------------|-----------|--------|
| QA-PROM-001 | Crear promoción activa sin fechas | Nombre + activa + imagen → guardar | Visible en home (promo permanente). | P1 | Promociones |
| QA-PROM-002 | Promoción con fechas vigentes | Inicio ayer, fin en 7 días | Visible en home. | P1 | Promociones |
| QA-PROM-003 | Promoción programada (futuro) | fecha_inicio = mañana | No visible en home. Admin muestra estado "programada". | P1 | Promociones |
| QA-PROM-004 | Promoción expirada | fecha_fin = ayer | No visible en home. Admin muestra "expirada". | P1 | Promociones |
| QA-PROM-005 | Promoción inactiva | activo = false | No visible en home aunque fechas OK. | P1 | Promociones |
| QA-PROM-006 | Fecha fin anterior a inicio | fin &lt; inicio | Error de validación. | P1 | Promociones |
| QA-PROM-007 | Promoción destacada | Marcar destacada + activa + vigente | Formato grande en landing. Badge "Destacada". | P1 | Promociones |
| QA-PROM-008 | Precio promocional | Completar precio promo | Se muestra en tarjeta de promo en home. | P1 | Promociones |
| QA-PROM-009 | Desactivar promo | Toggle desactivar | Desaparece de home. | P1 | Promociones |
| QA-PROM-010 | Eliminar promoción | Soft delete | No visible. Imagen eliminada si aplica. | P2 | Promociones |
| QA-PROM-011 | Nombre muy corto | 1 carácter | Error: mínimo 2 caracteres. | P2 | Promociones |
| QA-PROM-012 | Sin imagen | Crear promo sin foto | Placeholder o imagen default en home. | P2 | Promociones |
| QA-PROM-013 | Borde de medianoche (timezone) | Promo con fin = hoy 23:59 vs UTC | Verificar coherencia admin vs público en cambio de día. | P2 | Promociones |
| QA-PROM-014 | Editar promo — reemplazar imagen | Subir nueva imagen | Imagen anterior eliminada. Nueva visible. | P2 | Promociones |
| QA-PROM-015 | Agregar al carrito desde promo | Clic "Agregar" en promo home | Ítem en carrito con tipo promo. | P1 | Promociones / WhatsApp |
| QA-PROM-016 | CSRF en create/edit | POST sin token | Rechazado. | P1 | Promociones / Seguridad |

---

## 9. Hero

| ID | Caso de prueba | Pasos (resumen) | Resultado esperado | Prioridad | Módulo |
|----|----------------|-----------------|-------------------|-----------|--------|
| QA-HERO-001 | Hero activo visible | activo=ON + textos completos → guardar | Home muestra hero personalizado (textos, botones, imagen). | P1 | Hero |
| QA-HERO-002 | Hero inactivo | activo=OFF | Home muestra contenido predeterminado / fallback. | P1 | Hero |
| QA-HERO-003 | Título en 3 partes | titulo_antes + destacado + despues | Texto destacado con énfasis visual en landing. | P1 | Hero |
| QA-HERO-004 | Botón primario | Texto + URL `/menu` | Botón navega al menú. | P1 | Hero |
| QA-HERO-005 | Botón secundario WhatsApp | Texto sin URL + WhatsApp configurado | Botón abre WhatsApp del negocio. | P1 | Hero |
| QA-HERO-006 | URL botón primario inválida | URL `javascript:alert(1)` o texto libre | Error de validación. Solo `/`, `#` o `https://`. | P1 | Hero |
| QA-HERO-007 | Campos obligatorios vacíos | Enviar sin eyebrow o subtítulo | Error de validación. | P1 | Hero |
| QA-HERO-008 | Subir imagen hero | Foto válida hasta 50 MB | Imagen optimizada visible en portada. | P1 | Hero |
| QA-HERO-009 | Sin cambiar imagen | Editar solo textos | Imagen anterior se mantiene. | P2 | Hero |
| QA-HERO-010 | Subtítulo mínimo | &lt; 5 caracteres | Error de validación. | P2 | Hero |
| QA-HERO-011 | titulo_destacado max | &gt; 120 caracteres | Rechazado o truncado. | P2 | Hero |
| QA-HERO-012 | Upload error redirect | Subir archivo inválido | Redirect `/admin/hero?error=...` con mensaje claro. | P2 | Hero / Uploads |

---

## 10. Testimonios

| ID | Caso de prueba | Pasos (resumen) | Resultado esperado | Prioridad | Módulo |
|----|----------------|-----------------|-------------------|-----------|--------|
| QA-TEST-001 | Envío público válido | Home → formulario → nombre + estrellas + comentario → Enviar | Mensaje éxito. Testimonio en cola **pendiente**. No visible en home aún. | P0 | Testimonios |
| QA-TEST-002 | Aprobar testimonio pendiente | Admin → Pendientes → Aprobar | estado=aprobado, activo=true. Visible en home. | P0 | Testimonios |
| QA-TEST-003 | Rechazar testimonio | Pendientes → Rechazar | estado=rechazado, activo=false. No visible en home. | P0 | Testimonios |
| QA-TEST-004 | Editar pendiente antes de aprobar | Pendientes → Editar → corregir texto → guardar | Cambios guardados. Sigue pendiente hasta aprobar. | P1 | Testimonios |
| QA-TEST-005 | Crear testimonio desde admin | Admin → Nuevo testimonio | Creado como aprobado. Visible en home si activo. | P1 | Testimonios |
| QA-TEST-006 | Desactivar testimonio aprobado | Toggle desactivar | No visible en home. Sigue en listado admin. | P1 | Testimonios |
| QA-TEST-007 | Eliminar testimonio | Delete desde listado | Eliminado de BD. No visible en home. | P1 | Testimonios |
| QA-TEST-008 | Comentario muy corto (público) | &lt; 5 caracteres | Error de validación. | P1 | Testimonios |
| QA-TEST-009 | Comentario max público | &gt; 500 caracteres | Rechazado. | P2 | Testimonios |
| QA-TEST-010 | Honeypot anti-spam | Completar campo oculto `website` | Fake success. No insert en BD. | P1 | Testimonios / Seguridad |
| QA-TEST-011 | Rate limit testimonios | 4+ envíos en 10 min | Bloqueo con error en home `#dejar-testimonio`. | P1 | Testimonios |
| QA-TEST-012 | CSRF en envío público | POST sin `_csrf` | Rechazado. | P1 | Testimonios / Seguridad |
| QA-TEST-013 | Puntuación 1–5 estrellas | Probar cada valor | Estrellas correctas en home. | P2 | Testimonios |
| QA-TEST-014 | Orden en home | Orden 1, 2, 3 en testimonios | Home respeta orden ASC. | P2 | Testimonios |
| QA-TEST-015 | HTML/script en comentario | `<script>alert(1)</script>` | Escapado / sanitizado. No ejecuta script. | P0 | Testimonios / Seguridad |
| QA-TEST-016 | Toggle activo en pendiente | Intentar activar pendiente vía ruta | 404 o error — solo aprobados togglean. | P2 | Testimonios |
| QA-TEST-017 | Badge contador pendientes | Con pendientes en cola | Badge numérico en botón "Testimonios pendientes". | P2 | Testimonios |
| QA-TEST-018 | Editar aprobado desde ruta pendiente | URL incorrecta de edición | Error o redirect. | P2 | Testimonios |

---

## 11. Información útil

### 11.1 Hub y página pública

| ID | Caso de prueba | Pasos (resumen) | Resultado esperado | Prioridad | Módulo |
|----|----------------|-----------------|-------------------|-----------|--------|
| QA-INFO-001 | Página pública con contenido | Tener zonas + pagos + FAQ activos → `/informacion-util` | Tres secciones visibles con datos correctos. | P1 | Información útil |
| QA-INFO-002 | Página sin contenido activo | Desactivar todos los ítems | Sección vacía o mensaje apropiado. Link desde nav puede ocultarse. | P2 | Información útil |
| QA-INFO-003 | Hub admin | `/admin/informacion-util` | Tres tarjetas: Zonas, Pagos, FAQ con links. | P2 | Información útil |

### 11.2 Zonas de entrega

| ID | Caso de prueba | Pasos (resumen) | Resultado esperado | Prioridad | Módulo |
|----|----------------|-----------------|-------------------|-----------|--------|
| QA-ZONA-001 | Crear zona válida | Nombre + costo envío → guardar | Visible en `/informacion-util`. | P1 | Información útil |
| QA-ZONA-002 | Costo envío cero | costo = 0 | Muestra envío gratis o $0. | P2 | Información útil |
| QA-ZONA-003 | Costo negativo | costo = -100 | Rechazado. | P1 | Información útil |
| QA-ZONA-004 | Desactivar zona | Toggle off | No visible en público. | P1 | Información útil |
| QA-ZONA-005 | Eliminar zona | Delete | No visible en público. | P2 | Información útil |

### 11.3 Formas de pago

| ID | Caso de prueba | Pasos (resumen) | Resultado esperado | Prioridad | Módulo |
|----|----------------|-----------------|-------------------|-----------|--------|
| QA-PAGO-001 | Crear forma de pago | Nombre + descripción (CBU/alias) → guardar | Visible en información útil. | P1 | Información útil |
| QA-PAGO-002 | Nombre muy corto | 1 carácter | Error validación. | P2 | Información útil |
| QA-PAGO-003 | Desactivar forma de pago | Toggle off | No visible en público. | P1 | Información útil |

### 11.4 Preguntas frecuentes (FAQ)

| ID | Caso de prueba | Pasos (resumen) | Resultado esperado | Prioridad | Módulo |
|----|----------------|-----------------|-------------------|-----------|--------|
| QA-FAQ-001 | Crear FAQ válida | Pregunta + respuesta → guardar | Visible en acordeón/lista pública. | P1 | Información útil |
| QA-FAQ-002 | Pregunta muy corta | &lt; 5 caracteres | Error validación. | P2 | Información útil |
| QA-FAQ-003 | Respuesta max | &gt; 2000 caracteres | Rechazado. | P2 | Información útil |
| QA-FAQ-004 | Desactivar FAQ | Toggle off | No visible en público. | P1 | Información útil |

---

## 12. SEO

| ID | Caso de prueba | Pasos (resumen) | Resultado esperado | Prioridad | Módulo |
|----|----------------|-----------------|-------------------|-----------|--------|
| QA-SEO-001 | Meta title en home | Ver source `/` | `<title>` con seo_title o fallback nombre+slogan. ≤120 chars. | P1 | SEO |
| QA-SEO-002 | Meta description | Ver source | `meta description` con seo_description o fallback. ≤320 chars. | P1 | SEO |
| QA-SEO-003 | Open Graph tags | Ver source | `og:title`, `og:description`, `og:image`, `og:url` presentes. | P1 | SEO |
| QA-SEO-004 | Twitter cards | Ver source | `twitter:card`, `twitter:title`, etc. | P2 | SEO |
| QA-SEO-005 | Canonical URL | Ver source | `<link rel="canonical">` con SITE_URL correcto. | P2 | SEO |
| QA-SEO-006 | robots.txt | GET `/robots.txt` | Allow `/`. Disallow `/admin/`, `/auth/`. Sitemap URL. | P1 | SEO |
| QA-SEO-007 | sitemap.xml | GET `/sitemap.xml` | URLs: `/`, `/menu`, `/informacion-util`. XML válido. | P1 | SEO |
| QA-SEO-008 | SEO por página menú | Source `/menu` | Title/description específicos de menú. | P2 | SEO |
| QA-SEO-009 | SEO info útil | Source `/informacion-util` | Title/description específicos. | P2 | SEO |
| QA-SEO-010 | OG image fallback | Sin og_image, con logo | og:image apunta a logo del negocio. | P2 | SEO |

---

## 13. Uploads

| ID | Caso de prueba | Pasos (resumen) | Resultado esperado | Prioridad | Módulo |
|----|----------------|-----------------|-------------------|-----------|--------|
| QA-UPL-001 | Producto — JPG válido 50 MB | Subir foto grande | Acepta upload. Guarda WebP/JPG optimizado ≤2 MB en `/uploads/productos/`. | P0 | Uploads |
| QA-UPL-002 | Producto — archivo &gt; 50 MB | Subir 51+ MB | Error: supera 50 MB. | P1 | Uploads |
| QA-UPL-003 | Producto — imagen no optimizable | Imagen que no comprime bajo 2 MB | Error amigable: sigue siendo demasiado pesada. | P1 | Uploads |
| QA-UPL-004 | Promoción — mismas reglas que producto | Subir en promo | Perfil promociones: 50 MB → 2 MB output. | P1 | Uploads |
| QA-UPL-005 | Hero — 1920×1080 | Subir imagen hero | Optimizada a max 1920×1080, ≤2 MB. | P1 | Uploads |
| QA-UPL-006 | Logo — 20 MB max | Subir logo grande | Optimizado ≤500 KB. WebP o PNG. | P1 | Uploads |
| QA-UPL-007 | OG — 1200×630 | Subir imagen OG | Optimizada ≤1 MB. | P1 | Uploads |
| QA-UPL-008 | Extensión .gif / .svg | Subir SVG renombrado | Rechazado: extensión o MIME no permitido. | P0 | Uploads |
| QA-UPL-009 | Archivo .exe renombrado a .jpg | Fake image | Rechazado por Sharp (magic bytes). | P0 | Uploads |
| QA-UPL-010 | MIME incorrecto | .jpg con Content-Type text/html | Rechazado en fileFilter. | P0 | Uploads |
| QA-UPL-011 | Reemplazar imagen | Editar producto con nueva foto | Archivo anterior eliminado del disco. | P1 | Uploads |
| QA-UPL-012 | Sin archivo en edit | Guardar sin elegir archivo | Imagen anterior conservada. | P1 | Uploads |
| QA-UPL-013 | Logo error message | Logo &gt; 20 MB | "El logo supera el tamaño máximo de 20 MB." | P2 | Uploads |
| QA-UPL-014 | OG error message | OG &gt; 20 MB | "La imagen OG supera el tamaño máximo de 20 MB." | P2 | Uploads |
| QA-UPL-015 | Campo archivo inesperado | Enviar field distinto a `imagen` | LIMIT_UNEXPECTED_FILE. | P2 | Uploads |
| QA-UPL-016 | Dos archivos en single upload | Enviar 2 files en producto | LIMIT_FILE_COUNT o rechazo. | P2 | Uploads |
| QA-UPL-017 | Configuración — logo + OG simultáneos | Subir ambos en un save | Ambos procesados en dirs correctos. | P2 | Uploads |
| QA-UPL-018 | Filename seguro | Verificar nombre en disco | Patrón `timestamp-randomhex.ext`. Sin espacios ni `..`. | P1 | Uploads |
| QA-UPL-019 | Servir imagen existente legacy | Producto con .jpg antiguo en BD | Imagen carga OK desde `/uploads/productos/`. | P1 | Uploads |
| QA-UPL-020 | Delete entidad → delete file | Eliminar producto con imagen | Archivo físico eliminado. | P1 | Uploads |

---

## 14. WhatsApp / Carrito

| ID | Caso de prueba | Pasos (resumen) | Resultado esperado | Prioridad | Módulo |
|----|----------------|-----------------|-------------------|-----------|--------|
| QA-WA-001 | Botón flotante WhatsApp | Clic en botón flotante (sin carrito) | Abre wa.me con número configurado + mensaje default. | P1 | WhatsApp |
| QA-WA-002 | Agregar producto al carrito | Menú → "Agregar al pedido" | Ítem en panel carrito. Contador actualizado. | P0 | WhatsApp |
| QA-WA-003 | Agregar promo al carrito | Home promo → agregar | Ítem tipo promo en carrito. | P1 | WhatsApp |
| QA-WA-004 | Incrementar cantidad | + qty en carrito | Cantidad sube. Total recalculado. | P1 | WhatsApp |
| QA-WA-005 | Qty máximo 99 | Intentar qty 100 | Limitado a 99. | P2 | WhatsApp |
| QA-WA-006 | Máx 50 ítems distintos | Agregar 51 productos diferentes | Límite respetado o mensaje de error. | P2 | WhatsApp |
| QA-WA-007 | Eliminar ítem del carrito | Quitar producto | Desaparece del carrito. Total actualizado. | P1 | WhatsApp |
| QA-WA-008 | Vaciar carrito | Limpiar todo | Carrito vacío. localStorage actualizado. | P2 | WhatsApp |
| QA-WA-009 | Enviar pedido por WhatsApp | Carrito con ítems → Enviar | Abre wa.me con mensaje: intro + ítems + cantidades + total. | P0 | WhatsApp |
| QA-WA-010 | Sin WhatsApp configurado | WHATSAPP_PHONE vacío | Botón enviar deshabilitado. Mensaje "WhatsApp no configurado". | P1 | WhatsApp |
| QA-WA-011 | Producto sin precio | Agregar ítem sin precio | Mensaje muestra "Consultar precio". | P2 | WhatsApp |
| QA-WA-012 | Persistencia localStorage | Agregar ítems → refresh página | Carrito persiste (key `negocio-pedido-v1`). | P1 | WhatsApp |
| QA-WA-013 | localStorage corrupto | Borrar/manual corrupt data | Carrito inicia vacío sin crash JS. | P2 | WhatsApp |
| QA-WA-014 | Escape cierra panel | Tecla Escape con panel abierto | Panel carrito se cierra. | P3 | WhatsApp |

---

## 15. Seguridad

| ID | Caso de prueba | Pasos (resumen) | Resultado esperado | Prioridad | Módulo |
|----|----------------|-----------------|-------------------|-----------|--------|
| QA-SEC-001 | CSRF en POST admin producto | POST create sin `_csrf` | Rechazado. Redirect error CSRF. | P0 | Seguridad |
| QA-SEC-002 | CSRF en delete producto | POST delete sin token | Rechazado. | P0 | Seguridad |
| QA-SEC-003 | CSRF en toggle activo | POST toggle sin token | Rechazado. | P0 | Seguridad |
| QA-SEC-004 | CSRF en configuración | POST config sin token | Rechazado. | P0 | Seguridad |
| QA-SEC-005 | CSRF en cambio contraseña | POST password sin token | Rechazado. | P0 | Seguridad |
| QA-SEC-006 | Session fixation | Login exitoso | Session ID regenerado post-login. | P0 | Seguridad |
| QA-SEC-007 | Cookie httpOnly | Inspeccionar cookie `bendita.sid` | Flag httpOnly presente. No accesible desde JS. | P0 | Seguridad |
| QA-SEC-008 | Cookie secure (prod) | Producción HTTPS | Flag secure en cookie. | P0 | Seguridad |
| QA-SEC-009 | Headers Helmet | Inspeccionar response headers | CSP, X-Frame-Options/frame-ancestors, nosniff, etc. | P1 | Seguridad |
| QA-SEC-010 | X-Powered-By ausente | Response headers | No expone `X-Powered-By: Express`. | P2 | Seguridad |
| QA-SEC-011 | Error 500 en producción | Forzar error interno | Mensaje genérico al cliente. Sin stack trace. | P0 | Seguridad |
| QA-SEC-012 | Error 400 en producción | Validación fallida | Mensaje específico de validación (4xx). | P1 | Seguridad |
| QA-SEC-013 | Path traversal uploads | Manipular imagenActual | Rechazado (ver QA-PROD-021). | P0 | Seguridad |
| QA-SEC-014 | Acceso directo admin API sin auth | GET `/admin/productos/api/list` sin cookie | 401 o redirect login. | P0 | Seguridad |
| QA-SEC-015 | Rate limit global | 300+ requests / 15 min | 429 Too Many Requests. | P2 | Seguridad |
| QA-SEC-016 | Validación env producción | Arrancar con SESSION_SECRET débil | App **no inicia** con mensaje claro. | P0 | Seguridad |
| QA-SEC-017 | Validación SITE_URL HTTP en prod | SITE_URL=http://... en production | App no inicia. | P0 | Seguridad |
| QA-SEC-018 | Honeypot testimonios | Campo website lleno | No insert (ver QA-TEST-010). | P1 | Seguridad |

---

## 16. Responsive

| ID | Caso de prueba | Pasos (resumen) | Resultado esperado | Prioridad | Módulo |
|----|----------------|-----------------|-------------------|-----------|--------|
| QA-RES-001 | Home mobile 375px | iPhone viewport | Hero legible. Navbar colapsa. Botones tocables. | P0 | Responsive |
| QA-RES-002 | Menú mobile | `/menu` en 375px | Categorías apiladas. Imágenes no desbordan. | P0 | Responsive |
| QA-RES-003 | Carrito mobile | Abrir panel carrito en móvil | Panel usable. Botón enviar visible sin scroll excesivo. | P1 | Responsive |
| QA-RES-004 | Admin sidebar mobile | `/admin` en 375px | Menú offcanvas abre con ☰. Links accesibles. | P1 | Responsive |
| QA-RES-005 | Formularios admin mobile | Crear producto en móvil | Campos apilados. File input funcional. | P1 | Responsive |
| QA-RES-006 | Tablas admin tablet | Listado productos 768px | Scroll horizontal o layout adaptado. Acciones visibles. | P1 | Responsive |
| QA-RES-007 | Información útil mobile | `/informacion-util` 375px | Secciones legibles. Sin overflow horizontal. | P2 | Responsive |
| QA-RES-008 | Testimonio form mobile | Form envío en home móvil | Campos y botón submit accesibles. | P2 | Responsive |
| QA-RES-009 | Imágenes responsive | Product cards | `object-fit` correcto. No pixelación extrema. | P2 | Responsive |
| QA-RES-010 | Desktop 1280px+ | Home y menú | Layout completo. Sidebar admin fijo. | P2 | Responsive |
| QA-RES-011 | Landscape mobile | Rotar dispositivo | Sin elementos cortados críticos. | P2 | Responsive |
| QA-RES-012 | Touch targets | Botones nav y carrito | Área táctil ≥ 44px aprox. | P3 | Responsive |

---

## 17. Perfil admin (complemento)

| ID | Caso de prueba | Pasos (resumen) | Resultado esperado | Prioridad | Módulo |
|----|----------------|-----------------|-------------------|-----------|--------|
| QA-PERF-001 | Actualizar nombre | Mi perfil → cambiar nombre → guardar | Nombre actualizado en sidebar. | P2 | Configuración |
| QA-PERF-002 | Cambiar email | Nuevo email válido | Email actualizado. Login funciona con nuevo email. | P1 | Login |
| QA-PERF-003 | Email duplicado | Email ya usado por otro admin | Error 409. No guarda. | P2 | Configuración |
| QA-PERF-004 | Cambiar contraseña OK | Actual + nueva + confirmación | Éxito. Otras sesiones invalidadas. | P0 | Login |
| QA-PERF-005 | Contraseña actual incorrecta | Actual errónea | Error. No cambia. | P1 | Login |
| QA-PERF-006 | Confirmación no coincide | Nueva ≠ confirmación | Error. | P1 | Login |
| QA-PERF-007 | Nueva = actual | Misma contraseña | Error. | P2 | Login |

---

## 18. Dashboard y navegación (complemento)

| ID | Caso de prueba | Pasos (resumen) | Resultado esperado | Prioridad | Módulo |
|----|----------------|-----------------|-------------------|-----------|--------|
| QA-DASH-001 | Estadísticas correctas | Crear 2 productos activos, 1 inactivo | Dashboard muestra totales coherentes. | P2 | Configuración |
| QA-DASH-002 | Accesos rápidos | Clic cada botón de accesos rápidos | Navega a ruta correcta. | P2 | Configuración |
| QA-DASH-003 | Ver sitio (nueva pestaña) | Clic "Ver sitio" en sidebar | Abre sitio público. Sesión admin sigue activa. | P2 | Configuración |
| QA-DASH-004 | Menú activo resaltado | Navegar a Productos | Item "Productos" marcado activo en sidebar. | P3 | Configuración |
| QA-DASH-005 | Flash success | Guardar producto OK | Redirect con `?success=` muestra alerta verde. | P2 | Productos |
| QA-DASH-006 | Flash error | Error validación | Redirect con `?error=` muestra alerta roja. | P2 | Productos |

---

## 19. Menú público (complemento)

| ID | Caso de prueba | Pasos (resumen) | Resultado esperado | Prioridad | Módulo |
|----|----------------|-----------------|-------------------|-----------|--------|
| QA-MENU-001 | Menú vacío | Sin categorías/productos activos | Página menú con estado vacío (`menuVacio`). | P2 | Productos |
| QA-MENU-002 | API menú JSON | GET `/api/menu` | JSON con categorías y productos activos. | P2 | Productos |
| QA-MENU-003 | Producto inactivo oculto | Desactivar producto | No aparece en `/menu` ni API. | P1 | Productos |
| QA-MENU-004 | Categoría inactiva oculta | Desactivar categoría | Sección no listada. | P1 | Categorías |
| QA-MENU-005 | Precio formateado AR | Precio 4500 | Muestra `$4.500` o formato es-AR. | P2 | Productos |

---

## 20. Regresiones conocidas (verificar explícitamente)

Casos documentados en código que suelen generar falsos positivos/negativos:

| ID | Observación | Resultado esperado | Prioridad |
|----|-------------|-------------------|-----------|
| QA-REG-001 | GET `/auth/logout` no cierra sesión | Comportamiento intencional. Solo POST logout cierra. | P1 |
| QA-REG-002 | Destacados home ordenados por `fecha_creacion`, no `orden` | Verificar si es bug o feature. Documentar resultado. | P2 |
| QA-REG-003 | Fechas promo: SQL UTC vs validación local | Probar promo que vence "hoy" cerca de medianoche. | P2 |
| QA-REG-004 | CSRF error testimonio redirect `#testimonios` vs form `#dejar-testimonio` | Verificar anchor correcto en redirect error. | P3 |
| QA-REG-005 | Categorías sin toggle rápido en listado | Solo activo/inactivo vía formulario edit. | P3 |

---

## 21. Checklist smoke test (pre-release)

Ejecutar **todos los P0** + este checklist mínimo en staging:

| # | Verificación | ☐ |
|---|--------------|---|
| 1 | Login / Logout POST funcional | ☐ |
| 2 | Crear categoría + producto + visible en menú | ☐ |
| 3 | Carrito → WhatsApp con mensaje correcto | ☐ |
| 4 | Subir imagen producto (optimización OK) | ☐ |
| 5 | Configuración: logo + colores reflejados en público | ☐ |
| 6 | Promo vigente visible en home | ☐ |
| 7 | Testimonio público → aprobar → visible en home | ☐ |
| 8 | CSRF rechaza POST sin token (1 caso admin + 1 público) | ☐ |
| 9 | `/robots.txt` y `/sitemap.xml` responden OK | ☐ |
| 10 | Home + menú usable en móvil 375px | ☐ |

---

## 22. Plantilla de registro de ejecución

Copiar por sprint o release:

```
Release / Sprint: _______________
Tester: _______________
Fecha: _______________
Entorno: _______________
Build / commit: _______________

Resumen:
- Total ejecutados: ___
- Pass: ___
- Fail: ___
- Blocked: ___
- Pass rate: ___%

Bugs encontrados:
| ID caso | ID bug | Severidad | Descripción | Estado |
|---------|--------|-----------|-------------|--------|
|         |        |           |             |        |
```

---

## 23. Referencias técnicas (para testers)

| Recurso | Ubicación |
|---------|-----------|
| Manual de usuario | `docs/manual-de-usuario-foodhub.md` |
| Guía staging/demo | `docs/staging-demo.md` |
| Perfiles de upload | `backend/config/upload.config.js` |
| Rutas admin | `backend/routes/admin/` |
| Seguridad HTTP | `docs/security-headers.md` |

---

*Plan QA FoodHub v1.0 — 203 casos funcionales. Solo documentación; no modifica código.*
