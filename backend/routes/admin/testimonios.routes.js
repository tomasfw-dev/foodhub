const { Router } = require('express');
const testimoniosController = require('../../controllers/admin/testimonios.controller');

const router = Router();

router.get('/pendientes', testimoniosController.pendientesPage);
router.get('/pendientes/:id/edit', testimoniosController.editPendientePage);
router.post('/pendientes/:id/edit', testimoniosController.updatePendiente);
router.post('/pendientes/:id/aprobar', testimoniosController.aprobar);
router.post('/pendientes/:id/rechazar', testimoniosController.rechazar);
router.post('/pendientes/:id/delete', testimoniosController.destroyPendiente);

router.get('/', testimoniosController.indexPage);
router.get('/create', testimoniosController.createPage);
router.post('/', testimoniosController.store);
router.get('/:id/edit', testimoniosController.editPage);
router.post('/:id/edit', testimoniosController.update);
router.post('/:id/delete', testimoniosController.destroy);
router.post('/:id/:accion', testimoniosController.toggleActivo);

module.exports = router;
