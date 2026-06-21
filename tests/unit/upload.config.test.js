const uploadConfig = require('../../backend/config/upload.config');

describe('upload.config', () => {
  it('expone perfiles para todos los módulos de imagen', () => {
    expect(Object.keys(uploadConfig.IMAGE_PROFILES).sort()).toEqual(
      ['hero', 'logos', 'og', 'productos', 'promociones'].sort()
    );
  });

  it('productos permite subida de 50 MB y salida de 2 MB', () => {
    const profile = uploadConfig.getImageProfile('productos');
    expect(profile.maxUploadSize).toBe(50 * 1024 * 1024);
    expect(profile.maxOutputSize).toBe(2 * 1024 * 1024);
    expect(profile.width).toBe(1200);
  });

  it('logos tiene límite de 20 MB y salida 500 KB', () => {
    const profile = uploadConfig.getImageProfile('logos');
    expect(profile.maxUploadSize).toBe(20 * 1024 * 1024);
    expect(profile.maxOutputSize).toBe(500 * 1024);
  });

  it('resolveUploadSizeErrorMessage para productos', () => {
    const req = { originalUrl: '/admin/productos/create' };
    const message = uploadConfig.resolveUploadSizeErrorMessage(req, {});
    expect(message).toMatch(/50 MB/);
  });

  it('resolveUploadSizeErrorMessage para logo en configuración', () => {
    const req = { originalUrl: '/admin/configuracion' };
    const err = { field: 'logo' };
    const message = uploadConfig.resolveUploadSizeErrorMessage(req, err);
    expect(message).toMatch(/logo/i);
    expect(message).toMatch(/20 MB/);
  });

  it('rechaza perfil desconocido', () => {
    expect(() => uploadConfig.getImageProfile('invalido')).toThrow(/desconocido/i);
  });
});
