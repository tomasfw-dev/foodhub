const menuService = require('../services/menu.service');
const seoHelpers = require('../utils/seo.helpers');
const logger = require('../utils/logger');

exports.getHome = async (req, res, next) => {
  try {
    const [featuredItems, promotions] = await Promise.all([
      menuService.getFeaturedItems(),
      menuService.getPromotions(),
    ]);

    const seo = seoHelpers.buildPageSeo(res.locals.seoBase, {
      useDefaultTitle: true,
      path: '/',
      description: promotions.length
        ? `${res.locals.seoBase.defaultDescription} Promociones y recomendaciones disponibles.`
        : undefined,
    });

    res.render('layouts/main', {
      title: 'Inicio',
      page: 'home',
      bodyClass: 'page-home',
      contentPartial: '../pages/home',
      featuredItems,
      promotions,
      seo,
    });
  } catch (err) {
    logger.error('Error al renderizar landing', err);
    next(err);
  }
};
