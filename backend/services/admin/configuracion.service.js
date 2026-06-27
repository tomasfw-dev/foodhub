/**
 * Configuración global del negocio — SQL Server (registro único).
 */
const db = require('../../database/connection');
const queries = require('../../database/queries/configuracion.queries');
const siteHelpers = require('../../utils/site.helpers');
const seoHelpers = require('../../utils/seo.helpers');
const themeHelpers = require('../../utils/theme.helpers');
const uploadConfig = require('../../config/upload.config');
const uploadService = require('./upload.service');
const logger = require('../../utils/logger');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/.+/i;

let cachedConfig = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000;

function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function mapRow(row) {
  return {
    id: row.id,
    nombre_negocio: row.nombre_negocio,
    slogan: row.slogan,
    telefono: row.telefono || '',
    whatsapp: row.whatsapp || '',
    instagram: row.instagram || '',
    facebook: row.facebook || '',
    direccion: row.direccion || '',
    horarios: row.horarios || '',
    email: row.email || '',
    logo: row.logo || '',
    logoUrl: siteHelpers.resolveLogoUrl(row.logo),
    mensaje_whatsapp: row.mensaje_whatsapp || '',
    seo_title: row.seo_title || '',
    seo_description: row.seo_description || '',
    seo_keywords: row.seo_keywords || '',
    og_image: row.og_image || '',
    ogImageUrl:
      seoHelpers.resolveOgImageUrl(row.og_image) ||
      siteHelpers.resolveBusinessLogoUrl(row.logo) ||
      '',
    color_primario: row.color_primario || '',
    color_secundario: row.color_secundario || '',
    color_fondo: row.color_fondo || '',
    color_texto: row.color_texto || '',
    color_acento: row.color_acento || '',
    fecha_modificacion: row.fecha_modificacion,
  };
}

function cleanupUploadedFiles({ logoUrl, ogUrl }) {
  if (logoUrl) {
    uploadService.deleteLogoImage(logoUrl);
  }
  if (ogUrl) {
    uploadService.deleteOgImage(ogUrl);
  }
}

function cleanupReplacedFiles({ previousLogo, previousOg, newLogo, newOg }) {
  if (newLogo && previousLogo?.startsWith(`${uploadConfig.LOGO_PUBLIC_PREFIX}/`) && previousLogo !== newLogo) {
    uploadService.deleteLogoImage(previousLogo);
  }
  if (newOg && previousOg?.startsWith(`${uploadConfig.OG_PUBLIC_PREFIX}/`) && previousOg !== newOg) {
    uploadService.deleteOgImage(previousOg);
  }
}

exports.invalidateCache = () => {
  cachedConfig = null;
  cacheTimestamp = 0;
};

exports.obtener = async ({ useCache = true } = {}) => {
  if (useCache && cachedConfig && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedConfig;
  }

  logger.info('Consultando configuración del negocio');

  const rows = await db.query(queries.OBTENER);

  if (!rows.length) {
    throw createError(404, 'Configuración del negocio no encontrada. Ejecutá el script de seed.');
  }

  cachedConfig = mapRow(rows[0]);
  cacheTimestamp = Date.now();

  return cachedConfig;
};

exports.toViewLocals = (config) => {
  return siteHelpers.toViewLocals(config);
};

exports.validar = (datos) => {
  const errors = [];

  const nombre = datos.nombre_negocio?.trim();
  const slogan = datos.slogan?.trim();
  const seoTitle = datos.seo_title?.trim() || null;
  const seoDescription = datos.seo_description?.trim() || null;
  const seoKeywords = datos.seo_keywords?.trim() || null;

  if (!nombre || nombre.length < 2) {
    errors.push('El nombre del negocio es obligatorio (mínimo 2 caracteres).');
  }

  if (!slogan || slogan.length < 3) {
    errors.push('El slogan es obligatorio (mínimo 3 caracteres).');
  }

  if (datos.email?.trim() && !EMAIL_REGEX.test(datos.email.trim())) {
    errors.push('El email no tiene un formato válido.');
  }

  if (datos.instagram?.trim() && !URL_REGEX.test(datos.instagram.trim())) {
    errors.push('Instagram debe ser una URL válida (http/https).');
  }

  if (datos.facebook?.trim() && !URL_REGEX.test(datos.facebook.trim())) {
    errors.push('Facebook debe ser una URL válida (http/https).');
  }

  const mensaje = datos.mensaje_whatsapp?.trim();
  if (mensaje && mensaje.length > 500) {
    errors.push('El mensaje de WhatsApp no puede superar 500 caracteres.');
  }

  if (seoTitle && seoTitle.length > 120) {
    errors.push('El título SEO no puede superar 120 caracteres.');
  }

  if (seoDescription && seoDescription.length > 320) {
    errors.push('La descripción SEO no puede superar 320 caracteres.');
  }

  if (seoKeywords && seoKeywords.length > 500) {
    errors.push('Las palabras clave SEO no pueden superar 500 caracteres.');
  }

  const themeValidation = themeHelpers.validateThemeColors(datos);
  if (!themeValidation.valid) {
    errors.push(...themeValidation.errors);
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      nombre_negocio: nombre,
      slogan,
      telefono: siteHelpers.sanitizePhone(datos.telefono) || null,
      whatsapp: siteHelpers.sanitizePhone(datos.whatsapp) || null,
      instagram: datos.instagram?.trim() || null,
      facebook: datos.facebook?.trim() || null,
      direccion: datos.direccion?.trim() || null,
      horarios: datos.horarios?.trim() || null,
      email: datos.email?.trim().toLowerCase() || null,
      mensaje_whatsapp: mensaje || null,
      seo_title: seoTitle,
      seo_description: seoDescription,
      seo_keywords: seoKeywords,
      ...themeValidation.sanitized,
    },
  };
};

exports.actualizar = async (datos, files = {}) => {
  const { logoFile = null, ogImageFile = null } = files;
  const actual = await exports.obtener({ useCache: false });
  const validation = exports.validar(datos);

  const newLogoUrl = logoFile ? uploadService.toLogoPublicUrl(logoFile.filename) : null;
  const newOgUrl = ogImageFile ? uploadService.toOgPublicUrl(ogImageFile.filename) : null;

  if (!validation.valid) {
    cleanupUploadedFiles({ logoUrl: newLogoUrl, ogUrl: newOgUrl });
    throw createError(400, validation.errors.join(' '));
  }

  const logo = newLogoUrl ?? actual.logo;
  const og_image = newOgUrl ?? actual.og_image;

  try {
    const rows = await db.query(queries.ACTUALIZAR, {
      ...validation.sanitized,
      logo,
      og_image,
    });

    if (!rows.length) {
      throw createError(500, 'No se pudo actualizar la configuración.');
    }

    cleanupReplacedFiles({
      previousLogo: actual.logo,
      previousOg: actual.og_image,
      newLogo: newLogoUrl,
      newOg: newOgUrl,
    });

    exports.invalidateCache();

    const updated = mapRow(rows[0]);
    logger.info('Configuración del negocio actualizada', { id: updated.id });

    return updated;
  } catch (err) {
    cleanupUploadedFiles({ logoUrl: newLogoUrl, ogUrl: newOgUrl });
    throw err;
  }
};
