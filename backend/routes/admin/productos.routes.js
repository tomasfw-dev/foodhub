const { Router } = require('express');
const productosController = require('../../controllers/admin/productos.controller');
const { uploadProductoImagen } = require('../../middlewares/uploadProducto.middleware');
const { handleUploadError } = require('../../middlewares/uploadError.middleware');
const { verifyCsrf } = require('../../middlewares/csrf.middleware');

const router = Router();

/* Vistas HTML */
router.get('/', productosController.indexPage);
router.get('/create', productosController.createPage);
router.post('/', uploadProductoImagen, verifyCsrf, handleUploadError, productosController.store);
router.get('/:id/edit', productosController.editPage);
router.post('/:id/edit', uploadProductoImagen, verifyCsrf, handleUploadError, productosController.update);
router.post('/:id/delete', productosController.destroy);
router.post('/:id/toggle-destacado', productosController.toggleDestacado);
router.post('/:id/:accion', productosController.toggleActivo);

/* API JSON */
router.get('/api/list', productosController.listar);
router.post('/api', productosController.crear);
router.put('/api/:id', productosController.editar);
router.delete('/api/:id', productosController.eliminar);
router.patch('/api/:id/activar', productosController.activar);
router.patch('/api/:id/desactivar', productosController.desactivar);

module.exports = router;
