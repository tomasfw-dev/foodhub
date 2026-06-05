/**
 * Configuración global del negocio — SQL Server (registro único).
 */
const db = require('../../database/connection');
const queries = require('../../database/queries/configuracion.queries');
const siteHelpers = require('../../utils/site.helpers');
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
    fecha_modificacion: row.fecha_modificacion,
  };
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
    },
  };
};

exports.actualizar = async (datos, logoFile) => {
  const actual = await exports.obtener({ useCache: false });
  const validation = exports.validar(datos);

  if (!validation.valid) {
    throw createError(400, validation.errors.join(' '));
  }

  let logo = actual.logo;

  if (logoFile) {
    if (actual.logo?.startsWith(`${uploadConfig.LOGO_PUBLIC_PREFIX}/`)) {
      uploadService.deleteLogoImage(actual.logo);
    }
    logo = uploadService.toLogoPublicUrl(logoFile.filename);
    logger.info('Logo del negocio actualizado', { logo });
  }

  const rows = await db.query(queries.ACTUALIZAR, {
    ...validation.sanitized,
    logo,
  });

  if (!rows.length) {
    throw createError(500, 'No se pudo actualizar la configuración.');
  }

  exports.invalidateCache();

  const updated = mapRow(rows[0]);
  logger.info('Configuración del negocio actualizada', { id: updated.id });

  return updated;
};
