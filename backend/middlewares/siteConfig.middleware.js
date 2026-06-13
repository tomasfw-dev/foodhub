/**
 * Carga configuración del negocio desde BD en res.locals (sitio público y admin).
 */
const configuracionService = require('../services/admin/configuracion.service');
const whatsappService = require('../services/whatsapp.service');
const constants = require('../config/constants');
const config = require('../config');
const siteHelpers = require('../utils/site.helpers');
const seoHelpers = require('../utils/seo.helpers');
const themeHelpers = require('../utils/theme.helpers');
const logger = require('../utils/logger');

exports.loadSiteConfig = async (req, res, next) => {
  try {
    const configRow = await configuracionService.obtener();
    const locals = configuracionService.toViewLocals(configRow);

    res.locals.appName = locals.appName;
    res.locals.site = locals.site;
    res.locals.whatsapp = locals.whatsapp;
    res.locals.whatsappUrl = whatsappService.buildMessageUrl(
      locals.whatsapp.defaultMessage,
      locals.whatsapp.phone
    );
    res.locals.seoBase = seoHelpers.buildSeoBase(configRow, config.siteUrl);
    res.locals.themeCss = themeHelpers.buildThemeStyleBlock(configRow);
    res.locals.hasCustomTheme = themeHelpers.hasCustomTheme(configRow);

    return next();
  } catch (err) {
    logger.warn('Usando configuración por defecto (constants)', { error: err.message });

    const fallback = siteHelpers.toViewLocals(null);
    res.locals.appName = fallback.appName;
    res.locals.site = fallback.site;
    res.locals.whatsapp = fallback.whatsapp;
    res.locals.whatsappUrl = whatsappService.getDefaultUrl();
    res.locals.seoBase = seoHelpers.buildSeoBase(null, config.siteUrl);
    res.locals.themeCss = '';
    res.locals.hasCustomTheme = false;

    return next();
  }
};
