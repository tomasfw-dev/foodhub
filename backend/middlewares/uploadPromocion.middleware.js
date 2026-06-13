const multer = require('multer');
const uploadConfig = require('../config/upload.config');
const uploadService = require('../services/admin/upload.service');
const logger = require('../utils/logger');
const {
  createImageFileFilter,
  wrapUploadWithSanitization,
} = require('./upload.middleware.helpers');
const { createUploadError } = require('../utils/upload.helpers');

uploadService.ensurePromocionesUploadDir();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    uploadService.ensurePromocionesUploadDir();
    cb(null, uploadConfig.PROMOCIONES_DIR);
  },
  filename: (_req, file, cb) => {
    try {
      if (!uploadService.isAllowedExtension(file.originalname)) {
        return cb(createUploadError('Tipo de archivo no permitido. Use JPG, JPEG, PNG o WEBP.'));
      }
      const filename = uploadService.generateUniqueFilename(file.originalname);
      logger.info('Nombre de imagen de promoción generado', { filename });
      cb(null, filename);
    } catch (err) {
      cb(err);
    }
  },
});

const upload = multer({
  storage,
  fileFilter: createImageFileFilter(),
  limits: { fileSize: uploadConfig.MAX_FILE_SIZE, files: 1 },
});

exports.uploadPromocionImagen = wrapUploadWithSanitization(
  upload.single(uploadConfig.FIELD_NAME),
  'single'
);
