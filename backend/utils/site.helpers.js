/**
 * Helpers para mapear ConfiguracionNegocio → vistas públicas
 */
const path = require('path');
const fs = require('fs');
const paths = require('../config/paths');
const uploadConfig = require('../config/upload.config');
const constants = require('../config/constants');

const DEFAULT_LOGO = constants.SITE.logoUrl;

/**
 * @param {string|null|undefined} storedUrl
 * @returns {string}
 */
exports.resolveLogoUrl = (storedUrl) => {
  if (!storedUrl || typeof storedUrl !== 'string' || !storedUrl.trim()) {
    return DEFAULT_LOGO;
  }

  const url = storedUrl.trim();

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith(`${uploadConfig.LOGO_PUBLIC_PREFIX}/`)) {
    const filePath = path.join(uploadConfig.LOGOS_DIR, path.basename(url));
    if (fs.existsSync(filePath)) return url;
    return DEFAULT_LOGO;
  }

  if (url.startsWith('/')) {
    const filePath = path.join(paths.publicDir, url.replace(/^\//, ''));
    if (fs.existsSync(filePath)) return url;
    return DEFAULT_LOGO;
  }

  return DEFAULT_LOGO;
};

/**
 * @param {string|null|undefined} url
 * @returns {string}
 */
exports.extractInstagramHandle = (url) => {
  if (!url) return '';
  const match = String(url).match(/instagram\.com\/([^/?#]+)/i);
  return match ? `@${match[1]}` : '';
};

/**
 * Solo dígitos para teléfonos / WhatsApp.
 * @param {string|null|undefined} value
 * @returns {string}
 */
exports.sanitizePhone = (value) => {
  if (!value) return '';
  return String(value).replace(/\D/g, '');
};

/**
 * Mapeo a objetos usados en EJS (site, whatsapp, appName).
 * @param {object|null} row
 * @returns {{ appName: string, site: object, whatsapp: object }}
 */
exports.toViewLocals = (row) => {
  const fallback = constants.SITE;
  const config = require('../config');

  if (!row) {
    return {
      appName: constants.APP_NAME,
      site: { ...fallback, logoUrl: fallback.logoUrl },
      whatsapp: {
        phone: config.whatsapp.phone,
        defaultMessage: config.whatsapp.defaultMessage,
      },
    };
  }

  const logoUrl = exports.resolveLogoUrl(row.logo);
  const whatsappPhone = exports.sanitizePhone(row.whatsapp) || config.whatsapp.phone;

  return {
    appName: row.nombre_negocio || constants.APP_NAME,
    site: {
      logoUrl,
      tagline: row.slogan || fallback.tagline,
      email: row.email || fallback.email,
      instagram: row.instagram || fallback.instagram,
      instagramHandle: exports.extractInstagramHandle(row.instagram) || fallback.instagramHandle,
      facebook: row.facebook || '',
      location: row.direccion || fallback.location,
      hours: row.horarios || fallback.hours,
      telefono: exports.sanitizePhone(row.telefono),
    },
    whatsapp: {
      phone: whatsappPhone,
      defaultMessage: row.mensaje_whatsapp || config.whatsapp.defaultMessage,
    },
  };
};
