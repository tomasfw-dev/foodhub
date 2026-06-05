const paths = require('./paths');

module.exports = {
  PRODUCTOS_DIR: paths.uploadsProductosDir,
  PUBLIC_PREFIX: '/uploads/productos',
  FIELD_NAME: 'imagen',
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ALLOWED_EXTENSIONS: new Set(['.jpg', '.jpeg', '.png', '.webp']),
  ALLOWED_MIMES: new Set(['image/jpeg', 'image/png', 'image/webp']),
};
