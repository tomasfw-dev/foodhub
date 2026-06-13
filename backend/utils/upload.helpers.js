/**
 * Validación de rutas de imagen almacenadas (imagenActual, API).
 */
const path = require('path');
const uploadConfig = require('../config/upload.config');

const SUSPICIOUS_PATH_PATTERN =
  /(?:^|[\\/])\.\.(?:[\\/]|$)|^[a-zA-Z]:[\\/]|^\/\/|https?:\/\//i;

const BLOCKED_EXTENSIONS = /\.(svg|html?|htm|php|js|mjs|cjs|exe|bat|sh|cmd|ps1)(\?.*)?$/i;

/**
 * @param {string} [message]
 * @returns {Error}
 */
function createUploadError(message) {
  const err = new Error(message || 'Archivo de imagen no válido.');
  err.status = 400;
  err.isUploadError = true;
  return err;
}

/**
 * @param {string|null|undefined} value
 * @param {{ allowedPrefixes?: string[], requiredPrefix?: string }} [options]
 * @returns {{ ok: true, url: string|null } | { ok: false, message: string }}
 */
function validateStoredImagePath(value, options = {}) {
  if (value == null || !String(value).trim()) {
    return { ok: true, url: null };
  }

  const url = String(value).trim();
  const allowedPrefixes = options.allowedPrefixes || uploadConfig.ALLOWED_PUBLIC_PREFIXES;

  if (SUSPICIOUS_PATH_PATTERN.test(url)) {
    return { ok: false, message: 'Ruta de imagen no permitida.' };
  }

  if (BLOCKED_EXTENSIONS.test(url)) {
    return { ok: false, message: 'Tipo de archivo no permitido. Use JPG, JPEG, PNG o WEBP.' };
  }

  if (!url.startsWith('/')) {
    return { ok: false, message: 'La ruta de imagen debe ser relativa al sitio (/uploads/...).' };
  }

  if (options.requiredPrefix && !url.startsWith(options.requiredPrefix)) {
    return {
      ok: false,
      message: `La imagen debe estar en ${options.requiredPrefix}.`,
    };
  }

  const matchesAllowed = allowedPrefixes.some((prefix) => url.startsWith(prefix));
  if (!matchesAllowed) {
    return { ok: false, message: 'La ruta de imagen no pertenece a un directorio permitido.' };
  }

  const filename = path.basename(url);
  if (!filename || filename === '.' || filename === '..') {
    return { ok: false, message: 'Nombre de archivo no válido.' };
  }

  const ext = path.extname(filename).toLowerCase();
  if (!uploadConfig.ALLOWED_EXTENSIONS.has(ext)) {
    return { ok: false, message: 'Extensión no permitida. Use JPG, JPEG, PNG o WEBP.' };
  }

  if (!/^[\w.-]+$/.test(filename)) {
    return { ok: false, message: 'Nombre de archivo no válido.' };
  }

  return { ok: true, url };
}

/**
 * @param {string|null|undefined} value
 * @param {{ requiredPrefix?: string }} [options]
 * @returns {string|null}
 */
function assertStoredImagePath(value, options = {}) {
  const result = validateStoredImagePath(value, options);
  if (!result.ok) {
    throw createUploadError(result.message);
  }
  return result.url;
}

module.exports = {
  createUploadError,
  validateStoredImagePath,
  assertStoredImagePath,
};
