/**
 * Controlador admin — testimonios (vistas HTML).
 */
const testimoniosService = require('../../services/testimonios.service');
const logger = require('../../utils/logger');
const { resolveErrorForClient } = require('../../utils/error.helpers');
const constants = require('../../config/constants');

const ADMIN = constants.ADMIN_ROUTES.TESTIMONIOS;
const ADMIN_PENDIENTES = constants.ADMIN_ROUTES.TESTIMONIOS_PENDIENTES;

function redirectWithError(res, url, message) {
  return res.redirect(`${url}?error=${encodeURIComponent(message)}`);
}

function parseFormBody(body) {
  return {
    nombre_cliente: body.nombre_cliente,
    comentario: body.comentario,
    puntuacion: body.puntuacion,
    activo: body.activo === 'on' || body.activo === 'true' || body.activo === true,
    orden: body.orden,
  };
}

function parsePendienteBody(body) {
  return {
    nombre_cliente: body.nombre_cliente,
    comentario: body.comentario,
    puntuacion: body.puntuacion,
  };
}

exports.indexPage = async (req, res, next) => {
  try {
    const [testimonios, pendientesCount] = await Promise.all([
      testimoniosService.listar(),
      testimoniosService.contarPendientes(),
    ]);

    res.render('layouts/admin', {
      title: 'Testimonios',
      activeMenu: 'testimonios',
      contentPartial: '../admin/testimonios/index',
      testimonios,
      pendientesCount,
      flash: res.locals.flash,
    });
  } catch (err) {
    logger.error('Error al listar testimonios', err);
    next(err);
  }
};

exports.pendientesPage = async (req, res, next) => {
  try {
    const testimonios = await testimoniosService.listarPendientes();

    res.render('layouts/admin', {
      title: 'Testimonios pendientes',
      activeMenu: 'testimonios',
      contentPartial: '../admin/testimonios/pendientes',
      testimonios,
      flash: res.locals.flash,
    });
  } catch (err) {
    logger.error('Error al listar testimonios pendientes', err);
    next(err);
  }
};

exports.createPage = (req, res) => {
  res.render('layouts/admin', {
    title: 'Nuevo testimonio',
    activeMenu: 'testimonios',
    contentPartial: '../admin/testimonios/create',
    testimonio: null,
    flash: res.locals.flash,
  });
};

exports.editPage = async (req, res) => {
  try {
    const testimonio = await testimoniosService.obtenerPorId(req.params.id);

    res.render('layouts/admin', {
      title: 'Editar testimonio',
      activeMenu: 'testimonios',
      contentPartial: '../admin/testimonios/edit',
      testimonio,
      flash: res.locals.flash,
    });
  } catch (err) {
    redirectWithError(res, ADMIN, resolveErrorForClient(err, { req, context: 'Error en testimonios admin' }));
  }
};

exports.editPendientePage = async (req, res) => {
  try {
    const testimonio = await testimoniosService.obtenerPendientePorId(req.params.id);

    res.render('layouts/admin', {
      title: 'Moderar testimonio',
      activeMenu: 'testimonios',
      contentPartial: '../admin/testimonios/edit-pendiente',
      testimonio,
      flash: res.locals.flash,
    });
  } catch (err) {
    redirectWithError(res, ADMIN_PENDIENTES, resolveErrorForClient(err, { req, context: 'Error en testimonios admin' }));
  }
};

exports.store = async (req, res) => {
  try {
    await testimoniosService.crear(parseFormBody(req.body));
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Testimonio creado correctamente')}`);
  } catch (err) {
    logger.error('Error al crear testimonio', err);
    redirectWithError(res, `${ADMIN}/create`, resolveErrorForClient(err, { req, context: 'Error en testimonios admin' }));
  }
};

exports.update = async (req, res) => {
  try {
    await testimoniosService.editar(req.params.id, parseFormBody(req.body));
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Testimonio actualizado correctamente')}`);
  } catch (err) {
    logger.error('Error al actualizar testimonio', err);
    redirectWithError(res, `${ADMIN}/${req.params.id}/edit`, resolveErrorForClient(err, { req, context: 'Error en testimonios admin' }));
  }
};

exports.updatePendiente = async (req, res) => {
  try {
    await testimoniosService.editarPendiente(req.params.id, parsePendienteBody(req.body));
    res.redirect(`${ADMIN_PENDIENTES}?success=${encodeURIComponent('Testimonio pendiente actualizado')}`);
  } catch (err) {
    logger.error('Error al editar testimonio pendiente', err);
    redirectWithError(res, `${ADMIN_PENDIENTES}/${req.params.id}/edit`, resolveErrorForClient(err, { req, context: 'Error en testimonios admin' }));
  }
};

exports.destroy = async (req, res) => {
  try {
    await testimoniosService.eliminar(req.params.id);
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Testimonio eliminado')}`);
  } catch (err) {
    logger.error('Error al eliminar testimonio', err);
    redirectWithError(res, ADMIN, resolveErrorForClient(err, { req, context: 'Error en testimonios admin' }));
  }
};

exports.destroyPendiente = async (req, res) => {
  try {
    await testimoniosService.eliminar(req.params.id);
    res.redirect(`${ADMIN_PENDIENTES}?success=${encodeURIComponent('Testimonio eliminado')}`);
  } catch (err) {
    logger.error('Error al eliminar testimonio pendiente', err);
    redirectWithError(res, ADMIN_PENDIENTES, resolveErrorForClient(err, { req, context: 'Error en testimonios admin' }));
  }
};

exports.aprobar = async (req, res) => {
  try {
    await testimoniosService.aprobar(req.params.id);
    res.redirect(`${ADMIN_PENDIENTES}?success=${encodeURIComponent('Testimonio aprobado y publicado')}`);
  } catch (err) {
    logger.error('Error al aprobar testimonio', err);
    redirectWithError(res, ADMIN_PENDIENTES, resolveErrorForClient(err, { req, context: 'Error en testimonios admin' }));
  }
};

exports.rechazar = async (req, res) => {
  try {
    await testimoniosService.rechazar(req.params.id);
    res.redirect(`${ADMIN_PENDIENTES}?success=${encodeURIComponent('Testimonio rechazado')}`);
  } catch (err) {
    logger.error('Error al rechazar testimonio', err);
    redirectWithError(res, ADMIN_PENDIENTES, resolveErrorForClient(err, { req, context: 'Error en testimonios admin' }));
  }
};

exports.toggleActivo = async (req, res) => {
  try {
    const { accion } = req.params;

    if (accion !== 'activar' && accion !== 'desactivar') {
      return res.status(404).send('Acción no válida');
    }

    const activar = accion === 'activar';

    if (activar) {
      await testimoniosService.activar(req.params.id);
    } else {
      await testimoniosService.desactivar(req.params.id);
    }

    res.redirect(
      `${ADMIN}?success=${encodeURIComponent(activar ? 'Testimonio activado' : 'Testimonio desactivado')}`
    );
  } catch (err) {
    logger.error('Error al cambiar estado del testimonio', err);
    redirectWithError(res, ADMIN, resolveErrorForClient(err, { req, context: 'Error en testimonios admin' }));
  }
};
