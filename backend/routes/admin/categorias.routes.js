const { Router } = require('express');
const categoriasController = require('../../controllers/admin/categorias.controller');

const router = Router();

/* Vistas HTML */
router.get('/', categoriasController.indexPage);
router.get('/create', categoriasController.createPage);
router.post('/', categoriasController.store);
router.get('/:id/edit', categoriasController.editPage);
router.post('/:id/edit', categoriasController.update);
router.post('/:id/delete', categoriasController.destroy);

/* API JSON */
router.get('/api/list', categoriasController.listar);
router.post('/api', categoriasController.crear);
router.put('/api/:id', categoriasController.editar);
router.delete('/api/:id', categoriasController.eliminar);

module.exports = router;
