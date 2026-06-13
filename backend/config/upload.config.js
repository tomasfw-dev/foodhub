const paths = require('./paths');

module.exports = {
  PRODUCTOS_DIR: paths.uploadsProductosDir,
  PUBLIC_PREFIX: '/uploads/productos',
  LOGOS_DIR: paths.uploadsLogosDir,
  LOGO_PUBLIC_PREFIX: '/uploads/logos',
  OG_DIR: paths.uploadsOgDir,
  OG_PUBLIC_PREFIX: '/uploads/og',
  HERO_DIR: paths.uploadsHeroDir,
  HERO_PUBLIC_PREFIX: '/uploads/hero',
  PROMOCIONES_DIR: paths.uploadsPromocionesDir,
  PROMOCIONES_PUBLIC_PREFIX: '/uploads/promociones',
  /** Prefijos públicos válidos para imagenActual y rutas locales en BD. */
  ALLOWED_PUBLIC_PREFIXES: [
    '/uploads/productos/',
    '/uploads/promociones/',
    '/uploads/hero/',
    '/uploads/logos/',
    '/uploads/og/',
  ],
  FIELD_NAME: 'imagen',
  LOGO_FIELD_NAME: 'logo',
  OG_FIELD_NAME: 'og_image',
  HERO_FIELD_NAME: 'imagen',
  /** Límite de subida para logos, hero, promociones, OG (antes de optimizar). */
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  /** Límite de subida temporal para productos (Sharp optimiza después). */
  MAX_PRODUCTO_UPLOAD_SIZE: 50 * 1024 * 1024,
  /** Tamaño máximo del archivo de producto ya optimizado en disco. */
  MAX_PRODUCTO_OUTPUT_SIZE: 2 * 1024 * 1024,
  PRODUCTO_IMAGE: {
    MAX_WIDTH: 1200,
    MAX_HEIGHT: 1200,
    WEBP_QUALITY: 80,
    JPEG_QUALITY: 82,
  },
  ALLOWED_EXTENSIONS: new Set(['.jpg', '.jpeg', '.png', '.webp']),
  ALLOWED_MIMES: new Set(['image/jpeg', 'image/png', 'image/webp']),
};
