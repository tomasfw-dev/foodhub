/**
 * Consultas — ConfiguracionNegocio (registro único id = 1)
 */
module.exports = {
  OBTENER: `
    SELECT
      id,
      nombre_negocio,
      slogan,
      telefono,
      whatsapp,
      instagram,
      facebook,
      direccion,
      horarios,
      email,
      logo,
      mensaje_whatsapp,
      fecha_modificacion
    FROM dbo.ConfiguracionNegocio
    WHERE id = 1
  `,

  ACTUALIZAR: `
    DECLARE @updated TABLE (
      id INT,
      nombre_negocio NVARCHAR(120),
      slogan NVARCHAR(300),
      telefono NVARCHAR(30),
      whatsapp NVARCHAR(30),
      instagram NVARCHAR(500),
      facebook NVARCHAR(500),
      direccion NVARCHAR(300),
      horarios NVARCHAR(200),
      email NVARCHAR(255),
      logo NVARCHAR(500),
      mensaje_whatsapp NVARCHAR(500),
      fecha_modificacion DATETIME2(0)
    );

    UPDATE dbo.ConfiguracionNegocio
    SET
      nombre_negocio = @nombre_negocio,
      slogan = @slogan,
      telefono = @telefono,
      whatsapp = @whatsapp,
      instagram = @instagram,
      facebook = @facebook,
      direccion = @direccion,
      horarios = @horarios,
      email = @email,
      logo = @logo,
      mensaje_whatsapp = @mensaje_whatsapp,
      fecha_modificacion = SYSUTCDATETIME()
    OUTPUT
      INSERTED.id,
      INSERTED.nombre_negocio,
      INSERTED.slogan,
      INSERTED.telefono,
      INSERTED.whatsapp,
      INSERTED.instagram,
      INSERTED.facebook,
      INSERTED.direccion,
      INSERTED.horarios,
      INSERTED.email,
      INSERTED.logo,
      INSERTED.mensaje_whatsapp,
      INSERTED.fecha_modificacion
    INTO @updated
    WHERE id = 1;

    SELECT * FROM @updated;
  `,
};
