const bcrypt = require('bcrypt');
const authService = require('../../backend/services/auth.service');

describe('auth.service', () => {
  describe('validateLoginInput', () => {
    it('acepta email y contraseña válidos', () => {
      const result = authService.validateLoginInput('Admin@Test.com', 'secret12');
      expect(result.valid).toBe(true);
      expect(result.email).toBe('admin@test.com');
    });

    it('rechaza email inválido', () => {
      const result = authService.validateLoginInput('no-es-email', 'secret12');
      expect(result.valid).toBe(false);
      expect(result.message).toMatch(/email válido/i);
    });

    it('rechaza contraseña vacía', () => {
      const result = authService.validateLoginInput('admin@test.com', '');
      expect(result.valid).toBe(false);
      expect(result.message).toMatch(/contraseña/i);
    });

    it('normaliza espacios en email', () => {
      const result = authService.validateLoginInput('  admin@test.com  ', 'secret12');
      expect(result.valid).toBe(true);
      expect(result.email).toBe('admin@test.com');
    });
  });

  describe('authenticate', () => {
    beforeEach(() => {
      jest.spyOn(authService, 'findAdminByEmail');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('lanza AuthError con credenciales inválidas si no hay admin', async () => {
      authService.findAdminByEmail.mockResolvedValue(null);

      await expect(authService.authenticate('admin@test.com', 'secret12')).rejects.toMatchObject({
        name: 'AuthError',
        message: 'Credenciales inválidas.',
      });
    });

    it('lanza AuthError si la contraseña no coincide', async () => {
      const hash = await bcrypt.hash('otra-clave', 4);
      authService.findAdminByEmail.mockResolvedValue({
        id: 1,
        email: 'admin@test.com',
        activo: true,
        password_hash: hash,
        sesion_version: 1,
      });

      await expect(authService.authenticate('admin@test.com', 'secret12')).rejects.toMatchObject({
        name: 'AuthError',
        message: 'Credenciales inválidas.',
      });
    });

    it('retorna datos seguros del admin en login exitoso', async () => {
      const hash = await bcrypt.hash('secret12', 4);
      authService.findAdminByEmail.mockResolvedValue({
        id: 42,
        nombre: 'Tester',
        email: 'admin@test.com',
        activo: true,
        password_hash: hash,
        sesion_version: 2,
      });

      const admin = await authService.authenticate('admin@test.com', 'secret12');

      expect(admin).toEqual({
        id: 42,
        nombre: 'Tester',
        email: 'admin@test.com',
        sesion_version: 2,
      });
      expect(admin.password_hash).toBeUndefined();
    });
  });
});
