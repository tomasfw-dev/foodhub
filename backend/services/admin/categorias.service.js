/**
 * Lógica de negocio para categorías — SQL Server.
 */
const db = require('../../database/connection');
const queries = require('../../database/queries/categorias.queries');
const logger = require('../../utils/logger');
const { parseOrden, mapOrden } = require('../../utils/orden.helpers');

const CATEGORIA_CON_PRODUCTOS_ACTIVOS =
  'No se puede eliminar esta categoría porque tiene productos activos. Primero mové o desactivá esos productos.';

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
    orden: mapOrden(row.orden),
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

  let orden = null;
  try {
    orden = parseOrden(datos.orden);
  } catch (err) {
    throw createError(err.status || 400, err.message);
  }

  const rows = await db.query(queries.CREAR, {
    nombre,
    descripcion: datos.descripcion?.trim() || '',
    activo: datos.activo !== false && datos.activo !== 'false',
    orden,
  });

  const categoria = mapRow(rows[0]);
  logger.info('Categoría creada en BD', { id: categoria.id, orden: categoria.orden });
  return categoria;
};

exports.editar = async (id, datos) => {
  const actual = await exports.obtenerPorId(id);
  const nombre = datos.nombre !== undefined ? datos.nombre.trim() : actual.nombre;
  if (!nombre) throw createError(400, 'El nombre es obligatorio');

  let orden = actual.orden;
  if (datos.orden !== undefined) {
    try {
      orden = parseOrden(datos.orden);
    } catch (err) {
      throw createError(err.status || 400, err.message);
    }
  }

  const rows = await db.query(queries.EDITAR, {
    id: Number(id),
    nombre: nombre ?? actual.nombre,
    descripcion:
      datos.descripcion !== undefined ? datos.descripcion.trim() : actual.descripcion,
    activo:
      datos.activo !== undefined
        ? datos.activo !== false && datos.activo !== 'false'
        : actual.activo,
    orden,
  });

  if (!rows.length) throw createError(404, 'Categoría no encontrada');

  const categoria = mapRow(rows[0]);
  logger.info('Categoría actualizada en BD', { id: categoria.id, orden: categoria.orden });
  return categoria;
};

exports.eliminar = async (id) => {
  const categoriaId = Number(id);
  const activos = await db.query(queries.CONTAR_PRODUCTOS_ACTIVOS, { categoriaId });
  const totalActivos = Number(activos[0]?.total || 0);

  if (totalActivos > 0) {
    throw createError(400, CATEGORIA_CON_PRODUCTOS_ACTIVOS);
  }

  const rows = await db.query(queries.ELIMINAR, { id: categoriaId });
  if (!rows.length) throw createError(404, 'Categoría no encontrada');

  logger.info('Categoría dada de baja en BD', { id: categoriaId });
  return { id: rows[0].id };
};
