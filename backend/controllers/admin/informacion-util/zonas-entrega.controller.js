const zonasEntregaService = require('../../../services/zonas-entrega.service');
const logger = require('../../../utils/logger');
const constants = require('../../../config/constants');

const ADMIN = constants.ADMIN_ROUTES.ZONAS_ENTREGA;

function redirectWithError(res, url, message) {
  return res.redirect(`${url}?error=${encodeURIComponent(message)}`);
}

function parseFormBody(body) {
  return {
    nombre_zona: body.nombre_zona,
    descripcion: body.descripcion,
    costo_envio: body.costo_envio,
    activo: body.activo === 'on' || body.activo === 'true' || body.activo === true,
    orden: body.orden,
  };
}

exports.indexPage = async (req, res, next) => {
  try {
    const zonas = await zonasEntregaService.listar();
    res.render('layouts/admin', {
      title: 'Zonas de entrega',
      activeMenu: 'informacion-util',
      contentPartial: '../admin/informacion-util/zonas-entrega/index',
      zonas,
      flash: res.locals.flash,
    });
  } catch (err) {
    logger.error('Error al listar zonas de entrega', err);
    next(err);
  }
};

exports.createPage = (req, res) => {
  res.render('layouts/admin', {
    title: 'Nueva zona de entrega',
    activeMenu: 'informacion-util',
    contentPartial: '../admin/informacion-util/zonas-entrega/create',
    zona: null,
    flash: res.locals.flash,
  });
};

exports.editPage = async (req, res) => {
  try {
    const zona = await zonasEntregaService.obtenerPorId(req.params.id);
    res.render('layouts/admin', {
      title: 'Editar zona de entrega',
      activeMenu: 'informacion-util',
      contentPartial: '../admin/informacion-util/zonas-entrega/edit',
      zona,
      flash: res.locals.flash,
    });
  } catch (err) {
    redirectWithError(res, ADMIN, err.message);
  }
};

exports.store = async (req, res) => {
  try {
    await zonasEntregaService.crear(parseFormBody(req.body));
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Zona de entrega creada')}`);
  } catch (err) {
    logger.error('Error al crear zona de entrega', err);
    redirectWithError(res, constants.ADMIN_ROUTES.ZONAS_ENTREGA_CREATE, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    await zonasEntregaService.editar(req.params.id, parseFormBody(req.body));
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Zona de entrega actualizada')}`);
  } catch (err) {
    logger.error('Error al actualizar zona de entrega', err);
    redirectWithError(res, `${ADMIN}/${req.params.id}/edit`, err.message);
  }
};

exports.destroy = async (req, res) => {
  try {
    await zonasEntregaService.eliminar(req.params.id);
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Zona de entrega eliminada')}`);
  } catch (err) {
    logger.error('Error al eliminar zona de entrega', err);
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
    if (activar) await zonasEntregaService.activar(req.params.id);
    else await zonasEntregaService.desactivar(req.params.id);
    res.redirect(
      `${ADMIN}?success=${encodeURIComponent(activar ? 'Zona activada' : 'Zona desactivada')}`
    );
  } catch (err) {
    logger.error('Error al cambiar estado de zona', err);
    redirectWithError(res, ADMIN, err.message);
  }
};
