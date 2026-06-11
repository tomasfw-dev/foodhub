/*
  Bendita-Comida — Consultas del menú público
  Tablas: dbo.Categorias, dbo.Productos
*/

-- 1) Categorías activas (sin baja lógica)
SELECT
    id,
    nombre,
    descripcion
FROM dbo.Categorias
WHERE activo = 1
  AND fecha_baja IS NULL
ORDER BY nombre ASC;

-- 2) Productos activos (sin baja lógica)
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
ORDER BY nombre ASC;

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
ORDER BY c.nombre ASC, p.nombre ASC;

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
