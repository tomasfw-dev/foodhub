/**
 * Controlador admin — productos (vistas HTML + API JSON).
 */
const productosService = require('../../services/admin/productos.service');
const categoriasService = require('../../services/admin/categorias.service');

const ADMIN = '/admin/productos';

function handleError(res, err) {
  const status = err.status || 500;
  return res.status(status).json({ error: err.message });
}

function redirectWithError(res, url, message) {
  return res.redirect(`${url}?error=${encodeURIComponent(message)}`);
}

function parseFormBody(body) {
  return {
    categoriaId: body.categoriaId,
    nombre: body.nombre,
    descripcion: body.descripcion,
    precio: body.precio,
    imagen: body.imagen,
    badge: body.badge,
    activo: body.activo === 'on' || body.activo === 'true' || body.activo === true,
  };
}

function getCategoriasParaSelect() {
  return categoriasService.listar();
}

/* --- Vistas HTML --- */

exports.indexPage = (req, res) => {
  try {
    const productos = productosService.listar();
    const categorias = getCategoriasParaSelect();
    const categoriasMap = Object.fromEntries(categorias.map((c) => [c.id, c.nombre]));

    res.render('layouts/admin', {
      title: 'Productos',
      activeMenu: 'productos',
      contentPartial: '../admin/productos/index',
      productos,
      categoriasMap,
      flash: res.locals.flash,
    });
  } catch (err) {
    redirectWithError(res, ADMIN, err.message);
  }
};

exports.createPage = (req, res) => {
  res.render('layouts/admin', {
    title: 'Nuevo producto',
    activeMenu: 'productos',
    contentPartial: '../admin/productos/create',
    producto: null,
    categorias: getCategoriasParaSelect(),
    flash: res.locals.flash,
  });
};

exports.editPage = (req, res) => {
  try {
    const producto = productosService.obtenerPorId(req.params.id);
    res.render('layouts/admin', {
      title: 'Editar producto',
      activeMenu: 'productos',
      contentPartial: '../admin/productos/edit',
      producto,
      categorias: getCategoriasParaSelect(),
      flash: res.locals.flash,
    });
  } catch (err) {
    redirectWithError(res, ADMIN, err.message);
  }
};

exports.store = (req, res) => {
  try {
    productosService.crear(parseFormBody(req.body));
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Producto creado')}`);
  } catch (err) {
    redirectWithError(res, `${ADMIN}/create`, err.message);
  }
};

exports.update = (req, res) => {
  try {
    productosService.editar(req.params.id, parseFormBody(req.body));
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Producto actualizado')}`);
  } catch (err) {
    redirectWithError(res, `${ADMIN}/${req.params.id}/edit`, err.message);
  }
};

exports.destroy = (req, res) => {
  try {
    productosService.eliminar(req.params.id);
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Producto eliminado')}`);
  } catch (err) {
    redirectWithError(res, ADMIN, err.message);
  }
};

exports.toggleActivo = (req, res) => {
  try {
    const { accion } = req.params;
    if (accion !== 'activar' && accion !== 'desactivar') {
      return res.status(404).send('Acción no válida');
    }
    const activar = accion === 'activar';
    if (activar) {
      productosService.activar(req.params.id);
    } else {
      productosService.desactivar(req.params.id);
    }
    res.redirect(`${ADMIN}?success=${encodeURIComponent(activar ? 'Producto activado' : 'Producto desactivado')}`);
  } catch (err) {
    redirectWithError(res, ADMIN, err.message);
  }
};

/* --- API JSON --- */

exports.listar = (req, res) => {
  try {
    const filtros = {
      categoriaId: req.query.categoriaId,
      soloActivos: req.query.soloActivos === 'true',
    };
    res.json({ data: productosService.listar(filtros) });
  } catch (err) {
    handleError(res, err);
  }
};

exports.crear = (req, res) => {
  try {
    const producto = productosService.crear(req.body);
    res.status(201).json({ data: producto });
  } catch (err) {
    handleError(res, err);
  }
};

exports.editar = (req, res) => {
  try {
    const producto = productosService.editar(req.params.id, req.body);
    res.json({ data: producto });
  } catch (err) {
    handleError(res, err);
  }
};

exports.eliminar = (req, res) => {
  try {
    const producto = productosService.eliminar(req.params.id);
    res.json({ data: producto, message: 'Producto eliminado' });
  } catch (err) {
    handleError(res, err);
  }
};

exports.activar = (req, res) => {
  try {
    const producto = productosService.activar(req.params.id);
    res.json({ data: producto, message: 'Producto activado' });
  } catch (err) {
    handleError(res, err);
  }
};

exports.desactivar = (req, res) => {
  try {
    const producto = productosService.desactivar(req.params.id);
    res.json({ data: producto, message: 'Producto desactivado' });
  } catch (err) {
    handleError(res, err);
  }
};
