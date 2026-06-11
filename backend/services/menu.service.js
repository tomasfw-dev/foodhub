/**
 * Servicio de menú público — datos desde SQL Server.
 */
const db = require('../database/connection');
const queries = require('../database/queries/menu.queries');
const promocionesQueries = require('../database/queries/promociones.queries');
const logger = require('../utils/logger');
const config = require('../config');
const { resolveProductImageUrl, resolvePromocionImageUrl } = require('../utils/image.helpers');

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
    image: resolveProductImageUrl(row.imagen),
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
 * Productos destacados para la landing (marcados + activos, máx. 6).
 */
exports.getFeaturedItems = async (limite = config.menuFeaturedLimit) => {
  logger.info('Consultando productos destacados activos', { limite });

  const rows = await db.query(queries.PRODUCTOS_DESTACADOS, {
    limite,
  });

  return rows.map((row) => ({
    ...mapProductoParaVista(row),
    badge: 'Recomendado',
  }));
};

/**
 * Promociones activas y vigentes para la landing.
 */
exports.getPromotions = async () => {
  logger.info('Consultando promociones vigentes');

  const rows = await db.query(promocionesQueries.ACTIVAS_VIGENTES);

  return rows.map((row) => {
    const precio = row.precio_promocional != null ? Number(row.precio_promocional) : null;

    return {
      id: row.id,
      title: row.nombre,
      description: row.descripcion || '',
      image: resolvePromocionImageUrl(row.imagen),
      price: precio,
      tag: row.destacado ? 'Destacada' : 'Promo',
      destacado: Boolean(row.destacado),
    };
  });
};
