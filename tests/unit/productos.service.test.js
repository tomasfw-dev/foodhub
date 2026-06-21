jest.mock('../../backend/database/connection', () => ({
  query: jest.fn(),
  closePool: jest.fn(),
}));

const productosService = require('../../backend/services/admin/productos.service');

describe('productos.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rechaza crear producto sin nombre', async () => {
    await expect(
      productosService.crear({ categoriaId: 1, nombre: '  ' })
    ).rejects.toMatchObject({
      status: 400,
      message: expect.stringMatching(/nombre/i),
    });
  });

  it('rechaza crear producto sin categoría', async () => {
    await expect(
      productosService.crear({ nombre: 'Pizza' })
    ).rejects.toMatchObject({
      status: 400,
      message: expect.stringMatching(/categoría/i),
    });
  });

  it('rechaza imagen con URL externa', async () => {
    const db = require('../../backend/database/connection');
    db.query.mockResolvedValueOnce([{ id: 1 }]);

    await expect(
      productosService.crear({
        nombre: 'Pizza',
        categoriaId: 1,
        imagen: 'https://evil.com/pizza.jpg',
      })
    ).rejects.toMatchObject({
      status: 400,
      message: expect.stringMatching(/externa/i),
    });
  });

  it('rechaza superar límite de destacados', async () => {
    const db = require('../../backend/database/connection');
    db.query.mockResolvedValueOnce([{ total: 6 }]);

    await expect(
      productosService.crear({
        nombre: 'Nuevo destacado',
        categoriaId: 1,
        destacado: 'on',
      })
    ).rejects.toMatchObject({
      status: 400,
      message: expect.stringMatching(/destacados/i),
    });
  });

  it('crea producto válido', async () => {
    const db = require('../../backend/database/connection');
    db.query
      .mockResolvedValueOnce([{ id: 1 }])
      .mockResolvedValueOnce([
        {
          id: 5,
          categoria_id: 1,
          nombre: 'Muzzarella',
          descripcion: '',
          precio: 4500,
          imagen: null,
          activo: 1,
          destacado: 0,
          orden: null,
        },
      ]);

    const producto = await productosService.crear({
      nombre: 'Muzzarella',
      categoriaId: 1,
      precio: '4500',
    });

    expect(producto.nombre).toBe('Muzzarella');
    expect(producto.precio).toBe(4500);
  });
});
