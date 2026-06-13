const { Router } = require('express');
const authController = require('../../controllers/auth.controller');
const { redirectIfAuthenticated } = require('../../middlewares/auth.middleware');

const { loadPlatformBrand } = require('../../middlewares/platformBrand.middleware');
const { loginRateLimiter } = require('../../middlewares/rateLimit.middleware');

const router = Router();

router.use(loadPlatformBrand);

router.get('/login', redirectIfAuthenticated, authController.showLogin);
router.post('/login', loginRateLimiter, redirectIfAuthenticated, authController.login);
router.get('/logout', authController.logoutGet);
router.post('/logout', authController.logout);

module.exports = router;
