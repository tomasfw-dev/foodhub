const paths = require('./paths');

module.exports = {
  PRODUCTOS_DIR: paths.uploadsProductosDir,
  PUBLIC_PREFIX: '/uploads/productos',
  LOGOS_DIR: paths.uploadsLogosDir,
  LOGO_PUBLIC_PREFIX: '/uploads/logos',
  PROMOCIONES_DIR: paths.uploadsPromocionesDir,
  PROMOCIONES_PUBLIC_PREFIX: '/uploads/promociones',
  FIELD_NAME: 'imagen',
  LOGO_FIELD_NAME: 'logo',
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ALLOWED_EXTENSIONS: new Set(['.jpg', '.jpeg', '.png', '.webp']),
  ALLOWED_MIMES: new Set(['image/jpeg', 'image/png', 'image/webp']),
};
