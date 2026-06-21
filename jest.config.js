/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/setupEnv.js'],
  clearMocks: true,
  restoreMocks: true,
  testTimeout: 20000,
  collectCoverageFrom: [
    'backend/services/**/*.js',
    'backend/middlewares/auth.middleware.js',
    'backend/middlewares/csrf.middleware.js',
    'backend/utils/upload.helpers.js',
    'backend/utils/theme.helpers.js',
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
};
