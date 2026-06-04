const { Router } = require('express');
const constants = require('../../config/constants');

const router = Router();

/**
 * Cerrar sesión (placeholder hasta implementar auth).
 */
router.get('/logout', (req, res) => {
  res.redirect(constants.ROUTES.AUTH_LOGIN + '?message=' + encodeURIComponent('Sesión cerrada'));
});

module.exports = router;
