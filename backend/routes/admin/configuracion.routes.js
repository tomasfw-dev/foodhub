const { Router } = require('express');
const configuracionController = require('../../controllers/admin/configuracion.controller');
const { uploadConfiguracionImagenes } = require('../../middlewares/uploadConfiguracion.middleware');
const { handleUploadError } = require('../../middlewares/uploadError.middleware');

const router = Router();

router.get('/', configuracionController.editPage);
router.post('/', uploadConfiguracionImagenes, handleUploadError, configuracionController.update);

module.exports = router;
