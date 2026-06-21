jest.mock('../../backend/database/connection', () => ({
  query: jest.fn(),
  closePool: jest.fn(),
}));

const promocionesService = require('../../backend/services/admin/promociones.service');

describe('promociones.service validar', () => {
  const baseValid = {
    nombre: 'Combo familiar',
    descripcion: 'Incluye pizza y gaseosa',
    activo: 'on',
  };

  it('acepta promoción válida sin fechas', () => {
    const result = promocionesService.validar(baseValid);
    expect(result.valid).toBe(true);
    expect(result.sanitized.nombre).toBe('Combo familiar');
    expect(result.sanitized.fecha_inicio).toBeNull();
  });

  it('rechaza nombre corto', () => {
    const result = promocionesService.validar({ ...baseValid, nombre: 'A' });
    expect(result.valid).toBe(false);
  });

  it('rechaza precio promocional negativo', () => {
    const result = promocionesService.validar({ ...baseValid, precio_promocional: '-10' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/precio promocional/i);
  });

  it('rechaza formato de fecha inválido', () => {
    const result = promocionesService.validar({
      ...baseValid,
      fecha_inicio: '31/12/2026',
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/fecha/i);
  });

  it('rechaza fecha fin anterior a inicio', () => {
    const result = promocionesService.validar({
      ...baseValid,
      fecha_inicio: '2026-06-01',
      fecha_fin: '2026-05-01',
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/posterior/i);
  });

  it('rechaza imagen con URL externa', () => {
    expect(() =>
      promocionesService.validar({
        ...baseValid,
        imagen: 'https://evil.com/promo.jpg',
      })
    ).toThrow(/externa/i);
  });
});

describe('promociones.service vigencia', () => {
  const db = require('../../backend/database/connection');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('marca promoción programada cuando inicia en el futuro', async () => {
    db.query.mockResolvedValue([
      {
        id: 1,
        nombre: 'Futura',
        descripcion: '',
        imagen: null,
        precio_promocional: null,
        fecha_inicio: '2099-01-01',
        fecha_fin: null,
        activo: 1,
        destacado: 0,
      },
    ]);

    const promos = await promocionesService.listar();
    expect(promos[0].vigencia.estado).toBe('programada');
    expect(promos[0].vigencia.visibleEnHome).toBe(false);
  });

  it('marca promoción permanente sin fechas', async () => {
    db.query.mockResolvedValue([
      {
        id: 2,
        nombre: 'Permanente',
        descripcion: '',
        imagen: null,
        precio_promocional: 1000,
        fecha_inicio: null,
        fecha_fin: null,
        activo: 1,
        destacado: 0,
      },
    ]);

    const promos = await promocionesService.listar();
    expect(promos[0].vigencia.estado).toBe('permanente');
    expect(promos[0].vigencia.visibleEnHome).toBe(true);
  });
});
