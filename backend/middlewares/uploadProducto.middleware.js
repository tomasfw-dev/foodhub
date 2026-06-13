const uploadConfig = require('../config/upload.config');
const uploadService = require('../services/admin/upload.service');
const { createMulterSingleUpload } = require('./upload.middleware.helpers');

uploadService.ensureProductosUploadDir();

exports.uploadProductoImagen = createMulterSingleUpload({
  profileKey: 'productos',
  fieldName: uploadConfig.FIELD_NAME,
  destination: uploadConfig.PRODUCTOS_DIR,
  ensureDir: uploadService.ensureProductosUploadDir,
  logLabel: 'Nombre de archivo generado',
});
