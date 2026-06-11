/**
 * Consultas — Promociones
 */
module.exports = {
  LISTAR: `
    SELECT
      id,
      nombre,
      descripcion,
      imagen,
      precio_promocional,
      fecha_inicio,
      fecha_fin,
      activo,
      destacado
    FROM dbo.Promociones
    WHERE fecha_baja IS NULL
    ORDER BY destacado DESC, fecha_inicio DESC, nombre ASC
  `,

  ACTIVAS_VIGENTES: `
    SELECT
      id,
      nombre,
      descripcion,
      imagen,
      precio_promocional,
      destacado
    FROM dbo.Promociones
    WHERE fecha_baja IS NULL
      AND activo = 1
      AND (fecha_inicio IS NULL OR fecha_inicio <= CAST(SYSUTCDATETIME() AS DATE))
      AND (fecha_fin IS NULL OR fecha_fin >= CAST(SYSUTCDATETIME() AS DATE))
    ORDER BY destacado DESC, fecha_inicio DESC, id DESC
  `,

  OBTENER_POR_ID: `
    SELECT
      id,
      nombre,
      descripcion,
      imagen,
      precio_promocional,
      fecha_inicio,
      fecha_fin,
      activo,
      destacado
    FROM dbo.Promociones
    WHERE id = @id
      AND fecha_baja IS NULL
  `,

  CREAR: `
    DECLARE @inserted TABLE (
      id INT,
      nombre NVARCHAR(160),
      descripcion NVARCHAR(1000),
      imagen NVARCHAR(500),
      precio_promocional DECIMAL(10, 2),
      fecha_inicio DATE,
      fecha_fin DATE,
      activo BIT,
      destacado BIT
    );

    INSERT INTO dbo.Promociones (
      nombre,
      descripcion,
      imagen,
      precio_promocional,
      fecha_inicio,
      fecha_fin,
      activo,
      destacado
    )
    OUTPUT
      INSERTED.id,
      INSERTED.nombre,
      INSERTED.descripcion,
      INSERTED.imagen,
      INSERTED.precio_promocional,
      INSERTED.fecha_inicio,
      INSERTED.fecha_fin,
      INSERTED.activo,
      INSERTED.destacado
    INTO @inserted
    VALUES (
      @nombre,
      @descripcion,
      @imagen,
      @precio_promocional,
      @fecha_inicio,
      @fecha_fin,
      @activo,
      @destacado
    );

    SELECT * FROM @inserted;
  `,

  EDITAR: `
    DECLARE @updated TABLE (
      id INT,
      nombre NVARCHAR(160),
      descripcion NVARCHAR(1000),
      imagen NVARCHAR(500),
      precio_promocional DECIMAL(10, 2),
      fecha_inicio DATE,
      fecha_fin DATE,
      activo BIT,
      destacado BIT
    );

    UPDATE dbo.Promociones
    SET
      nombre = @nombre,
      descripcion = @descripcion,
      imagen = @imagen,
      precio_promocional = @precio_promocional,
      fecha_inicio = @fecha_inicio,
      fecha_fin = @fecha_fin,
      activo = @activo,
      destacado = @destacado
    OUTPUT
      INSERTED.id,
      INSERTED.nombre,
      INSERTED.descripcion,
      INSERTED.imagen,
      INSERTED.precio_promocional,
      INSERTED.fecha_inicio,
      INSERTED.fecha_fin,
      INSERTED.activo,
      INSERTED.destacado
    INTO @updated
    WHERE id = @id
      AND fecha_baja IS NULL;

    SELECT * FROM @updated;
  `,

  ELIMINAR: `
    DECLARE @deleted TABLE (
      id INT,
      imagen NVARCHAR(500)
    );

    UPDATE dbo.Promociones
    SET fecha_baja = SYSUTCDATETIME()
    OUTPUT INSERTED.id, INSERTED.imagen INTO @deleted
    WHERE id = @id
      AND fecha_baja IS NULL;

    SELECT id, imagen FROM @deleted;
  `,

  ACTUALIZAR_ESTADO: `
    DECLARE @updated TABLE (
      id INT,
      nombre NVARCHAR(160),
      descripcion NVARCHAR(1000),
      imagen NVARCHAR(500),
      precio_promocional DECIMAL(10, 2),
      fecha_inicio DATE,
      fecha_fin DATE,
      activo BIT,
      destacado BIT
    );

    UPDATE dbo.Promociones
    SET
      activo = @activo,
      destacado = @destacado
    OUTPUT
      INSERTED.id,
      INSERTED.nombre,
      INSERTED.descripcion,
      INSERTED.imagen,
      INSERTED.precio_promocional,
      INSERTED.fecha_inicio,
      INSERTED.fecha_fin,
      INSERTED.activo,
      INSERTED.destacado
    INTO @updated
    WHERE id = @id
      AND fecha_baja IS NULL;

    SELECT * FROM @updated;
  `,
};
