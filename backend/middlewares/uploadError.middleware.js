const multer = require('multer');
const uploadConfig = require('../config/upload.config');
const { getClientErrorMessage, logApplicationError } = require('../utils/error.helpers');

const ADMIN_CONFIGURACION = '/admin/configuracion';

const GENERIC_UPLOAD_MESSAGE = 'Error al subir la imagen.';

const UPLOAD_ERROR_PATTERN =
  /permitid|MIME|archivo|imagen|ruta|válid|valid|procesar|directorio|externa|demasiado pesad/i;

function resolveUploadMessage(err, req) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return uploadConfig.resolveUploadSizeErrorMessage(req, err);
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

  if (req.originalUrl.startsWith('/admin/hero')) {
    return '/admin/hero';
  }

  if (req.originalUrl.startsWith('/admin/promociones')) {
    const isEdit = req.originalUrl.includes('/edit');
    return isEdit
      ? `/admin/promociones/${req.params.id}/edit`
      : '/admin/promociones/create';
  }

  const isEdit = req.originalUrl.includes('/edit');
  return isEdit
    ? `/admin/productos/${req.params.id}/edit`
    : '/admin/productos/create';
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
