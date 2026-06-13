/*
  Plataforma gastronómica — Hero inicial de la landing (demo)
  Ejecutar después de 014_schema_hero_home.sql
*/

SET NOCOUNT ON;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.HeroHome WHERE id = 1)
BEGIN
    INSERT INTO dbo.HeroHome (
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
    )
    VALUES (
        1,
        N'Carta online y pedidos por WhatsApp',
        N'Bienvenidos a',
        N'nuestro local',
        NULL,
        N'Descubrí la carta, elegí tus favoritos y consultanos por WhatsApp.',
        N'Ver menú',
        N'/menu',
        N'Pedir por WhatsApp',
        NULL,
        NULL,
        1,
        SYSUTCDATETIME()
    );

    PRINT 'Hero demo de la home inicializado.';
END
ELSE
BEGIN
    PRINT 'El hero de la home ya existe — sin cambios.';
END
GO
