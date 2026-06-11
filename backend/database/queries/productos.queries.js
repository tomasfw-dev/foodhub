module.exports = {
  LISTAR: `
    SELECT
      id,
      categoria_id,
      nombre,
      descripcion,
      precio,
      imagen,
      activo,
      destacado
    FROM dbo.Productos
    WHERE fecha_baja IS NULL
    ORDER BY destacado DESC, nombre ASC
  `,

  OBTENER_POR_ID: `
    SELECT
      id,
      categoria_id,
      nombre,
      descripcion,
      precio,
      imagen,
      activo,
      destacado
    FROM dbo.Productos
    WHERE id = @id
      AND fecha_baja IS NULL
  `,

  CONTAR_DESTACADOS: `
    SELECT COUNT(*) AS total
    FROM dbo.Productos
    WHERE fecha_baja IS NULL
      AND destacado = 1
  `,

  CREAR: `
    DECLARE @inserted TABLE (
      id INT,
      categoria_id INT,
      nombre NVARCHAR(160),
      descripcion NVARCHAR(1000),
      precio DECIMAL(10, 2),
      imagen NVARCHAR(500),
      activo BIT,
      destacado BIT
    );

    INSERT INTO dbo.Productos (categoria_id, nombre, descripcion, precio, imagen, activo, destacado)
    OUTPUT
      INSERTED.id,
      INSERTED.categoria_id,
      INSERTED.nombre,
      INSERTED.descripcion,
      INSERTED.precio,
      INSERTED.imagen,
      INSERTED.activo,
      INSERTED.destacado
    INTO @inserted
    VALUES (@categoriaId, @nombre, @descripcion, @precio, @imagen, @activo, @destacado);

    SELECT id, categoria_id, nombre, descripcion, precio, imagen, activo, destacado
    FROM @inserted;
  `,

  EDITAR: `
    DECLARE @updated TABLE (
      id INT,
      categoria_id INT,
      nombre NVARCHAR(160),
      descripcion NVARCHAR(1000),
      precio DECIMAL(10, 2),
      imagen NVARCHAR(500),
      activo BIT,
      destacado BIT
    );

    UPDATE dbo.Productos
    SET
      categoria_id = @categoriaId,
      nombre = @nombre,
      descripcion = @descripcion,
      precio = @precio,
      imagen = @imagen,
      activo = @activo,
      destacado = @destacado
    OUTPUT
      INSERTED.id,
      INSERTED.categoria_id,
      INSERTED.nombre,
      INSERTED.descripcion,
      INSERTED.precio,
      INSERTED.imagen,
      INSERTED.activo,
      INSERTED.destacado
    INTO @updated
    WHERE id = @id
      AND fecha_baja IS NULL;

    SELECT id, categoria_id, nombre, descripcion, precio, imagen, activo, destacado
    FROM @updated;
  `,

  ACTUALIZAR_DESTACADO: `
    DECLARE @updated TABLE (
      id INT,
      categoria_id INT,
      nombre NVARCHAR(160),
      descripcion NVARCHAR(1000),
      precio DECIMAL(10, 2),
      imagen NVARCHAR(500),
      activo BIT,
      destacado BIT
    );

    UPDATE dbo.Productos
    SET destacado = @destacado
    OUTPUT
      INSERTED.id,
      INSERTED.categoria_id,
      INSERTED.nombre,
      INSERTED.descripcion,
      INSERTED.precio,
      INSERTED.imagen,
      INSERTED.activo,
      INSERTED.destacado
    INTO @updated
    WHERE id = @id
      AND fecha_baja IS NULL;

    SELECT id, categoria_id, nombre, descripcion, precio, imagen, activo, destacado
    FROM @updated;
  `,

  ACTUALIZAR_ACTIVO: `
    DECLARE @updated TABLE (
      id INT,
      categoria_id INT,
      nombre NVARCHAR(160),
      descripcion NVARCHAR(1000),
      precio DECIMAL(10, 2),
      imagen NVARCHAR(500),
      activo BIT,
      destacado BIT
    );

    UPDATE dbo.Productos
    SET activo = @activo
    OUTPUT
      INSERTED.id,
      INSERTED.categoria_id,
      INSERTED.nombre,
      INSERTED.descripcion,
      INSERTED.precio,
      INSERTED.imagen,
      INSERTED.activo,
      INSERTED.destacado
    INTO @updated
    WHERE id = @id
      AND fecha_baja IS NULL;

    SELECT id, categoria_id, nombre, descripcion, precio, imagen, activo, destacado
    FROM @updated;
  `,

  ELIMINAR: `
    DECLARE @deleted TABLE (
      id INT,
      imagen NVARCHAR(500)
    );

    UPDATE dbo.Productos
    SET fecha_baja = SYSUTCDATETIME()
    OUTPUT INSERTED.id, INSERTED.imagen INTO @deleted
    WHERE id = @id
      AND fecha_baja IS NULL;

    SELECT id, imagen FROM @deleted;
  `,

  VERIFICAR_CATEGORIA: `
    SELECT id
    FROM dbo.Categorias
    WHERE id = @categoriaId
      AND fecha_baja IS NULL
  `,
};
