/**
 * Controlador admin — promociones (vistas HTML).
 */
const promocionesService = require('../../services/admin/promociones.service');
const uploadService = require('../../services/admin/upload.service');
const logger = require('../../utils/logger');
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
    return req.body.imagenActual.trim();
  }
  return null;
}

function parseFormBody(req) {
  return {
    nombre: req.body.nombre,
    descripcion: req.body.descripcion,
    precio_promocional: req.body.precio_promocional,
    fecha_inicio: req.body.fecha_inicio,
    fecha_fin: req.body.fecha_fin,
    imagen: resolveImagen(req),
    imagenAnterior: req.body.imagenActual || null,
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
    redirectWithError(res, ADMIN, err.message);
  }
};

exports.store = async (req, res) => {
  try {
    const datos = parseFormBody(req);
    await promocionesService.crear(datos);
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Promoción creada')}`);
  } catch (err) {
    cleanupUploadedFile(req);
    logger.error('Error al crear promoción', err);
    redirectWithError(res, constants.ADMIN_ROUTES.PROMOCIONES_CREATE, err.message);
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
    logger.error('Error al actualizar promoción', err);
    redirectWithError(res, `${ADMIN}/${req.params.id}/edit`, err.message);
  }
};

exports.destroy = async (req, res) => {
  try {
    const promocion = await promocionesService.eliminar(req.params.id);
    uploadService.deletePromocionImage(promocion.imagen);
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Promoción eliminada')}`);
  } catch (err) {
    logger.error('Error al eliminar promoción', err);
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
      await promocionesService.activar(req.params.id);
    } else {
      await promocionesService.desactivar(req.params.id);
    }

    res.redirect(
      `${ADMIN}?success=${encodeURIComponent(activar ? 'Promoción activada' : 'Promoción desactivada')}`
    );
  } catch (err) {
    redirectWithError(res, ADMIN, err.message);
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
    redirectWithError(res, ADMIN, err.message);
  }
};
