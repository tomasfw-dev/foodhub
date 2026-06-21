/*
  FoodHub — Estado de moderación en Testimonios
  Ejecutar después de 016_schema_testimonios.sql
*/

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
GO

IF COL_LENGTH('dbo.Testimonios', 'estado') IS NULL
BEGIN
    ALTER TABLE dbo.Testimonios
    ADD estado NVARCHAR(20) NOT NULL
        CONSTRAINT DF_Testimonios_estado DEFAULT ('aprobado');

    PRINT 'Columna estado agregada.';
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.check_constraints
    WHERE name = N'CK_Testimonios_estado'
      AND parent_object_id = OBJECT_ID(N'dbo.Testimonios')
)
BEGIN
    ALTER TABLE dbo.Testimonios
    ADD CONSTRAINT CK_Testimonios_estado
        CHECK (estado IN (N'pendiente', N'aprobado', N'rechazado'));

    PRINT 'Constraint CK_Testimonios_estado agregada.';
END
GO

UPDATE dbo.Testimonios
SET estado = N'aprobado'
WHERE estado IS NULL OR estado = N'';
GO

PRINT 'Testimonios existentes marcados como aprobados.';
GO
