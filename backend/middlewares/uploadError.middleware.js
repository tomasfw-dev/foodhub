const multer = require('multer');
const { getClientErrorMessage, logApplicationError } = require('../utils/error.helpers');

const ADMIN_PRODUCTOS = '/admin/productos';
const ADMIN_CONFIGURACION = '/admin/configuracion';
const ADMIN_PROMOCIONES = '/admin/promociones';
const ADMIN_HERO = '/admin/hero';

const GENERIC_UPLOAD_MESSAGE = 'Error al subir la imagen.';

const UPLOAD_ERROR_PATTERN =
  /permitid|MIME|archivo|imagen|ruta|válid|valid|procesar|directorio|externa/i;

function resolveUploadMessage(err, req) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      if (req.originalUrl.startsWith(ADMIN_PRODUCTOS)) {
        return 'La imagen supera el tamaño máximo de 50 MB.';
      }
      return 'La imagen supera el tamaño máximo de 5 MB.';
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return 'Solo se permite una imagen por archivo.';
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return 'Campo de archivo no permitido.';
    }
  }

  if (err.message && UPLOAD_ERROR_PATTERN.test(err.message)) {
    return err.message;
  }

  return GENERIC_UPLOAD_MESSAGE;
}

function resolveRedirectUrl(req) {
  if (req.originalUrl.startsWith(ADMIN_CONFIGURACION)) {
    return ADMIN_CONFIGURACION;
  }

  if (req.originalUrl.startsWith(ADMIN_HERO)) {
    return ADMIN_HERO;
  }

  if (req.originalUrl.startsWith(ADMIN_PROMOCIONES)) {
    const isEdit = req.originalUrl.includes('/edit');
    return isEdit
      ? `${ADMIN_PROMOCIONES}/${req.params.id}/edit`
      : `${ADMIN_PROMOCIONES}/create`;
  }

  const isEdit = req.originalUrl.includes('/edit');
  return isEdit
    ? `${ADMIN_PRODUCTOS}/${req.params.id}/edit`
    : `${ADMIN_PRODUCTOS}/create`;
}

exports.handleUploadError = (err, req, res, next) => {
  if (!err) return next();

  const isUploadError =
    err.isUploadError ||
    err instanceof multer.MulterError ||
    UPLOAD_ERROR_PATTERN.test(err.message || '');

  if (!isUploadError) return next(err);

  const message = resolveUploadMessage(err, req);
  logApplicationError('Error de carga de imagen', err, req);

  const safeMessage = getClientErrorMessage(
    { ...err, status: err.status || 400 },
    { fallback: message }
  );

  return res.redirect(`${resolveRedirectUrl(req)}?error=${encodeURIComponent(safeMessage)}`);
};
