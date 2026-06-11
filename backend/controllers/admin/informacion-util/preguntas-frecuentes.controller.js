const preguntasFrecuentesService = require('../../../services/preguntas-frecuentes.service');
const logger = require('../../../utils/logger');
const constants = require('../../../config/constants');

const ADMIN = constants.ADMIN_ROUTES.PREGUNTAS_FRECUENTES;

function redirectWithError(res, url, message) {
  return res.redirect(`${url}?error=${encodeURIComponent(message)}`);
}

function parseFormBody(body) {
  return {
    pregunta: body.pregunta,
    respuesta: body.respuesta,
    activo: body.activo === 'on' || body.activo === 'true' || body.activo === true,
    orden: body.orden,
  };
}

exports.indexPage = async (req, res, next) => {
  try {
    const preguntas = await preguntasFrecuentesService.listar();
    res.render('layouts/admin', {
      title: 'Preguntas frecuentes',
      activeMenu: 'informacion-util',
      contentPartial: '../admin/informacion-util/preguntas-frecuentes/index',
      preguntas,
      flash: res.locals.flash,
    });
  } catch (err) {
    logger.error('Error al listar preguntas frecuentes', err);
    next(err);
  }
};

exports.createPage = (req, res) => {
  res.render('layouts/admin', {
    title: 'Nueva pregunta frecuente',
    activeMenu: 'informacion-util',
    contentPartial: '../admin/informacion-util/preguntas-frecuentes/create',
    pregunta: null,
    flash: res.locals.flash,
  });
};

exports.editPage = async (req, res) => {
  try {
    const pregunta = await preguntasFrecuentesService.obtenerPorId(req.params.id);
    res.render('layouts/admin', {
      title: 'Editar pregunta frecuente',
      activeMenu: 'informacion-util',
      contentPartial: '../admin/informacion-util/preguntas-frecuentes/edit',
      pregunta,
      flash: res.locals.flash,
    });
  } catch (err) {
    redirectWithError(res, ADMIN, err.message);
  }
};

exports.store = async (req, res) => {
  try {
    await preguntasFrecuentesService.crear(parseFormBody(req.body));
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Pregunta frecuente creada')}`);
  } catch (err) {
    logger.error('Error al crear pregunta frecuente', err);
    redirectWithError(res, constants.ADMIN_ROUTES.PREGUNTAS_FRECUENTES_CREATE, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    await preguntasFrecuentesService.editar(req.params.id, parseFormBody(req.body));
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Pregunta frecuente actualizada')}`);
  } catch (err) {
    logger.error('Error al actualizar pregunta frecuente', err);
    redirectWithError(res, `${ADMIN}/${req.params.id}/edit`, err.message);
  }
};

exports.destroy = async (req, res) => {
  try {
    await preguntasFrecuentesService.eliminar(req.params.id);
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Pregunta frecuente eliminada')}`);
  } catch (err) {
    logger.error('Error al eliminar pregunta frecuente', err);
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
    if (activar) await preguntasFrecuentesService.activar(req.params.id);
    else await preguntasFrecuentesService.desactivar(req.params.id);
    res.redirect(
      `${ADMIN}?success=${encodeURIComponent(activar ? 'Pregunta activada' : 'Pregunta desactivada')}`
    );
  } catch (err) {
    logger.error('Error al cambiar estado de pregunta frecuente', err);
    redirectWithError(res, ADMIN, err.message);
  }
};
