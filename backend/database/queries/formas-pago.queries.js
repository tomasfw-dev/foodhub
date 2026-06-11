/**
 * Consultas — Formas de pago
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
      id, nombre, descripcion, activo, orden,
      fecha_creacion, fecha_modificacion
    FROM dbo.FormasPago
    ${ORDER_BY}
  `,

  LISTAR_ACTIVAS: `
    SELECT id, nombre, descripcion, orden, fecha_creacion
    FROM dbo.FormasPago
    WHERE activo = 1
    ${ORDER_BY}
  `,

  OBTENER_POR_ID: `
    SELECT
      id, nombre, descripcion, activo, orden,
      fecha_creacion, fecha_modificacion
    FROM dbo.FormasPago
    WHERE id = @id
  `,

  CREAR: `
    DECLARE @inserted TABLE (
      id INT, nombre NVARCHAR(80), descripcion NVARCHAR(500),
      activo BIT, orden INT,
      fecha_creacion DATETIME2(0), fecha_modificacion DATETIME2(0)
    );

    INSERT INTO dbo.FormasPago (nombre, descripcion, activo, orden)
    OUTPUT
      INSERTED.id, INSERTED.nombre, INSERTED.descripcion, INSERTED.activo,
      INSERTED.orden, INSERTED.fecha_creacion, INSERTED.fecha_modificacion
    INTO @inserted
    VALUES (@nombre, @descripcion, @activo, @orden);

    SELECT * FROM @inserted;
  `,

  EDITAR: `
    DECLARE @updated TABLE (
      id INT, nombre NVARCHAR(80), descripcion NVARCHAR(500),
      activo BIT, orden INT,
      fecha_creacion DATETIME2(0), fecha_modificacion DATETIME2(0)
    );

    UPDATE dbo.FormasPago
    SET
      nombre = @nombre,
      descripcion = @descripcion,
      activo = @activo,
      orden = @orden,
      fecha_modificacion = SYSUTCDATETIME()
    OUTPUT
      INSERTED.id, INSERTED.nombre, INSERTED.descripcion, INSERTED.activo,
      INSERTED.orden, INSERTED.fecha_creacion, INSERTED.fecha_modificacion
    INTO @updated
    WHERE id = @id;

    SELECT * FROM @updated;
  `,

  ELIMINAR: `
    DECLARE @deleted TABLE (id INT);
    DELETE FROM dbo.FormasPago OUTPUT DELETED.id INTO @deleted WHERE id = @id;
    SELECT id FROM @deleted;
  `,

  ACTUALIZAR_ACTIVO: `
    DECLARE @updated TABLE (
      id INT, nombre NVARCHAR(80), descripcion NVARCHAR(500),
      activo BIT, orden INT,
      fecha_creacion DATETIME2(0), fecha_modificacion DATETIME2(0)
    );

    UPDATE dbo.FormasPago
    SET activo = @activo, fecha_modificacion = SYSUTCDATETIME()
    OUTPUT
      INSERTED.id, INSERTED.nombre, INSERTED.descripcion, INSERTED.activo,
      INSERTED.orden, INSERTED.fecha_creacion, INSERTED.fecha_modificacion
    INTO @updated
    WHERE id = @id;

    SELECT * FROM @updated;
  `,
};
