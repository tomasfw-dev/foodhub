const config = require('../config');

/**
 * Genera URL de WhatsApp con mensaje opcional.
 */
exports.buildMessageUrl = (message = '') => {
  const phone = config.whatsapp.phone;
  const text = encodeURIComponent(message || config.whatsapp.defaultMessage);

  if (!phone) {
    return `https://wa.me/?text=${text}`;
  }

  return `https://wa.me/${phone}?text=${text}`;
};

exports.getDefaultUrl = () => {
  return exports.buildMessageUrl();
};
