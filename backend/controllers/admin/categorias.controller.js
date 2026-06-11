/**
 * Controlador admin — categorías (vistas HTML + API JSON).
 */
const categoriasService = require('../../services/admin/categorias.service');
const logger = require('../../utils/logger');

const ADMIN = '/admin/categorias';

function handleError(res, err) {
  const status = err.status || 500;
  return res.status(status).json({ error: err.message });
}

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

/* --- Vistas HTML --- */

exports.indexPage = async (req, res, next) => {
  try {
    const categorias = await categoriasService.listar();
    res.render('layouts/admin', {
      title: 'Categorías',
      activeMenu: 'categorias',
      contentPartial: '../admin/categorias/index',
      categorias,
      flash: res.locals.flash,
    });
  } catch (err) {
    logger.error('Error al listar categorías', err);
    next(err);
  }
};

exports.createPage = (req, res) => {
  res.render('layouts/admin', {
    title: 'Nueva categoría',
    activeMenu: 'categorias',
    contentPartial: '../admin/categorias/create',
    categoria: null,
    flash: res.locals.flash,
  });
};

exports.editPage = async (req, res) => {
  try {
    const categoria = await categoriasService.obtenerPorId(req.params.id);
    res.render('layouts/admin', {
      title: 'Editar categoría',
      activeMenu: 'categorias',
      contentPartial: '../admin/categorias/edit',
      categoria,
      flash: res.locals.flash,
    });
  } catch (err) {
    redirectWithError(res, ADMIN, err.message);
  }
};

exports.store = async (req, res) => {
  try {
    await categoriasService.crear(parseFormBody(req.body));
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Categoría creada')}`);
  } catch (err) {
    redirectWithError(res, `${ADMIN}/create`, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    await categoriasService.editar(req.params.id, parseFormBody(req.body));
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Categoría actualizada')}`);
  } catch (err) {
    redirectWithError(res, `${ADMIN}/${req.params.id}/edit`, err.message);
  }
};

exports.destroy = async (req, res) => {
  try {
    await categoriasService.eliminar(req.params.id);
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Categoría eliminada')}`);
  } catch (err) {
    redirectWithError(res, ADMIN, err.message);
  }
};

/* --- API JSON --- */

exports.listar = async (req, res) => {
  try {
    const data = await categoriasService.listar();
    res.json({ data });
  } catch (err) {
    handleError(res, err);
  }
};

exports.crear = async (req, res) => {
  try {
    const categoria = await categoriasService.crear(req.body);
    res.status(201).json({ data: categoria });
  } catch (err) {
    handleError(res, err);
  }
};

exports.editar = async (req, res) => {
  try {
    const categoria = await categoriasService.editar(req.params.id, req.body);
    res.json({ data: categoria });
  } catch (err) {
    handleError(res, err);
  }
};

exports.eliminar = async (req, res) => {
  try {
    const categoria = await categoriasService.eliminar(req.params.id);
    res.json({ data: categoria, message: 'Categoría eliminada' });
  } catch (err) {
    handleError(res, err);
  }
};
