module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,
  WHATSAPP_PHONE: process.env.WHATSAPP_PHONE || '',
  WHATSAPP_DEFAULT_MESSAGE:
    process.env.WHATSAPP_DEFAULT_MESSAGE || 'Hola! Quiero hacer un pedido.',
};
