/**
 * Servicio de autenticación — FoodHub
 */
const bcrypt = require('bcrypt');

const db = require('../database/connection');
const queries = require('../database/queries/auth.queries');
const logger = require('../utils/logger');
const { validateAdminPasswordPolicy } = require('../utils/password.helpers');

const BCRYPT_ROUNDS = 12;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class AuthError extends Error {
  constructor(message, code = 'AUTH_ERROR') {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.status = 401;
  }
}

/**
 * Normaliza email para búsqueda consistente.
 */
function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

/**
 * Valida formato básico de credenciales de login.
 */
exports.validateLoginInput = (email, password) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
    return { valid: false, message: 'Ingresá un email válido.' };
  }

  if (!password || !String(password).length) {
    return { valid: false, message: 'Ingresá tu contraseña.' };
  }

  return { valid: true, email: normalizedEmail };
};

/**
 * Busca administrador activo por email.
 */
exports.findAdminByEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email);

  logger.info('Buscando administrador por email', { email: normalizedEmail });

  const rows = await db.query(queries.ADMIN_POR_EMAIL, { email: normalizedEmail });
  return rows[0] || null;
};

/**
 * Verifica administrador activo por id (sesión).
 */
exports.findAdminById = async (id) => {
  if (!id) return null;

  const rows = await db.query(queries.ADMIN_POR_ID, { id });
  return rows[0] || null;
};

/**
 * Autentica email + contraseña. Retorna datos seguros del admin.
 */
exports.authenticate = async (email, password) => {
  const validation = exports.validateLoginInput(email, password);

  if (!validation.valid) {
    throw new AuthError(validation.message, 'VALIDATION_ERROR');
  }

  const admin = await exports.findAdminByEmail(validation.email);

  if (!admin || !admin.activo) {
    logger.warn('Intento de login fallido', { email: validation.email });
    throw new AuthError('Credenciales inválidas.', 'INVALID_CREDENTIALS');
  }

  const passwordMatch = await bcrypt.compare(password, admin.password_hash);

  if (!passwordMatch) {
    logger.warn('Contraseña incorrecta', { email: validation.email, adminId: admin.id });
    throw new AuthError('Credenciales inválidas.', 'INVALID_CREDENTIALS');
  }

  logger.info('Login exitoso', { adminId: admin.id, email: admin.email });

  return {
    id: admin.id,
    nombre: admin.nombre,
    email: admin.email,
    sesion_version: admin.sesion_version ?? 1,
  };
};

/**
 * Genera hash bcrypt (utilidad para seeds / cambio de contraseña futuro).
 */
exports.hashPassword = async (plainPassword) => {
  const policy = validateAdminPasswordPolicy(plainPassword);
  if (!policy.valid) {
    throw new AuthError(policy.errors.join(' '), 'VALIDATION_ERROR');
  }
  return bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
};

exports.AuthError = AuthError;
