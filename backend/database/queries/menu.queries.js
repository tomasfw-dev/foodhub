/**
 * Consultas SQL del menú público.
 * Referencia: database/sqlserver/002_menu_queries.sql
 */
module.exports = {
  CATEGORIAS_ACTIVAS: `
    SELECT
      id,
      nombre,
      descripcion,
      orden
    FROM dbo.Categorias
    WHERE activo = 1
      AND fecha_baja IS NULL
    ORDER BY
      CASE WHEN orden IS NULL THEN 1 ELSE 0 END,
      orden ASC,
      fecha_creacion DESC
  `,

  PRODUCTOS_ACTIVOS: `
    SELECT
      id,
      categoria_id,
      nombre,
      descripcion,
      precio,
      imagen,
      orden
    FROM dbo.Productos
    WHERE activo = 1
      AND fecha_baja IS NULL
    ORDER BY
      CASE WHEN orden IS NULL THEN 1 ELSE 0 END,
      orden ASC,
      fecha_creacion DESC
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
      AND destacado = 1
      AND fecha_baja IS NULL
    ORDER BY fecha_creacion DESC
  `,
};
