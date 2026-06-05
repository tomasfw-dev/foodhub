const { Router } = require('express');
const authController = require('../../controllers/auth.controller');
const { redirectIfAuthenticated } = require('../../middlewares/auth.middleware');

const router = Router();

router.get('/login', redirectIfAuthenticated, authController.showLogin);
router.post('/login', redirectIfAuthenticated, authController.login);
router.get('/logout', authController.logout);
router.post('/logout', authController.logout);

module.exports = router;
