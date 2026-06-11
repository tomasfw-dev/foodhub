/**
 * Zonas de entrega — SQL Server.
 */
const db = require('../database/connection');
const queries = require('../database/queries/zonas-entrega.queries');
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

function parseCosto(value) {
  if (value === undefined || value === null || value === '') return 0;
  const num = Number(String(value).replace(',', '.'));
  if (!Number.isFinite(num) || num < 0) {
    throw createError(400, 'El costo de envío debe ser un número mayor o igual a 0.');
  }
  return Math.round(num * 100) / 100;
}

function mapRowAdmin(row) {
  return {
    id: row.id,
    nombre_zona: row.nombre_zona,
    descripcion: row.descripcion || '',
    costo_envio: Number(row.costo_envio),
    activo: Boolean(row.activo),
    orden: mapOrden(row.orden),
    fecha_creacion: row.fecha_creacion,
    fecha_modificacion: row.fecha_modificacion,
  };
}

function mapRowPublic(row) {
  return {
    id: row.id,
    nombreZona: row.nombre_zona,
    descripcion: row.descripcion || '',
    costoEnvio: Number(row.costo_envio),
    orden: mapOrden(row.orden),
  };
}

function validar(datos) {
  const errors = [];
  const nombre = datos.nombre_zona?.trim();

  if (!nombre || nombre.length < 2) {
    errors.push('El nombre de la zona es obligatorio (mínimo 2 caracteres).');
  } else if (nombre.length > 120) {
    errors.push('El nombre de la zona no puede superar 120 caracteres.');
  }

  const descripcion = datos.descripcion?.trim() || '';
  if (descripcion.length > 500) {
    errors.push('La descripción no puede superar 500 caracteres.');
  }

  let costo_envio;
  try {
    costo_envio = parseCosto(datos.costo_envio);
  } catch (err) {
    errors.push(err.message);
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
      nombre_zona: nombre,
      descripcion,
      costo_envio,
      activo: parseBoolean(datos.activo, true),
      orden,
    },
  };
}

exports.listar = async () => {
  logger.info('Listando zonas de entrega');
  const rows = await db.query(queries.LISTAR);
  return rows.map(mapRowAdmin);
};

exports.listarActivas = async () => {
  logger.info('Consultando zonas de entrega activas');
  const rows = await db.query(queries.LISTAR_ACTIVAS);
  return rows.map(mapRowPublic);
};

exports.obtenerPorId = async (id) => {
  const rows = await db.query(queries.OBTENER_POR_ID, { id: Number(id) });
  if (!rows.length) throw createError(404, 'Zona de entrega no encontrada.');
  return mapRowAdmin(rows[0]);
};

exports.crear = async (datos) => {
  const validation = validar(datos);
  if (!validation.valid) throw createError(400, validation.errors.join(' '));

  const rows = await db.query(queries.CREAR, validation.sanitized);
  if (!rows.length) throw createError(500, 'No se pudo crear la zona de entrega.');

  const zona = mapRowAdmin(rows[0]);
  logger.info('Zona de entrega creada', { id: zona.id });
  return zona;
};

exports.editar = async (id, datos) => {
  const actual = await exports.obtenerPorId(id);
  const payload = {
    nombre_zona: datos.nombre_zona !== undefined ? datos.nombre_zona : actual.nombre_zona,
    descripcion: datos.descripcion !== undefined ? datos.descripcion : actual.descripcion,
    costo_envio: datos.costo_envio !== undefined ? datos.costo_envio : actual.costo_envio,
    activo: datos.activo !== undefined ? datos.activo : actual.activo,
    orden: datos.orden !== undefined ? datos.orden : actual.orden,
  };

  const validation = validar(payload);
  if (!validation.valid) throw createError(400, validation.errors.join(' '));

  const rows = await db.query(queries.EDITAR, { id: Number(id), ...validation.sanitized });
  if (!rows.length) throw createError(404, 'Zona de entrega no encontrada.');

  const zona = mapRowAdmin(rows[0]);
  logger.info('Zona de entrega actualizada', { id: zona.id });
  return zona;
};

exports.eliminar = async (id) => {
  const rows = await db.query(queries.ELIMINAR, { id: Number(id) });
  if (!rows.length) throw createError(404, 'Zona de entrega no encontrada.');
  logger.info('Zona de entrega eliminada', { id: rows[0].id });
  return { id: rows[0].id };
};

exports.setActivo = async (id, activo) => {
  const rows = await db.query(queries.ACTUALIZAR_ACTIVO, { id: Number(id), activo: Boolean(activo) });
  if (!rows.length) throw createError(404, 'Zona de entrega no encontrada.');
  const zona = mapRowAdmin(rows[0]);
  logger.info('Estado de zona de entrega actualizado', { id: zona.id, activo: zona.activo });
  return zona;
};

exports.activar = async (id) => exports.setActivo(id, true);
exports.desactivar = async (id) => exports.setActivo(id, false);
