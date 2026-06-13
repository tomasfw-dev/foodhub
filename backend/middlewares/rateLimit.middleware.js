/**
 * Rate limiting — login, testimonios públicos y límite global suave.
 */
const { rateLimit } = require('express-rate-limit');
const config = require('../config');
const constants = require('../config/constants');
const logger = require('../utils/logger');

const STATIC_PATH_PREFIXES = ['/css/', '/js/', '/images/', '/uploads/'];
const STATIC_FILE_PATTERN = /\.(css|js|png|jpe?g|webp|gif|svg|ico|woff2?|map|txt|xml)$/i;

const LOGIN_LIMIT_MESSAGE =
  'Demasiados intentos de inicio de sesión. Esperá 15 minutos e intentá de nuevo.';

const TESTIMONIAL_LIMIT_MESSAGE =
  'Enviaste varios testimonios recientemente. Esperá unos minutos antes de volver a intentarlo.';

function shouldSkipGlobalRateLimit(req) {
  const path = req.path || '/';

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return false;
  }

  if (STATIC_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return true;
  }

  if (STATIC_FILE_PATTERN.test(path)) {
    return true;
  }

  return false;
}

function createLimiterOptions(overrides = {}) {
  return {
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    validate: {
      trustProxy: config.env === 'production',
    },
    ...overrides,
  };
}

exports.loginRateLimiter = rateLimit(
  createLimiterOptions({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    skipSuccessfulRequests: false,
    handler: (req, res) => {
      logger.warn('Rate limit login excedido', {
        ip: req.ip,
        path: req.originalUrl,
      });

      if (req.accepts('html')) {
        return res.redirect(
          `${constants.ROUTES.AUTH_LOGIN}?error=${encodeURIComponent(LOGIN_LIMIT_MESSAGE)}`
        );
      }

      return res.status(429).json({ error: LOGIN_LIMIT_MESSAGE });
    },
  })
);

exports.testimonialRateLimiter = rateLimit(
  createLimiterOptions({
    windowMs: 10 * 60 * 1000,
    limit: 3,
    handler: (req, res) => {
      logger.warn('Rate limit testimonios excedido', {
        ip: req.ip,
        path: req.originalUrl,
      });

      const redirectUrl = `${constants.ROUTES.HOME}?error=${encodeURIComponent(TESTIMONIAL_LIMIT_MESSAGE)}#dejar-testimonio`;

      if (req.accepts('html')) {
        return res.redirect(redirectUrl);
      }

      return res.status(429).json({ error: TESTIMONIAL_LIMIT_MESSAGE });
    },
  })
);

exports.globalRateLimiter = rateLimit(
  createLimiterOptions({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    skip: shouldSkipGlobalRateLimit,
    handler: (req, res) => {
      logger.warn('Rate limit global excedido', {
        ip: req.ip,
        method: req.method,
        path: req.originalUrl,
      });

      const message = 'Demasiadas solicitudes desde tu conexión. Intentá de nuevo en unos minutos.';

      if (req.accepts('html')) {
        return res.status(429).render('pages/errors/500', {
          title: 'Demasiadas solicitudes',
          message,
        });
      }

      return res.status(429).json({ error: message });
    },
  })
);
