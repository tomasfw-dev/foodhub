/*
  FoodHub — Desacople marca pública / plataforma
  Ejecutar en bases existentes (idempotente).

  - Quita logo de plataforma del sitio público
  - Limpia imágenes de hero con assets internos
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

PRINT 'Marca pública desacoplada de assets de plataforma.';
GO
