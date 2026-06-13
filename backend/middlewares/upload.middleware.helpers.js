/**
 * Helpers compartidos para middlewares de upload (multer + sharp).
 */
const path = require('path');
const uploadConfig = require('../config/upload.config');
const uploadService = require('../services/admin/upload.service');
const { createUploadError } = require('../utils/upload.helpers');

function createImageFileFilter() {
  return (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!uploadConfig.ALLOWED_EXTENSIONS.has(ext)) {
      return cb(createUploadError('Extensión no permitida. Use JPG, JPEG, PNG o WEBP.'));
    }

    if (!uploadConfig.ALLOWED_MIMES.has(file.mimetype)) {
      return cb(createUploadError('Tipo MIME no permitido.'));
    }

    cb(null, true);
  };
}

async function sanitizeReqFile(req) {
  if (!req.file?.path) return;

  const filename = await uploadService.sanitizeUploadedImage(req.file.path);
  req.file.filename = filename;
  req.file.path = path.join(path.dirname(req.file.path), filename);
}

async function sanitizeReqFiles(req) {
  if (!req.files) return;

  for (const fieldFiles of Object.values(req.files)) {
    for (const file of fieldFiles) {
      if (!file?.path) continue;
      const filename = await uploadService.sanitizeUploadedImage(file.path);
      file.filename = filename;
      file.path = path.join(path.dirname(file.path), filename);
    }
  }
}

/**
 * Ejecuta multer y sanitiza con sharp antes de continuar.
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => void} multerHandler
 * @param {'single'|'fields'} mode
 */
function wrapUploadWithSanitization(multerHandler, mode) {
  return (req, res, next) => {
    multerHandler(req, res, async (err) => {
      if (err) {
        err.isUploadError = true;
        return next(err);
      }

      try {
        if (mode === 'fields') {
          await sanitizeReqFiles(req);
        } else {
          await sanitizeReqFile(req);
        }
        next();
      } catch (sanitizeErr) {
        sanitizeErr.isUploadError = true;
        next(sanitizeErr);
      }
    });
  };
}

module.exports = {
  createImageFileFilter,
  wrapUploadWithSanitization,
};
