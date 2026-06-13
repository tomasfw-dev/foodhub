/**
 * Controlador admin — hero de la landing.
 */
const heroService = require('../../services/hero.service');
const { resolveErrorForClient } = require('../../utils/error.helpers');

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
    next(err);
  }
};

exports.update = async (req, res) => {
  try {
    await heroService.actualizar(req.body, req.file);
    res.redirect(`${ADMIN_HERO}?success=${encodeURIComponent('Hero actualizado correctamente')}`);
  } catch (err) {
    redirectWithError(
      res,
      resolveErrorForClient(err, {
        req,
        context: 'Error al actualizar hero',
        fallback: 'Error al guardar el hero',
      })
    );
  }
};
