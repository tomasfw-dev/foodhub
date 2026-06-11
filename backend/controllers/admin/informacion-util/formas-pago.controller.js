const formasPagoService = require('../../../services/formas-pago.service');
const logger = require('../../../utils/logger');
const constants = require('../../../config/constants');

const ADMIN = constants.ADMIN_ROUTES.FORMAS_PAGO;

function redirectWithError(res, url, message) {
  return res.redirect(`${url}?error=${encodeURIComponent(message)}`);
}

function parseFormBody(body) {
  return {
    nombre: body.nombre,
    descripcion: body.descripcion,
    activo: body.activo === 'on' || body.activo === 'true' || body.activo === true,
    orden: body.orden,
  };
}

exports.indexPage = async (req, res, next) => {
  try {
    const formasPago = await formasPagoService.listar();
    res.render('layouts/admin', {
      title: 'Formas de pago',
      activeMenu: 'informacion-util',
      contentPartial: '../admin/informacion-util/formas-pago/index',
      formasPago,
      flash: res.locals.flash,
    });
  } catch (err) {
    logger.error('Error al listar formas de pago', err);
    next(err);
  }
};

exports.createPage = (req, res) => {
  res.render('layouts/admin', {
    title: 'Nueva forma de pago',
    activeMenu: 'informacion-util',
    contentPartial: '../admin/informacion-util/formas-pago/create',
    formaPago: null,
    flash: res.locals.flash,
  });
};

exports.editPage = async (req, res) => {
  try {
    const formaPago = await formasPagoService.obtenerPorId(req.params.id);
    res.render('layouts/admin', {
      title: 'Editar forma de pago',
      activeMenu: 'informacion-util',
      contentPartial: '../admin/informacion-util/formas-pago/edit',
      formaPago,
      flash: res.locals.flash,
    });
  } catch (err) {
    redirectWithError(res, ADMIN, err.message);
  }
};

exports.store = async (req, res) => {
  try {
    await formasPagoService.crear(parseFormBody(req.body));
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Forma de pago creada')}`);
  } catch (err) {
    logger.error('Error al crear forma de pago', err);
    redirectWithError(res, constants.ADMIN_ROUTES.FORMAS_PAGO_CREATE, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    await formasPagoService.editar(req.params.id, parseFormBody(req.body));
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Forma de pago actualizada')}`);
  } catch (err) {
    logger.error('Error al actualizar forma de pago', err);
    redirectWithError(res, `${ADMIN}/${req.params.id}/edit`, err.message);
  }
};

exports.destroy = async (req, res) => {
  try {
    await formasPagoService.eliminar(req.params.id);
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Forma de pago eliminada')}`);
  } catch (err) {
    logger.error('Error al eliminar forma de pago', err);
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
    if (activar) await formasPagoService.activar(req.params.id);
    else await formasPagoService.desactivar(req.params.id);
    res.redirect(
      `${ADMIN}?success=${encodeURIComponent(activar ? 'Forma de pago activada' : 'Forma de pago desactivada')}`
    );
  } catch (err) {
    logger.error('Error al cambiar estado de forma de pago', err);
    redirectWithError(res, ADMIN, err.message);
  }
};
