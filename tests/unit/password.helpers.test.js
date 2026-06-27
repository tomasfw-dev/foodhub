const {
  validateAdminPasswordPolicy,
  POLICY_MESSAGE,
} = require('../../backend/utils/password.helpers');

describe('password.helpers', () => {
  it('acepta contraseña que cumple la política', () => {
    const result = validateAdminPasswordPolicy('MiClaveSegura1!');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rechaza contraseña corta', () => {
    const result = validateAdminPasswordPolicy('Corta1!');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toBe(POLICY_MESSAGE);
  });

  it('rechaza contraseña sin símbolo', () => {
    const result = validateAdminPasswordPolicy('MiClaveSegura12');
    expect(result.valid).toBe(false);
  });

  it('rechaza contraseña sin mayúscula', () => {
    const result = validateAdminPasswordPolicy('miclavesegura1!');
    expect(result.valid).toBe(false);
  });
});
