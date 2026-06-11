/**
 * Formas de pago — SQL Server.
 */
const db = require('../database/connection');
const queries = require('../database/queries/formas-pago.queries');
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
    nombre: row.nombre,
    descripcion: row.descripcion || '',
    activo: Boolean(row.activo),
    orden: mapOrden(row.orden),
    fecha_creacion: row.fecha_creacion,
    fecha_modificacion: row.fecha_modificacion,
  };
}

function mapRowPublic(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion || '',
    orden: mapOrden(row.orden),
  };
}

function validar(datos) {
  const errors = [];
  const nombre = datos.nombre?.trim();

  if (!nombre || nombre.length < 2) {
    errors.push('El nombre es obligatorio (mínimo 2 caracteres).');
  } else if (nombre.length > 80) {
    errors.push('El nombre no puede superar 80 caracteres.');
  }

  const descripcion = datos.descripcion?.trim() || '';
  if (descripcion.length > 500) {
    errors.push('La descripción no puede superar 500 caracteres.');
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
      nombre,
      descripcion,
      activo: parseBoolean(datos.activo, true),
      orden,
    },
  };
}

exports.listar = async () => {
  logger.info('Listando formas de pago');
  const rows = await db.query(queries.LISTAR);
  return rows.map(mapRowAdmin);
};

exports.listarActivas = async () => {
  logger.info('Consultando formas de pago activas');
  const rows = await db.query(queries.LISTAR_ACTIVAS);
  return rows.map(mapRowPublic);
};

exports.obtenerPorId = async (id) => {
  const rows = await db.query(queries.OBTENER_POR_ID, { id: Number(id) });
  if (!rows.length) throw createError(404, 'Forma de pago no encontrada.');
  return mapRowAdmin(rows[0]);
};

exports.crear = async (datos) => {
  const validation = validar(datos);
  if (!validation.valid) throw createError(400, validation.errors.join(' '));

  const rows = await db.query(queries.CREAR, validation.sanitized);
  if (!rows.length) throw createError(500, 'No se pudo crear la forma de pago.');

  const item = mapRowAdmin(rows[0]);
  logger.info('Forma de pago creada', { id: item.id });
  return item;
};

exports.editar = async (id, datos) => {
  const actual = await exports.obtenerPorId(id);
  const payload = {
    nombre: datos.nombre !== undefined ? datos.nombre : actual.nombre,
    descripcion: datos.descripcion !== undefined ? datos.descripcion : actual.descripcion,
    activo: datos.activo !== undefined ? datos.activo : actual.activo,
    orden: datos.orden !== undefined ? datos.orden : actual.orden,
  };

  const validation = validar(payload);
  if (!validation.valid) throw createError(400, validation.errors.join(' '));

  const rows = await db.query(queries.EDITAR, { id: Number(id), ...validation.sanitized });
  if (!rows.length) throw createError(404, 'Forma de pago no encontrada.');

  const item = mapRowAdmin(rows[0]);
  logger.info('Forma de pago actualizada', { id: item.id });
  return item;
};

exports.eliminar = async (id) => {
  const rows = await db.query(queries.ELIMINAR, { id: Number(id) });
  if (!rows.length) throw createError(404, 'Forma de pago no encontrada.');
  logger.info('Forma de pago eliminada', { id: rows[0].id });
  return { id: rows[0].id };
};

exports.setActivo = async (id, activo) => {
  const rows = await db.query(queries.ACTUALIZAR_ACTIVO, { id: Number(id), activo: Boolean(activo) });
  if (!rows.length) throw createError(404, 'Forma de pago no encontrada.');
  const item = mapRowAdmin(rows[0]);
  logger.info('Estado de forma de pago actualizado', { id: item.id, activo: item.activo });
  return item;
};

exports.activar = async (id) => exports.setActivo(id, true);
exports.desactivar = async (id) => exports.setActivo(id, false);
