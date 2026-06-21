/*
  FoodHub — Consultas del menú público
  Tablas: dbo.Categorias, dbo.Productos
*/

-- 1) Categorías activas (sin baja lógica)
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
    fecha_creacion DESC;

-- 2) Productos activos (sin baja lógica)
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
    fecha_creacion DESC;

-- 3) Menú agrupado (una sola consulta — alternativa optimizada)
SELECT
    c.id              AS categoria_id,
    c.nombre          AS categoria_nombre,
    c.descripcion     AS categoria_descripcion,
    p.id              AS producto_id,
    p.nombre          AS producto_nombre,
    p.descripcion     AS producto_descripcion,
    p.precio          AS producto_precio,
    p.imagen          AS producto_imagen
FROM dbo.Categorias AS c
LEFT JOIN dbo.Productos AS p
    ON p.categoria_id = c.id
   AND p.activo = 1
   AND p.fecha_baja IS NULL
WHERE c.activo = 1
  AND c.fecha_baja IS NULL
ORDER BY
    CASE WHEN c.orden IS NULL THEN 1 ELSE 0 END,
    c.orden ASC,
    c.fecha_creacion DESC,
    CASE WHEN p.orden IS NULL THEN 1 ELSE 0 END,
    p.orden ASC,
    p.fecha_creacion DESC;

-- 4) Productos destacados activos para landing (máx. 6, requiere columna destacado)
SELECT TOP (6)
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
ORDER BY fecha_creacion DESC;
