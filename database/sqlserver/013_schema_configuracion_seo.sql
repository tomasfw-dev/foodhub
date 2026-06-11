/*
  Bendita-Comida — Campos SEO / Open Graph en ConfiguracionNegocio
  Ejecutar en bases existentes después de 007_schema_configuracion_negocio.sql
*/

SET NOCOUNT ON;
GO

IF COL_LENGTH('dbo.ConfiguracionNegocio', 'seo_title') IS NULL
BEGIN
    ALTER TABLE dbo.ConfiguracionNegocio ADD seo_title NVARCHAR(120) NULL;
    PRINT 'Columna seo_title agregada.';
END
GO

IF COL_LENGTH('dbo.ConfiguracionNegocio', 'seo_description') IS NULL
BEGIN
    ALTER TABLE dbo.ConfiguracionNegocio ADD seo_description NVARCHAR(320) NULL;
    PRINT 'Columna seo_description agregada.';
END
GO

IF COL_LENGTH('dbo.ConfiguracionNegocio', 'seo_keywords') IS NULL
BEGIN
    ALTER TABLE dbo.ConfiguracionNegocio ADD seo_keywords NVARCHAR(500) NULL;
    PRINT 'Columna seo_keywords agregada.';
END
GO

IF COL_LENGTH('dbo.ConfiguracionNegocio', 'og_image') IS NULL
BEGIN
    ALTER TABLE dbo.ConfiguracionNegocio ADD og_image NVARCHAR(500) NULL;
    PRINT 'Columna og_image agregada.';
END
GO
