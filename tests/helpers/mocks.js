function mockRateLimiters() {
  jest.mock('../../backend/middlewares/rateLimit.middleware', () => ({
    globalRateLimiter: (_req, _res, next) => next(),
    loginRateLimiter: (_req, _res, next) => next(),
    testimonialRateLimiter: (_req, _res, next) => next(),
  }));
}

function mockDatabase() {
  jest.mock('../../backend/database/connection', () => ({
    query: jest.fn().mockResolvedValue([]),
    closePool: jest.fn().mockResolvedValue(undefined),
  }));
}

function extractCsrfToken(html) {
  const match = String(html).match(/name="_csrf"\s+value="([^"]+)"/);
  return match ? match[1] : null;
}

const MOCK_ADMIN = {
  id: 1,
  nombre: 'Admin Test',
  email: 'admin@test.com',
  activo: true,
  sesion_version: 1,
  password_hash: '$2b$12$placeholder',
};

const MOCK_ADMIN_SESSION = {
  id: 1,
  nombre: 'Admin Test',
  email: 'admin@test.com',
  sesion_version: 1,
};

module.exports = {
  mockRateLimiters,
  mockDatabase,
  extractCsrfToken,
  MOCK_ADMIN,
  MOCK_ADMIN_SESSION,
};
