const {
  attachCsrfToken,
  verifyCsrf,
  createCsrfError,
  CSRF_FIELD,
} = require('../../backend/middlewares/csrf.middleware');

function createMockRes() {
  return {
    locals: {},
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json: jest.fn(),
  };
}

describe('csrf.middleware', () => {
  it('genera token CSRF en attachCsrfToken', () => {
    const req = { session: {}, method: 'GET' };
    const res = createMockRes();
    const next = jest.fn();

    attachCsrfToken(req, res, next);

    expect(res.locals.csrfToken).toBeTruthy();
    expect(typeof req.csrfToken).toBe('function');
    expect(next).toHaveBeenCalled();
  });

  it('verifyCsrf rechaza POST sin token', () => {
    const req = {
      session: { csrfSecret: undefined },
      method: 'POST',
      body: {},
      headers: {},
    };
    attachCsrfToken(req, createMockRes(), () => {});

    const res = createMockRes();
    const next = jest.fn();

    verifyCsrf(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ code: 'EBADCSRFTOKEN' }));
  });

  it('verifyCsrf acepta token válido en body', () => {
    const req = { session: {}, method: 'GET', headers: {} };
    const res = createMockRes();
    attachCsrfToken(req, res, () => {});

    const token = res.locals.csrfToken;
    req.method = 'POST';
    req.body = { [CSRF_FIELD]: token };

    const next = jest.fn();
    verifyCsrf(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('createCsrfError tiene status 403', () => {
    const err = createCsrfError();
    expect(err.status).toBe(403);
    expect(err.code).toBe('EBADCSRFTOKEN');
  });
});
