const request = require('supertest');
const { mockRateLimiters, mockDatabase } = require('../helpers/mocks');
const { loginAsAdmin, csrfFromResponse } = require('../helpers/authAgent');

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
  validar: jest.requireActual('../../backend/services/admin/configuracion.service').validar,
  actualizar: jest.fn(),
}));

jest.mock('../../backend/services/admin/dashboard.service', () => ({
  getEstadisticas: jest.fn().mockResolvedValue({
    totalCategorias: 1,
    totalProductos: 2,
    productosActivos: 1,
    productosInactivos: 1,
  }),
}));

const app = require('../../backend/app');

describe('Admin protected routes', () => {
  it('GET /admin sin sesión redirige a login', async () => {
    await request(app).get('/admin').expect(302).expect('Location', /auth\/login/);
  });

  it('GET /admin con sesión responde 200', async () => {
    const agent = await loginAsAdmin(app);
    const res = await agent.get('/admin').expect(200);
    expect(res.text).toMatch(/Dashboard/i);
  });

  it('GET /admin/productos con sesión responde 200', async () => {
    const db = require('../../backend/database/connection');
    db.query.mockResolvedValue([]);

    const agent = await loginAsAdmin(app);
    const res = await agent.get('/admin/productos').expect(200);
    expect(res.text).toMatch(/Productos/i);
  });

  it('POST admin sin CSRF es rechazado', async () => {
    const agent = await loginAsAdmin(app);

    await agent
      .post('/admin/categorias')
      .type('form')
      .send({ nombre: 'Sin CSRF' })
      .expect(302);
  });

  it('GET /admin/configuracion muestra formulario', async () => {
    const agent = await loginAsAdmin(app);
    const res = await agent.get('/admin/configuracion').expect(200);
    expect(res.text).toMatch(/Configuración|nombre_negocio/i);
  });
});

describe('Admin configuración POST', () => {
  it('rechaza datos inválidos vía validación', async () => {
    const configuracionService = require('../../backend/services/admin/configuracion.service');
    const agent = await loginAsAdmin(app);

    const page = await agent.get('/admin/configuracion');
    const csrf = csrfFromResponse(page);

    configuracionService.actualizar.mockRejectedValue(
      Object.assign(new Error('El nombre del negocio es obligatorio'), { status: 400 })
    );

    await agent
      .post('/admin/configuracion')
      .type('form')
      .send({
        _csrf: csrf,
        nombre_negocio: '',
        slogan: 'Test',
      })
      .expect(302);
  });
});
