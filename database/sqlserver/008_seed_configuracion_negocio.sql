/*
  Plataforma gastronómica — Configuración inicial del negocio (demo)
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
        N'Mi negocio',
        N'Carta online y pedidos por WhatsApp',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        N'Hola! Quiero hacer un pedido.',
        SYSUTCDATETIME()
    );

    PRINT 'Configuración demo del negocio inicializada.';
END
ELSE
BEGIN
    PRINT 'La configuración del negocio ya existe — sin cambios.';
END
GO
