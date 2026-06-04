const { Router } = require('express');
const dashboardController = require('../../controllers/admin/dashboard.controller');

const router = Router();

router.get('/', dashboardController.index);

module.exports = router;
