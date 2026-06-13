/**
 * Marca de plataforma — solo rutas /admin y /auth.
 */
const constants = require('../config/constants');

exports.loadPlatformBrand = (_req, res, next) => {
  res.locals.platformName = constants.PLATFORM_NAME;
  res.locals.platformLogoUrl = constants.PLATFORM_LOGO_URL;
  next();
};
