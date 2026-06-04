const { Router } = require('express');
const dashboardController = require('../../controllers/admin/dashboard.controller');
const categoriasRoutes = require('./categorias.routes');
const productosRoutes = require('./productos.routes');

const router = Router();

router.get('/', dashboardController.index);
router.use('/categorias', categoriasRoutes);
router.use('/productos', productosRoutes);

module.exports = router;
