/*
  FoodHub — Consulta del dashboard administrativo
  Un solo round-trip a SQL Server.
*/
SELECT
    (SELECT COUNT(*)
     FROM dbo.Categorias
     WHERE fecha_baja IS NULL) AS total_categorias,
    (SELECT COUNT(*)
     FROM dbo.Productos
     WHERE fecha_baja IS NULL) AS total_productos,
    (SELECT COUNT(*)
     FROM dbo.Productos
     WHERE fecha_baja IS NULL AND activo = 1) AS productos_activos,
    (SELECT COUNT(*)
     FROM dbo.Productos
     WHERE fecha_baja IS NULL AND activo = 0) AS productos_inactivos;
