const { Router } = require('express');
const { requireAuth } = require('../../middlewares/auth.middleware');
const dashboardRoutes = require('./dashboard.routes');
const categoriasRoutes = require('./categorias.routes');
const productosRoutes = require('./productos.routes');

const router = Router();

router.use(requireAuth);

router.use('/', dashboardRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/productos', productosRoutes);

module.exports = router;
