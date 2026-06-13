/**
 * Controlador admin — configuración del negocio.
 */
const configuracionService = require('../../services/admin/configuracion.service');
const themeHelpers = require('../../utils/theme.helpers');
const logger = require('../../utils/logger');

const ADMIN_CONFIG = '/admin/configuracion';

function redirectWithError(res, message) {
  return res.redirect(`${ADMIN_CONFIG}?error=${encodeURIComponent(message)}`);
}

exports.editPage = async (req, res, next) => {
  try {
    const configuracion = await configuracionService.obtener();

    res.render('layouts/admin', {
      title: 'Configuración del negocio',
      activeMenu: 'configuracion',
      contentPartial: '../admin/configuracion/edit',
      configuracion,
      hasCustomTheme: themeHelpers.hasCustomTheme(configuracion),
      flash: res.locals.flash,
    });
  } catch (err) {
    logger.error('Error al cargar configuración del negocio', err);
    next(err);
  }
};

exports.update = async (req, res) => {
  try {
    const logoFile = req.files?.logo?.[0] || null;
    const ogImageFile = req.files?.og_image?.[0] || null;

    await configuracionService.actualizar(req.body, { logoFile, ogImageFile });
    res.redirect(`${ADMIN_CONFIG}?success=${encodeURIComponent('Configuración actualizada correctamente')}`);
  } catch (err) {
    logger.error('Error al actualizar configuración', { error: err.message, status: err.status });
    const message = err.status === 400
      ? err.message
      : (err.message || 'Error al guardar la configuración');
    redirectWithError(res, message);
  }
};
