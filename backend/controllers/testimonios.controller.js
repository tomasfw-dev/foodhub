/**
 * Controlador público — envío de testimonios.
 */
const testimoniosService = require('../services/testimonios.service');
const { resolveErrorForClient } = require('../utils/error.helpers');
const logger = require('../utils/logger');
const constants = require('../config/constants');

function redirectHomeSuccess(res, message) {
  return res.redirect(`${constants.ROUTES.HOME}?success=${encodeURIComponent(message)}#dejar-testimonio`);
}

function redirectHomeError(res, message) {
  return res.redirect(`${constants.ROUTES.HOME}?error=${encodeURIComponent(message)}#dejar-testimonio`);
}

exports.store = async (req, res) => {
  if (req.body.website?.trim()) {
    logger.warn('Honeypot activado en formulario de testimonio', { ip: req.ip });
    return redirectHomeSuccess(res, testimoniosService.MENSAJE_EXITO_PUBLICO);
  }

  try {
    await testimoniosService.crearPublico({
      nombre_cliente: req.body.nombre_cliente,
      comentario: req.body.comentario,
      puntuacion: req.body.puntuacion,
    });

    return redirectHomeSuccess(res, testimoniosService.MENSAJE_EXITO_PUBLICO);
  } catch (err) {
    return redirectHomeError(
      res,
      resolveErrorForClient(err, {
        req,
        context: 'Error al recibir testimonio público',
        fallback: 'No se pudo enviar el testimonio.',
      })
    );
  }
};
