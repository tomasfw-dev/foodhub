const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const uploadConfig = require('../../config/upload.config');
const logger = require('../../utils/logger');
const { createUploadError } = require('../../utils/upload.helpers');

const ALLOWED_SHARP_FORMATS = new Set(['jpeg', 'png', 'webp']);

const STANDARD_SHARP_FORMAT = {
  jpeg: { ext: '.jpg', apply: (instance) => instance.jpeg({ quality: 85, mozjpeg: true }) },
  png: { ext: '.png', apply: (instance) => instance.png() },
  webp: { ext: '.webp', apply: (instance) => instance.webp({ quality: 85 }) },
};

function removeFile(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

async function readImageMetadata(filePath) {
  try {
    return await sharp(filePath, { failOn: 'error' }).metadata();
  } catch (err) {
    logger.warn('Imagen rechazada: no se pudo leer con sharp', { filePath, error: err.message });
    removeFile(filePath);
    throw createUploadError(
      'El archivo no es una imagen válida. Solo se aceptan JPG, JPEG, PNG o WEBP.'
    );
  }
}

function assertAllowedFormat(metadata, filePath) {
  if (!metadata.format || !ALLOWED_SHARP_FORMATS.has(metadata.format)) {
    removeFile(filePath);
    throw createUploadError(
      'Formato de imagen no permitido. Solo se aceptan JPG, JPEG, PNG o WEBP.'
    );
  }
}

function writeOptimizedBuffer(filePath, buffer, ext) {
  const dir = path.dirname(filePath);
  const baseName = path.basename(filePath, path.extname(filePath));
  const finalFilename = `${baseName}${ext}`;
  const finalPath = path.join(dir, finalFilename);

  fs.writeFileSync(finalPath, buffer);
  if (finalPath !== filePath) {
    removeFile(filePath);
  }

  return finalFilename;
}

function buildProductPipeline(filePath) {
  const { MAX_WIDTH, MAX_HEIGHT } = uploadConfig.PRODUCTO_IMAGE;

  return sharp(filePath, { failOn: 'error' })
    .rotate()
    .resize({
      width: MAX_WIDTH,
      height: MAX_HEIGHT,
      fit: 'inside',
      withoutEnlargement: true,
    });
}

/**
 * Optimiza imagen de producto: resize, WebP/JPG, límite de salida 2 MB.
 * @param {string} filePath
 * @returns {Promise<string>}
 */
async function optimizeProductImage(filePath) {
  const metadata = await readImageMetadata(filePath);
  assertAllowedFormat(metadata, filePath);

  const pipeline = buildProductPipeline(filePath);
  const maxOutput = uploadConfig.MAX_PRODUCTO_OUTPUT_SIZE;
  const { WEBP_QUALITY, JPEG_QUALITY } = uploadConfig.PRODUCTO_IMAGE;

  const attempts = [
    { ext: '.webp', run: (p) => p.webp({ quality: WEBP_QUALITY }) },
    { ext: '.webp', run: (p) => p.webp({ quality: 70 }) },
    { ext: '.webp', run: (p) => p.webp({ quality: 60 }) },
    { ext: '.jpg', run: (p) => p.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }) },
    { ext: '.jpg', run: (p) => p.jpeg({ quality: 72, mozjpeg: true }) },
  ];

  for (const attempt of attempts) {
    let buffer;
    try {
      buffer = await attempt.run(pipeline.clone()).toBuffer();
    } catch (err) {
      logger.warn('Error al optimizar imagen de producto', { filePath, error: err.message });
      removeFile(filePath);
      throw createUploadError('No se pudo procesar la imagen. Verificá que sea un archivo válido.');
    }

    if (buffer.length <= maxOutput) {
      const finalFilename = writeOptimizedBuffer(filePath, buffer, attempt.ext);
      logger.info('Imagen de producto optimizada', {
        filename: finalFilename,
        bytes: buffer.length,
        format: attempt.ext,
      });
      return finalFilename;
    }
  }

  removeFile(filePath);
  throw createUploadError(
    'La imagen optimizada sigue siendo demasiado pesada (máx. 2 MB). Probá con una foto más chica o con menos detalle.'
  );
}

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

/**
 * Valida magic bytes y re-encodea (uploads estándar: logos, hero, promos, OG).
 * @param {string} filePath
 * @returns {Promise<string>}
 */
exports.sanitizeUploadedImage = async (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) {
    throw createUploadError('No se recibió ningún archivo de imagen.');
  }

  const metadata = await readImageMetadata(filePath);
  assertAllowedFormat(metadata, filePath);

  const formatConfig = STANDARD_SHARP_FORMAT[metadata.format];
  let buffer;

  try {
    buffer = await formatConfig.apply(sharp(filePath).rotate()).toBuffer();
  } catch (err) {
    logger.warn('Imagen rechazada al re-encodear', { filePath, error: err.message });
    removeFile(filePath);
    throw createUploadError('No se pudo procesar la imagen. Verificá que sea un archivo válido.');
  }

  if (buffer.length > uploadConfig.MAX_FILE_SIZE) {
    removeFile(filePath);
    throw createUploadError('La imagen supera el tamaño máximo de 5 MB.');
  }

  const finalFilename = writeOptimizedBuffer(filePath, buffer, formatConfig.ext);
  logger.info('Imagen sanitizada', { filename: finalFilename, bytes: buffer.length });
  return finalFilename;
};

/** @type {typeof optimizeProductImage} */
exports.sanitizeProductoImage = optimizeProductImage;

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
    logger.warn('Imagen de promoción no encontrada', { filePath });
    return;
  }

  fs.unlinkSync(filePath);
  logger.info('Imagen de promoción eliminada', { filename });
};
