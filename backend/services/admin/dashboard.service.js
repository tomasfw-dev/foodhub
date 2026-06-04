/**
 * Estadísticas del panel administrativo desde SQL Server.
 */
const db = require('../../database/connection');
const queries = require('../../database/queries/dashboard.queries');
const logger = require('../../utils/logger');

/**
 * @returns {Promise<{
 *   totalCategorias: number,
 *   totalProductos: number,
 *   productosActivos: number,
 *   productosInactivos: number
 * }>}
 */
exports.getEstadisticas = async () => {
  logger.info('Consultando estadísticas del dashboard');

  const rows = await db.query(queries.ESTADISTICAS);
  const row = rows[0] || {};

  const stats = {
    totalCategorias: Number(row.total_categorias) || 0,
    totalProductos: Number(row.total_productos) || 0,
    productosActivos: Number(row.productos_activos) || 0,
    productosInactivos: Number(row.productos_inactivos) || 0,
  };

  logger.info('Estadísticas del dashboard obtenidas', stats);

  return stats;
};
