/**
 * Helpers para mapear ConfiguracionNegocio → vistas públicas
 */
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const paths = require('../config/paths');
const uploadConfig = require('../config/upload.config');
const constants = require('../config/constants');

const { PLATFORM_LOGO_URL } = constants;

let platformLogoHashCache = null;

function hashFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }

  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function getPlatformLogoHash() {
  if (platformLogoHashCache) {
    return platformLogoHashCache;
  }

  const platformPath = path.join(paths.publicDir, PLATFORM_LOGO_URL.replace(/^\//, ''));
  platformLogoHashCache = hashFile(platformPath);
  return platformLogoHashCache;
}

function isSameAsPlatformLogo(filePath) {
  const platformHash = getPlatformLogoHash();
  const fileHash = hashFile(filePath);
  return Boolean(platformHash && fileHash && platformHash === fileHash);
}

/**
 * Rutas reservadas a la plataforma (no se muestran en el sitio público).
 * @param {string|null|undefined} url
 * @returns {boolean}
 */
exports.isPlatformLogoPath = (url) => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return false;
  }

  const normalized = url.trim();
  return (
    normalized === PLATFORM_LOGO_URL ||
    normalized.endsWith('/logo-default.png') ||
    normalized.endsWith('logo-default.png')
  );
};

/**
 * Resuelve logo del negocio para el sitio público.
 * @param {string|null|undefined} storedUrl
 * @returns {string|null}
 */
exports.resolveBusinessLogoUrl = (storedUrl) => {
  if (!storedUrl || typeof storedUrl !== 'string' || !storedUrl.trim()) {
    return null;
  }

  if (exports.isPlatformLogoPath(storedUrl)) {
    return null;
  }

  const url = storedUrl.trim();

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith(`${uploadConfig.LOGO_PUBLIC_PREFIX}/`)) {
    const filePath = path.join(uploadConfig.LOGOS_DIR, path.basename(url));
    if (!fs.existsSync(filePath) || isSameAsPlatformLogo(filePath)) {
      return null;
    }
    return url;
  }

  if (url.startsWith('/')) {
    const filePath = path.join(paths.publicDir, url.replace(/^\//, ''));
    if (!fs.existsSync(filePath) || isSameAsPlatformLogo(filePath)) {
      return null;
    }
    return url;
  }

  return null;
};

/**
 * Resuelve logo para admin / previews (incluye fallback de plataforma).
 * @param {string|null|undefined} storedUrl
 * @returns {string}
 */
exports.resolveLogoUrl = (storedUrl) => {
  const businessLogo = exports.resolveBusinessLogoUrl(storedUrl);
  if (businessLogo) {
    return businessLogo;
  }

  if (storedUrl?.trim() && !exports.isPlatformLogoPath(storedUrl)) {
    return PLATFORM_LOGO_URL;
  }

  return PLATFORM_LOGO_URL;
};

/**
 * @param {string|null|undefined} storedUrl
 * @returns {{ hasLogo: boolean, logoUrl: string|null }}
 */
exports.resolvePublicBrand = (storedUrl) => {
  const logoUrl = exports.resolveBusinessLogoUrl(storedUrl);
  return {
    hasLogo: Boolean(logoUrl),
    logoUrl,
  };
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
  const fallback = constants.DEFAULT_SITE_CONFIG;
  const config = require('../config');

  if (!row) {
    return {
      appName: constants.DEFAULT_APP_NAME,
      site: {
        hasLogo: false,
        logoUrl: null,
        tagline: fallback.tagline,
        email: fallback.email,
        instagram: fallback.instagram,
        instagramHandle: fallback.instagramHandle,
        facebook: '',
        location: fallback.location,
        hours: fallback.hours,
        telefono: '',
      },
      whatsapp: {
        phone: config.whatsapp.phone,
        defaultMessage: config.whatsapp.defaultMessage,
      },
    };
  }

  const brand = exports.resolvePublicBrand(row.logo);
  const whatsappPhone = exports.sanitizePhone(row.whatsapp) || config.whatsapp.phone;

  return {
    appName: row.nombre_negocio || constants.DEFAULT_APP_NAME,
    site: {
      hasLogo: brand.hasLogo,
      logoUrl: brand.logoUrl,
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
