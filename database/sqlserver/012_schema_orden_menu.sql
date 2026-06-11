/*
  Bendita-Comida — Orden configurable de categorías y productos
  Ejecutar en bases existentes después de 001_schema_bendita_comida.sql
*/

SET NOCOUNT ON;
GO

IF COL_LENGTH('dbo.Categorias', 'orden') IS NULL
BEGIN
    ALTER TABLE dbo.Categorias
    ADD orden INT NULL;

    PRINT 'Columna orden agregada a Categorias.';
END
ELSE
BEGIN
    PRINT 'La columna orden ya existe en Categorias — sin cambios.';
END
GO

IF COL_LENGTH('dbo.Productos', 'orden') IS NULL
BEGIN
    ALTER TABLE dbo.Productos
    ADD orden INT NULL;

    PRINT 'Columna orden agregada a Productos.';
END
ELSE
BEGIN
    PRINT 'La columna orden ya existe en Productos — sin cambios.';
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.check_constraints
    WHERE name = N'CK_Categorias_orden'
)
BEGIN
    ALTER TABLE dbo.Categorias
    ADD CONSTRAINT CK_Categorias_orden
        CHECK (orden IS NULL OR orden >= 0);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.check_constraints
    WHERE name = N'CK_Productos_orden'
)
BEGIN
    ALTER TABLE dbo.Productos
    ADD CONSTRAINT CK_Productos_orden
        CHECK (orden IS NULL OR orden >= 0);
END
GO
