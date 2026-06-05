/**
 * Carga configuración del negocio desde BD en res.locals (sitio público y admin).
 */
const configuracionService = require('../services/admin/configuracion.service');
const whatsappService = require('../services/whatsapp.service');
const constants = require('../config/constants');
const siteHelpers = require('../utils/site.helpers');
const logger = require('../utils/logger');

exports.loadSiteConfig = async (req, res, next) => {
  try {
    const config = await configuracionService.obtener();
    const locals = configuracionService.toViewLocals(config);

    res.locals.appName = locals.appName;
    res.locals.site = locals.site;
    res.locals.whatsapp = locals.whatsapp;
    res.locals.whatsappUrl = whatsappService.buildMessageUrl(
      locals.whatsapp.defaultMessage,
      locals.whatsapp.phone
    );

    return next();
  } catch (err) {
    logger.warn('Usando configuración por defecto (constants)', { error: err.message });

    const fallback = siteHelpers.toViewLocals(null);
    res.locals.appName = fallback.appName;
    res.locals.site = fallback.site;
    res.locals.whatsapp = fallback.whatsapp;
    res.locals.whatsappUrl = whatsappService.getDefaultUrl();

    return next();
  }
};
