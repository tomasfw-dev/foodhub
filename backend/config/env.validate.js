/**
 * Validación de variables de entorno al iniciar FoodHub.
 *
 * Producción: bloquea el arranque si la configuración es insegura.
 * Desarrollo: emite advertencias sin detener la app.
 */
const logger = require('../utils/logger');

const DEV_SESSION_FALLBACK = 'dev-only-change-in-production';
const MIN_SESSION_SECRET_LENGTH = 32;
const MIN_DB_PASSWORD_LENGTH = 8;

const EXAMPLE_SESSION_SECRETS = new Set([
  DEV_SESSION_FALLBACK,
  'cambiar_por_un_secreto_largo_y_aleatorio',
  'change-me',
  'changeme',
  'secret',
  'your-secret-here',
  'ejemplo',
  'example',
  'replace-me',
  'session-secret',
]);

const TRIVIAL_DB_PASSWORDS = new Set([
  '',
  '1234',
  '12345',
  '123456',
  '12345678',
  'password',
  'password1',
  'password123',
  'admin',
  'root',
  'test',
  'sa',
  'guest',
  'qwerty',
  'tu_password',
  'changeme',
  'change-me',
]);

/** E.164 sin +: código de país + número (10–15 dígitos). */
const WHATSAPP_PHONE_PATTERN = /^[1-9]\d{9,14}$/;

function normalizeSecret(value) {
  return String(value || '').trim();
}

function isExampleSessionSecret(value) {
  const normalized = normalizeSecret(value).toLowerCase();
  return EXAMPLE_SESSION_SECRETS.has(normalized);
}

function isWeakSessionSecret(value) {
  const secret = normalizeSecret(value);
  return !secret || secret.length < MIN_SESSION_SECRET_LENGTH || isExampleSessionSecret(secret);
}

function isTrivialDbPassword(value) {
  const password = String(value || '');
  if (!password.trim()) return true;
  if (password.length < MIN_DB_PASSWORD_LENGTH) return true;
  return TRIVIAL_DB_PASSWORDS.has(password.toLowerCase());
}

function isValidWhatsappPhone(value) {
  const phone = String(value || '').trim();
  if (!phone) return false;
  if (!/^\d+$/.test(phone)) return false;
  return WHATSAPP_PHONE_PATTERN.test(phone);
}

function hasTrailingSlash(url) {
  return /\/+$/.test(String(url || '').trim());
}

function collectProductionErrors(env) {
  const errors = [];
  const sessionSecret = normalizeSecret(env.SESSION_SECRET);

  if (!sessionSecret) {
    errors.push('SESSION_SECRET es obligatorio en producción.');
  } else if (sessionSecret.length < MIN_SESSION_SECRET_LENGTH) {
    errors.push(
      `SESSION_SECRET debe tener al menos ${MIN_SESSION_SECRET_LENGTH} caracteres en producción.`
    );
  } else if (isExampleSessionSecret(sessionSecret)) {
    errors.push(
      'SESSION_SECRET no puede ser un valor de ejemplo; generá un secreto aleatorio único.'
    );
  }

  const siteUrl = String(env.SITE_URL || '').trim();
  if (!siteUrl) {
    errors.push('SITE_URL es obligatorio en producción.');
  } else {
    if (!siteUrl.startsWith('https://')) {
      errors.push('SITE_URL debe comenzar con https:// en producción.');
    }
    if (hasTrailingSlash(siteUrl)) {
      errors.push('SITE_URL no debe terminar con barra final (/).');
    }
  }

  const dbUser = String(env.DB_USER || '').trim().toLowerCase();
  if (!dbUser) {
    errors.push('DB_USER es obligatorio en producción.');
  } else if (dbUser === 'sa') {
    errors.push('DB_USER no puede ser "sa" en producción.');
  }

  if (isTrivialDbPassword(env.DB_PASSWORD)) {
    errors.push(
      'DB_PASSWORD es obligatorio en producción y debe ser una contraseña segura (mínimo 8 caracteres, no trivial).'
    );
  }

  if (env.DB_TRUST_SERVER_CERTIFICATE) {
    errors.push(
      'DB_TRUST_SERVER_CERTIFICATE debe ser false en producción (certificado SQL Server validado).'
    );
  }

  if (!isValidWhatsappPhone(env.WHATSAPP_PHONE)) {
    errors.push(
      'WHATSAPP_PHONE es obligatorio en producción y debe contener solo dígitos (código de país + número, 10–15 dígitos, sin + ni espacios).'
    );
  }

  return errors;
}

function collectDevelopmentWarnings(env) {
  const warnings = [];

  if (isWeakSessionSecret(env.SESSION_SECRET)) {
    warnings.push(
      'SESSION_SECRET vacío, corto o de ejemplo; definí uno de al menos 32 caracteres antes de producción.'
    );
  }

  const siteUrl = String(env.SITE_URL || '').trim();
  if (siteUrl && !siteUrl.startsWith('https://')) {
    warnings.push('SITE_URL usa HTTP; en producción debe ser https://.');
  }
  if (siteUrl && hasTrailingSlash(siteUrl)) {
    warnings.push('SITE_URL termina con barra final; conviene quitarla.');
  }

  if (String(env.DB_USER || '').trim().toLowerCase() === 'sa') {
    warnings.push('DB_USER es "sa"; evitá esa cuenta en producción.');
  }

  if (isTrivialDbPassword(env.DB_PASSWORD)) {
    warnings.push('DB_PASSWORD vacía o débil; usá una contraseña segura en producción.');
  }

  if (env.DB_TRUST_SERVER_CERTIFICATE) {
    warnings.push(
      'DB_TRUST_SERVER_CERTIFICATE=true; desactivalo en producción salvo entornos locales.'
    );
  }

  if (!isValidWhatsappPhone(env.WHATSAPP_PHONE)) {
    warnings.push(
      'WHATSAPP_PHONE ausente o inválido; el carrito por WhatsApp puede no funcionar.'
    );
  }

  return warnings;
}

/**
 * @param {import('./env')} env
 */
function validateEnvironment(env) {
  const isProduction = env.NODE_ENV === 'production';

  if (isProduction) {
    const errors = collectProductionErrors(env);

    if (errors.length > 0) {
      logger.error('Configuración inválida para producción. El servidor no arrancará.');
      errors.forEach((message) => logger.error(message));
      logger.error('Corregí las variables en .env o en el entorno del despliegue.');
      process.exit(1);
    }

    return;
  }

  const warnings = collectDevelopmentWarnings(env);
  if (warnings.length > 0) {
    logger.warn('Advertencias de configuración (development):');
    warnings.forEach((message) => logger.warn(message));
  }
}

module.exports = {
  validateEnvironment,
  collectProductionErrors,
  collectDevelopmentWarnings,
  isValidWhatsappPhone,
  isWeakSessionSecret,
  isTrivialDbPassword,
};
