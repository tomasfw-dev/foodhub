/**
 * Servicio de menú público — datos desde SQL Server.
 */
const db = require('../database/connection');
const queries = require('../database/queries/menu.queries');
const logger = require('../utils/logger');
const config = require('../config');

const PLACEHOLDER_IMAGE = '/images/placeholder-food.svg';

/**
 * Mapea fila de Productos al formato de las vistas (food-card).
 */
function mapProductoParaVista(row) {
  return {
    id: row.id,
    categoriaId: row.categoria_id,
    name: row.nombre,
    description: row.descripcion || '',
    price: row.precio != null ? Number(row.precio) : null,
    image: row.imagen || PLACEHOLDER_IMAGE,
    badge: null,
  };
}

/**
 * Obtiene todas las categorías activas.
 */
exports.getCategoriasActivas = async () => {
  logger.info('Consultando categorías activas');
  const rows = await db.query(queries.CATEGORIAS_ACTIVAS);
  return rows;
};

/**
 * Obtiene todos los productos activos.
 */
exports.getProductosActivos = async () => {
  logger.info('Consultando productos activos');
  const rows = await db.query(queries.PRODUCTOS_ACTIVOS);
  return rows.map(mapProductoParaVista);
};

/**
 * Agrupa productos activos por categoría activa.
 */
exports.getMenuAgrupado = async () => {
  const [categorias, productos] = await Promise.all([
    exports.getCategoriasActivas(),
    exports.getProductosActivos(),
  ]);

  const menu = categorias.map((categoria) => ({
    id: categoria.id,
    nombre: categoria.nombre,
    descripcion: categoria.descripcion,
    productos: productos.filter((p) => p.categoriaId === categoria.id),
  }));

  logger.info('Menú agrupado generado', {
    categorias: menu.length,
    productos: productos.length,
  });

  return menu;
};

/**
 * Productos destacados para la landing.
 */
exports.getFeaturedItems = async (limite = config.menuFeaturedLimit) => {
  logger.info('Consultando productos destacados', { limite });

  const rows = await db.query(queries.PRODUCTOS_DESTACADOS, {
    limite,
  });

  return rows.map(mapProductoParaVista);
};

/**
 * Promociones (sin tabla en BD por ahora).
 */
exports.getPromotions = async () => {
  logger.warn('Promociones no configuradas en base de datos');
  return [];
};
