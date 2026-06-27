module.exports = {
  LISTAR: `
    SELECT id, nombre, descripcion, activo, orden
    FROM dbo.Categorias
    WHERE fecha_baja IS NULL
    ORDER BY
      CASE WHEN orden IS NULL THEN 1 ELSE 0 END,
      orden ASC,
      nombre ASC
  `,

  OBTENER_POR_ID: `
    SELECT id, nombre, descripcion, activo, orden
    FROM dbo.Categorias
    WHERE id = @id
      AND fecha_baja IS NULL
  `,

  CREAR: `
    DECLARE @inserted TABLE (
      id INT,
      nombre NVARCHAR(120),
      descripcion NVARCHAR(500),
      activo BIT,
      orden INT
    );

    INSERT INTO dbo.Categorias (nombre, descripcion, activo, orden)
    OUTPUT INSERTED.id, INSERTED.nombre, INSERTED.descripcion, INSERTED.activo, INSERTED.orden
    INTO @inserted
    VALUES (@nombre, @descripcion, @activo, @orden);

    SELECT id, nombre, descripcion, activo, orden FROM @inserted;
  `,

  EDITAR: `
    DECLARE @updated TABLE (
      id INT,
      nombre NVARCHAR(120),
      descripcion NVARCHAR(500),
      activo BIT,
      orden INT
    );

    UPDATE dbo.Categorias
    SET
      nombre = @nombre,
      descripcion = @descripcion,
      activo = @activo,
      orden = @orden
    OUTPUT INSERTED.id, INSERTED.nombre, INSERTED.descripcion, INSERTED.activo, INSERTED.orden
    INTO @updated
    WHERE id = @id
      AND fecha_baja IS NULL;

    SELECT id, nombre, descripcion, activo, orden FROM @updated;
  `,

  ELIMINAR: `
    DECLARE @deleted TABLE (id INT);

    UPDATE dbo.Categorias
    SET fecha_baja = SYSUTCDATETIME()
    OUTPUT INSERTED.id INTO @deleted
    WHERE id = @id
      AND fecha_baja IS NULL;

    SELECT id FROM @deleted;
  `,

  CONTAR_PRODUCTOS_ACTIVOS: `
    SELECT COUNT(*) AS total
    FROM dbo.Productos
    WHERE categoria_id = @categoriaId
      AND fecha_baja IS NULL
      AND activo = 1
  `,
};
