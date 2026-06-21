const request = require('supertest');
const { mockRateLimiters, mockDatabase, extractCsrfToken } = require('../helpers/mocks');
const { loginAsAdmin } = require('../helpers/authAgent');

mockRateLimiters();
mockDatabase();

jest.mock('../../backend/services/auth.service', () => {
  const actual = jest.requireActual('../../backend/services/auth.service');
  return {
    ...actual,
    authenticate: jest.fn(),
    findAdminByEmail: jest.fn(),
    findAdminById: jest.fn(),
  };
});

jest.mock('../../backend/services/admin/configuracion.service', () => ({
  obtener: jest.fn().mockResolvedValue({
    id: 1,
    nombre_negocio: 'Test Negocio',
    slogan: 'Slogan test',
    telefono: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    direccion: '',
    horarios: '',
    email: '',
    logo: '',
    logoUrl: '',
    mensaje_whatsapp: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    og_image: '',
    ogImageUrl: '',
    color_primario: '',
    color_secundario: '',
    color_fondo: '',
    color_texto: '',
    color_acento: '',
  }),
  toViewLocals: jest.fn().mockReturnValue({
    appName: 'Test Negocio',
    site: { tagline: 'Slogan test' },
    whatsapp: { phone: '5491112345678', defaultMessage: 'Hola' },
  }),
  invalidateCache: jest.fn(),
}));

jest.mock('../../backend/services/admin/dashboard.service', () => ({
  getEstadisticas: jest.fn().mockResolvedValue({
    totalCategorias: 0,
    totalProductos: 0,
    productosActivos: 0,
    productosInactivos: 0,
  }),
}));

const authService = require('../../backend/services/auth.service');
const app = require('../../backend/app');

describe('Auth routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /auth/login', () => {
    it('muestra formulario de login', async () => {
      const res = await request(app).get('/auth/login').expect(200);
      expect(res.text).toMatch(/Iniciar sesión/i);
      expect(extractCsrfToken(res.text)).toBeTruthy();
    });
  });

  describe('POST /auth/login', () => {
    it('redirige al dashboard con credenciales válidas', async () => {
      authService.authenticate.mockResolvedValue({
        id: 1,
        nombre: 'Admin Test',
        email: 'admin@test.com',
        sesion_version: 1,
      });

      const agent = request.agent(app);
      const loginPage = await agent.get('/auth/login');
      const csrf = extractCsrfToken(loginPage.text);

      await agent
        .post('/auth/login')
        .type('form')
        .send({ email: 'admin@test.com', password: 'secret12', _csrf: csrf })
        .expect(302)
        .expect('Location', '/admin');
    });

    it('muestra error con credenciales inválidas', async () => {
      const { AuthError } = jest.requireActual('../../backend/services/auth.service');
      authService.authenticate.mockRejectedValue(new AuthError('Credenciales inválidas.'));

      const agent = request.agent(app);
      const loginPage = await agent.get('/auth/login');
      const csrf = extractCsrfToken(loginPage.text);

      const res = await agent
        .post('/auth/login')
        .type('form')
        .send({ email: 'admin@test.com', password: 'wrongpass', _csrf: csrf })
        .expect(200);

      expect(res.text).toMatch(/Credenciales inválidas/i);
    });
  });

  describe('Logout', () => {
    it('POST /auth/logout cierra sesión', async () => {
      const agent = await loginAsAdmin(app);

      const page = await agent.get('/admin').expect(200);
      const csrf = extractCsrfToken(page.text);

      await agent
        .post('/auth/logout')
        .type('form')
        .send({ _csrf: csrf })
        .expect(302)
        .expect('Location', /auth\/login/);

      await agent.get('/admin').expect(302).expect('Location', /auth\/login/);
    });

    it('GET /auth/logout no cierra sesión', async () => {
      const agent = await loginAsAdmin(app);

      await agent.get('/auth/logout').expect(302).expect('Location', '/admin');
      await agent.get('/admin').expect(200);
    });
  });
});
