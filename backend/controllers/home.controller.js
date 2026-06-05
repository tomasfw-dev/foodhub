const menuService = require('../services/menu.service');
const logger = require('../utils/logger');

exports.getHome = async (req, res, next) => {
  try {
    const [featuredItems, promotions] = await Promise.all([
      menuService.getFeaturedItems(),
      menuService.getPromotions(),
    ]);

    res.render('layouts/main', {
      title: 'Inicio',
      page: 'home',
      bodyClass: 'page-home',
      contentPartial: '../pages/home',
      featuredItems,
      promotions,
    });
  } catch (err) {
    logger.error('Error al renderizar landing', err);
    next(err);
  }
};
