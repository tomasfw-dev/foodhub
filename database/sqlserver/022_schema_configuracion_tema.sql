/*
  FoodHub — Colores del tema público en ConfiguracionNegocio
  Ejecutar en bases existentes después de 013_schema_configuracion_seo.sql
*/

SET NOCOUNT ON;
GO

IF COL_LENGTH('dbo.ConfiguracionNegocio', 'color_primario') IS NULL
BEGIN
    ALTER TABLE dbo.ConfiguracionNegocio ADD color_primario NVARCHAR(7) NULL;
    PRINT 'Columna color_primario agregada.';
END
GO

IF COL_LENGTH('dbo.ConfiguracionNegocio', 'color_secundario') IS NULL
BEGIN
    ALTER TABLE dbo.ConfiguracionNegocio ADD color_secundario NVARCHAR(7) NULL;
    PRINT 'Columna color_secundario agregada.';
END
GO

IF COL_LENGTH('dbo.ConfiguracionNegocio', 'color_fondo') IS NULL
BEGIN
    ALTER TABLE dbo.ConfiguracionNegocio ADD color_fondo NVARCHAR(7) NULL;
    PRINT 'Columna color_fondo agregada.';
END
GO

IF COL_LENGTH('dbo.ConfiguracionNegocio', 'color_texto') IS NULL
BEGIN
    ALTER TABLE dbo.ConfiguracionNegocio ADD color_texto NVARCHAR(7) NULL;
    PRINT 'Columna color_texto agregada.';
END
GO

IF COL_LENGTH('dbo.ConfiguracionNegocio', 'color_acento') IS NULL
BEGIN
    ALTER TABLE dbo.ConfiguracionNegocio ADD color_acento NVARCHAR(7) NULL;
    PRINT 'Columna color_acento agregada.';
END
GO
