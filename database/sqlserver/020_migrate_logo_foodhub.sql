/*
  Obsoleto — usar 021_migrate_marca_publica.sql
  Limpia logos legacy sin asignar logo de plataforma al sitio público.
*/

SET NOCOUNT ON;
GO

UPDATE dbo.ConfiguracionNegocio
SET logo = NULL
WHERE logo IS NOT NULL
  AND (
    logo LIKE N'%logo-default%'
    OR logo LIKE N'%bendita%'
    OR logo LIKE N'%comidacarito%'
  );
GO

UPDATE dbo.HeroHome
SET imagen = NULL
WHERE imagen IS NOT NULL
  AND (
    imagen LIKE N'%logo-default%'
    OR imagen LIKE N'%bendita%'
    OR imagen LIKE N'%comidacarito%'
  );
GO

PRINT 'Logos legacy eliminados del sitio público (sin logo de plataforma).';
GO
