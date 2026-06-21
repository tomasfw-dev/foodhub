/**
 * Middlewares de autenticación y autorización — FoodHub
 */
const constants = require('../config/constants');
const authService = require('../services/auth.service');
const logger = require('../utils/logger');

/**
 * Requiere sesión autenticada. Protege rutas administrativas.
 */
exports.requireAuth = async (req, res, next) => {
  try {
    const adminId = req.session?.adminId;

    if (!adminId) {
      logger.warn('Acceso no autorizado al panel', { path: req.originalUrl, ip: req.ip });

      if (req.accepts('html')) {
        const loginUrl =
          constants.ROUTES.AUTH_LOGIN +
          '?error=' +
          encodeURIComponent('Debés iniciar sesión para acceder al panel.');

        return res.redirect(loginUrl);
      }

      return res.status(401).json({ error: 'No autenticado' });
    }

    const admin = await authService.findAdminById(adminId);

    if (!admin) {
      logger.warn('Sesión inválida o administrador inactivo', { adminId });

      return req.session.destroy(() => {
        if (req.accepts('html')) {
          return res.redirect(
            constants.ROUTES.AUTH_LOGIN +
              '?error=' +
              encodeURIComponent('Tu sesión expiró. Iniciá sesión nuevamente.')
          );
        }

        return res.status(401).json({ error: 'Sesión inválida' });
      });
    }

    const sesionVersionDb = admin.sesion_version ?? 1;
    const sesionVersionSession = req.session.sesionVersion ?? 1;

    if (sesionVersionSession !== sesionVersionDb) {
      logger.warn('Sesión invalidada por cambio de contraseña', {
        adminId,
        sesionVersionSession,
        sesionVersionDb,
      });

      return req.session.destroy(() => {
        if (req.accepts('html')) {
          return res.redirect(
            constants.ROUTES.AUTH_LOGIN +
              '?error=' +
              encodeURIComponent('Tu sesión fue cerrada por un cambio de contraseña. Iniciá sesión nuevamente.')
          );
        }

        return res.status(401).json({ error: 'Sesión invalidada' });
      });
    }

    req.admin = {
      id: admin.id,
      nombre: admin.nombre,
      email: admin.email,
    };

    res.locals.adminUser = req.admin;

    return next();
  } catch (err) {
    logger.error('Error en middleware requireAuth', err);
    return next(err);
  }
};

/**
 * Redirige al dashboard si ya hay sesión activa (página de login).
 */
exports.redirectIfAuthenticated = (req, res, next) => {
  if (req.session?.adminId) {
    return res.redirect(constants.ADMIN_ROUTES.DASHBOARD);
  }

  return next();
};
