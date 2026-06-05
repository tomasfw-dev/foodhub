const config = require('../config');

/**
 * Genera URL de WhatsApp con mensaje y teléfono opcionales.
 * @param {string} [message]
 * @param {string} [phoneOverride]
 */
exports.buildMessageUrl = (message = '', phoneOverride) => {
  const phone = phoneOverride || config.whatsapp.phone;
  const defaultMessage = config.whatsapp.defaultMessage;
  const text = encodeURIComponent(message || defaultMessage);

  if (!phone) {
    return `https://wa.me/?text=${text}`;
  }

  return `https://wa.me/${phone}?text=${text}`;
};

exports.getDefaultUrl = () => {
  return exports.buildMessageUrl();
};
