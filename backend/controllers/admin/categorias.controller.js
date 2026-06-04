/**
 * Controlador admin — categorías (vistas HTML + API JSON).
 */
const categoriasService = require('../../services/admin/categorias.service');

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
    slug: body.slug,
    orden: body.orden,
    activo: body.activo === 'on' || body.activo === 'true' || body.activo === true,
  };
}

/* --- Vistas HTML --- */

exports.indexPage = (req, res) => {
  try {
    res.render('layouts/admin', {
      title: 'Categorías',
      activeMenu: 'categorias',
      contentPartial: '../admin/categorias/index',
      categorias: categoriasService.listar(),
      flash: res.locals.flash,
    });
  } catch (err) {
    redirectWithError(res, ADMIN, err.message);
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

exports.editPage = (req, res) => {
  try {
    const categoria = categoriasService.obtenerPorId(req.params.id);
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

exports.store = (req, res) => {
  try {
    categoriasService.crear(parseFormBody(req.body));
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Categoría creada')}`);
  } catch (err) {
    redirectWithError(res, `${ADMIN}/create`, err.message);
  }
};

exports.update = (req, res) => {
  try {
    categoriasService.editar(req.params.id, parseFormBody(req.body));
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Categoría actualizada')}`);
  } catch (err) {
    redirectWithError(res, `${ADMIN}/${req.params.id}/edit`, err.message);
  }
};

exports.destroy = (req, res) => {
  try {
    categoriasService.eliminar(req.params.id);
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Categoría eliminada')}`);
  } catch (err) {
    redirectWithError(res, ADMIN, err.message);
  }
};

/* --- API JSON --- */

exports.listar = (req, res) => {
  try {
    res.json({ data: categoriasService.listar() });
  } catch (err) {
    handleError(res, err);
  }
};

exports.crear = (req, res) => {
  try {
    const categoria = categoriasService.crear(req.body);
    res.status(201).json({ data: categoria });
  } catch (err) {
    handleError(res, err);
  }
};

exports.editar = (req, res) => {
  try {
    const categoria = categoriasService.editar(req.params.id, req.body);
    res.json({ data: categoria });
  } catch (err) {
    handleError(res, err);
  }
};

exports.eliminar = (req, res) => {
  try {
    const categoria = categoriasService.eliminar(req.params.id);
    res.json({ data: categoria, message: 'Categoría eliminada' });
  } catch (err) {
    handleError(res, err);
  }
};
