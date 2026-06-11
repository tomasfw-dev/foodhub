const multer = require('multer');
const logger = require('../utils/logger');

const ADMIN_PRODUCTOS = '/admin/productos';
const ADMIN_CONFIGURACION = '/admin/configuracion';
const ADMIN_PROMOCIONES = '/admin/promociones';

exports.handleUploadError = (err, req, res, next) => {
  if (!err) return next();

  const isUploadError =
    err.isUploadError ||
    err instanceof multer.MulterError ||
    /permitid|MIME|archivo/i.test(err.message || '');

  if (!isUploadError) return next(err);

  let message = 'Error al subir la imagen.';

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'La imagen supera el tamaño máximo de 5 MB.';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Solo se permite una imagen por producto.';
    } else {
      message = err.message;
    }
  } else if (err.message) {
    message = err.message;
  }

  logger.error('Error de carga de imagen', err);

  let redirectUrl = ADMIN_PRODUCTOS;

  if (req.originalUrl.startsWith(ADMIN_CONFIGURACION)) {
    redirectUrl = ADMIN_CONFIGURACION;
  } else if (req.originalUrl.startsWith(ADMIN_PROMOCIONES)) {
    const isEdit = req.originalUrl.includes('/edit');
    redirectUrl = isEdit
      ? `${ADMIN_PROMOCIONES}/${req.params.id}/edit`
      : `${ADMIN_PROMOCIONES}/create`;
  } else {
    const isEdit = req.originalUrl.includes('/edit');
    redirectUrl = isEdit
      ? `${ADMIN_PRODUCTOS}/${req.params.id}/edit`
      : `${ADMIN_PRODUCTOS}/create`;
  }

  return res.redirect(`${redirectUrl}?error=${encodeURIComponent(message)}`);
};
