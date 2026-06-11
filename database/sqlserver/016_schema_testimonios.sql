/*
  Bendita-Comida — Testimonios de clientes (home pública)
*/

SET NOCOUNT ON;
GO

IF OBJECT_ID(N'dbo.Testimonios', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Testimonios (
        id                  INT             NOT NULL IDENTITY(1, 1),
        nombre_cliente      NVARCHAR(120)   NOT NULL,
        comentario          NVARCHAR(1000)  NOT NULL,
        puntuacion          TINYINT         NOT NULL,
        activo              BIT             NOT NULL CONSTRAINT DF_Testimonios_activo DEFAULT (1),
        orden               INT             NULL,
        fecha_creacion      DATETIME2(0)    NOT NULL CONSTRAINT DF_Testimonios_fecha_creacion DEFAULT (SYSUTCDATETIME()),
        fecha_modificacion  DATETIME2(0)    NULL,

        CONSTRAINT PK_Testimonios PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_Testimonios_puntuacion CHECK (puntuacion BETWEEN 1 AND 5),
        CONSTRAINT CK_Testimonios_orden CHECK (orden IS NULL OR orden >= 0)
    );

    PRINT 'Tabla Testimonios creada.';
END
ELSE
BEGIN
    PRINT 'La tabla Testimonios ya existe — sin cambios.';
END
GO

CREATE OR ALTER TRIGGER TR_Testimonios_actualizar_modificacion
ON dbo.Testimonios
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT UPDATE(fecha_modificacion)
    BEGIN
        UPDATE t
        SET fecha_modificacion = SYSUTCDATETIME()
        FROM dbo.Testimonios t
        INNER JOIN inserted i ON t.id = i.id;
    END
END;
GO

CREATE NONCLUSTERED INDEX IX_Testimonios_activos_home
    ON dbo.Testimonios (activo, orden, fecha_creacion DESC)
    INCLUDE (nombre_cliente, comentario, puntuacion)
    WHERE activo = 1;
GO
