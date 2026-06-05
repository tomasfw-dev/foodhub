/**
 * Lógica de negocio para categorías — SQL Server.
 */
const db = require('../../database/connection');
const queries = require('../../database/queries/categorias.queries');
const logger = require('../../utils/logger');

function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function mapRow(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion || '',
    activo: Boolean(row.activo),
  };
}

exports.listar = async () => {
  logger.info('Listando categorías desde BD');
  const rows = await db.query(queries.LISTAR);
  return rows.map(mapRow);
};

exports.obtenerPorId = async (id) => {
  const rows = await db.query(queries.OBTENER_POR_ID, { id: Number(id) });
  if (!rows.length) throw createError(404, 'Categoría no encontrada');
  return mapRow(rows[0]);
};

exports.crear = async (datos) => {
  const nombre = datos.nombre?.trim();
  if (!nombre) throw createError(400, 'El nombre es obligatorio');

  const rows = await db.query(queries.CREAR, {
    nombre,
    descripcion: datos.descripcion?.trim() || '',
    activo: datos.activo !== false && datos.activo !== 'false',
  });

  const categoria = mapRow(rows[0]);
  logger.info('Categoría creada en BD', { id: categoria.id });
  return categoria;
};

exports.editar = async (id, datos) => {
  const actual = await exports.obtenerPorId(id);
  const nombre = datos.nombre !== undefined ? datos.nombre.trim() : actual.nombre;
  if (!nombre) throw createError(400, 'El nombre es obligatorio');

  const rows = await db.query(queries.EDITAR, {
    id: Number(id),
    nombre: nombre ?? actual.nombre,
    descripcion:
      datos.descripcion !== undefined ? datos.descripcion.trim() : actual.descripcion,
    activo:
      datos.activo !== undefined
        ? datos.activo !== false && datos.activo !== 'false'
        : actual.activo,
  });

  if (!rows.length) throw createError(404, 'Categoría no encontrada');

  return mapRow(rows[0]);
};

exports.eliminar = async (id) => {
  const rows = await db.query(queries.ELIMINAR, { id: Number(id) });
  if (!rows.length) throw createError(404, 'Categoría no encontrada');

  logger.info('Categoría dada de baja en BD', { id });
  return { id: rows[0].id };
};
