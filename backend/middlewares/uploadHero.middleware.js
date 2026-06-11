const path = require('path');
const multer = require('multer');
const uploadConfig = require('../config/upload.config');
const uploadService = require('../services/admin/upload.service');
const logger = require('../utils/logger');

uploadService.ensureHeroUploadDir();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    uploadService.ensureHeroUploadDir();
    cb(null, uploadConfig.HERO_DIR);
  },
  filename: (_req, file, cb) => {
    try {
      if (!uploadService.isAllowedExtension(file.originalname)) {
        return cb(new Error('Tipo de archivo no permitido. Use JPG, JPEG, PNG o WEBP.'));
      }
      const filename = uploadService.generateUniqueFilename(file.originalname);
      logger.info('Nombre de imagen de hero generado', { filename });
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
  limits: { fileSize: uploadConfig.MAX_FILE_SIZE, files: 1 },
});

exports.uploadHeroImagen = (req, res, next) => {
  upload.single(uploadConfig.HERO_FIELD_NAME)(req, res, (err) => {
    if (!err) return next();
    err.isUploadError = true;
    next(err);
  });
};
