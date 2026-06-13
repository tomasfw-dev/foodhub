const uploadConfig = require('../config/upload.config');
const uploadService = require('../services/admin/upload.service');
const { createMulterSingleUpload } = require('./upload.middleware.helpers');

uploadService.ensurePromocionesUploadDir();

exports.uploadPromocionImagen = createMulterSingleUpload({
  profileKey: 'promociones',
  fieldName: uploadConfig.FIELD_NAME,
  destination: uploadConfig.PROMOCIONES_DIR,
  ensureDir: uploadService.ensurePromocionesUploadDir,
  logLabel: 'Nombre de imagen de promoción generado',
});
