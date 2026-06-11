const env = require('./env');
const constants = require('./constants');

module.exports = {
  env: env.NODE_ENV,
  port: env.PORT,
  appName: constants.APP_NAME,
  whatsapp: {
    phone: env.WHATSAPP_PHONE,
    defaultMessage: env.WHATSAPP_DEFAULT_MESSAGE,
  },
  database: {
    server: env.DB_SERVER,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    options: {
      encrypt: env.DB_ENCRYPT,
      trustServerCertificate: env.DB_TRUST_SERVER_CERTIFICATE,
      enableArithAbort: true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  },
  menuFeaturedLimit: env.MENU_FEATURED_LIMIT,
  siteUrl: env.SITE_URL.replace(/\/+$/, ''),
};
