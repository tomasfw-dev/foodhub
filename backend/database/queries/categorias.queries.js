module.exports = {
  LISTAR: `
    SELECT id, nombre, descripcion, activo
    FROM dbo.Categorias
    WHERE fecha_baja IS NULL
    ORDER BY nombre ASC
  `,

  OBTENER_POR_ID: `
    SELECT id, nombre, descripcion, activo
    FROM dbo.Categorias
    WHERE id = @id
      AND fecha_baja IS NULL
  `,

  CREAR: `
    DECLARE @inserted TABLE (
      id INT,
      nombre NVARCHAR(120),
      descripcion NVARCHAR(500),
      activo BIT
    );

    INSERT INTO dbo.Categorias (nombre, descripcion, activo)
    OUTPUT INSERTED.id, INSERTED.nombre, INSERTED.descripcion, INSERTED.activo
    INTO @inserted
    VALUES (@nombre, @descripcion, @activo);

    SELECT id, nombre, descripcion, activo FROM @inserted;
  `,

  EDITAR: `
    DECLARE @updated TABLE (
      id INT,
      nombre NVARCHAR(120),
      descripcion NVARCHAR(500),
      activo BIT
    );

    UPDATE dbo.Categorias
    SET
      nombre = @nombre,
      descripcion = @descripcion,
      activo = @activo
    OUTPUT INSERTED.id, INSERTED.nombre, INSERTED.descripcion, INSERTED.activo
    INTO @updated
    WHERE id = @id
      AND fecha_baja IS NULL;

    SELECT id, nombre, descripcion, activo FROM @updated;
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
};
