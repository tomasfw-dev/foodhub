module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,
  WHATSAPP_PHONE: process.env.WHATSAPP_PHONE || '',
  WHATSAPP_DEFAULT_MESSAGE:
    process.env.WHATSAPP_DEFAULT_MESSAGE || 'Hola! Quiero hacer un pedido.',

  DB_SERVER: process.env.DB_SERVER || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT, 10) || 1433,
  DB_NAME: process.env.DB_NAME || 'FoodHub',
  DB_USER: process.env.DB_USER || '',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_ENCRYPT: process.env.DB_ENCRYPT !== 'false',
  // En desarrollo local, confiar en certificado autofirmado de SQL Server (si no se define en .env)
  DB_TRUST_SERVER_CERTIFICATE:
    process.env.DB_TRUST_SERVER_CERTIFICATE === 'true' ||
    (process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false' &&
      (process.env.NODE_ENV || 'development') === 'development'),
  MENU_FEATURED_LIMIT: parseInt(process.env.MENU_FEATURED_LIMIT, 10) || 6,

  SITE_URL: process.env.SITE_URL || 'http://localhost:3000',

  SESSION_SECRET: process.env.SESSION_SECRET || '',
  SESSION_MAX_AGE_MS: parseInt(process.env.SESSION_MAX_AGE_MS, 10) || 24 * 60 * 60 * 1000,
};
