const menuService = require('../services/menu.service');

exports.getMenu = (req, res) => {
  res.render('layouts/main', {
    title: 'Menú',
    page: 'menu',
    contentPartial: '../pages/menu',
    items: menuService.getItems(),
  });
};
