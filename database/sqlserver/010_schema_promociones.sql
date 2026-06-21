/*
  FoodHub — Promociones (landing / home)
*/

SET NOCOUNT ON;
GO

IF OBJECT_ID(N'dbo.Promociones', N'U') IS NOT NULL
    DROP TABLE dbo.Promociones;
GO

CREATE TABLE dbo.Promociones (
    id                  INT             NOT NULL IDENTITY(1, 1),
    nombre              NVARCHAR(160)   NOT NULL,
    descripcion         NVARCHAR(1000)  NULL,
    imagen              NVARCHAR(500)   NULL,
    precio_promocional  DECIMAL(10, 2)  NULL,
    fecha_inicio        DATE            NULL,
    fecha_fin           DATE            NULL,
    activo              BIT             NOT NULL CONSTRAINT DF_Promociones_activo DEFAULT (1),
    destacado           BIT             NOT NULL CONSTRAINT DF_Promociones_destacado DEFAULT (0),
    fecha_creacion      DATETIME2(0)    NOT NULL CONSTRAINT DF_Promociones_fecha_creacion DEFAULT (SYSUTCDATETIME()),
    fecha_modificacion  DATETIME2(0)    NULL,
    fecha_baja          DATETIME2(0)    NULL,

    CONSTRAINT PK_Promociones PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_Promociones_precio
        CHECK (precio_promocional IS NULL OR precio_promocional >= 0),
    CONSTRAINT CK_Promociones_fechas
        CHECK (
            fecha_inicio IS NULL
            OR fecha_fin IS NULL
            OR fecha_fin >= fecha_inicio
        ),
    CONSTRAINT CK_Promociones_fecha_baja
        CHECK (fecha_baja IS NULL OR fecha_baja >= fecha_creacion)
);
GO

CREATE NONCLUSTERED INDEX IX_Promociones_vigentes
    ON dbo.Promociones (activo, fecha_baja, fecha_inicio, fecha_fin)
    INCLUDE (nombre, descripcion, imagen, precio_promocional, destacado)
    WHERE activo = 1 AND fecha_baja IS NULL;
GO

CREATE OR ALTER TRIGGER TR_Promociones_actualizar_modificacion
ON dbo.Promociones
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT UPDATE(fecha_modificacion)
    BEGIN
        UPDATE p
        SET fecha_modificacion = SYSUTCDATETIME()
        FROM dbo.Promociones p
        INNER JOIN inserted i ON p.id = i.id;
    END
END;
GO
