/**
 * Consultas — Zonas de entrega
 */
const ORDER_BY = `
  ORDER BY
    CASE WHEN orden IS NULL THEN 1 ELSE 0 END,
    orden ASC,
    fecha_creacion DESC
`;

module.exports = {
  LISTAR: `
    SELECT
      id, nombre_zona, descripcion, costo_envio, activo, orden,
      fecha_creacion, fecha_modificacion
    FROM dbo.ZonasEntrega
    ${ORDER_BY}
  `,

  LISTAR_ACTIVAS: `
    SELECT
      id, nombre_zona, descripcion, costo_envio, orden, fecha_creacion
    FROM dbo.ZonasEntrega
    WHERE activo = 1
    ${ORDER_BY}
  `,

  OBTENER_POR_ID: `
    SELECT
      id, nombre_zona, descripcion, costo_envio, activo, orden,
      fecha_creacion, fecha_modificacion
    FROM dbo.ZonasEntrega
    WHERE id = @id
  `,

  CREAR: `
    DECLARE @inserted TABLE (
      id INT, nombre_zona NVARCHAR(120), descripcion NVARCHAR(500),
      costo_envio DECIMAL(10, 2), activo BIT, orden INT,
      fecha_creacion DATETIME2(0), fecha_modificacion DATETIME2(0)
    );

    INSERT INTO dbo.ZonasEntrega (nombre_zona, descripcion, costo_envio, activo, orden)
    OUTPUT
      INSERTED.id, INSERTED.nombre_zona, INSERTED.descripcion, INSERTED.costo_envio,
      INSERTED.activo, INSERTED.orden, INSERTED.fecha_creacion, INSERTED.fecha_modificacion
    INTO @inserted
    VALUES (@nombre_zona, @descripcion, @costo_envio, @activo, @orden);

    SELECT * FROM @inserted;
  `,

  EDITAR: `
    DECLARE @updated TABLE (
      id INT, nombre_zona NVARCHAR(120), descripcion NVARCHAR(500),
      costo_envio DECIMAL(10, 2), activo BIT, orden INT,
      fecha_creacion DATETIME2(0), fecha_modificacion DATETIME2(0)
    );

    UPDATE dbo.ZonasEntrega
    SET
      nombre_zona = @nombre_zona,
      descripcion = @descripcion,
      costo_envio = @costo_envio,
      activo = @activo,
      orden = @orden,
      fecha_modificacion = SYSUTCDATETIME()
    OUTPUT
      INSERTED.id, INSERTED.nombre_zona, INSERTED.descripcion, INSERTED.costo_envio,
      INSERTED.activo, INSERTED.orden, INSERTED.fecha_creacion, INSERTED.fecha_modificacion
    INTO @updated
    WHERE id = @id;

    SELECT * FROM @updated;
  `,

  ELIMINAR: `
    DECLARE @deleted TABLE (id INT);
    DELETE FROM dbo.ZonasEntrega OUTPUT DELETED.id INTO @deleted WHERE id = @id;
    SELECT id FROM @deleted;
  `,

  ACTUALIZAR_ACTIVO: `
    DECLARE @updated TABLE (
      id INT, nombre_zona NVARCHAR(120), descripcion NVARCHAR(500),
      costo_envio DECIMAL(10, 2), activo BIT, orden INT,
      fecha_creacion DATETIME2(0), fecha_modificacion DATETIME2(0)
    );

    UPDATE dbo.ZonasEntrega
    SET activo = @activo, fecha_modificacion = SYSUTCDATETIME()
    OUTPUT
      INSERTED.id, INSERTED.nombre_zona, INSERTED.descripcion, INSERTED.costo_envio,
      INSERTED.activo, INSERTED.orden, INSERTED.fecha_creacion, INSERTED.fecha_modificacion
    INTO @updated
    WHERE id = @id;

    SELECT * FROM @updated;
  `,
};
