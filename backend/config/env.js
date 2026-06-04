module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,
  WHATSAPP_PHONE: process.env.WHATSAPP_PHONE || '',
  WHATSAPP_DEFAULT_MESSAGE:
    process.env.WHATSAPP_DEFAULT_MESSAGE || 'Hola! Quiero hacer un pedido.',

  DB_SERVER: process.env.DB_SERVER || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT, 10) || 1433,
  DB_NAME: process.env.DB_NAME || 'BenditaComida',
  DB_USER: process.env.DB_USER || '',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_ENCRYPT: process.env.DB_ENCRYPT !== 'false',
  DB_TRUST_SERVER_CERTIFICATE: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
  MENU_FEATURED_LIMIT: parseInt(process.env.MENU_FEATURED_LIMIT, 10) || 4,
};
