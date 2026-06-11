const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const uploadConfig = require('../../config/upload.config');
const logger = require('../../utils/logger');

exports.ensureProductosUploadDir = () => {
  if (!fs.existsSync(uploadConfig.PRODUCTOS_DIR)) {
    fs.mkdirSync(uploadConfig.PRODUCTOS_DIR, { recursive: true });
    logger.info('Directorio de uploads creado', { dir: uploadConfig.PRODUCTOS_DIR });
  }
};

exports.ensureLogosUploadDir = () => {
  if (!fs.existsSync(uploadConfig.LOGOS_DIR)) {
    fs.mkdirSync(uploadConfig.LOGOS_DIR, { recursive: true });
    logger.info('Directorio de logos creado', { dir: uploadConfig.LOGOS_DIR });
  }
};

exports.ensurePromocionesUploadDir = () => {
  if (!fs.existsSync(uploadConfig.PROMOCIONES_DIR)) {
    fs.mkdirSync(uploadConfig.PROMOCIONES_DIR, { recursive: true });
    logger.info('Directorio de promociones creado', { dir: uploadConfig.PROMOCIONES_DIR });
  }
};

exports.generateUniqueFilename = (originalname) => {
  const ext = path.extname(originalname).toLowerCase();
  const uniqueId = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  return `${uniqueId}${ext}`;
};

exports.toPublicUrl = (filename) => {
  if (!filename) return null;
  return `${uploadConfig.PUBLIC_PREFIX}/${filename}`;
};

exports.toLogoPublicUrl = (filename) => {
  if (!filename) return null;
  return `${uploadConfig.LOGO_PUBLIC_PREFIX}/${filename}`;
};

exports.toPromocionPublicUrl = (filename) => {
  if (!filename) return null;
  return `${uploadConfig.PROMOCIONES_PUBLIC_PREFIX}/${filename}`;
};

exports.isAllowedExtension = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return uploadConfig.ALLOWED_EXTENSIONS.has(ext);
};

exports.deleteProductoImage = (publicUrl) => {
  if (!publicUrl || !publicUrl.startsWith(`${uploadConfig.PUBLIC_PREFIX}/`)) {
    return;
  }

  const filename = path.basename(publicUrl);
  const filePath = path.join(uploadConfig.PRODUCTOS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    logger.warn('Imagen a eliminar no encontrada', { filePath });
    return;
  }

  fs.unlinkSync(filePath);
  logger.info('Imagen de producto eliminada', { filename });
};

exports.deleteLogoImage = (publicUrl) => {
  if (!publicUrl || !publicUrl.startsWith(`${uploadConfig.LOGO_PUBLIC_PREFIX}/`)) {
    return;
  }

  const filename = path.basename(publicUrl);
  const filePath = path.join(uploadConfig.LOGOS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    logger.warn('Logo a eliminar no encontrado', { filePath });
    return;
  }

  fs.unlinkSync(filePath);
  logger.info('Logo eliminado', { filename });
};

exports.deletePromocionImage = (publicUrl) => {
  if (!publicUrl || !publicUrl.startsWith(`${uploadConfig.PROMOCIONES_PUBLIC_PREFIX}/`)) {
    return;
  }

  const filename = path.basename(publicUrl);
  const filePath = path.join(uploadConfig.PROMOCIONES_DIR, filename);

  if (!fs.existsSync(filePath)) {
    logger.warn('Imagen de promoción a eliminar no encontrada', { filePath });
    return;
  }

  fs.unlinkSync(filePath);
  logger.info('Imagen de promoción eliminada', { filename });
};
