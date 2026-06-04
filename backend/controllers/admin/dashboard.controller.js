const categoriasService = require('../../services/admin/categorias.service');
const productosService = require('../../services/admin/productos.service');

exports.index = (req, res) => {
  const categorias = categoriasService.listar();
  const productos = productosService.listar();

  res.render('layouts/admin', {
    title: 'Dashboard',
    activeMenu: 'dashboard',
    contentPartial: '../admin/dashboard',
    stats: {
      categorias: categorias.length,
      categoriasActivas: categorias.filter((c) => c.activo).length,
      productos: productos.length,
      productosActivos: productos.filter((p) => p.activo).length,
    },
    flash: res.locals.flash,
  });
};
