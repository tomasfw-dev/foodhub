/**
 * Controlador de autenticación — Bendita-Comida
 */
const constants = require('../config/constants');
const authService = require('../services/auth.service');
const logger = require('../utils/logger');

const LOGIN_VIEW = 'layouts/auth';

function renderLogin(res, { title, error, email, success }) {
  return res.render(LOGIN_VIEW, {
    title,
    page: '',
    contentPartial: '../pages/auth/login',
    error: error || null,
    email: email || '',
    success: success || null,
    routes: constants.ROUTES,
  });
}

/**
 * GET /auth/login
 */
exports.showLogin = (req, res) => {
  if (req.session && req.session.adminId) {
    return res.redirect(constants.ADMIN_ROUTES.DASHBOARD);
  }

  const success = req.query.message ? String(req.query.message) : null;

  return renderLogin(res, {
    title: 'Iniciar sesión',
    success,
  });
};

/**
 * POST /auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await authService.authenticate(email, password);

    req.session.regenerate((regenerateErr) => {
      if (regenerateErr) {
        logger.error('Error al regenerar sesión', regenerateErr);
        return next(regenerateErr);
      }

      req.session.adminId = admin.id;
      req.session.adminNombre = admin.nombre;
      req.session.adminEmail = admin.email;

      req.session.save((saveErr) => {
        if (saveErr) {
          logger.error('Error al guardar sesión', saveErr);
          return next(saveErr);
        }

        const redirectTo = constants.ADMIN_ROUTES.DASHBOARD;
        logger.info('Sesión iniciada', { adminId: admin.id, redirectTo });
        return res.redirect(redirectTo);
      });
    });
  } catch (err) {
    if (err.name === 'AuthError') {
      return renderLogin(res, {
        title: 'Iniciar sesión',
        error: err.message,
        email: req.body.email,
      });
    }

    logger.error('Error en login', err);
    return next(err);
  }
};

/**
 * GET|POST /auth/logout — destruye la sesión
 */
exports.logout = (req, res, next) => {
  const adminId = req.session?.adminId;

  if (!req.session) {
    return res.redirect(constants.ROUTES.AUTH_LOGIN);
  }

  req.session.destroy((err) => {
    if (err) {
      logger.error('Error al cerrar sesión', { adminId, err });
      return next(err);
    }

    res.clearCookie('bendita.sid');
    logger.info('Sesión cerrada', { adminId });

    return res.redirect(
      constants.ROUTES.AUTH_LOGIN + '?message=' + encodeURIComponent('Sesión cerrada correctamente')
    );
  });
};
