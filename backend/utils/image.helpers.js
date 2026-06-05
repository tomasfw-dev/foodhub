/**
 * Helper para URLs de imagen de productos.
 * Valida existencia de archivos locales y aplica imagen por defecto.
 */
const fs = require('fs');
const path = require('path');
const uploadConfig = require('../config/upload.config');
const paths = require('../config/paths');
const logger = require('./logger');

const DEFAULT_PRODUCT_IMAGE = '/images/placeholder-food.svg';

/**
 * Resuelve la URL pública de imagen de un producto.
 * @param {string|null|undefined} storedUrl - Valor guardado en BD (ruta local o URL externa)
 * @returns {string}
 */
exports.resolveProductImageUrl = (storedUrl) => {
  if (!storedUrl || typeof storedUrl !== 'string' || !storedUrl.trim()) {
    return DEFAULT_PRODUCT_IMAGE;
  }

  const url = storedUrl.trim();

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith(`${uploadConfig.PUBLIC_PREFIX}/`)) {
    const filename = path.basename(url);
    const filePath = path.join(uploadConfig.PRODUCTOS_DIR, filename);

    if (exports.fileExists(filePath)) {
      return url;
    }

    logger.warn('Imagen de producto no encontrada en disco', { url, filePath });
    return DEFAULT_PRODUCT_IMAGE;
  }

  if (url.startsWith('/')) {
    const filePath = path.join(paths.publicDir, url.replace(/^\//, ''));

    if (exports.fileExists(filePath)) {
      return url;
    }

    logger.warn('Archivo de imagen no encontrado', { url, filePath });
    return DEFAULT_PRODUCT_IMAGE;
  }

  logger.warn('URL de imagen con formato no reconocido', { url });
  return DEFAULT_PRODUCT_IMAGE;
};

/**
 * @param {string} absolutePath
 * @returns {boolean}
 */
exports.fileExists = (absolutePath) => {
  try {
    return fs.existsSync(absolutePath);
  } catch (err) {
    logger.error('Error al verificar archivo de imagen', err);
    return false;
  }
};

exports.DEFAULT_PRODUCT_IMAGE = DEFAULT_PRODUCT_IMAGE;
