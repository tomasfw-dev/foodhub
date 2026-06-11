/**
 * Consultas — HeroHome (registro único id = 1)
 */
module.exports = {
  OBTENER_ACTIVO: `
    SELECT
      id,
      eyebrow,
      titulo_antes,
      titulo_destacado,
      titulo_despues,
      subtitulo,
      btn_primario_texto,
      btn_primario_url,
      btn_secundario_texto,
      btn_secundario_url,
      imagen,
      activo,
      fecha_modificacion
    FROM dbo.HeroHome
    WHERE id = 1 AND activo = 1
  `,

  OBTENER: `
    SELECT
      id,
      eyebrow,
      titulo_antes,
      titulo_destacado,
      titulo_despues,
      subtitulo,
      btn_primario_texto,
      btn_primario_url,
      btn_secundario_texto,
      btn_secundario_url,
      imagen,
      activo,
      fecha_modificacion
    FROM dbo.HeroHome
    WHERE id = 1
  `,

  ACTUALIZAR: `
    DECLARE @updated TABLE (
      id INT,
      eyebrow NVARCHAR(200),
      titulo_antes NVARCHAR(200),
      titulo_destacado NVARCHAR(120),
      titulo_despues NVARCHAR(200),
      subtitulo NVARCHAR(500),
      btn_primario_texto NVARCHAR(120),
      btn_primario_url NVARCHAR(500),
      btn_secundario_texto NVARCHAR(120),
      btn_secundario_url NVARCHAR(500),
      imagen NVARCHAR(500),
      activo BIT,
      fecha_modificacion DATETIME2(0)
    );

    UPDATE dbo.HeroHome
    SET
      eyebrow = @eyebrow,
      titulo_antes = @titulo_antes,
      titulo_destacado = @titulo_destacado,
      titulo_despues = @titulo_despues,
      subtitulo = @subtitulo,
      btn_primario_texto = @btn_primario_texto,
      btn_primario_url = @btn_primario_url,
      btn_secundario_texto = @btn_secundario_texto,
      btn_secundario_url = @btn_secundario_url,
      imagen = @imagen,
      activo = @activo,
      fecha_modificacion = SYSUTCDATETIME()
    OUTPUT
      INSERTED.id,
      INSERTED.eyebrow,
      INSERTED.titulo_antes,
      INSERTED.titulo_destacado,
      INSERTED.titulo_despues,
      INSERTED.subtitulo,
      INSERTED.btn_primario_texto,
      INSERTED.btn_primario_url,
      INSERTED.btn_secundario_texto,
      INSERTED.btn_secundario_url,
      INSERTED.imagen,
      INSERTED.activo,
      INSERTED.fecha_modificacion
    INTO @updated
    WHERE id = 1;

    SELECT * FROM @updated;
  `,
};
