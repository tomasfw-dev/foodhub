const { Router } = require('express');
const preguntasFrecuentesController = require('../../../controllers/admin/informacion-util/preguntas-frecuentes.controller');

const router = Router();

router.get('/', preguntasFrecuentesController.indexPage);
router.get('/create', preguntasFrecuentesController.createPage);
router.post('/', preguntasFrecuentesController.store);
router.get('/:id/edit', preguntasFrecuentesController.editPage);
router.post('/:id/edit', preguntasFrecuentesController.update);
router.post('/:id/delete', preguntasFrecuentesController.destroy);
router.post('/:id/:accion', preguntasFrecuentesController.toggleActivo);

module.exports = router;
