exports.indexPage = (req, res) => {
  res.render('layouts/admin', {
    title: 'Información útil',
    activeMenu: 'informacion-util',
    contentPartial: '../admin/informacion-util/index',
    flash: res.locals.flash,
  });
};
