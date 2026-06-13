const uploadConfig = require('../config/upload.config');
const uploadService = require('../services/admin/upload.service');
const { createMulterSingleUpload } = require('./upload.middleware.helpers');

uploadService.ensureLogosUploadDir();

exports.uploadLogoImagen = createMulterSingleUpload({
  profileKey: 'logos',
  fieldName: uploadConfig.LOGO_FIELD_NAME,
  destination: uploadConfig.LOGOS_DIR,
  ensureDir: uploadService.ensureLogosUploadDir,
  logLabel: 'Nombre de logo generado',
});
