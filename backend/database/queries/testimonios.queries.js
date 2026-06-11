/**
 * Consultas — Testimonios
 */
module.exports = {
  LISTAR_GESTIONADOS: `
    SELECT
      id,
      nombre_cliente,
      comentario,
      puntuacion,
      activo,
      estado,
      orden,
      fecha_creacion,
      fecha_modificacion
    FROM dbo.Testimonios
    WHERE estado IN (N'aprobado', N'rechazado')
    ORDER BY
      CASE WHEN orden IS NULL THEN 1 ELSE 0 END,
      orden ASC,
      fecha_creacion DESC
  `,

  LISTAR_PENDIENTES: `
    SELECT
      id,
      nombre_cliente,
      comentario,
      puntuacion,
      activo,
      estado,
      orden,
      fecha_creacion,
      fecha_modificacion
    FROM dbo.Testimonios
    WHERE estado = N'pendiente'
    ORDER BY fecha_creacion ASC
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
    WHERE activo = 1 AND estado = N'aprobado'
    ORDER BY
      CASE WHEN orden IS NULL THEN 1 ELSE 0 END,
      orden ASC,
      fecha_creacion DESC
  `,

  CONTAR_PENDIENTES: `
    SELECT COUNT(1) AS total
    FROM dbo.Testimonios
    WHERE estado = N'pendiente'
  `,

  OBTENER_POR_ID: `
    SELECT
      id,
      nombre_cliente,
      comentario,
      puntuacion,
      activo,
      estado,
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
      estado NVARCHAR(20),
      orden INT,
      fecha_creacion DATETIME2(0),
      fecha_modificacion DATETIME2(0)
    );

    INSERT INTO dbo.Testimonios (nombre_cliente, comentario, puntuacion, activo, estado, orden)
    OUTPUT
      INSERTED.id,
      INSERTED.nombre_cliente,
      INSERTED.comentario,
      INSERTED.puntuacion,
      INSERTED.activo,
      INSERTED.estado,
      INSERTED.orden,
      INSERTED.fecha_creacion,
      INSERTED.fecha_modificacion
    INTO @inserted
    VALUES (@nombre_cliente, @comentario, @puntuacion, @activo, @estado, @orden);

    SELECT * FROM @inserted;
  `,

  EDITAR: `
    DECLARE @updated TABLE (
      id INT,
      nombre_cliente NVARCHAR(120),
      comentario NVARCHAR(1000),
      puntuacion TINYINT,
      activo BIT,
      estado NVARCHAR(20),
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
      estado = @estado,
      orden = @orden,
      fecha_modificacion = SYSUTCDATETIME()
    OUTPUT
      INSERTED.id,
      INSERTED.nombre_cliente,
      INSERTED.comentario,
      INSERTED.puntuacion,
      INSERTED.activo,
      INSERTED.estado,
      INSERTED.orden,
      INSERTED.fecha_creacion,
      INSERTED.fecha_modificacion
    INTO @updated
    WHERE id = @id;

    SELECT * FROM @updated;
  `,

  EDITAR_PENDIENTE: `
    DECLARE @updated TABLE (
      id INT,
      nombre_cliente NVARCHAR(120),
      comentario NVARCHAR(1000),
      puntuacion TINYINT,
      activo BIT,
      estado NVARCHAR(20),
      orden INT,
      fecha_creacion DATETIME2(0),
      fecha_modificacion DATETIME2(0)
    );

    UPDATE dbo.Testimonios
    SET
      nombre_cliente = @nombre_cliente,
      comentario = @comentario,
      puntuacion = @puntuacion,
      fecha_modificacion = SYSUTCDATETIME()
    OUTPUT
      INSERTED.id,
      INSERTED.nombre_cliente,
      INSERTED.comentario,
      INSERTED.puntuacion,
      INSERTED.activo,
      INSERTED.estado,
      INSERTED.orden,
      INSERTED.fecha_creacion,
      INSERTED.fecha_modificacion
    INTO @updated
    WHERE id = @id AND estado = N'pendiente';

    SELECT * FROM @updated;
  `,

  ACTUALIZAR_MODERACION: `
    DECLARE @updated TABLE (
      id INT,
      nombre_cliente NVARCHAR(120),
      comentario NVARCHAR(1000),
      puntuacion TINYINT,
      activo BIT,
      estado NVARCHAR(20),
      orden INT,
      fecha_creacion DATETIME2(0),
      fecha_modificacion DATETIME2(0)
    );

    UPDATE dbo.Testimonios
    SET
      activo = @activo,
      estado = @estado,
      fecha_modificacion = SYSUTCDATETIME()
    OUTPUT
      INSERTED.id,
      INSERTED.nombre_cliente,
      INSERTED.comentario,
      INSERTED.puntuacion,
      INSERTED.activo,
      INSERTED.estado,
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
      estado NVARCHAR(20),
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
      INSERTED.estado,
      INSERTED.orden,
      INSERTED.fecha_creacion,
      INSERTED.fecha_modificacion
    INTO @updated
    WHERE id = @id AND estado = N'aprobado';

    SELECT * FROM @updated;
  `,
};
