/**
 * Información útil — agregador para la web pública.
 */
const zonasEntregaService = require('./zonas-entrega.service');
const formasPagoService = require('./formas-pago.service');
const preguntasFrecuentesService = require('./preguntas-frecuentes.service');
const logger = require('../utils/logger');

exports.obtenerContenidoPublico = async () => {
  logger.info('Consultando información útil para la web pública');

  const [zonasEntrega, formasPago, preguntasFrecuentes] = await Promise.all([
    zonasEntregaService.listarActivas(),
    formasPagoService.listarActivas(),
    preguntasFrecuentesService.listarActivas(),
  ]);

  return {
    zonasEntrega,
    formasPago,
    preguntasFrecuentes,
    tieneContenido:
      zonasEntrega.length > 0 || formasPago.length > 0 || preguntasFrecuentes.length > 0,
  };
};
