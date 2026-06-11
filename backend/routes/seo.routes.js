const { Router } = require('express');
const seoController = require('../controllers/seo.controller');

const router = Router();

router.get('/robots.txt', seoController.getRobots);
router.get('/sitemap.xml', seoController.getSitemap);

module.exports = router;
