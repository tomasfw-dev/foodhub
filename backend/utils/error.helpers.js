/**
 * Mensajes y respuestas de error seguros para el cliente (dev vs producción).
 */
const config = require('../config');
const logger = require('./logger');

const GENERIC_HTML_MESSAGE =
  'Ocurrió un error. Por favor, intentá de nuevo más tarde.';
const GENERIC_JSON_MESSAGE = 'Error interno del servidor';

function getHttpStatus(err) {
  return err.status || err.statusCode || 500;
}

function isServerError(status) {
  return status >= 500;
}

function isDevelopment() {
  return config.env === 'development';
}

/**
 * Mensaje seguro para JSON, HTML o query string (?error=).
 * Errores 4xx: mensaje original. Errores 5xx en producción: genérico.
 */
function getClientErrorMessage(err, { fallback } = {}) {
  const status = getHttpStatus(err);
  const message = err.message || fallback || GENERIC_JSON_MESSAGE;

  if (isServerError(status) && !isDevelopment()) {
    return GENERIC_JSON_MESSAGE;
  }

  return message;
}

function getClientHtmlErrorMessage(err) {
  const status = getHttpStatus(err);

  if (isServerError(status) && !isDevelopment()) {
    return GENERIC_HTML_MESSAGE;
  }

  return err.message || GENERIC_HTML_MESSAGE;
}

function logApplicationError(context, err, req) {
  const status = getHttpStatus(err);
  const meta = {
    status,
    message: err.message,
    stack: err.stack,
    name: err.name,
    code: err.code,
    path: req?.originalUrl,
    method: req?.method,
  };

  logger.error(context, meta);
}

/**
 * Resuelve mensaje para el cliente y registra errores 5xx internamente.
 */
function resolveErrorForClient(err, { context, req, fallback, log = true } = {}) {
  const status = getHttpStatus(err);

  if (log && isServerError(status)) {
    logApplicationError(context || 'Error en solicitud', err, req);
  }

  return getClientErrorMessage(err, { fallback });
}

function sendJsonError(res, err, { context, req, log = true } = {}) {
  const status = getHttpStatus(err);

  if (log && isServerError(status)) {
    logApplicationError(context || 'Error en respuesta JSON', err, req);
  }

  return res.status(status).json({
    error: getClientErrorMessage(err),
  });
}

module.exports = {
  GENERIC_HTML_MESSAGE,
  GENERIC_JSON_MESSAGE,
  getHttpStatus,
  isServerError,
  isDevelopment,
  getClientErrorMessage,
  getClientHtmlErrorMessage,
  logApplicationError,
  resolveErrorForClient,
  sendJsonError,
};
