/*
  Menú de ejemplo — instalación demo
  Ejecutar después de 001_schema_bendita_comida.sql
*/

SET NOCOUNT ON;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Categorias)
BEGIN
    INSERT INTO dbo.Categorias (nombre, descripcion, activo, orden)
    VALUES
        (N'Entradas', N'Para comenzar', 1, 1),
        (N'Platos principales', N'Opciones de la carta', 1, 2);

    INSERT INTO dbo.Productos (categoria_id, nombre, descripcion, precio, imagen, activo, destacado, orden)
    VALUES
        (1, N'Ensalada de la casa', N'Verduras frescas de estación.', 3200.00, NULL, 1, 0, 1),
        (1, N'Empanadas (docena)', N'Rellenos clásicos, masa casera.', 4500.00, NULL, 1, 1, 2),
        (2, N'Plato del día', N'Consultá la propuesta de hoy.', 5200.00, NULL, 1, 1, 1),
        (2, N'Opción vegetariana', N'Preparación sin carne, consultar ingredientes.', 4800.00, NULL, 1, 0, 2);

    PRINT 'Menú de ejemplo insertado.';
END
ELSE
BEGIN
    PRINT 'Ya existen categorías — menú de ejemplo omitido.';
END
GO
