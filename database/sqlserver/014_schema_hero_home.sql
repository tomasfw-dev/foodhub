/*
  Bendita-Comida — Hero administrable de la landing (registro único id = 1)
*/

SET NOCOUNT ON;
GO

IF OBJECT_ID(N'dbo.HeroHome', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.HeroHome (
        id                      INT             NOT NULL CONSTRAINT DF_HeroHome_id DEFAULT (1),
        eyebrow                 NVARCHAR(200)   NOT NULL,
        titulo_antes            NVARCHAR(200)   NOT NULL,
        titulo_destacado        NVARCHAR(120)   NULL,
        titulo_despues          NVARCHAR(200)   NULL,
        subtitulo               NVARCHAR(500)   NOT NULL,
        btn_primario_texto      NVARCHAR(120)   NOT NULL,
        btn_primario_url        NVARCHAR(500)   NOT NULL,
        btn_secundario_texto    NVARCHAR(120)   NULL,
        btn_secundario_url      NVARCHAR(500)   NULL,
        imagen                  NVARCHAR(500)   NULL,
        activo                  BIT             NOT NULL CONSTRAINT DF_HeroHome_activo DEFAULT (1),
        fecha_modificacion      DATETIME2(0)    NULL,

        CONSTRAINT PK_HeroHome PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_HeroHome_singleton CHECK (id = 1)
    );

    PRINT 'Tabla HeroHome creada.';
END
ELSE
BEGIN
    PRINT 'La tabla HeroHome ya existe — sin cambios.';
END
GO
