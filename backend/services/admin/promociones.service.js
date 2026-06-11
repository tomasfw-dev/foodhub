/**
 * Lógica de negocio para promociones — SQL Server.
 */
const db = require('../../database/connection');
const queries = require('../../database/queries/promociones.queries');
const logger = require('../../utils/logger');
const { resolvePromocionImageUrl } = require('../../utils/image.helpers');

function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function toDateOnly(value) {
  if (!value) return null;

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayDateOnly() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateInput(value) {
  return toDateOnly(value) || '';
}

function parseDate(value) {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw createError(400, 'Formato de fecha inválido. Use AAAA-MM-DD.');
  }

  return trimmed;
}

function parseBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (value === false || value === 'false' || value === 0 || value === '0') return false;
  return value === 'on' || value === 'true' || value === true || value === 1 || value === '1';
}

function evaluarVigencia(row) {
  const hoy = todayDateOnly();
  const inicio = toDateOnly(row.fecha_inicio);
  const fin = toDateOnly(row.fecha_fin);
  const activo = Boolean(row.activo);

  if (!activo) {
    return { estado: 'inactiva', visibleEnHome: false, mensaje: 'Inactiva' };
  }

  if (inicio && inicio > hoy) {
    return { estado: 'programada', visibleEnHome: false, mensaje: 'Programada' };
  }

  if (fin && fin < hoy) {
    return { estado: 'expirada', visibleEnHome: false, mensaje: 'Expirada' };
  }

  if (!inicio && !fin) {
    return { estado: 'permanente', visibleEnHome: true, mensaje: 'Vigente' };
  }

  return { estado: 'vigente', visibleEnHome: true, mensaje: 'Vigente' };
}

function mapRow(row) {
  const imagen = row.imagen || null;
  const vigencia = evaluarVigencia(row);

  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion || '',
    imagen,
    imagenUrl: resolvePromocionImageUrl(imagen),
    precio_promocional: row.precio_promocional != null ? Number(row.precio_promocional) : null,
    fecha_inicio: row.fecha_inicio,
    fecha_fin: row.fecha_fin,
    fecha_inicio_input: formatDateInput(row.fecha_inicio),
    fecha_fin_input: formatDateInput(row.fecha_fin),
    fecha_inicio_display: formatDateInput(row.fecha_inicio),
    fecha_fin_display: formatDateInput(row.fecha_fin),
    activo: Boolean(row.activo),
    destacado: Boolean(row.destacado),
    vigencia,
  };
}

exports.listar = async () => {
  logger.info('Listando promociones desde BD');
  const rows = await db.query(queries.LISTAR);
  return rows.map(mapRow);
};

exports.obtenerPorId = async (id) => {
  const rows = await db.query(queries.OBTENER_POR_ID, { id: Number(id) });
  if (!rows.length) throw createError(404, 'Promoción no encontrada');
  return mapRow(rows[0]);
};

exports.validar = (datos) => {
  const errors = [];
  const nombre = datos.nombre?.trim();

  if (!nombre || nombre.length < 2) {
    errors.push('El nombre es obligatorio (mínimo 2 caracteres).');
  }

  if (datos.descripcion && datos.descripcion.length > 1000) {
    errors.push('La descripción no puede superar 1000 caracteres.');
  }

  let precio_promocional = null;
  if (datos.precio_promocional !== undefined && datos.precio_promocional !== '') {
    precio_promocional = Number(datos.precio_promocional);
    if (Number.isNaN(precio_promocional) || precio_promocional < 0) {
      errors.push('El precio promocional debe ser un número mayor o igual a 0.');
    }
  }

  let fecha_inicio = null;
  let fecha_fin = null;

  try {
    fecha_inicio = parseDate(datos.fecha_inicio);
    fecha_fin = parseDate(datos.fecha_fin);
  } catch (err) {
    errors.push(err.message);
  }

  if (fecha_inicio && fecha_fin && fecha_fin < fecha_inicio) {
    errors.push('La fecha de fin debe ser posterior o igual a la fecha de inicio.');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      nombre,
      descripcion: datos.descripcion?.trim() || '',
      precio_promocional,
      fecha_inicio,
      fecha_fin,
      imagen: datos.imagen?.trim() || null,
      activo: parseBoolean(datos.activo, true),
      destacado: parseBoolean(datos.destacado, false),
    },
  };
};

exports.crear = async (datos) => {
  const validation = exports.validar(datos);

  if (!validation.valid) {
    throw createError(400, validation.errors.join(' '));
  }

  const rows = await db.query(queries.CREAR, validation.sanitized);
  const promocion = mapRow(rows[0]);
  logger.info('Promoción creada en BD', { id: promocion.id });
  return promocion;
};

exports.editar = async (id, datos) => {
  const actual = await exports.obtenerPorId(id);
  const merged = {
    nombre: datos.nombre !== undefined ? datos.nombre : actual.nombre,
    descripcion: datos.descripcion !== undefined ? datos.descripcion : actual.descripcion,
    precio_promocional:
      datos.precio_promocional !== undefined ? datos.precio_promocional : actual.precio_promocional,
    fecha_inicio:
      datos.fecha_inicio !== undefined ? datos.fecha_inicio : actual.fecha_inicio_input,
    fecha_fin: datos.fecha_fin !== undefined ? datos.fecha_fin : actual.fecha_fin_input,
    imagen: datos.imagen !== undefined ? datos.imagen : actual.imagen,
    activo: datos.activo !== undefined ? datos.activo : actual.activo,
    destacado: datos.destacado !== undefined ? datos.destacado : actual.destacado,
  };

  const validation = exports.validar(merged);

  if (!validation.valid) {
    throw createError(400, validation.errors.join(' '));
  }

  const rows = await db.query(queries.EDITAR, {
    id: Number(id),
    ...validation.sanitized,
  });

  if (!rows.length) throw createError(404, 'Promoción no encontrada');

  const promocion = mapRow(rows[0]);
  logger.info('Promoción actualizada en BD', { id: promocion.id });
  return promocion;
};

exports.actualizarEstado = async (id, { activo, destacado }) => {
  const actual = await exports.obtenerPorId(id);

  const rows = await db.query(queries.ACTUALIZAR_ESTADO, {
    id: Number(id),
    activo: activo !== undefined ? Boolean(activo) : actual.activo,
    destacado: destacado !== undefined ? Boolean(destacado) : actual.destacado,
  });

  if (!rows.length) throw createError(404, 'Promoción no encontrada');

  const promocion = mapRow(rows[0]);
  logger.info('Estado de promoción actualizado', {
    id: promocion.id,
    activo: promocion.activo,
    destacado: promocion.destacado,
  });

  return promocion;
};

exports.eliminar = async (id) => {
  const rows = await db.query(queries.ELIMINAR, { id: Number(id) });
  if (!rows.length) throw createError(404, 'Promoción no encontrada');

  logger.info('Promoción dada de baja en BD', { id });
  return { id: rows[0].id, imagen: rows[0].imagen };
};

exports.activar = async (id) => exports.actualizarEstado(id, { activo: true });

exports.desactivar = async (id) => exports.actualizarEstado(id, { activo: false });

exports.toggleDestacado = async (id) => {
  const actual = await exports.obtenerPorId(id);
  return exports.actualizarEstado(id, { destacado: !actual.destacado });
};
