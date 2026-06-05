const { Router } = require('express');
const configuracionController = require('../../controllers/admin/configuracion.controller');
const { uploadLogoImagen } = require('../../middlewares/uploadLogo.middleware');
const { handleUploadError } = require('../../middlewares/uploadError.middleware');

const router = Router();

router.get('/', configuracionController.editPage);
router.post('/', uploadLogoImagen, handleUploadError, configuracionController.update);

module.exports = router;
