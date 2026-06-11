/**
 * Testimonios de clientes — SQL Server.
 */
const db = require('../database/connection');
const queries = require('../database/queries/testimonios.queries');
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

function parsePuntuacion(value) {
  const num = Number(value);

  if (!Number.isInteger(num) || num < 1 || num > 5) {
    throw createError(400, 'La puntuación debe ser un número entero entre 1 y 5.');
  }

  return num;
}

function mapRowAdmin(row) {
  return {
    id: row.id,
    nombre_cliente: row.nombre_cliente,
    comentario: row.comentario,
    puntuacion: Number(row.puntuacion),
    activo: Boolean(row.activo),
    orden: mapOrden(row.orden),
    fecha_creacion: row.fecha_creacion,
    fecha_modificacion: row.fecha_modificacion,
  };
}

function mapRowPublic(row) {
  return {
    id: row.id,
    nombreCliente: row.nombre_cliente,
    comentario: row.comentario,
    puntuacion: Number(row.puntuacion),
    orden: mapOrden(row.orden),
  };
}

function validar(datos) {
  const errors = [];

  const nombre = datos.nombre_cliente?.trim();
  const comentario = datos.comentario?.trim();

  if (!nombre || nombre.length < 2) {
    errors.push('El nombre del cliente es obligatorio (mínimo 2 caracteres).');
  } else if (nombre.length > 120) {
    errors.push('El nombre del cliente no puede superar 120 caracteres.');
  }

  if (!comentario || comentario.length < 5) {
    errors.push('El comentario es obligatorio (mínimo 5 caracteres).');
  } else if (comentario.length > 1000) {
    errors.push('El comentario no puede superar 1000 caracteres.');
  }

  let puntuacion;
  try {
    puntuacion = parsePuntuacion(datos.puntuacion);
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
      nombre_cliente: nombre,
      comentario,
      puntuacion,
      activo: parseBoolean(datos.activo, true),
      orden,
    },
  };
}

exports.listar = async () => {
  logger.info('Listando testimonios');
  const rows = await db.query(queries.LISTAR);
  return rows.map(mapRowAdmin);
};

exports.listarActivos = async () => {
  logger.info('Consultando testimonios activos para home');

  const rows = await db.query(queries.ACTIVOS_HOME);
  return rows.map(mapRowPublic);
};

exports.obtenerPorId = async (id) => {
  const rows = await db.query(queries.OBTENER_POR_ID, { id: Number(id) });

  if (!rows.length) {
    throw createError(404, 'Testimonio no encontrado.');
  }

  return mapRowAdmin(rows[0]);
};

exports.crear = async (datos) => {
  const validation = validar(datos);

  if (!validation.valid) {
    throw createError(400, validation.errors.join(' '));
  }

  const rows = await db.query(queries.CREAR, validation.sanitized);

  if (!rows.length) {
    throw createError(500, 'No se pudo crear el testimonio.');
  }

  const testimonio = mapRowAdmin(rows[0]);
  logger.info('Testimonio creado', { id: testimonio.id });

  return testimonio;
};

exports.editar = async (id, datos) => {
  const actual = await exports.obtenerPorId(id);

  const payload = {
    nombre_cliente: datos.nombre_cliente !== undefined ? datos.nombre_cliente : actual.nombre_cliente,
    comentario: datos.comentario !== undefined ? datos.comentario : actual.comentario,
    puntuacion: datos.puntuacion !== undefined ? datos.puntuacion : actual.puntuacion,
    activo: datos.activo !== undefined ? datos.activo : actual.activo,
    orden: datos.orden !== undefined ? datos.orden : actual.orden,
  };

  const validation = validar(payload);

  if (!validation.valid) {
    throw createError(400, validation.errors.join(' '));
  }

  const rows = await db.query(queries.EDITAR, {
    id: Number(id),
    ...validation.sanitized,
  });

  if (!rows.length) {
    throw createError(404, 'Testimonio no encontrado.');
  }

  const testimonio = mapRowAdmin(rows[0]);
  logger.info('Testimonio actualizado', { id: testimonio.id });

  return testimonio;
};

exports.eliminar = async (id) => {
  const rows = await db.query(queries.ELIMINAR, { id: Number(id) });

  if (!rows.length) {
    throw createError(404, 'Testimonio no encontrado.');
  }

  logger.info('Testimonio eliminado', { id: rows[0].id });

  return { id: rows[0].id };
};

exports.setActivo = async (id, activo) => {
  const rows = await db.query(queries.ACTUALIZAR_ACTIVO, {
    id: Number(id),
    activo: Boolean(activo),
  });

  if (!rows.length) {
    throw createError(404, 'Testimonio no encontrado.');
  }

  const testimonio = mapRowAdmin(rows[0]);
  logger.info('Estado de testimonio actualizado', { id: testimonio.id, activo: testimonio.activo });

  return testimonio;
};

exports.activar = async (id) => exports.setActivo(id, true);

exports.desactivar = async (id) => exports.setActivo(id, false);
