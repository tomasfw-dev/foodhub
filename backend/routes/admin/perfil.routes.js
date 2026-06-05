const { Router } = require('express');
const perfilController = require('../../controllers/admin/perfil.controller');

const router = Router();

router.get('/', perfilController.indexPage);
router.post('/', perfilController.updateDatos);
router.post('/password', perfilController.updatePassword);

module.exports = router;
