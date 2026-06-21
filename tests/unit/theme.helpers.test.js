const themeHelpers = require('../../backend/utils/theme.helpers');

describe('theme.helpers', () => {
  describe('normalizeHexColor', () => {
    it('normaliza HEX de 3 dígitos', () => {
      expect(themeHelpers.normalizeHexColor('#abc')).toBe('#aabbcc');
    });

    it('acepta HEX sin numeral', () => {
      expect(themeHelpers.normalizeHexColor('ff5733')).toBe('#ff5733');
    });

    it('rechaza valores inválidos', () => {
      expect(themeHelpers.normalizeHexColor('rojo')).toBeNull();
      expect(themeHelpers.normalizeHexColor('#gggggg')).toBeNull();
    });
  });

  describe('validateThemeColors', () => {
    it('acepta colores vacíos', () => {
      const result = themeHelpers.validateThemeColors({});
      expect(result.valid).toBe(true);
      expect(result.sanitized.color_primario).toBeNull();
    });

    it('sanitiza colores válidos', () => {
      const result = themeHelpers.validateThemeColors({
        color_primario: '#FF5733',
        color_fondo: '#ffffff',
      });
      expect(result.valid).toBe(true);
      expect(result.sanitized.color_primario).toBe('#ff5733');
    });

    it('rechaza HEX inválido', () => {
      const result = themeHelpers.validateThemeColors({
        color_primario: 'not-a-color',
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toMatch(/Color primario/i);
    });
  });

  describe('buildThemeCssVars', () => {
    it('retorna null sin tema personalizado', () => {
      expect(themeHelpers.buildThemeCssVars({})).toBeNull();
    });

    it('genera variables CSS con color primario', () => {
      const vars = themeHelpers.buildThemeCssVars({ color_primario: '#112233' });
      expect(vars).not.toBeNull();
      expect(vars['--color-primary']).toBe('#112233');
    });
  });
});
