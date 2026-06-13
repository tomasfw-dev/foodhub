const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const uploadConfig = require('../../config/upload.config');
const logger = require('../../utils/logger');
const { createUploadError } = require('../../utils/upload.helpers');

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

exports.ensureOgUploadDir = () => {
  if (!fs.existsSync(uploadConfig.OG_DIR)) {
    fs.mkdirSync(uploadConfig.OG_DIR, { recursive: true });
    logger.info('Directorio de OG creado', { dir: uploadConfig.OG_DIR });
  }
};

exports.ensureHeroUploadDir = () => {
  if (!fs.existsSync(uploadConfig.HERO_DIR)) {
    fs.mkdirSync(uploadConfig.HERO_DIR, { recursive: true });
    logger.info('Directorio de hero creado', { dir: uploadConfig.HERO_DIR });
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

exports.toOgPublicUrl = (filename) => {
  if (!filename) return null;
  return `${uploadConfig.OG_PUBLIC_PREFIX}/${filename}`;
};

exports.toHeroPublicUrl = (filename) => {
  if (!filename) return null;
  return `${uploadConfig.HERO_PUBLIC_PREFIX}/${filename}`;
};

exports.toPromocionPublicUrl = (filename) => {
  if (!filename) return null;
  return `${uploadConfig.PROMOCIONES_PUBLIC_PREFIX}/${filename}`;
};

exports.isAllowedExtension = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return uploadConfig.ALLOWED_EXTENSIONS.has(ext);
};

const SHARP_FORMAT_CONFIG = {
  jpeg: { ext: '.jpg', apply: (instance) => instance.jpeg({ quality: 85, mozjpeg: true }) },
  png: { ext: '.png', apply: (instance) => instance.png() },
  webp: { ext: '.webp', apply: (instance) => instance.webp({ quality: 85 }) },
};

/**
 * Valida magic bytes y re-encodea la imagen con sharp (elimina contenido incrustado).
 * @param {string} filePath - Ruta absoluta del archivo subido por multer
 * @returns {Promise<string>} Nombre de archivo final (puede cambiar la extensión)
 */
exports.sanitizeUploadedImage = async (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) {
    throw createUploadError('No se recibió ningún archivo de imagen.');
  }

  let metadata;
  try {
    metadata = await sharp(filePath, { failOn: 'error' }).metadata();
  } catch (err) {
    logger.warn('Imagen rechazada: no se pudo leer con sharp', { filePath, error: err.message });
    fs.unlinkSync(filePath);
    throw createUploadError(
      'El archivo no es una imagen válida. Solo se aceptan JPG, JPEG, PNG o WEBP.'
    );
  }

  const formatConfig = SHARP_FORMAT_CONFIG[metadata.format];
  if (!formatConfig) {
    fs.unlinkSync(filePath);
    throw createUploadError(
      'Formato de imagen no permitido. Solo se aceptan JPG, JPEG, PNG o WEBP.'
    );
  }

  let buffer;
  try {
    buffer = await formatConfig.apply(sharp(filePath).rotate()).toBuffer();
  } catch (err) {
    logger.warn('Imagen rechazada al re-encodear', { filePath, error: err.message });
    fs.unlinkSync(filePath);
    throw createUploadError('No se pudo procesar la imagen. Verificá que sea un archivo válido.');
  }

  if (buffer.length > uploadConfig.MAX_FILE_SIZE) {
    fs.unlinkSync(filePath);
    throw createUploadError('La imagen supera el tamaño máximo de 5 MB.');
  }

  const dir = path.dirname(filePath);
  const baseName = path.basename(filePath, path.extname(filePath));
  const finalFilename = `${baseName}${formatConfig.ext}`;
  const finalPath = path.join(dir, finalFilename);

  fs.writeFileSync(finalPath, buffer);
  if (finalPath !== filePath) {
    fs.unlinkSync(filePath);
  }

  logger.info('Imagen sanitizada', { filename: finalFilename, bytes: buffer.length });
  return finalFilename;
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

exports.deleteOgImage = (publicUrl) => {
  if (!publicUrl || !publicUrl.startsWith(`${uploadConfig.OG_PUBLIC_PREFIX}/`)) {
    return;
  }

  const filename = path.basename(publicUrl);
  const filePath = path.join(uploadConfig.OG_DIR, filename);

  if (!fs.existsSync(filePath)) {
    logger.warn('Imagen OG a eliminar no encontrada', { filePath });
    return;
  }

  fs.unlinkSync(filePath);
  logger.info('Imagen OG eliminada', { filename });
};

exports.deleteHeroImage = (publicUrl) => {
  if (!publicUrl || !publicUrl.startsWith(`${uploadConfig.HERO_PUBLIC_PREFIX}/`)) {
    return;
  }

  const filename = path.basename(publicUrl);
  const filePath = path.join(uploadConfig.HERO_DIR, filename);

  if (!fs.existsSync(filePath)) {
    logger.warn('Imagen de hero a eliminar no encontrada', { filePath });
    return;
  }

  fs.unlinkSync(filePath);
  logger.info('Imagen de hero eliminada', { filename });
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
