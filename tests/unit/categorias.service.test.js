jest.mock('../../backend/database/connection', () => ({
  query: jest.fn(),
  closePool: jest.fn(),
}));

const categoriasService = require('../../backend/services/admin/categorias.service');

describe('categorias.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rechaza crear categoría sin nombre', async () => {
    await expect(categoriasService.crear({ nombre: '   ' })).rejects.toMatchObject({
      status: 400,
      message: expect.stringMatching(/nombre/i),
    });
  });

  it('crea categoría válida', async () => {
    const db = require('../../backend/database/connection');
    db.query.mockResolvedValue([
      {
        id: 1,
        nombre: 'Pizzas',
        descripcion: '',
        activo: 1,
        orden: null,
      },
    ]);

    const categoria = await categoriasService.crear({
      nombre: 'Pizzas',
      activo: true,
    });

    expect(categoria.nombre).toBe('Pizzas');
    expect(categoria.activo).toBe(true);
  });

  it('lanza 404 al editar categoría inexistente', async () => {
    const db = require('../../backend/database/connection');
    db.query.mockResolvedValue([]);

    await expect(
      categoriasService.editar(999, { nombre: 'Nueva' })
    ).rejects.toMatchObject({
      status: 404,
    });
  });

  it('impide eliminar categoría con productos activos', async () => {
    const db = require('../../backend/database/connection');
    db.query.mockResolvedValueOnce([{ total: 2 }]);

    await expect(categoriasService.eliminar(1)).rejects.toMatchObject({
      status: 400,
      message: expect.stringMatching(/productos activos/i),
    });
  });
});
