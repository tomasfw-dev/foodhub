/**
 * Helmet — headers de seguridad HTTP (FoodHub)
 *
 * Excepciones CSP documentadas en docs/security-headers.md
 */
const helmet = require('helmet');

const CDN = 'https://cdn.jsdelivr.net';
const GOOGLE_FONTS_CSS = 'https://fonts.googleapis.com';
const GOOGLE_FONTS_FILES = 'https://fonts.gstatic.com';

/**
 * Directivas CSP compartidas (público + admin + auth).
 * @param {boolean} isProduction
 * @returns {Record<string, string[]|null>}
 */
function buildCspDirectives(isProduction) {
  const directives = {
    defaultSrc: ["'self'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    objectSrc: ["'none'"],
    scriptSrc: [
      "'self'",
      CDN,
      // configuracion-form.ejs — sincronización color picker ↔ hex
      "'unsafe-inline'",
    ],
    scriptSrcAttr: [
      // Fallback de imágenes (onerror) y confirm() en formularios admin (onsubmit)
      "'unsafe-inline'",
    ],
    styleSrc: [
      "'self'",
      GOOGLE_FONTS_CSS,
      CDN,
      // theme-vars.ejs — variables CSS del tema del negocio
      // Estilos inline puntuales en previews admin (max-height, object-fit)
      "'unsafe-inline'",
    ],
    fontSrc: ["'self'", GOOGLE_FONTS_FILES, CDN, 'data:'],
    imgSrc: [
      "'self'",
      'data:',
      // Logos/imágenes externas configuradas en productos (URL https)
      'https:',
    ],
    connectSrc: ["'self'"],
    manifestSrc: ["'self'"],
    mediaSrc: ["'self'"],
    workerSrc: ["'none'"],
  };

  if (isProduction) {
    directives.upgradeInsecureRequests = [];
  } else {
    // Helmet mergea defaults que incluyen upgrade-insecure-requests
    directives.upgradeInsecureRequests = null;
  }

  return directives;
}

/**
 * @param {boolean} [isProduction=false]
 * @returns {import('express').RequestHandler}
 */
module.exports = function createHelmetMiddleware(isProduction = false) {
  return helmet({
    contentSecurityPolicy: {
      directives: buildCspDirectives(isProduction),
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-site' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    frameguard: { action: 'deny' },
    xContentTypeOptions: true,
    xDnsPrefetchControl: { allow: false },
    xDownloadOptions: true,
    xPermittedCrossDomainPolicies: { permittedPolicies: 'none' },
    strictTransportSecurity: isProduction
      ? {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: false,
        }
      : false,
  });
};

module.exports.buildCspDirectives = buildCspDirectives;
