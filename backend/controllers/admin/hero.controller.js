/**
 * Controlador admin — hero de la landing.
 */
const heroService = require('../../services/hero.service');
const logger = require('../../utils/logger');

const ADMIN_HERO = '/admin/hero';

function redirectWithError(res, message) {
  return res.redirect(`${ADMIN_HERO}?error=${encodeURIComponent(message)}`);
}

exports.editPage = async (req, res, next) => {
  try {
    const hero = await heroService.obtener();

    res.render('layouts/admin', {
      title: 'Hero de la home',
      activeMenu: 'hero',
      contentPartial: '../admin/hero/edit',
      hero,
      flash: res.locals.flash,
    });
  } catch (err) {
    logger.error('Error al cargar hero de la home', err);
    next(err);
  }
};

exports.update = async (req, res) => {
  try {
    await heroService.actualizar(req.body, req.file);
    res.redirect(`${ADMIN_HERO}?success=${encodeURIComponent('Hero actualizado correctamente')}`);
  } catch (err) {
    logger.error('Error al actualizar hero', err);
    redirectWithError(res, err.message || 'Error al guardar el hero');
  }
};
