/**
 * Controlador admin — testimonios (vistas HTML).
 */
const testimoniosService = require('../../services/testimonios.service');
const logger = require('../../utils/logger');
const constants = require('../../config/constants');

const ADMIN = constants.ADMIN_ROUTES.TESTIMONIOS;

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

exports.indexPage = async (req, res, next) => {
  try {
    const testimonios = await testimoniosService.listar();

    res.render('layouts/admin', {
      title: 'Testimonios',
      activeMenu: 'testimonios',
      contentPartial: '../admin/testimonios/index',
      testimonios,
      flash: res.locals.flash,
    });
  } catch (err) {
    logger.error('Error al listar testimonios', err);
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
    redirectWithError(res, ADMIN, err.message);
  }
};

exports.store = async (req, res) => {
  try {
    await testimoniosService.crear(parseFormBody(req.body));
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Testimonio creado correctamente')}`);
  } catch (err) {
    logger.error('Error al crear testimonio', err);
    redirectWithError(res, `${ADMIN}/create`, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    await testimoniosService.editar(req.params.id, parseFormBody(req.body));
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Testimonio actualizado correctamente')}`);
  } catch (err) {
    logger.error('Error al actualizar testimonio', err);
    redirectWithError(res, `${ADMIN}/${req.params.id}/edit`, err.message);
  }
};

exports.destroy = async (req, res) => {
  try {
    await testimoniosService.eliminar(req.params.id);
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Testimonio eliminado')}`);
  } catch (err) {
    logger.error('Error al eliminar testimonio', err);
    redirectWithError(res, ADMIN, err.message);
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
    redirectWithError(res, ADMIN, err.message);
  }
};
