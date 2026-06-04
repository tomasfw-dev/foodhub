exports.errorHandler = (err, req, res, _next) => {
  console.error(err);

  const status = err.status || 500;

  if (req.accepts('html')) {
    return res.status(status).render('pages/errors/500', {
      title: 'Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Ocurrió un error.',
    });
  }

  res.status(status).json({ error: err.message || 'Error interno del servidor' });
};
