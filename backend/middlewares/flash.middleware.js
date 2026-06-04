/**
 * Expone mensajes flash desde query string (?success= / ?error=).
 */
exports.flashMiddleware = (req, res, next) => {
  res.locals.flash = null;

  if (req.query.success) {
    res.locals.flash = { type: 'success', message: req.query.success };
  } else if (req.query.error) {
    res.locals.flash = { type: 'danger', message: req.query.error };
  }

  next();
};
