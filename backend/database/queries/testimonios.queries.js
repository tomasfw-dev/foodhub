/**
 * Consultas — Testimonios
 */
module.exports = {
  LISTAR: `
    SELECT
      id,
      nombre_cliente,
      comentario,
      puntuacion,
      activo,
      orden,
      fecha_creacion,
      fecha_modificacion
    FROM dbo.Testimonios
    ORDER BY
      CASE WHEN orden IS NULL THEN 1 ELSE 0 END,
      orden ASC,
      fecha_creacion DESC
  `,

  ACTIVOS_HOME: `
    SELECT
      id,
      nombre_cliente,
      comentario,
      puntuacion,
      orden,
      fecha_creacion
    FROM dbo.Testimonios
    WHERE activo = 1
    ORDER BY
      CASE WHEN orden IS NULL THEN 1 ELSE 0 END,
      orden ASC,
      fecha_creacion DESC
  `,

  OBTENER_POR_ID: `
    SELECT
      id,
      nombre_cliente,
      comentario,
      puntuacion,
      activo,
      orden,
      fecha_creacion,
      fecha_modificacion
    FROM dbo.Testimonios
    WHERE id = @id
  `,

  CREAR: `
    DECLARE @inserted TABLE (
      id INT,
      nombre_cliente NVARCHAR(120),
      comentario NVARCHAR(1000),
      puntuacion TINYINT,
      activo BIT,
      orden INT,
      fecha_creacion DATETIME2(0),
      fecha_modificacion DATETIME2(0)
    );

    INSERT INTO dbo.Testimonios (nombre_cliente, comentario, puntuacion, activo, orden)
    OUTPUT
      INSERTED.id,
      INSERTED.nombre_cliente,
      INSERTED.comentario,
      INSERTED.puntuacion,
      INSERTED.activo,
      INSERTED.orden,
      INSERTED.fecha_creacion,
      INSERTED.fecha_modificacion
    INTO @inserted
    VALUES (@nombre_cliente, @comentario, @puntuacion, @activo, @orden);

    SELECT * FROM @inserted;
  `,

  EDITAR: `
    DECLARE @updated TABLE (
      id INT,
      nombre_cliente NVARCHAR(120),
      comentario NVARCHAR(1000),
      puntuacion TINYINT,
      activo BIT,
      orden INT,
      fecha_creacion DATETIME2(0),
      fecha_modificacion DATETIME2(0)
    );

    UPDATE dbo.Testimonios
    SET
      nombre_cliente = @nombre_cliente,
      comentario = @comentario,
      puntuacion = @puntuacion,
      activo = @activo,
      orden = @orden,
      fecha_modificacion = SYSUTCDATETIME()
    OUTPUT
      INSERTED.id,
      INSERTED.nombre_cliente,
      INSERTED.comentario,
      INSERTED.puntuacion,
      INSERTED.activo,
      INSERTED.orden,
      INSERTED.fecha_creacion,
      INSERTED.fecha_modificacion
    INTO @updated
    WHERE id = @id;

    SELECT * FROM @updated;
  `,

  ELIMINAR: `
    DECLARE @deleted TABLE (id INT);

    DELETE FROM dbo.Testimonios
    OUTPUT DELETED.id INTO @deleted
    WHERE id = @id;

    SELECT id FROM @deleted;
  `,

  ACTUALIZAR_ACTIVO: `
    DECLARE @updated TABLE (
      id INT,
      nombre_cliente NVARCHAR(120),
      comentario NVARCHAR(1000),
      puntuacion TINYINT,
      activo BIT,
      orden INT,
      fecha_creacion DATETIME2(0),
      fecha_modificacion DATETIME2(0)
    );

    UPDATE dbo.Testimonios
    SET
      activo = @activo,
      fecha_modificacion = SYSUTCDATETIME()
    OUTPUT
      INSERTED.id,
      INSERTED.nombre_cliente,
      INSERTED.comentario,
      INSERTED.puntuacion,
      INSERTED.activo,
      INSERTED.orden,
      INSERTED.fecha_creacion,
      INSERTED.fecha_modificacion
    INTO @updated
    WHERE id = @id;

    SELECT * FROM @updated;
  `,
};
