const { Router } = require('express');
const { requireAuth } = require('../../middlewares/auth.middleware');
const dashboardRoutes = require('./dashboard.routes');
const categoriasRoutes = require('./categorias.routes');
const productosRoutes = require('./productos.routes');
const configuracionRoutes = require('./configuracion.routes');
const perfilRoutes = require('./perfil.routes');
const promocionesRoutes = require('./promociones.routes');
const heroRoutes = require('./hero.routes');
const testimoniosRoutes = require('./testimonios.routes');

const router = Router();

router.use(requireAuth);

router.use('/', dashboardRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/productos', productosRoutes);
router.use('/promociones', promocionesRoutes);
router.use('/hero', heroRoutes);
router.use('/testimonios', testimoniosRoutes);
router.use('/configuracion', configuracionRoutes);
router.use('/perfil', perfilRoutes);

module.exports = router;
