/**
 * Factory de express-session
 */
const session = require('express-session');
const authConfig = require('./auth.config');

module.exports = function createSessionMiddleware() {
  return session({
    secret: authConfig.sessionSecret,
    name: authConfig.cookieName,
    resave: authConfig.session.resave,
    saveUninitialized: authConfig.session.saveUninitialized,
    rolling: authConfig.session.rolling,
    cookie: authConfig.cookie,
  });
};
