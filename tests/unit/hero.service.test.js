const heroService = require('../../backend/services/hero.service');

describe('hero.service validar', () => {
  const baseValid = {
    eyebrow: 'Sabores de casa',
    titulo_antes: 'Comida que',
    titulo_destacado: 'abrazan',
    titulo_despues: 'el alma',
    subtitulo: 'Pedí online por WhatsApp',
    btn_primario_texto: 'Ver menú',
    btn_primario_url: '/menu',
    activo: 'on',
  };

  it('acepta hero válido', () => {
    const result = heroService.validar(baseValid);
    expect(result.valid).toBe(true);
    expect(result.sanitized.activo).toBe(true);
  });

  it('rechaza eyebrow corto', () => {
    const result = heroService.validar({ ...baseValid, eyebrow: 'A' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/eyebrow/i);
  });

  it('rechaza subtítulo corto', () => {
    const result = heroService.validar({ ...baseValid, subtitulo: 'Hola' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/subtítulo/i);
  });

  it('rechaza URL inválida del botón primario', () => {
    const result = heroService.validar({ ...baseValid, btn_primario_url: 'javascript:alert(1)' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/botón principal/i);
  });

  it('acepta URL https en botón primario', () => {
    const result = heroService.validar({
      ...baseValid,
      btn_primario_url: 'https://example.com/menu',
    });
    expect(result.valid).toBe(true);
  });

  it('rechaza URL secundaria sin texto', () => {
    const result = heroService.validar({
      ...baseValid,
      btn_secundario_url: '/contacto',
      btn_secundario_texto: '',
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/secundario/i);
  });
});
