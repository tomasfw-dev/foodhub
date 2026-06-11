const informacionUtilService = require('../services/informacion-util.service');
const seoHelpers = require('../utils/seo.helpers');
const logger = require('../utils/logger');

exports.getInformacionUtil = async (req, res, next) => {
  try {
    const contenido = await informacionUtilService.obtenerContenidoPublico();

    const seo = seoHelpers.buildPageSeo(res.locals.seoBase, {
      title: 'Información útil',
      path: '/informacion-util',
      description: `Zonas de entrega, formas de pago y preguntas frecuentes de ${res.locals.seoBase.siteName}.`,
      keywords: `${res.locals.seoBase.defaultKeywords}, envíos, pagos, faq`,
    });

    res.render('layouts/main', {
      title: 'Información útil',
      page: 'informacion-util',
      contentPartial: '../pages/informacion-util',
      zonasEntrega: contenido.zonasEntrega,
      formasPago: contenido.formasPago,
      preguntasFrecuentes: contenido.preguntasFrecuentes,
      tieneContenido: contenido.tieneContenido,
      seo,
    });
  } catch (err) {
    logger.error('Error al renderizar información útil', err);
    next(err);
  }
};
