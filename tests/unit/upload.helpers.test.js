const { validateStoredImagePath, createUploadError } = require('../../backend/utils/upload.helpers');

describe('upload.helpers', () => {
  describe('validateStoredImagePath', () => {
    it('acepta null o vacío', () => {
      expect(validateStoredImagePath(null)).toEqual({ ok: true, url: null });
      expect(validateStoredImagePath('')).toEqual({ ok: true, url: null });
    });

    it('acepta ruta válida de producto', () => {
      const result = validateStoredImagePath('/uploads/productos/abc123.webp', {
        requiredPrefix: '/uploads/productos/',
      });
      expect(result.ok).toBe(true);
      expect(result.url).toBe('/uploads/productos/abc123.webp');
    });

    it('rechaza path traversal', () => {
      const result = validateStoredImagePath('/uploads/productos/../../../etc/passwd');
      expect(result.ok).toBe(false);
      expect(result.message).toMatch(/no permitida/i);
    });

    it('rechaza URLs externas', () => {
      const result = validateStoredImagePath('https://evil.com/image.jpg');
      expect(result.ok).toBe(false);
    });

    it('rechaza extensiones peligrosas', () => {
      const result = validateStoredImagePath('/uploads/productos/mal.svg');
      expect(result.ok).toBe(false);
      expect(result.message).toMatch(/no permitido/i);
    });

    it('rechaza prefijo incorrecto cuando se exige', () => {
      const result = validateStoredImagePath('/uploads/logos/logo.webp', {
        requiredPrefix: '/uploads/productos/',
      });
      expect(result.ok).toBe(false);
      expect(result.message).toMatch(/debe estar en/i);
    });

    it('rechaza nombres de archivo inválidos', () => {
      const result = validateStoredImagePath('/uploads/productos/bad name.jpg');
      expect(result.ok).toBe(false);
    });
  });

  describe('createUploadError', () => {
    it('marca error como upload con status 400', () => {
      const err = createUploadError('Archivo inválido');
      expect(err.status).toBe(400);
      expect(err.isUploadError).toBe(true);
      expect(err.message).toBe('Archivo inválido');
    });
  });
});
