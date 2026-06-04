const { Router } = require('express');
const menuController = require('../controllers/menu.controller');

const router = Router();

router.get('/menu', menuController.getMenu);
router.get('/api/menu', menuController.getMenuApi);

module.exports = router;
