/**
 * Controlador admin — perfil de administradora.
 */
const perfilService = require('../../services/admin/perfil.service');
const { resolveErrorForClient } = require('../../utils/error.helpers');
const logger = require('../../utils/logger');
const constants = require('../../config/constants');

const ADMIN_PERFIL = constants.ADMIN_ROUTES.PERFIL;

function redirectWithError(res, message) {
  return res.redirect(`${ADMIN_PERFIL}?error=${encodeURIComponent(message)}`);
}

function redirectWithSuccess(res, message) {
  return res.redirect(`${ADMIN_PERFIL}?success=${encodeURIComponent(message)}`);
}

function syncSession(req, admin, sesionVersion) {
  req.session.adminId = admin.id;
  req.session.adminNombre = admin.nombre;
  req.session.adminEmail = admin.email;
  if (sesionVersion !== undefined) {
    req.session.sesionVersion = sesionVersion;
  }
}

exports.indexPage = async (req, res, next) => {
  try {
    const perfil = await perfilService.obtenerPerfil(req.admin.id);

    res.render('layouts/admin', {
      title: 'Mi perfil',
      activeMenu: 'perfil',
      contentPartial: '../admin/perfil/index',
      perfil,
      flash: res.locals.flash,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateDatos = async (req, res) => {
  try {
    const perfil = await perfilService.actualizarDatos(req.admin.id, req.body);

    req.session.adminNombre = perfil.nombre;
    req.session.adminEmail = perfil.email;

    redirectWithSuccess(res, 'Datos del perfil actualizados correctamente.');
  } catch (err) {
    redirectWithError(
      res,
      resolveErrorForClient(err, {
        req,
        context: 'Error al actualizar perfil',
        fallback: 'Error al guardar los datos del perfil',
      })
    );
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const result = await perfilService.cambiarPassword(req.admin.id, req.body);

    req.session.regenerate((regenerateErr) => {
      if (regenerateErr) {
        logger.error('Error al regenerar sesión tras cambio de contraseña', regenerateErr);
        return next(regenerateErr);
      }

      syncSession(req, result, result.sesion_version);

      req.session.save((saveErr) => {
        if (saveErr) {
          logger.error('Error al guardar sesión tras cambio de contraseña', saveErr);
          return next(saveErr);
        }

        redirectWithSuccess(
          res,
          'Contraseña actualizada. Las demás sesiones fueron cerradas por seguridad.'
        );
      });
    });
  } catch (err) {
    redirectWithError(
      res,
      resolveErrorForClient(err, {
        req,
        context: 'Error al cambiar contraseña',
        fallback: 'Error al cambiar la contraseña',
      })
    );
  }
};
