const multer = require('multer');
const uploadConfig = require('../config/upload.config');
const uploadService = require('../services/admin/upload.service');
const {
  createImageFileFilter,
  wrapUploadWithSanitization,
} = require('./upload.middleware.helpers');
const { createUploadError } = require('../utils/upload.helpers');

uploadService.ensureLogosUploadDir();
uploadService.ensureOgUploadDir();

const logoProfile = uploadConfig.getImageProfile('logos');
const ogProfile = uploadConfig.getImageProfile('og');
const maxUploadSize = Math.max(logoProfile.maxUploadSize, ogProfile.maxUploadSize);

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

    return cb(createUploadError('Campo de archivo no permitido.'));
  },
  filename: (_req, file, cb) => {
    try {
      if (!uploadService.isAllowedExtension(file.originalname)) {
        return cb(createUploadError('Tipo de archivo no permitido. Use JPG, JPEG, PNG o WEBP.'));
      }
      const filename = uploadService.generateUniqueFilename(file.originalname);
      cb(null, filename);
    } catch (err) {
      cb(err);
    }
  },
});

const upload = multer({
  storage,
  fileFilter: createImageFileFilter(),
  limits: { fileSize: maxUploadSize, files: 2 },
});

exports.uploadConfiguracionImagenes = wrapUploadWithSanitization(
  upload.fields([
    { name: uploadConfig.LOGO_FIELD_NAME, maxCount: 1 },
    { name: uploadConfig.OG_FIELD_NAME, maxCount: 1 },
  ]),
  'fields',
  {
    fieldProfiles: {
      [uploadConfig.LOGO_FIELD_NAME]: 'logos',
      [uploadConfig.OG_FIELD_NAME]: 'og',
    },
  }
);
