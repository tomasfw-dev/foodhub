const multer = require('multer');
const { getClientErrorMessage, logApplicationError } = require('../utils/error.helpers');

const ADMIN_PRODUCTOS = '/admin/productos';
const ADMIN_CONFIGURACION = '/admin/configuracion';
const ADMIN_PROMOCIONES = '/admin/promociones';

const GENERIC_UPLOAD_MESSAGE = 'Error al subir la imagen.';

exports.handleUploadError = (err, req, res, next) => {
  if (!err) return next();

  const isUploadError =
    err.isUploadError ||
    err instanceof multer.MulterError ||
    /permitid|MIME|archivo/i.test(err.message || '');

  if (!isUploadError) return next(err);

  let message = GENERIC_UPLOAD_MESSAGE;

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'La imagen supera el tamaño máximo de 5 MB.';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Solo se permite una imagen por producto.';
    } else if (/permitid|MIME|archivo/i.test(err.message || '')) {
      message = err.message;
    }
  } else if (/permitid|MIME|archivo/i.test(err.message || '')) {
    message = err.message;
  }

  logApplicationError('Error de carga de imagen', err, req);

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

  const safeMessage = getClientErrorMessage(
    { ...err, status: err.status || 400 },
    { fallback: message }
  );

  return res.redirect(`${redirectUrl}?error=${encodeURIComponent(safeMessage)}`);
};
