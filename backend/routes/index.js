const { Router } = require('express');

const webRoutes = require('./web.routes');
const menuRoutes = require('./menu.routes');
const testimoniosRoutes = require('./testimonios.routes');
const adminRoutes = require('./admin');
const authRoutes = require('./auth');

const router = Router();

router.use(webRoutes);
router.use(menuRoutes);
router.use('/testimonios', testimoniosRoutes);
router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);

module.exports = router;
