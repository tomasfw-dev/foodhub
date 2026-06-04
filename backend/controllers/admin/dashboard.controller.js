const dashboardService = require('../../services/admin/dashboard.service');
const logger = require('../../utils/logger');

exports.index = async (req, res, next) => {
  try {
    const stats = await dashboardService.getEstadisticas();

    res.render('layouts/admin', {
      title: 'Dashboard',
      activeMenu: 'dashboard',
      contentPartial: '../admin/dashboard',
      stats,
      flash: res.locals.flash,
    });
  } catch (err) {
    logger.error('Error al cargar dashboard administrativo', err);
    next(err);
  }
};
