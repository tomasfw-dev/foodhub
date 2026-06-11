const { Router } = require('express');
const formasPagoController = require('../../../controllers/admin/informacion-util/formas-pago.controller');

const router = Router();

router.get('/', formasPagoController.indexPage);
router.get('/create', formasPagoController.createPage);
router.post('/', formasPagoController.store);
router.get('/:id/edit', formasPagoController.editPage);
router.post('/:id/edit', formasPagoController.update);
router.post('/:id/delete', formasPagoController.destroy);
router.post('/:id/:accion', formasPagoController.toggleActivo);

module.exports = router;
