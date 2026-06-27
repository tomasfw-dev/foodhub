/**
 * Perfil de administradora — datos personales y contraseña.
 */
const bcrypt = require('bcrypt');

const db = require('../../database/connection');
const queries = require('../../database/queries/perfil.queries');
const authService = require('../auth.service');
const logger = require('../../utils/logger');
const {
  validateAdminPasswordPolicy,
  POLICY_MESSAGE,
} = require('../../utils/password.helpers');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_NOMBRE_LENGTH = 2;

function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function mapPerfil(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    email: row.email,
    fecha_creacion: row.fecha_creacion,
    sesion_version: row.sesion_version,
  };
}

exports.obtenerPerfil = async (adminId) => {
  const rows = await db.query(queries.OBTENER_POR_ID, { id: Number(adminId) });

  if (!rows.length) {
    throw createError(404, 'Perfil no encontrado.');
  }

  return mapPerfil(rows[0]);
};

exports.obtenerConHash = async (adminId) => {
  const rows = await db.query(queries.OBTENER_POR_ID, { id: Number(adminId) });

  if (!rows.length) {
    throw createError(404, 'Perfil no encontrado.');
  }

  return rows[0];
};

exports.validarDatos = (datos) => {
  const errors = [];
  const nombre = datos.nombre?.trim();
  const email = normalizeEmail(datos.email);

  if (!nombre || nombre.length < MIN_NOMBRE_LENGTH) {
    errors.push(`El nombre es obligatorio (mínimo ${MIN_NOMBRE_LENGTH} caracteres).`);
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    errors.push('Ingresá un email válido.');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: { nombre, email },
  };
};

exports.actualizarDatos = async (adminId, datos) => {
  const validation = exports.validarDatos(datos);

  if (!validation.valid) {
    throw createError(400, validation.errors.join(' '));
  }

  const { nombre, email } = validation.sanitized;

  const enUso = await db.query(queries.EMAIL_EN_USO, {
    id: Number(adminId),
    email,
  });

  if (enUso.length) {
    throw createError(409, 'Ese email ya está registrado por otra cuenta.');
  }

  const rows = await db.query(queries.ACTUALIZAR_DATOS, {
    id: Number(adminId),
    nombre,
    email,
  });

  if (!rows.length) {
    throw createError(404, 'No se pudo actualizar el perfil.');
  }

  const perfil = mapPerfil(rows[0]);
  logger.info('Perfil de administradora actualizado', { adminId: perfil.id, email: perfil.email });

  return perfil;
};

exports.validarCambioPassword = (datos) => {
  const errors = [];
  const actual = datos.contrasena_actual || datos.contrasenaActual || '';
  const nueva = datos.contrasena_nueva || datos.contrasenaNueva || '';
  const confirmacion = datos.contrasena_confirmacion || datos.contrasenaConfirmacion || '';

  if (!actual) {
    errors.push('Ingresá tu contraseña actual.');
  }

  if (!nueva) {
    errors.push('Ingresá la nueva contraseña.');
  } else {
    const policy = validateAdminPasswordPolicy(nueva);
    if (!policy.valid) {
      errors.push(POLICY_MESSAGE);
    }
  }

  if (!confirmacion) {
    errors.push('Confirmá la nueva contraseña.');
  }

  if (nueva && confirmacion && nueva !== confirmacion) {
    errors.push('La confirmación no coincide con la nueva contraseña.');
  }

  if (actual && nueva && actual === nueva) {
    errors.push('La nueva contraseña debe ser distinta a la actual.');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: { actual, nueva },
  };
};

exports.cambiarPassword = async (adminId, datos) => {
  const validation = exports.validarCambioPassword(datos);

  if (!validation.valid) {
    throw createError(400, validation.errors.join(' '));
  }

  const admin = await exports.obtenerConHash(adminId);
  const passwordMatch = await bcrypt.compare(validation.sanitized.actual, admin.password_hash);

  if (!passwordMatch) {
    throw createError(400, 'La contraseña actual no es correcta.');
  }

  const passwordHash = await authService.hashPassword(validation.sanitized.nueva);

  const rows = await db.query(queries.ACTUALIZAR_PASSWORD, {
    id: Number(adminId),
    password_hash: passwordHash,
  });

  if (!rows.length) {
    throw createError(500, 'No se pudo actualizar la contraseña.');
  }

  const updated = rows[0];
  logger.info('Contraseña de administradora actualizada', {
    adminId: updated.id,
    sesionVersion: updated.sesion_version,
  });

  return {
    id: updated.id,
    nombre: updated.nombre,
    email: updated.email,
    sesion_version: updated.sesion_version,
  };
};
