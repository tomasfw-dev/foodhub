/**
 * Consultas SQL del menú público.
 * Referencia: database/sqlserver/002_menu_queries.sql
 */
module.exports = {
  CATEGORIAS_ACTIVAS: `
    SELECT
      id,
      nombre,
      descripcion
    FROM dbo.Categorias
    WHERE activo = 1
      AND fecha_baja IS NULL
    ORDER BY nombre ASC
  `,

  PRODUCTOS_ACTIVOS: `
    SELECT
      id,
      categoria_id,
      nombre,
      descripcion,
      precio,
      imagen
    FROM dbo.Productos
    WHERE activo = 1
      AND fecha_baja IS NULL
    ORDER BY nombre ASC
  `,

  PRODUCTOS_DESTACADOS: `
    SELECT TOP (@limite)
      id,
      categoria_id,
      nombre,
      descripcion,
      precio,
      imagen
    FROM dbo.Productos
    WHERE activo = 1
      AND fecha_baja IS NULL
    ORDER BY fecha_creacion DESC
  `,
};
