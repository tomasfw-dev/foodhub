jest.mock('../../backend/database/connection', () => ({
  query: jest.fn(),
  closePool: jest.fn(),
}));

const testimoniosService = require('../../backend/services/testimonios.service');

describe('testimonios.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('crearPublico', () => {
    it('rechaza comentario muy corto', async () => {
      await expect(
        testimoniosService.crearPublico({
          nombre_cliente: 'Juan',
          comentario: 'Ok',
          puntuacion: 5,
        })
      ).rejects.toMatchObject({
        status: 400,
        message: expect.stringMatching(/comentario/i),
      });
    });

    it('rechaza HTML en comentario', async () => {
      await expect(
        testimoniosService.crearPublico({
          nombre_cliente: 'Juan',
          comentario: '<script>alert(1)</script> Muy rico',
          puntuacion: 5,
        })
      ).rejects.toMatchObject({
        status: 400,
        message: expect.stringMatching(/HTML/i),
      });
    });

    it('rechaza puntuación inválida', async () => {
      await expect(
        testimoniosService.crearPublico({
          nombre_cliente: 'Juan',
          comentario: 'Excelente comida',
          puntuacion: 6,
        })
      ).rejects.toMatchObject({
        status: 400,
        message: expect.stringMatching(/puntuación/i),
      });
    });

    it('crea testimonio pendiente con datos válidos', async () => {
      const db = require('../../backend/database/connection');
      db.query.mockResolvedValue([
        {
          id: 10,
          nombre_cliente: 'María G.',
          comentario: 'Muy rica la pizza',
          puntuacion: 5,
          activo: 0,
          estado: 'pendiente',
          orden: null,
          fecha_creacion: new Date(),
          fecha_modificacion: null,
        },
      ]);

      const testimonio = await testimoniosService.crearPublico({
        nombre_cliente: 'María G.',
        comentario: 'Muy rica la pizza',
        puntuacion: 5,
      });

      expect(testimonio.estado).toBe('pendiente');
      expect(testimonio.activo).toBe(false);
      expect(db.query).toHaveBeenCalled();
    });
  });
});
