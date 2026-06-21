/*
  FoodHub — Configuración global del negocio
  Una única fila (id = 1)
*/

SET NOCOUNT ON;
GO

IF OBJECT_ID(N'dbo.ConfiguracionNegocio', N'U') IS NOT NULL
    DROP TABLE dbo.ConfiguracionNegocio;
GO

CREATE TABLE dbo.ConfiguracionNegocio (
    id                  INT             NOT NULL CONSTRAINT DF_ConfiguracionNegocio_id DEFAULT (1),
    nombre_negocio      NVARCHAR(120)   NOT NULL,
    slogan              NVARCHAR(300)   NOT NULL,
    telefono            NVARCHAR(30)    NULL,
    whatsapp            NVARCHAR(30)    NULL,
    instagram           NVARCHAR(500)   NULL,
    facebook            NVARCHAR(500)   NULL,
    direccion           NVARCHAR(300)   NULL,
    horarios            NVARCHAR(200)   NULL,
    email               NVARCHAR(255)   NULL,
    logo                NVARCHAR(500)   NULL,
    mensaje_whatsapp    NVARCHAR(500)   NULL,
    fecha_modificacion  DATETIME2(0)    NULL,

    CONSTRAINT PK_ConfiguracionNegocio PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_ConfiguracionNegocio_singleton CHECK (id = 1),
    CONSTRAINT CK_ConfiguracionNegocio_email_formato
        CHECK (email IS NULL OR (email LIKE '%_@_%._%' AND LEN(email) >= 5))
);
GO

CREATE TRIGGER TR_ConfiguracionNegocio_fecha_modificacion
ON dbo.ConfiguracionNegocio
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT UPDATE(fecha_modificacion)
    BEGIN
        UPDATE c
        SET fecha_modificacion = SYSUTCDATETIME()
        FROM dbo.ConfiguracionNegocio c
        INNER JOIN inserted i ON c.id = i.id;
    END
END;
GO
