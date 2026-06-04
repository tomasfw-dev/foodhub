/*
  Datos de ejemplo para probar el menú dinámico.
  Ejecutar después de 001_schema_bendita_comida.sql
*/
USE BenditaComida;
GO

INSERT INTO dbo.Categorias (nombre, descripcion, activo)
VALUES
  (N'Platos principales', N'Clásicos de la casa', 1),
  (N'Tartas y horno', N'Preparaciones al horno', 1);

INSERT INTO dbo.Productos (categoria_id, nombre, descripcion, precio, imagen, activo)
VALUES
  (1, N'Milanesas caseras', N'Crocantes por fuera, jugosas por dentro.', 4500.00, NULL, 1),
  (1, N'Pollo al horno', N'Con hierbas aromáticas y papas doradas.', 4900.00, NULL, 1),
  (2, N'Lasagna de la casa', N'Ragú lentamente cocinado y bechamel sedosa.', 5200.00, NULL, 1),
  (2, N'Tarta de verduras', N'Masa casera y vegetales de estación.', 3800.00, NULL, 1);
GO
