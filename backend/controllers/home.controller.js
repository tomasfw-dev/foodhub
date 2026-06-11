const menuService = require('../services/menu.service');
const heroService = require('../services/hero.service');
const heroHelpers = require('../utils/hero.helpers');
const seoHelpers = require('../utils/seo.helpers');
const logger = require('../utils/logger');

exports.getHome = async (req, res, next) => {
  try {
    const heroContext = {
      appName: res.locals.appName,
      whatsappPhone: res.locals.whatsapp?.phone,
      whatsappUrl: res.locals.whatsappUrl,
    };

    const [featuredItems, promotions, heroActivo] = await Promise.all([
      menuService.getFeaturedItems(),
      menuService.getPromotions(),
      heroService.obtenerActivo({ context: heroContext }).catch((err) => {
        logger.warn('Hero no disponible, usando fallback', { error: err.message });
        return null;
      }),
    ]);

    const hero =
      heroActivo ||
      heroHelpers.buildFallback(res.locals.site, res.locals.whatsapp, res.locals.whatsappUrl);

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
      hero,
      seo,
    });
  } catch (err) {
    logger.error('Error al renderizar landing', err);
    next(err);
  }
};
