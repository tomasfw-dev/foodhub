/*
  Bendita-Comida — Valores iniciales de configuración del negocio
  Ejecutar después de 007_schema_configuracion_negocio.sql
*/

SET NOCOUNT ON;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.ConfiguracionNegocio WHERE id = 1)
BEGIN
    INSERT INTO dbo.ConfiguracionNegocio (
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
    )
    VALUES (
        1,
        N'Bendita-Comida',
        N'Sabores de casa, calidad premium',
        NULL,
        NULL,
        N'https://instagram.com/comidacarito',
        NULL,
        N'Buenos Aires, Argentina',
        N'Lun – Sáb · 11:00 a 21:00',
        N'hola@comidacarito.com',
        N'/images/logo-bendita-comida.png',
        N'Hola! Quiero hacer un pedido.',
        SYSUTCDATETIME()
    );

    PRINT 'Configuración del negocio inicializada.';
END
ELSE
BEGIN
    PRINT 'La configuración del negocio ya existe — sin cambios.';
END
GO
