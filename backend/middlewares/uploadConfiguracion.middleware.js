const path = require('path');
const multer = require('multer');
const uploadConfig = require('../config/upload.config');
const uploadService = require('../services/admin/upload.service');
const logger = require('../utils/logger');

uploadService.ensureLogosUploadDir();
uploadService.ensureOgUploadDir();

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === uploadConfig.LOGO_FIELD_NAME) {
      uploadService.ensureLogosUploadDir();
      return cb(null, uploadConfig.LOGOS_DIR);
    }

    if (file.fieldname === uploadConfig.OG_FIELD_NAME) {
      uploadService.ensureOgUploadDir();
      return cb(null, uploadConfig.OG_DIR);
    }

    return cb(new Error('Campo de archivo no permitido.'));
  },
  filename: (_req, file, cb) => {
    try {
      if (!uploadService.isAllowedExtension(file.originalname)) {
        return cb(new Error('Tipo de archivo no permitido. Use JPG, JPEG, PNG o WEBP.'));
      }
      const filename = uploadService.generateUniqueFilename(file.originalname);
      logger.info('Archivo de configuración generado', { field: file.fieldname, filename });
      cb(null, filename);
    } catch (err) {
      cb(err);
    }
  },
});

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!uploadConfig.ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new Error('Extensión no permitida. Use JPG, JPEG, PNG o WEBP.'));
  }

  if (!uploadConfig.ALLOWED_MIMES.has(file.mimetype)) {
    return cb(new Error('Tipo MIME no permitido.'));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: uploadConfig.MAX_FILE_SIZE, files: 2 },
});

exports.uploadConfiguracionImagenes = (req, res, next) => {
  upload.fields([
    { name: uploadConfig.LOGO_FIELD_NAME, maxCount: 1 },
    { name: uploadConfig.OG_FIELD_NAME, maxCount: 1 },
  ])(req, res, (err) => {
    if (!err) return next();
    err.isUploadError = true;
    next(err);
  });
};
