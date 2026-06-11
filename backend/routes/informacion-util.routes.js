const { Router } = require('express');
const informacionUtilController = require('../controllers/informacion-util.controller');

const router = Router();

router.get('/informacion-util', informacionUtilController.getInformacionUtil);

module.exports = router;
