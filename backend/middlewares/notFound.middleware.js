const constants = require('../config/constants');

exports.notFoundHandler = (req, res) => {
  res.status(404).render('pages/errors/404', {
    title: 'Página no encontrada',
    path: req.originalUrl,
    routes: constants.ROUTES,
    page: '',
  });
};
