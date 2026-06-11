const { Router } = require('express');
const zonasEntregaController = require('../../../controllers/admin/informacion-util/zonas-entrega.controller');

const router = Router();

router.get('/', zonasEntregaController.indexPage);
router.get('/create', zonasEntregaController.createPage);
router.post('/', zonasEntregaController.store);
router.get('/:id/edit', zonasEntregaController.editPage);
router.post('/:id/edit', zonasEntregaController.update);
router.post('/:id/delete', zonasEntregaController.destroy);
router.post('/:id/:accion', zonasEntregaController.toggleActivo);

module.exports = router;
