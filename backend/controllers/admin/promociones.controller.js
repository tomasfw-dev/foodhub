/**
 * Controlador admin — promociones (vistas HTML).
 */
const promocionesService = require('../../services/admin/promociones.service');
const uploadService = require('../../services/admin/upload.service');
const uploadConfig = require('../../config/upload.config');
const logger = require('../../utils/logger');
const { resolveErrorForClient } = require('../../utils/error.helpers');
const { assertStoredImagePath } = require('../../utils/upload.helpers');
const constants = require('../../config/constants');

const ADMIN = constants.ADMIN_ROUTES.PROMOCIONES;

function redirectWithError(res, url, message) {
  return res.redirect(`${url}?error=${encodeURIComponent(message)}`);
}

function resolveImagen(req) {
  if (req.file) {
    return uploadService.toPromocionPublicUrl(req.file.filename);
  }
  if (req.body.imagenActual) {
    return assertStoredImagePath(req.body.imagenActual, {
      requiredPrefix: `${uploadConfig.PROMOCIONES_PUBLIC_PREFIX}/`,
    });
  }
  return null;
}

function parseFormBody(req) {
  const imagenActual = req.body.imagenActual
    ? assertStoredImagePath(req.body.imagenActual, {
        requiredPrefix: `${uploadConfig.PROMOCIONES_PUBLIC_PREFIX}/`,
      })
    : null;

  return {
    nombre: req.body.nombre,
    descripcion: req.body.descripcion,
    precio_promocional: req.body.precio_promocional,
    fecha_inicio: req.body.fecha_inicio,
    fecha_fin: req.body.fecha_fin,
    imagen: resolveImagen(req),
    imagenAnterior: imagenActual,
    activo: req.body.activo === 'on' || req.body.activo === 'true' || req.body.activo === true,
    destacado: req.body.destacado === 'on' || req.body.destacado === 'true' || req.body.destacado === true,
  };
}

function cleanupUploadedFile(req) {
  if (req.file) {
    uploadService.deletePromocionImage(uploadService.toPromocionPublicUrl(req.file.filename));
  }
}

exports.indexPage = async (req, res, next) => {
  try {
    const promociones = await promocionesService.listar();

    res.render('layouts/admin', {
      title: 'Promociones',
      activeMenu: 'promociones',
      contentPartial: '../admin/promociones/index',
      promociones,
      flash: res.locals.flash,
    });
  } catch (err) {
    logger.error('Error al listar promociones', err);
    next(err);
  }
};

exports.createPage = (req, res) => {
  res.render('layouts/admin', {
    title: 'Nueva promoción',
    activeMenu: 'promociones',
    contentPartial: '../admin/promociones/create',
    promocion: null,
    flash: res.locals.flash,
  });
};

exports.editPage = async (req, res) => {
  try {
    const promocion = await promocionesService.obtenerPorId(req.params.id);

    res.render('layouts/admin', {
      title: 'Editar promoción',
      activeMenu: 'promociones',
      contentPartial: '../admin/promociones/edit',
      promocion,
      flash: res.locals.flash,
    });
  } catch (err) {
    redirectWithError(res, ADMIN, resolveErrorForClient(err, { req, context: 'Error en promociones' }));
  }
};

exports.store = async (req, res) => {
  try {
    const datos = parseFormBody(req);
    await promocionesService.crear(datos);
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Promoción creada')}`);
  } catch (err) {
    cleanupUploadedFile(req);
    redirectWithError(res, constants.ADMIN_ROUTES.PROMOCIONES_CREATE, resolveErrorForClient(err, { req, context: 'Error al crear promoción' }));
  }
};

exports.update = async (req, res) => {
  try {
    const datos = parseFormBody(req);
    await promocionesService.editar(req.params.id, datos);

    if (req.file && datos.imagenAnterior && datos.imagenAnterior !== datos.imagen) {
      uploadService.deletePromocionImage(datos.imagenAnterior);
    }

    res.redirect(`${ADMIN}?success=${encodeURIComponent('Promoción actualizada')}`);
  } catch (err) {
    cleanupUploadedFile(req);
    redirectWithError(res, `${ADMIN}/${req.params.id}/edit`, resolveErrorForClient(err, { req, context: 'Error al actualizar promoción' }));
  }
};

exports.destroy = async (req, res) => {
  try {
    const promocion = await promocionesService.eliminar(req.params.id);
    uploadService.deletePromocionImage(promocion.imagen);
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Promoción eliminada')}`);
  } catch (err) {
    redirectWithError(res, ADMIN, resolveErrorForClient(err, { req, context: 'Error al eliminar promoción' }));
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
      await promocionesService.activar(req.params.id);
    } else {
      await promocionesService.desactivar(req.params.id);
    }

    res.redirect(
      `${ADMIN}?success=${encodeURIComponent(activar ? 'Promoción activada' : 'Promoción desactivada')}`
    );
  } catch (err) {
    redirectWithError(res, ADMIN, resolveErrorForClient(err, { req, context: 'Error en promociones' }));
  }
};

exports.toggleDestacado = async (req, res) => {
  try {
    const promocion = await promocionesService.toggleDestacado(req.params.id);
    const mensaje = promocion.destacado
      ? 'Promoción marcada como destacada'
      : 'Promoción ya no está destacada';

    res.redirect(`${ADMIN}?success=${encodeURIComponent(mensaje)}`);
  } catch (err) {
    redirectWithError(res, ADMIN, resolveErrorForClient(err, { req, context: 'Error en promociones' }));
  }
};
