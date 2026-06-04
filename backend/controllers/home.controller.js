const menuService = require('../services/menu.service');
const whatsappService = require('../services/whatsapp.service');

exports.getHome = (req, res) => {
  res.render('layouts/main', {
    title: 'Inicio',
    page: 'home',
    bodyClass: 'page-home',
    contentPartial: '../pages/home',
    featuredItems: menuService.getFeaturedItems(),
    promotions: menuService.getPromotions(),
    whatsappUrl: whatsappService.getDefaultUrl(),
  });
};
