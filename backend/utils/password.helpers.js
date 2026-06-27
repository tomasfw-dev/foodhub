/**
 * Política de contraseña para cuentas administrativas (cambio desde perfil).
 */
const MIN_PASSWORD_LENGTH = 12;

const POLICY_MESSAGE =
  'La contraseña debe tener al menos 12 caracteres e incluir mayúscula, minúscula, número y símbolo.';

/**
 * @param {unknown} password
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateAdminPasswordPolicy(password) {
  const value = String(password || '');
  const errors = [];

  if (value.length < MIN_PASSWORD_LENGTH) {
    errors.push(POLICY_MESSAGE);
    return { valid: false, errors };
  }

  if (!/[A-Z]/.test(value)) {
    errors.push(POLICY_MESSAGE);
  }
  if (!/[a-z]/.test(value)) {
    errors.push(POLICY_MESSAGE);
  }
  if (!/[0-9]/.test(value)) {
    errors.push(POLICY_MESSAGE);
  }
  if (!/[^A-Za-z0-9]/.test(value)) {
    errors.push(POLICY_MESSAGE);
  }

  const uniqueErrors = [...new Set(errors)];
  return {
    valid: uniqueErrors.length === 0,
    errors: uniqueErrors.length ? [POLICY_MESSAGE] : [],
  };
}

module.exports = {
  MIN_PASSWORD_LENGTH,
  POLICY_MESSAGE,
  validateAdminPasswordPolicy,
};
