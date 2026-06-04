const menuService = require('../services/menu.service');
const logger = require('../utils/logger');

/**
 * Página pública del menú (HTML).
 */
exports.getMenu = async (req, res, next) => {
  try {
    const menuAgrupado = await menuService.getMenuAgrupado();
    const totalProductos = menuAgrupado.reduce(
      (sum, cat) => sum + cat.productos.length,
      0
    );

    res.render('layouts/main', {
      title: 'Menú',
      page: 'menu',
      contentPartial: '../pages/menu',
      menuAgrupado,
      menuVacio: totalProductos === 0,
    });
  } catch (err) {
    logger.error('Error al renderizar menú público', err);
    next(err);
  }
};

/**
 * API JSON del menú agrupado.
 */
exports.getMenuApi = async (req, res, next) => {
  try {
    const menuAgrupado = await menuService.getMenuAgrupado();
    res.json({ data: menuAgrupado });
  } catch (err) {
    logger.error('Error en API de menú', err);
    next(err);
  }
};
