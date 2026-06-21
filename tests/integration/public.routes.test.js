const request = require('supertest');
const { mockRateLimiters, mockDatabase } = require('../helpers/mocks');

mockRateLimiters();
mockDatabase();

jest.mock('../../backend/services/menu.service', () => ({
  getFeaturedItems: jest.fn().mockResolvedValue([]),
  getPromotions: jest.fn().mockResolvedValue([]),
  getMenuAgrupado: jest.fn().mockResolvedValue([]),
  getFullMenu: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../backend/services/hero.service', () => ({
  obtenerActivo: jest.fn().mockResolvedValue(null),
  invalidateCache: jest.fn(),
}));

jest.mock('../../backend/services/testimonios.service', () => ({
  listarActivos: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../backend/services/admin/configuracion.service', () => ({
  obtener: jest.fn().mockRejectedValue(new Error('no db')),
  toViewLocals: jest.fn(),
  invalidateCache: jest.fn(),
}));

const app = require('../../backend/app');

describe('Public routes', () => {
  it('GET / responde 200', async () => {
    const res = await request(app).get('/').expect(200);
    expect(res.text).toMatch(/html/i);
  });

  it('GET /menu responde 200', async () => {
    await request(app).get('/menu').expect(200);
  });

  it('GET /informacion-util responde 200', async () => {
    await request(app).get('/informacion-util').expect(200);
  });
});

describe('SEO routes', () => {
  it('GET /robots.txt incluye reglas básicas', async () => {
    const res = await request(app).get('/robots.txt').expect(200);
    expect(res.text).toMatch(/User-agent/i);
    expect(res.text).toMatch(/Disallow: \/admin\//);
    expect(res.text).toMatch(/Sitemap/i);
  });

  it('GET /sitemap.xml devuelve XML con URLs públicas', async () => {
    const res = await request(app).get('/sitemap.xml').expect(200);
    expect(res.headers['content-type']).toMatch(/xml/i);
    expect(res.text).toMatch(/<loc>.*\/menu<\/loc>/);
    expect(res.text).toMatch(/informacion-util/);
  });
});

describe('Public testimonios POST', () => {
  it('rechaza envío sin CSRF', async () => {
    await request(app)
      .post('/testimonios')
      .type('form')
      .send({
        nombre_cliente: 'Juan',
        comentario: 'Muy bueno',
        puntuacion: 5,
      })
      .expect(302);
  });
});
