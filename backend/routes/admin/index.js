const { Router } = require('express');
const dashboardRoutes = require('./dashboard.routes');
const categoriasRoutes = require('./categorias.routes');
const productosRoutes = require('./productos.routes');

const router = Router();

router.use('/', dashboardRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/productos', productosRoutes);

module.exports = router;
