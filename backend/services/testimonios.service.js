/**
 * Testimonios de clientes — SQL Server.
 */
const db = require('../database/connection');
const queries = require('../database/queries/testimonios.queries');
const logger = require('../utils/logger');
const { parseOrden, mapOrden } = require('../utils/orden.helpers');

const ESTADO = {
  PENDIENTE: 'pendiente',
  APROBADO: 'aprobado',
  RECHAZADO: 'rechazado',
};

exports.ESTADO = ESTADO;

exports.MENSAJE_EXITO_PUBLICO =
  'Gracias por compartir tu experiencia. Tu testimonio será revisado antes de publicarse.';

const LIMITS = {
  admin: { nombre: 120, comentario: 1000 },
  publico: { nombre: 100, comentario: 500 },
};

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

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .trim();
}

function containsHtml(value) {
  return /<[^>]+>/.test(String(value || ''));
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
    estado: row.estado,
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

function validar(datos, { modo = 'admin' } = {}) {
  const limits = LIMITS[modo] || LIMITS.admin;
  const errors = [];

  const nombreRaw = datos.nombre_cliente?.trim();
  const comentarioRaw = datos.comentario?.trim();

  if (containsHtml(nombreRaw) || containsHtml(comentarioRaw)) {
    errors.push('No se permite HTML en el nombre ni en el comentario.');
  }

  const nombre = stripHtml(nombreRaw);
  const comentario = stripHtml(comentarioRaw);

  if (!nombre || nombre.length < 2) {
    errors.push('El nombre del cliente es obligatorio (mínimo 2 caracteres).');
  } else if (nombre.length > limits.nombre) {
    errors.push(`El nombre del cliente no puede superar ${limits.nombre} caracteres.`);
  }

  if (!comentario || comentario.length < 5) {
    errors.push('El comentario es obligatorio (mínimo 5 caracteres).');
  } else if (comentario.length > limits.comentario) {
    errors.push(`El comentario no puede superar ${limits.comentario} caracteres.`);
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

  const result = {
    valid: errors.length === 0,
    errors,
    sanitized: {
      nombre_cliente: nombre,
      comentario,
      puntuacion,
    },
  };

  if (modo === 'admin') {
    result.sanitized.activo = parseBoolean(datos.activo, true);
    result.sanitized.estado = datos.estado || ESTADO.APROBADO;
    result.sanitized.orden = orden;
  }

  return result;
}

exports.listar = async () => {
  logger.info('Listando testimonios gestionados');
  const rows = await db.query(queries.LISTAR_GESTIONADOS);
  return rows.map(mapRowAdmin);
};

exports.listarPendientes = async () => {
  logger.info('Listando testimonios pendientes');
  const rows = await db.query(queries.LISTAR_PENDIENTES);
  return rows.map(mapRowAdmin);
};

exports.contarPendientes = async () => {
  const rows = await db.query(queries.CONTAR_PENDIENTES);
  return rows[0]?.total || 0;
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

exports.crearPublico = async (datos) => {
  const validation = validar(datos, { modo: 'publico' });

  if (!validation.valid) {
    throw createError(400, validation.errors.join(' '));
  }

  const rows = await db.query(queries.CREAR, {
    ...validation.sanitized,
    activo: false,
    estado: ESTADO.PENDIENTE,
    orden: null,
  });

  if (!rows.length) {
    throw createError(500, 'No se pudo enviar el testimonio.');
  }

  const testimonio = mapRowAdmin(rows[0]);
  logger.info('Testimonio público recibido (pendiente)', { id: testimonio.id });

  return testimonio;
};

exports.crear = async (datos) => {
  const validation = validar(datos, { modo: 'admin' });

  if (!validation.valid) {
    throw createError(400, validation.errors.join(' '));
  }

  const rows = await db.query(queries.CREAR, {
    ...validation.sanitized,
    estado: ESTADO.APROBADO,
  });

  if (!rows.length) {
    throw createError(500, 'No se pudo crear el testimonio.');
  }

  const testimonio = mapRowAdmin(rows[0]);
  logger.info('Testimonio creado desde admin', { id: testimonio.id });

  return testimonio;
};

exports.editar = async (id, datos) => {
  const actual = await exports.obtenerPorId(id);

  if (actual.estado === ESTADO.PENDIENTE) {
    throw createError(400, 'Editá los testimonios pendientes desde la sección correspondiente.');
  }

  const payload = {
    nombre_cliente: datos.nombre_cliente !== undefined ? datos.nombre_cliente : actual.nombre_cliente,
    comentario: datos.comentario !== undefined ? datos.comentario : actual.comentario,
    puntuacion: datos.puntuacion !== undefined ? datos.puntuacion : actual.puntuacion,
    activo: datos.activo !== undefined ? datos.activo : actual.activo,
    orden: datos.orden !== undefined ? datos.orden : actual.orden,
    estado: actual.estado,
  };

  const validation = validar(payload, { modo: 'admin' });

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

exports.editarPendiente = async (id, datos) => {
  await exports.obtenerPendientePorId(id);

  const validation = validar(datos, { modo: 'publico' });

  if (!validation.valid) {
    throw createError(400, validation.errors.join(' '));
  }

  const rows = await db.query(queries.EDITAR_PENDIENTE, {
    id: Number(id),
    ...validation.sanitized,
  });

  if (!rows.length) {
    throw createError(404, 'Testimonio pendiente no encontrado.');
  }

  const testimonio = mapRowAdmin(rows[0]);
  logger.info('Testimonio pendiente editado', { id: testimonio.id });

  return testimonio;
};

exports.obtenerPendientePorId = async (id) => {
  const testimonio = await exports.obtenerPorId(id);

  if (testimonio.estado !== ESTADO.PENDIENTE) {
    throw createError(404, 'Testimonio pendiente no encontrado.');
  }

  return testimonio;
};

exports.aprobar = async (id) => {
  await exports.obtenerPendientePorId(id);

  const rows = await db.query(queries.ACTUALIZAR_MODERACION, {
    id: Number(id),
    activo: true,
    estado: ESTADO.APROBADO,
  });

  if (!rows.length) {
    throw createError(404, 'Testimonio no encontrado.');
  }

  const testimonio = mapRowAdmin(rows[0]);
  logger.info('Testimonio aprobado', { id: testimonio.id });

  return testimonio;
};

exports.rechazar = async (id) => {
  await exports.obtenerPendientePorId(id);

  const rows = await db.query(queries.ACTUALIZAR_MODERACION, {
    id: Number(id),
    activo: false,
    estado: ESTADO.RECHAZADO,
  });

  if (!rows.length) {
    throw createError(404, 'Testimonio no encontrado.');
  }

  const testimonio = mapRowAdmin(rows[0]);
  logger.info('Testimonio rechazado', { id: testimonio.id });

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
    throw createError(404, 'Testimonio no encontrado o no está aprobado.');
  }

  const testimonio = mapRowAdmin(rows[0]);
  logger.info('Estado activo de testimonio actualizado', { id: testimonio.id, activo: testimonio.activo });

  return testimonio;
};

exports.activar = async (id) => exports.setActivo(id, true);

exports.desactivar = async (id) => exports.setActivo(id, false);
