/**
 * Controlador admin — productos (vistas HTML + API JSON).
 */
const productosService = require('../../services/admin/productos.service');
const categoriasService = require('../../services/admin/categorias.service');
const uploadService = require('../../services/admin/upload.service');
const logger = require('../../utils/logger');
const { resolveErrorForClient, sendJsonError } = require('../../utils/error.helpers');

const ADMIN = '/admin/productos';

function handleError(res, err, req) {
  return sendJsonError(res, err, { context: 'Error en API de productos', req });
}

function redirectWithError(res, url, message) {
  return res.redirect(`${url}?error=${encodeURIComponent(message)}`);
}

function resolveImagen(req) {
  if (req.file) {
    return uploadService.toPublicUrl(req.file.filename);
  }
  if (req.body.imagenActual) {
    return req.body.imagenActual.trim();
  }
  return null;
}

function parseFormBody(req) {
  return {
    categoriaId: req.body.categoriaId,
    nombre: req.body.nombre,
    descripcion: req.body.descripcion,
    precio: req.body.precio,
    imagen: resolveImagen(req),
    imagenAnterior: req.body.imagenActual || null,
    badge: req.body.badge,
    activo: req.body.activo === 'on' || req.body.activo === 'true' || req.body.activo === true,
    destacado: req.body.destacado === 'on' || req.body.destacado === 'true' || req.body.destacado === true,
    orden: req.body.orden,
  };
}

function cleanupUploadedFile(req) {
  if (req.file) {
    uploadService.deleteProductoImage(uploadService.toPublicUrl(req.file.filename));
  }
}

/* --- Vistas HTML --- */

exports.indexPage = async (req, res, next) => {
  try {
    const [productos, categorias, totalDestacados] = await Promise.all([
      productosService.listar(),
      categoriasService.listar(),
      productosService.contarDestacados(),
    ]);
    const categoriasMap = Object.fromEntries(categorias.map((c) => [c.id, c.nombre]));

    res.render('layouts/admin', {
      title: 'Productos',
      activeMenu: 'productos',
      contentPartial: '../admin/productos/index',
      productos,
      categoriasMap,
      totalDestacados,
      maxDestacados: productosService.getMaxDestacados(),
      flash: res.locals.flash,
    });
  } catch (err) {
    logger.error('Error al listar productos', err);
    next(err);
  }
};

exports.createPage = async (req, res, next) => {
  try {
    const categorias = await categoriasService.listar();
    res.render('layouts/admin', {
      title: 'Nuevo producto',
      activeMenu: 'productos',
      contentPartial: '../admin/productos/create',
      producto: null,
      categorias,
      flash: res.locals.flash,
    });
  } catch (err) {
    next(err);
  }
};

exports.editPage = async (req, res, next) => {
  try {
    const [producto, categorias] = await Promise.all([
      productosService.obtenerPorId(req.params.id),
      categoriasService.listar(),
    ]);
    res.render('layouts/admin', {
      title: 'Editar producto',
      activeMenu: 'productos',
      contentPartial: '../admin/productos/edit',
      producto,
      categorias,
      flash: res.locals.flash,
    });
  } catch (err) {
    redirectWithError(res, ADMIN, resolveErrorForClient(err, { req, context: 'Error al cargar producto' }));
  }
};

exports.store = async (req, res) => {
  try {
    const datos = parseFormBody(req);
    await productosService.crear(datos);
    logger.info('Producto creado', { imagen: datos.imagen });
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Producto creado')}`);
  } catch (err) {
    cleanupUploadedFile(req);
    redirectWithError(res, `${ADMIN}/create`, resolveErrorForClient(err, { req, context: 'Error al crear producto' }));
  }
};

exports.update = async (req, res) => {
  try {
    const datos = parseFormBody(req);
    await productosService.editar(req.params.id, datos);

    if (req.file && datos.imagenAnterior && datos.imagenAnterior !== datos.imagen) {
      uploadService.deleteProductoImage(datos.imagenAnterior);
    }

    logger.info('Producto actualizado', { id: req.params.id, imagen: datos.imagen });
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Producto actualizado')}`);
  } catch (err) {
    cleanupUploadedFile(req);
    redirectWithError(res, `${ADMIN}/${req.params.id}/edit`, resolveErrorForClient(err, { req, context: 'Error al actualizar producto' }));
  }
};

exports.destroy = async (req, res) => {
  try {
    const producto = await productosService.eliminar(req.params.id);
    uploadService.deleteProductoImage(producto.imagen);
    logger.info('Producto eliminado', { id: req.params.id });
    res.redirect(`${ADMIN}?success=${encodeURIComponent('Producto eliminado')}`);
  } catch (err) {
    redirectWithError(res, ADMIN, resolveErrorForClient(err, { req, context: 'Error al eliminar producto' }));
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
      await productosService.activar(req.params.id);
    } else {
      await productosService.desactivar(req.params.id);
    }
    res.redirect(`${ADMIN}?success=${encodeURIComponent(activar ? 'Producto activado' : 'Producto desactivado')}`);
  } catch (err) {
    redirectWithError(res, ADMIN, resolveErrorForClient(err, { req, context: 'Error al cambiar estado del producto' }));
  }
};

exports.toggleDestacado = async (req, res) => {
  try {
    const producto = await productosService.toggleDestacado(req.params.id);
    const mensaje = producto.destacado
      ? 'Producto marcado como destacado'
      : 'Producto quitado de destacados';

    res.redirect(`${ADMIN}?success=${encodeURIComponent(mensaje)}`);
  } catch (err) {
    redirectWithError(res, ADMIN, resolveErrorForClient(err, { req, context: 'Error al cambiar destacado del producto' }));
  }
};

/* --- API JSON --- */

exports.listar = async (req, res) => {
  try {
    const filtros = {
      categoriaId: req.query.categoriaId,
      soloActivos: req.query.soloActivos === 'true',
    };
    const data = await productosService.listar(filtros);
    res.json({ data });
  } catch (err) {
    handleError(res, err, req);
  }
};

exports.crear = async (req, res) => {
  try {
    const producto = await productosService.crear(req.body);
    res.status(201).json({ data: producto });
  } catch (err) {
    handleError(res, err, req);
  }
};

exports.editar = async (req, res) => {
  try {
    const producto = await productosService.editar(req.params.id, req.body);
    res.json({ data: producto });
  } catch (err) {
    handleError(res, err, req);
  }
};

exports.eliminar = async (req, res) => {
  try {
    const producto = await productosService.eliminar(req.params.id);
    res.json({ data: producto, message: 'Producto eliminado' });
  } catch (err) {
    handleError(res, err, req);
  }
};

exports.activar = async (req, res) => {
  try {
    const producto = await productosService.activar(req.params.id);
    res.json({ data: producto, message: 'Producto activado' });
  } catch (err) {
    handleError(res, err, req);
  }
};

exports.desactivar = async (req, res) => {
  try {
    const producto = await productosService.desactivar(req.params.id);
    res.json({ data: producto, message: 'Producto desactivado' });
  } catch (err) {
    handleError(res, err, req);
  }
};
