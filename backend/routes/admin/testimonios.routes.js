const { Router } = require('express');
const testimoniosController = require('../../controllers/admin/testimonios.controller');

const router = Router();

router.get('/', testimoniosController.indexPage);
router.get('/create', testimoniosController.createPage);
router.post('/', testimoniosController.store);
router.get('/:id/edit', testimoniosController.editPage);
router.post('/:id/edit', testimoniosController.update);
router.post('/:id/delete', testimoniosController.destroy);
router.post('/:id/:accion', testimoniosController.toggleActivo);

module.exports = router;
