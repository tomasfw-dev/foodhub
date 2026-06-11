const { Router } = require('express');
const testimoniosController = require('../controllers/testimonios.controller');

const router = Router();

router.post('/', testimoniosController.store);

module.exports = router;
