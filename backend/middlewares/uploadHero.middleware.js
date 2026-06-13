const uploadConfig = require('../config/upload.config');
const uploadService = require('../services/admin/upload.service');
const { createMulterSingleUpload } = require('./upload.middleware.helpers');

uploadService.ensureHeroUploadDir();

exports.uploadHeroImagen = createMulterSingleUpload({
  profileKey: 'hero',
  fieldName: uploadConfig.HERO_FIELD_NAME,
  destination: uploadConfig.HERO_DIR,
  ensureDir: uploadService.ensureHeroUploadDir,
  logLabel: 'Nombre de imagen de hero generado',
});
