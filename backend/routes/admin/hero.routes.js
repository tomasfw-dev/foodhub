const { Router } = require('express');
const heroController = require('../../controllers/admin/hero.controller');
const { uploadHeroImagen } = require('../../middlewares/uploadHero.middleware');
const { handleUploadError } = require('../../middlewares/uploadError.middleware');

const router = Router();

router.get('/', heroController.editPage);
router.post('/', uploadHeroImagen, handleUploadError, heroController.update);

module.exports = router;
