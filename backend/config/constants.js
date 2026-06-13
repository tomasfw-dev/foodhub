/** Marca de la plataforma (solo admin, login, docs). */
const PLATFORM_NAME = 'FoodHub';
const PLATFORM_LOGO_URL = '/images/logo-default.png';

/** Nombre visible del negocio cuando no hay configuración en BD. */
const DEFAULT_APP_NAME = 'Mi negocio';

/** Valores por defecto del sitio público (fallback sin BD). */
const DEFAULT_SITE_CONFIG = {
  tagline: 'Carta online y pedidos por WhatsApp',
  instagram: '',
  instagramHandle: '',
  email: '',
  location: '',
  hours: '',
};

module.exports = {
  PLATFORM_NAME,
  PLATFORM_LOGO_URL,
  DEFAULT_APP_NAME,
  DEFAULT_SITE_CONFIG,

  /** @deprecated Usar DEFAULT_APP_NAME */
  get APP_NAME() {
    return DEFAULT_APP_NAME;
  },

  /** @deprecated Usar DEFAULT_SITE_CONFIG */
  get SITE() {
    return DEFAULT_SITE_CONFIG;
  },

  ROUTES: {
    HOME: '/',
    MENU: '/menu',
    ADMIN: '/admin',
    AUTH_LOGIN: '/auth/login',
    AUTH_LOGOUT: '/auth/logout',
    TESTIMONIOS: '/testimonios',
    INFORMACION_UTIL: '/informacion-util',
  },

  ADMIN_ROUTES: {
    DASHBOARD: '/admin',
    CATEGORIAS: '/admin/categorias',
    CATEGORIAS_CREATE: '/admin/categorias/create',
    PRODUCTOS: '/admin/productos',
    PRODUCTOS_CREATE: '/admin/productos/create',
    PROMOCIONES: '/admin/promociones',
    PROMOCIONES_CREATE: '/admin/promociones/create',
    CONFIGURACION: '/admin/configuracion',
    HERO: '/admin/hero',
    TESTIMONIOS: '/admin/testimonios',
    TESTIMONIOS_CREATE: '/admin/testimonios/create',
    TESTIMONIOS_PENDIENTES: '/admin/testimonios/pendientes',
    INFORMACION_UTIL: '/admin/informacion-util',
    ZONAS_ENTREGA: '/admin/informacion-util/zonas-entrega',
    ZONAS_ENTREGA_CREATE: '/admin/informacion-util/zonas-entrega/create',
    FORMAS_PAGO: '/admin/informacion-util/formas-pago',
    FORMAS_PAGO_CREATE: '/admin/informacion-util/formas-pago/create',
    PREGUNTAS_FRECUENTES: '/admin/informacion-util/preguntas-frecuentes',
    PREGUNTAS_FRECUENTES_CREATE: '/admin/informacion-util/preguntas-frecuentes/create',
    PERFIL: '/admin/perfil',
  },
};
