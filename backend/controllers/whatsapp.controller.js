/**
 * Controlador para lógica relacionada con WhatsApp (reservado).
 * La generación de enlaces se delega al servicio whatsapp.service.
 */
const whatsappService = require('../services/whatsapp.service');

exports.buildOrderLink = (req, res) => {
  const message = req.query.message || '';
  const phone = res.locals.whatsapp?.phone;
  const url = whatsappService.buildMessageUrl(message, phone);

  res.json({ url });
};
