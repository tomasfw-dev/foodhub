/**
 * Consultas — Preguntas frecuentes
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
      id, pregunta, respuesta, activo, orden,
      fecha_creacion, fecha_modificacion
    FROM dbo.PreguntasFrecuentes
    ${ORDER_BY}
  `,

  LISTAR_ACTIVAS: `
    SELECT id, pregunta, respuesta, orden, fecha_creacion
    FROM dbo.PreguntasFrecuentes
    WHERE activo = 1
    ${ORDER_BY}
  `,

  OBTENER_POR_ID: `
    SELECT
      id, pregunta, respuesta, activo, orden,
      fecha_creacion, fecha_modificacion
    FROM dbo.PreguntasFrecuentes
    WHERE id = @id
  `,

  CREAR: `
    DECLARE @inserted TABLE (
      id INT, pregunta NVARCHAR(300), respuesta NVARCHAR(2000),
      activo BIT, orden INT,
      fecha_creacion DATETIME2(0), fecha_modificacion DATETIME2(0)
    );

    INSERT INTO dbo.PreguntasFrecuentes (pregunta, respuesta, activo, orden)
    OUTPUT
      INSERTED.id, INSERTED.pregunta, INSERTED.respuesta, INSERTED.activo,
      INSERTED.orden, INSERTED.fecha_creacion, INSERTED.fecha_modificacion
    INTO @inserted
    VALUES (@pregunta, @respuesta, @activo, @orden);

    SELECT * FROM @inserted;
  `,

  EDITAR: `
    DECLARE @updated TABLE (
      id INT, pregunta NVARCHAR(300), respuesta NVARCHAR(2000),
      activo BIT, orden INT,
      fecha_creacion DATETIME2(0), fecha_modificacion DATETIME2(0)
    );

    UPDATE dbo.PreguntasFrecuentes
    SET
      pregunta = @pregunta,
      respuesta = @respuesta,
      activo = @activo,
      orden = @orden,
      fecha_modificacion = SYSUTCDATETIME()
    OUTPUT
      INSERTED.id, INSERTED.pregunta, INSERTED.respuesta, INSERTED.activo,
      INSERTED.orden, INSERTED.fecha_creacion, INSERTED.fecha_modificacion
    INTO @updated
    WHERE id = @id;

    SELECT * FROM @updated;
  `,

  ELIMINAR: `
    DECLARE @deleted TABLE (id INT);
    DELETE FROM dbo.PreguntasFrecuentes OUTPUT DELETED.id INTO @deleted WHERE id = @id;
    SELECT id FROM @deleted;
  `,

  ACTUALIZAR_ACTIVO: `
    DECLARE @updated TABLE (
      id INT, pregunta NVARCHAR(300), respuesta NVARCHAR(2000),
      activo BIT, orden INT,
      fecha_creacion DATETIME2(0), fecha_modificacion DATETIME2(0)
    );

    UPDATE dbo.PreguntasFrecuentes
    SET activo = @activo, fecha_modificacion = SYSUTCDATETIME()
    OUTPUT
      INSERTED.id, INSERTED.pregunta, INSERTED.respuesta, INSERTED.activo,
      INSERTED.orden, INSERTED.fecha_creacion, INSERTED.fecha_modificacion
    INTO @updated
    WHERE id = @id;

    SELECT * FROM @updated;
  `,
};
