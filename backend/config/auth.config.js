/**
 * Configuración de autenticación y sesiones
 */
const env = require('./env');

const isProduction = env.NODE_ENV === 'production';

if (isProduction && !env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET es obligatorio en producción');
}

module.exports = {
  enabled: true,
  sessionSecret: env.SESSION_SECRET || 'dev-only-change-in-production',
  cookieName: 'bendita.sid',
  cookieMaxAge: env.SESSION_MAX_AGE_MS,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: env.SESSION_MAX_AGE_MS,
  },
  session: {
    resave: false,
    saveUninitialized: false,
    rolling: true,
    name: 'bendita.sid',
  },
};
