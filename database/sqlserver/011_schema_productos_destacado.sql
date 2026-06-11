/*
  Bendita-Comida — Campo destacado en Productos
  Ejecutar en bases existentes después de 001_schema_bendita_comida.sql
*/

SET NOCOUNT ON;
GO

IF COL_LENGTH('dbo.Productos', 'destacado') IS NULL
BEGIN
    ALTER TABLE dbo.Productos
    ADD destacado BIT NOT NULL
        CONSTRAINT DF_Productos_destacado DEFAULT (0);

    PRINT 'Columna destacado agregada a Productos.';
END
ELSE
BEGIN
    PRINT 'La columna destacado ya existe — sin cambios.';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Productos_destacados_home'
      AND object_id = OBJECT_ID(N'dbo.Productos')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_Productos_destacados_home
        ON dbo.Productos (destacado, activo, fecha_creacion DESC)
        INCLUDE (nombre, descripcion, precio, imagen, categoria_id)
        WHERE destacado = 1 AND activo = 1 AND fecha_baja IS NULL;

    PRINT 'Índice IX_Productos_destacados_home creado.';
END
GO
