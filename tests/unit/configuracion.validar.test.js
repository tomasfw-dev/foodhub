const configuracionService = require('../../backend/services/admin/configuracion.service');

describe('configuracion.service validar', () => {
  const baseValid = {
    nombre_negocio: 'Mi Local',
    slogan: 'Comida casera',
  };

  it('acepta configuración mínima válida', () => {
    const result = configuracionService.validar(baseValid);
    expect(result.valid).toBe(true);
    expect(result.sanitized.nombre_negocio).toBe('Mi Local');
  });

  it('rechaza nombre corto', () => {
    const result = configuracionService.validar({ ...baseValid, nombre_negocio: 'A' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/nombre del negocio/i);
  });

  it('rechaza slogan corto', () => {
    const result = configuracionService.validar({ ...baseValid, slogan: 'Ok' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/slogan/i);
  });

  it('rechaza email inválido', () => {
    const result = configuracionService.validar({ ...baseValid, email: 'mal-email' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/email/i);
  });

  it('rechaza URL de Instagram inválida', () => {
    const result = configuracionService.validar({
      ...baseValid,
      instagram: 'instagram.com/foo',
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/Instagram/i);
  });

  it('sanitiza teléfonos a solo dígitos', () => {
    const result = configuracionService.validar({
      ...baseValid,
      telefono: '011 1234-5678',
      whatsapp: '+54 9 11 1234-5678',
    });
    expect(result.valid).toBe(true);
    expect(result.sanitized.telefono).toBe('01112345678');
    expect(result.sanitized.whatsapp).toBe('5491112345678');
  });

  it('rechaza título SEO demasiado largo', () => {
    const result = configuracionService.validar({
      ...baseValid,
      seo_title: 'x'.repeat(121),
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/SEO/i);
  });
});
