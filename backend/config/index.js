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
};
