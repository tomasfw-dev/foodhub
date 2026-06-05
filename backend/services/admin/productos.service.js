/**
 * Lógica de negocio para productos — SQL Server.
 */
const db = require('../../database/connection');
const queries = require('../../database/queries/productos.queries');
const logger = require('../../utils/logger');
const { resolveProductImageUrl } = require('../../utils/image.helpers');

function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function mapRow(row) {
  const imagen = row.imagen || null;
  return {
    id: row.id,
    categoriaId: row.categoria_id,
    nombre: row.nombre,
    descripcion: row.descripcion || '',
    precio: row.precio != null ? Number(row.precio) : 0,
    imagen,
    imagenUrl: resolveProductImageUrl(imagen),
    badge: null,
    activo: Boolean(row.activo),
  };
}

async function verificarCategoria(categoriaId) {
  const rows = await db.query(queries.VERIFICAR_CATEGORIA, {
    categoriaId: Number(categoriaId),
  });
  if (!rows.length) throw createError(404, 'Categoría no encontrada');
}

exports.listar = async (filtros = {}) => {
  logger.info('Listando productos desde BD');
  let resultado = (await db.query(queries.LISTAR)).map(mapRow);

  if (filtros.categoriaId) {
    resultado = resultado.filter(
      (p) => p.categoriaId === Number(filtros.categoriaId)
    );
  }

  if (filtros.soloActivos) {
    resultado = resultado.filter((p) => p.activo);
  }

  return resultado;
};

exports.obtenerPorId = async (id) => {
  const rows = await db.query(queries.OBTENER_POR_ID, { id: Number(id) });
  if (!rows.length) throw createError(404, 'Producto no encontrado');
  return mapRow(rows[0]);
};

exports.crear = async (datos) => {
  const nombre = datos.nombre?.trim();
  if (!nombre) throw createError(400, 'El nombre es obligatorio');
  if (datos.categoriaId == null) throw createError(400, 'La categoría es obligatoria');

  await verificarCategoria(datos.categoriaId);

  const rows = await db.query(queries.CREAR, {
    categoriaId: Number(datos.categoriaId),
    nombre,
    descripcion: datos.descripcion?.trim() || '',
    precio: datos.precio != null ? Number(datos.precio) : 0,
    imagen: datos.imagen?.trim() || null,
    activo: datos.activo !== false,
  });

  const producto = mapRow(rows[0]);
  logger.info('Producto creado en BD', { id: producto.id, imagen: producto.imagen });
  return producto;
};

exports.editar = async (id, datos) => {
  const actual = await exports.obtenerPorId(id);

  if (datos.categoriaId != null) {
    await verificarCategoria(datos.categoriaId);
  }

  const nombre = datos.nombre !== undefined ? datos.nombre.trim() : actual.nombre;
  if (!nombre) throw createError(400, 'El nombre es obligatorio');

  const rows = await db.query(queries.EDITAR, {
    id: Number(id),
    categoriaId:
      datos.categoriaId != null ? Number(datos.categoriaId) : actual.categoriaId,
    nombre,
    descripcion:
      datos.descripcion !== undefined ? datos.descripcion.trim() : actual.descripcion,
    precio: datos.precio !== undefined ? Number(datos.precio) : actual.precio,
    imagen: datos.imagen !== undefined ? datos.imagen?.trim() || null : actual.imagen,
    activo: datos.activo !== undefined ? Boolean(datos.activo) : actual.activo,
  });

  if (!rows.length) throw createError(404, 'Producto no encontrado');

  const producto = mapRow(rows[0]);
  logger.info('Producto actualizado en BD', { id: producto.id, imagen: producto.imagen });
  return producto;
};

exports.eliminar = async (id) => {
  const rows = await db.query(queries.ELIMINAR, { id: Number(id) });
  if (!rows.length) throw createError(404, 'Producto no encontrado');

  logger.info('Producto dado de baja en BD', { id });
  return { id: rows[0].id, imagen: rows[0].imagen };
};

exports.activar = async (id) => exports.editar(id, { activo: true });

exports.desactivar = async (id) => exports.editar(id, { activo: false });
