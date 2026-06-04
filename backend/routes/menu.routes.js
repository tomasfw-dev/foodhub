const { Router } = require('express');
const menuController = require('../controllers/menu.controller');

const router = Router();

router.get('/menu', menuController.getMenu);

module.exports = router;
