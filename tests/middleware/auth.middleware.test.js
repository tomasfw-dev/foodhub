jest.mock('../../backend/services/auth.service', () => {
  const actual = jest.requireActual('../../backend/services/auth.service');
  return {
    ...actual,
    findAdminById: jest.fn(),
  };
});

const authService = require('../../backend/services/auth.service');
const { requireAuth, redirectIfAuthenticated } = require('../../backend/middlewares/auth.middleware');

function createMockRes() {
  const res = {
    locals: {},
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json: jest.fn(function json(payload) {
      this.body = payload;
      return this;
    }),
    redirect: jest.fn(function redirect(url) {
      this.redirectUrl = url;
      return this;
    }),
  };
  return res;
}

describe('auth.middleware', () => {
  describe('requireAuth', () => {
    it('redirige a login si no hay sesión', async () => {
      const req = { session: {}, originalUrl: '/admin/productos', accepts: () => 'html' };
      const res = createMockRes();
      const next = jest.fn();

      await requireAuth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('/auth/login'));
    });

    it('responde 401 JSON si no hay sesión y acepta JSON', async () => {
      const req = {
        session: {},
        originalUrl: '/admin/productos/api/list',
        accepts: jest.fn().mockReturnValue(false),
      };
      const res = createMockRes();
      const next = jest.fn();

      await requireAuth(req, res, next);

      expect(res.statusCode).toBe(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No autenticado' });
    });

    it('continúa si admin válido en sesión', async () => {
      authService.findAdminById.mockResolvedValue({
        id: 1,
        nombre: 'Admin',
        email: 'admin@test.com',
        activo: true,
        sesion_version: 1,
      });

      const req = {
        session: { adminId: 1, sesionVersion: 1 },
        originalUrl: '/admin',
        accepts: () => 'html',
      };
      const res = createMockRes();
      const next = jest.fn();

      await requireAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.admin.id).toBe(1);
    });

    it('invalida sesión si cambió sesion_version', async () => {
      authService.findAdminById.mockResolvedValue({
        id: 1,
        nombre: 'Admin',
        email: 'admin@test.com',
        activo: true,
        sesion_version: 2,
      });

      const req = {
        session: {
          adminId: 1,
          sesionVersion: 1,
          destroy: jest.fn((cb) => cb()),
        },
        originalUrl: '/admin',
        accepts: () => 'html',
      };
      const res = createMockRes();
      const next = jest.fn();

      await requireAuth(req, res, next);

      expect(req.session.destroy).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(expect.stringMatching(/contrase/i));
    });
  });

  describe('redirectIfAuthenticated', () => {
    it('redirige al dashboard si ya hay sesión', () => {
      const req = { session: { adminId: 1 } };
      const res = createMockRes();
      const next = jest.fn();

      redirectIfAuthenticated(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/admin');
      expect(next).not.toHaveBeenCalled();
    });

    it('continúa si no hay sesión', () => {
      const req = { session: {} };
      const res = createMockRes();
      const next = jest.fn();

      redirectIfAuthenticated(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
