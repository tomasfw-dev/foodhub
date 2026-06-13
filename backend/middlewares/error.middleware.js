const constants = require('../config/constants');
const {
  getHttpStatus,
  isServerError,
  getClientErrorMessage,
  getClientHtmlErrorMessage,
  logApplicationError,
} = require('../utils/error.helpers');
const { logCsrfFailure } = require('./csrf.middleware');

function redirectWithCsrfError(req, res, message) {
  const encoded = encodeURIComponent(message);

  if (req.originalUrl.startsWith('/auth')) {
    return res.redirect(`${constants.ROUTES.AUTH_LOGIN}?error=${encoded}`);
  }

  if (req.originalUrl.startsWith('/admin')) {
    const referer = req.get('Referer');
    if (referer && referer.includes('/admin')) {
      const separator = referer.includes('?') ? '&' : '?';
      return res.redirect(`${referer}${separator}error=${encoded}`);
    }
    return res.redirect(`${constants.ADMIN_ROUTES.DASHBOARD}?error=${encoded}`);
  }

  if (req.originalUrl.startsWith('/testimonios')) {
    return res.redirect(`${constants.ROUTES.HOME}?error=${encoded}#testimonios`);
  }

  return res.redirect(`${constants.ROUTES.HOME}?error=${encoded}`);
}

exports.errorHandler = (err, req, res, _next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    logCsrfFailure(req);

    const message =
      'Tu sesión de seguridad expiró o la solicitud no es válida. Volvé a intentarlo.';

    if (req.accepts('html')) {
      return redirectWithCsrfError(req, res, message);
    }

    return res.status(403).json({ error: message });
  }

  const status = getHttpStatus(err);

  if (isServerError(status)) {
    logApplicationError('Error no controlado', err, req);
  }

  if (req.accepts('html')) {
    return res.status(status).render('pages/errors/500', {
      title: 'Error',
      message: getClientHtmlErrorMessage(err),
    });
  }

  res.status(status).json({ error: getClientErrorMessage(err) });
};
