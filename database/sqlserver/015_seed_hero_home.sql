/*
  Bendita-Comida — Valores iniciales del hero (contenido actual de la landing)
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
        N'Sabores de casa, calidad premium',
        N'Sabores que',
        N'abrazan',
        N'el alma',
        N'Cocina casera premium, ingredientes seleccionados y el cariño de siempre en cada plato.',
        N'Ver menú',
        N'/menu',
        N'Pedir por WhatsApp',
        NULL,
        N'/images/logo-bendita-comida.png',
        1,
        SYSUTCDATETIME()
    );

    PRINT 'Hero de la home inicializado.';
END
ELSE
BEGIN
    PRINT 'El hero de la home ya existe — sin cambios.';
END
GO
