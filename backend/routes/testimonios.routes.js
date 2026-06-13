const { Router } = require('express');
const testimoniosController = require('../controllers/testimonios.controller');
const { testimonialRateLimiter } = require('../middlewares/rateLimit.middleware');

const router = Router();

router.post('/', testimonialRateLimiter, testimoniosController.store);

module.exports = router;
