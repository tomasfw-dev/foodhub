const request = require('supertest');
const authService = require('../../backend/services/auth.service');
const { extractCsrfToken } = require('./mocks');

/**
 * Obtiene token CSRF desde una respuesta HTML del panel o login.
 * @param {import('supertest').Response} res
 */
function csrfFromResponse(res) {
  const token = extractCsrfToken(res.text);
  if (!token) {
    throw new Error('No se encontró token CSRF en la respuesta HTML');
  }
  return token;
}

/**
 * Login vía supertest agent (sesión + CSRF).
 * @param {import('supertest').SuperTest<import('express').Application>} app
 * @param {{ email?: string, password?: string }} [credentials]
 */
async function loginAsAdmin(app, credentials = {}) {
  authService.authenticate.mockResolvedValue({
    id: 1,
    nombre: 'Admin Test',
    email: credentials.email || 'admin@test.com',
    sesion_version: 1,
  });

  authService.findAdminById.mockResolvedValue({
    id: 1,
    nombre: 'Admin Test',
    email: credentials.email || 'admin@test.com',
    activo: true,
    sesion_version: 1,
  });

  const agent = request.agent(app);
  const loginPage = await agent.get('/auth/login').expect(200);
  const csrf = csrfFromResponse(loginPage);

  await agent
    .post('/auth/login')
    .type('form')
    .send({
      email: credentials.email || 'admin@test.com',
      password: credentials.password || 'secret12',
      _csrf: csrf,
    })
    .expect(302)
    .expect('Location', '/admin');

  return agent;
}

module.exports = {
  csrfFromResponse,
  loginAsAdmin,
};
