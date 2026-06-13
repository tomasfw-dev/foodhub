/**
 * Protección CSRF basada en sesión (compatible con express-session).
 */
const Tokens = require('csrf');
const logger = require('../utils/logger');

const tokens = new Tokens();
const CSRF_SESSION_KEY = 'csrfSecret';
const CSRF_FIELD = '_csrf';
const CSRF_HEADER = 'x-csrf-token';

function ensureSecret(req) {
  if (!req.session) {
    return null;
  }

  if (!req.session[CSRF_SESSION_KEY]) {
    req.session[CSRF_SESSION_KEY] = tokens.secretSync();
  }

  return req.session[CSRF_SESSION_KEY];
}

function readSubmittedToken(req) {
  const headerToken = req.headers[CSRF_HEADER] || req.headers['csrf-token'];
  if (headerToken) {
    return String(headerToken);
  }

  if (req.body && req.body[CSRF_FIELD]) {
    return String(req.body[CSRF_FIELD]);
  }

  return '';
}

function isMutatingMethod(method) {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
}

function isMultipartRequest(req) {
  const contentType = req.headers['content-type'] || '';
  return contentType.includes('multipart/form-data');
}

exports.CSRF_FIELD = CSRF_FIELD;
exports.CSRF_HEADER = CSRF_HEADER;

exports.createCsrfError = () => {
  const err = new Error(
    'La solicitud no pudo completarse por un token de seguridad inválido o expirado.'
  );
  err.status = 403;
  err.code = 'EBADCSRFTOKEN';
  return err;
};

/**
 * Genera token y lo expone en res.locals.csrfToken en cada request.
 */
exports.attachCsrfToken = (req, res, next) => {
  const secret = ensureSecret(req);

  if (secret) {
    res.locals.csrfToken = tokens.create(secret);
    req.csrfToken = () => tokens.create(secret);
  } else {
    res.locals.csrfToken = '';
    req.csrfToken = () => '';
  }

  return next();
};

/**
 * Verifica token CSRF (usar después de multer en multipart).
 */
exports.verifyCsrf = (req, res, next) => {
  if (!isMutatingMethod(req.method)) {
    return next();
  }

  const secret = ensureSecret(req);
  if (!secret) {
    return next(exports.createCsrfError());
  }

  const token = readSubmittedToken(req);
  if (!token || !tokens.verify(secret, token)) {
    return next(exports.createCsrfError());
  }

  return next();
};

/**
 * Verifica CSRF en requests mutantes excepto multipart (deferir a verifyCsrf post-multer).
 */
exports.verifyCsrfUnlessMultipart = (req, res, next) => {
  if (!isMutatingMethod(req.method)) {
    return next();
  }

  if (isMultipartRequest(req)) {
    return next();
  }

  return exports.verifyCsrf(req, res, next);
};

exports.logCsrfFailure = (req) => {
  logger.warn('Intento CSRF bloqueado', {
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });
};
