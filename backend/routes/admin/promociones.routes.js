const { Router } = require('express');
const promocionesController = require('../../controllers/admin/promociones.controller');
const { uploadPromocionImagen } = require('../../middlewares/uploadPromocion.middleware');
const { handleUploadError } = require('../../middlewares/uploadError.middleware');

const router = Router();

router.get('/', promocionesController.indexPage);
router.get('/create', promocionesController.createPage);
router.post('/', uploadPromocionImagen, handleUploadError, promocionesController.store);
router.get('/:id/edit', promocionesController.editPage);
router.post('/:id/edit', uploadPromocionImagen, handleUploadError, promocionesController.update);
router.post('/:id/delete', promocionesController.destroy);
router.post('/:id/toggle-destacado', promocionesController.toggleDestacado);
router.post('/:id/:accion', promocionesController.toggleActivo);

module.exports = router;
