/**
 * Hero de la landing — SQL Server (registro único).
 */
const db = require('../database/connection');
const queries = require('../database/queries/hero.queries');
const heroHelpers = require('../utils/hero.helpers');
const uploadConfig = require('../config/upload.config');
const uploadService = require('./admin/upload.service');
const logger = require('../utils/logger');

const URL_REGEX = /^(https?:\/\/|\/|#)/i;

let cachedHero = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000;

function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function parseActivo(value) {
  if (value === true || value === 1 || value === '1') return true;
  if (value === 'on' || value === 'true') return true;
  return false;
}

exports.invalidateCache = () => {
  cachedHero = null;
  cacheTimestamp = 0;
};

/**
 * Hero activo para la home pública.
 */
exports.obtenerActivo = async ({ useCache = true, context = {} } = {}) => {
  if (useCache && cachedHero && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return heroHelpers.mapRowToView(cachedHero, context);
  }

  logger.info('Consultando hero activo de la home');

  const rows = await db.query(queries.OBTENER_ACTIVO);

  if (!rows.length) {
    return null;
  }

  cachedHero = rows[0];
  cacheTimestamp = Date.now();

  return heroHelpers.mapRowToView(cachedHero, context);
};

/**
 * Registro del hero para el panel admin (activo o no).
 */
exports.obtener = async () => {
  logger.info('Consultando hero para administración');

  const rows = await db.query(queries.OBTENER);

  if (!rows.length) {
    throw createError(
      404,
      'Hero no encontrado. Ejecutá los scripts 014_schema_hero_home.sql y 015_seed_hero_home.sql.'
    );
  }

  return heroHelpers.mapRowToAdmin(rows[0]);
};

exports.validar = (datos) => {
  const errors = [];

  const eyebrow = datos.eyebrow?.trim();
  const tituloAntes = datos.titulo_antes?.trim();
  const tituloDestacado = datos.titulo_destacado?.trim() || null;
  const tituloDespues = datos.titulo_despues?.trim() || null;
  const subtitulo = datos.subtitulo?.trim();
  const btnPrimarioTexto = datos.btn_primario_texto?.trim();
  const btnPrimarioUrl = datos.btn_primario_url?.trim();
  const btnSecundarioTexto = datos.btn_secundario_texto?.trim() || null;
  const btnSecundarioUrl = datos.btn_secundario_url?.trim() || null;

  if (!eyebrow || eyebrow.length < 2) {
    errors.push('El texto superior (eyebrow) es obligatorio (mínimo 2 caracteres).');
  }

  if (!tituloAntes || tituloAntes.length < 2) {
    errors.push('El título principal es obligatorio (mínimo 2 caracteres).');
  }

  if (tituloDestacado && tituloDestacado.length > 120) {
    errors.push('El texto destacado del título no puede superar 120 caracteres.');
  }

  if (!subtitulo || subtitulo.length < 5) {
    errors.push('El subtítulo es obligatorio (mínimo 5 caracteres).');
  }

  if (!btnPrimarioTexto || btnPrimarioTexto.length < 2) {
    errors.push('El texto del botón principal es obligatorio.');
  }

  if (!btnPrimarioUrl || !URL_REGEX.test(btnPrimarioUrl)) {
    errors.push('La URL del botón principal debe comenzar con /, # o http(s)://.');
  }

  if (btnSecundarioTexto && btnSecundarioUrl && !URL_REGEX.test(btnSecundarioUrl)) {
    errors.push('La URL del botón secundario debe comenzar con /, # o http(s)://.');
  }

  if (btnSecundarioUrl && !btnSecundarioTexto) {
    errors.push('Si indicás URL del botón secundario, también debe tener texto.');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      eyebrow,
      titulo_antes: tituloAntes,
      titulo_destacado: tituloDestacado,
      titulo_despues: tituloDespues,
      subtitulo,
      btn_primario_texto: btnPrimarioTexto,
      btn_primario_url: btnPrimarioUrl,
      btn_secundario_texto: btnSecundarioTexto,
      btn_secundario_url: btnSecundarioUrl,
      activo: parseActivo(datos.activo),
    },
  };
};

exports.actualizar = async (datos, imagenFile) => {
  const actual = await exports.obtener();
  const validation = exports.validar(datos);

  if (!validation.valid) {
    throw createError(400, validation.errors.join(' '));
  }

  let imagen = actual.imagen;

  if (imagenFile) {
    if (actual.imagen?.startsWith(`${uploadConfig.HERO_PUBLIC_PREFIX}/`)) {
      uploadService.deleteHeroImage(actual.imagen);
    }
    imagen = uploadService.toHeroPublicUrl(imagenFile.filename);
    logger.info('Imagen del hero actualizada', { imagen });
  }

  const rows = await db.query(queries.ACTUALIZAR, {
    ...validation.sanitized,
    imagen,
  });

  if (!rows.length) {
    throw createError(500, 'No se pudo actualizar el hero.');
  }

  exports.invalidateCache();

  const updated = heroHelpers.mapRowToAdmin(rows[0]);
  logger.info('Hero de la home actualizado', { id: updated.id, activo: updated.activo });

  return updated;
};
