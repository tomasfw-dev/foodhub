/**
 * Preguntas frecuentes — SQL Server.
 */
const db = require('../database/connection');
const queries = require('../database/queries/preguntas-frecuentes.queries');
const logger = require('../utils/logger');
const { parseOrden, mapOrden } = require('../utils/orden.helpers');

function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function parseBoolean(value, defaultValue = true) {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (value === false || value === 'false' || value === 0 || value === '0') return false;
  return value === 'on' || value === 'true' || value === true || value === 1 || value === '1';
}

function mapRowAdmin(row) {
  return {
    id: row.id,
    pregunta: row.pregunta,
    respuesta: row.respuesta,
    activo: Boolean(row.activo),
    orden: mapOrden(row.orden),
    fecha_creacion: row.fecha_creacion,
    fecha_modificacion: row.fecha_modificacion,
  };
}

function mapRowPublic(row) {
  return {
    id: row.id,
    pregunta: row.pregunta,
    respuesta: row.respuesta,
    orden: mapOrden(row.orden),
  };
}

function validar(datos) {
  const errors = [];
  const pregunta = datos.pregunta?.trim();
  const respuesta = datos.respuesta?.trim();

  if (!pregunta || pregunta.length < 5) {
    errors.push('La pregunta es obligatoria (mínimo 5 caracteres).');
  } else if (pregunta.length > 300) {
    errors.push('La pregunta no puede superar 300 caracteres.');
  }

  if (!respuesta || respuesta.length < 5) {
    errors.push('La respuesta es obligatoria (mínimo 5 caracteres).');
  } else if (respuesta.length > 2000) {
    errors.push('La respuesta no puede superar 2000 caracteres.');
  }

  let orden = null;
  if (datos.orden !== undefined) {
    try {
      orden = parseOrden(datos.orden);
    } catch (err) {
      errors.push(err.message);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      pregunta,
      respuesta,
      activo: parseBoolean(datos.activo, true),
      orden,
    },
  };
}

exports.listar = async () => {
  logger.info('Listando preguntas frecuentes');
  const rows = await db.query(queries.LISTAR);
  return rows.map(mapRowAdmin);
};

exports.listarActivas = async () => {
  logger.info('Consultando preguntas frecuentes activas');
  const rows = await db.query(queries.LISTAR_ACTIVAS);
  return rows.map(mapRowPublic);
};

exports.obtenerPorId = async (id) => {
  const rows = await db.query(queries.OBTENER_POR_ID, { id: Number(id) });
  if (!rows.length) throw createError(404, 'Pregunta frecuente no encontrada.');
  return mapRowAdmin(rows[0]);
};

exports.crear = async (datos) => {
  const validation = validar(datos);
  if (!validation.valid) throw createError(400, validation.errors.join(' '));

  const rows = await db.query(queries.CREAR, validation.sanitized);
  if (!rows.length) throw createError(500, 'No se pudo crear la pregunta frecuente.');

  const item = mapRowAdmin(rows[0]);
  logger.info('Pregunta frecuente creada', { id: item.id });
  return item;
};

exports.editar = async (id, datos) => {
  const actual = await exports.obtenerPorId(id);
  const payload = {
    pregunta: datos.pregunta !== undefined ? datos.pregunta : actual.pregunta,
    respuesta: datos.respuesta !== undefined ? datos.respuesta : actual.respuesta,
    activo: datos.activo !== undefined ? datos.activo : actual.activo,
    orden: datos.orden !== undefined ? datos.orden : actual.orden,
  };

  const validation = validar(payload);
  if (!validation.valid) throw createError(400, validation.errors.join(' '));

  const rows = await db.query(queries.EDITAR, { id: Number(id), ...validation.sanitized });
  if (!rows.length) throw createError(404, 'Pregunta frecuente no encontrada.');

  const item = mapRowAdmin(rows[0]);
  logger.info('Pregunta frecuente actualizada', { id: item.id });
  return item;
};

exports.eliminar = async (id) => {
  const rows = await db.query(queries.ELIMINAR, { id: Number(id) });
  if (!rows.length) throw createError(404, 'Pregunta frecuente no encontrada.');
  logger.info('Pregunta frecuente eliminada', { id: rows[0].id });
  return { id: rows[0].id };
};

exports.setActivo = async (id, activo) => {
  const rows = await db.query(queries.ACTUALIZAR_ACTIVO, { id: Number(id), activo: Boolean(activo) });
  if (!rows.length) throw createError(404, 'Pregunta frecuente no encontrada.');
  const item = mapRowAdmin(rows[0]);
  logger.info('Estado de pregunta frecuente actualizado', { id: item.id, activo: item.activo });
  return item;
};

exports.activar = async (id) => exports.setActivo(id, true);
exports.desactivar = async (id) => exports.setActivo(id, false);
