/**
 * Controlador para lógica relacionada con WhatsApp (reservado).
 * La generación de enlaces se delega al servicio whatsapp.service.
 */
const whatsappService = require('../services/whatsapp.service');

exports.buildOrderLink = (req, res) => {
  const message = req.query.message || '';
  const url = whatsappService.buildMessageUrl(message);

  res.json({ url });
};
