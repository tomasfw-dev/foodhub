const { Router } = require('express');
const hubController = require('../../../controllers/admin/informacion-util/hub.controller');
const zonasEntregaRoutes = require('./zonas-entrega.routes');
const formasPagoRoutes = require('./formas-pago.routes');
const preguntasFrecuentesRoutes = require('./preguntas-frecuentes.routes');

const router = Router();

router.get('/', hubController.indexPage);
router.use('/zonas-entrega', zonasEntregaRoutes);
router.use('/formas-pago', formasPagoRoutes);
router.use('/preguntas-frecuentes', preguntasFrecuentesRoutes);

module.exports = router;
