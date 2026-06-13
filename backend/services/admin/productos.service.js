/**
 * Lógica de negocio para productos — SQL Server.
 */
const db = require('../../database/connection');
const queries = require('../../database/queries/productos.queries');
const logger = require('../../utils/logger');
const config = require('../../config');
const { resolveProductImageUrl } = require('../../utils/image.helpers');
const { parseOrden, mapOrden } = require('../../utils/orden.helpers');
const { parsePrecio } = require('../../utils/price.helpers');
const uploadConfig = require('../../config/upload.config');
const { validateStoredImagePath } = require('../../utils/upload.helpers');

const MAX_DESTACADOS = config.menuFeaturedLimit;

function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function sanitizeImagenForWrite(imagen, requiredPrefix) {
  if (imagen === undefined) return undefined;
  if (imagen === null || !String(imagen).trim()) return null;

  const trimmed = String(imagen).trim();
  if (/^https?:\/\//i.test(trimmed)) {
    throw createError(400, 'La imagen no puede ser una URL externa.');
  }

  const result = validateStoredImagePath(trimmed, { requiredPrefix });
  if (!result.ok) throw createError(400, result.message);
  return result.url;
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
    destacado: Boolean(row.destacado),
    orden: mapOrden(row.orden),
  };
}

async function verificarCategoria(categoriaId) {
  const rows = await db.query(queries.VERIFICAR_CATEGORIA, {
    categoriaId: Number(categoriaId),
  });
  if (!rows.length) throw createError(404, 'Categoría no encontrada');
}

async function contarDestacados() {
  const rows = await db.query(queries.CONTAR_DESTACADOS);
  return Number(rows[0]?.total || 0);
}

async function validarLimiteDestacados(destacado, productoId = null) {
  if (!destacado) return;

  const total = await contarDestacados();
  const actual = productoId ? await exports.obtenerPorId(productoId) : null;
  const yaDestacado = actual?.destacado;

  if (!yaDestacado && total >= MAX_DESTACADOS) {
    throw createError(
      400,
      `Solo podés tener hasta ${MAX_DESTACADOS} productos destacados en la home.`
    );
  }
}

exports.getMaxDestacados = () => MAX_DESTACADOS;

exports.contarDestacados = contarDestacados;

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

  if (filtros.soloDestacados) {
    resultado = resultado.filter((p) => p.destacado);
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

  const destacado = datos.destacado === true || datos.destacado === 'true' || datos.destacado === 'on';
  await validarLimiteDestacados(destacado);
  await verificarCategoria(datos.categoriaId);

  let orden = null;
  try {
    orden = parseOrden(datos.orden);
  } catch (err) {
    throw createError(err.status || 400, err.message);
  }

  let precio = 0;
  try {
    precio = parsePrecio(datos.precio);
  } catch (err) {
    throw createError(err.status || 400, err.message);
  }

  const rows = await db.query(queries.CREAR, {
    categoriaId: Number(datos.categoriaId),
    nombre,
    descripcion: datos.descripcion?.trim() || '',
    precio,
    imagen: sanitizeImagenForWrite(datos.imagen, `${uploadConfig.PUBLIC_PREFIX}/`) ?? null,
    activo: datos.activo !== false && datos.activo !== 'false',
    destacado,
    orden,
  });

  const producto = mapRow(rows[0]);
  logger.info('Producto creado en BD', {
    id: producto.id,
    imagen: producto.imagen,
    destacado: producto.destacado,
    orden: producto.orden,
  });
  return producto;
};

exports.editar = async (id, datos) => {
  const actual = await exports.obtenerPorId(id);

  if (datos.categoriaId != null) {
    await verificarCategoria(datos.categoriaId);
  }

  const nombre = datos.nombre !== undefined ? datos.nombre.trim() : actual.nombre;
  if (!nombre) throw createError(400, 'El nombre es obligatorio');

  let destacado = actual.destacado;
  if (datos.destacado !== undefined) {
    destacado =
      datos.destacado === true ||
      datos.destacado === 'true' ||
      datos.destacado === 'on';
  }

  await validarLimiteDestacados(destacado, id);

  let orden = actual.orden;
  if (datos.orden !== undefined) {
    try {
      orden = parseOrden(datos.orden);
    } catch (err) {
      throw createError(err.status || 400, err.message);
    }
  }

  let precio = actual.precio;
  if (datos.precio !== undefined) {
    try {
      precio = parsePrecio(datos.precio);
    } catch (err) {
      throw createError(err.status || 400, err.message);
    }
  }

  const rows = await db.query(queries.EDITAR, {
    id: Number(id),
    categoriaId:
      datos.categoriaId != null ? Number(datos.categoriaId) : actual.categoriaId,
    nombre,
    descripcion:
      datos.descripcion !== undefined ? datos.descripcion.trim() : actual.descripcion,
    precio,
    imagen:
      datos.imagen !== undefined
        ? sanitizeImagenForWrite(datos.imagen, `${uploadConfig.PUBLIC_PREFIX}/`)
        : actual.imagen,
    activo: datos.activo !== undefined ? Boolean(datos.activo) : actual.activo,
    destacado,
    orden,
  });

  if (!rows.length) throw createError(404, 'Producto no encontrado');

  const producto = mapRow(rows[0]);
  logger.info('Producto actualizado en BD', {
    id: producto.id,
    imagen: producto.imagen,
    destacado: producto.destacado,
    orden: producto.orden,
  });
  return producto;
};

exports.actualizarDestacado = async (id, destacado) => {
  await validarLimiteDestacados(destacado, id);

  const rows = await db.query(queries.ACTUALIZAR_DESTACADO, {
    id: Number(id),
    destacado: Boolean(destacado),
  });

  if (!rows.length) throw createError(404, 'Producto no encontrado');

  const producto = mapRow(rows[0]);
  logger.info('Destacado de producto actualizado', {
    id: producto.id,
    destacado: producto.destacado,
  });

  return producto;
};

exports.toggleDestacado = async (id) => {
  const actual = await exports.obtenerPorId(id);
  return exports.actualizarDestacado(id, !actual.destacado);
};

exports.actualizarActivo = async (id, activo) => {
  const rows = await db.query(queries.ACTUALIZAR_ACTIVO, {
    id: Number(id),
    activo: Boolean(activo),
  });

  if (!rows.length) throw createError(404, 'Producto no encontrado');

  const producto = mapRow(rows[0]);
  logger.info('Estado activo de producto actualizado', {
    id: producto.id,
    activo: producto.activo,
  });

  return producto;
};

exports.eliminar = async (id) => {
  const rows = await db.query(queries.ELIMINAR, { id: Number(id) });
  if (!rows.length) throw createError(404, 'Producto no encontrado');

  logger.info('Producto dado de baja en BD', { id });
  return { id: rows[0].id, imagen: rows[0].imagen };
};

exports.activar = async (id) => exports.actualizarActivo(id, true);

exports.desactivar = async (id) => exports.actualizarActivo(id, false);
