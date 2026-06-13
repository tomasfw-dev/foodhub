/*
  =============================================================================
  FoodHub — Eliminar todas las tablas del esquema
  =============================================================================

  USO (SSMS / Azure Data Studio):
    1. Descomentar USE con el nombre de tu base (ej. BenditaComida, FoodHub).
    2. Ejecutar este script completo.
    3. Ejecutar después: 000_install_completo.sql

  ADVERTENCIA: borra TODOS los datos (productos, admin, configuración, etc.).
  No elimina la base de datos ni archivos en frontend/public/uploads/.

  Nota: 000_install_completo.sql ya incluye la misma limpieza al inicio;
  este script sirve si querés vaciar la BD sin reinstalar todavía.
  =============================================================================
*/

-- USE BenditaComida;
-- GO

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
GO

PRINT 'FoodHub — eliminando tablas...';
GO

/* Hijos primero (FK), luego padres */
IF OBJECT_ID(N'dbo.Productos', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.Productos;
    PRINT 'Tabla dbo.Productos eliminada.';
END
GO

IF OBJECT_ID(N'dbo.Categorias', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.Categorias;
    PRINT 'Tabla dbo.Categorias eliminada.';
END
GO

IF OBJECT_ID(N'dbo.Promociones', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.Promociones;
    PRINT 'Tabla dbo.Promociones eliminada.';
END
GO

IF OBJECT_ID(N'dbo.Testimonios', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.Testimonios;
    PRINT 'Tabla dbo.Testimonios eliminada.';
END
GO

IF OBJECT_ID(N'dbo.ZonasEntrega', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.ZonasEntrega;
    PRINT 'Tabla dbo.ZonasEntrega eliminada.';
END
GO

IF OBJECT_ID(N'dbo.FormasPago', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.FormasPago;
    PRINT 'Tabla dbo.FormasPago eliminada.';
END
GO

IF OBJECT_ID(N'dbo.PreguntasFrecuentes', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.PreguntasFrecuentes;
    PRINT 'Tabla dbo.PreguntasFrecuentes eliminada.';
END
GO

IF OBJECT_ID(N'dbo.HeroHome', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.HeroHome;
    PRINT 'Tabla dbo.HeroHome eliminada.';
END
GO

IF OBJECT_ID(N'dbo.ConfiguracionNegocio', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.ConfiguracionNegocio;
    PRINT 'Tabla dbo.ConfiguracionNegocio eliminada.';
END
GO

IF OBJECT_ID(N'dbo.Administradores', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.Administradores;
    PRINT 'Tabla dbo.Administradores eliminada.';
END
GO

PRINT 'Limpieza completada. Ejecutá 000_install_completo.sql para reinstalar.';
GO
