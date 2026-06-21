/*
  FoodHub — Información útil (zonas, pagos, FAQ)
  Ejecutar después de 017_schema_testimonios_estado.sql
*/

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
GO

/* ── Zonas de entrega ── */
IF OBJECT_ID(N'dbo.ZonasEntrega', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ZonasEntrega (
        id                  INT             NOT NULL IDENTITY(1, 1),
        nombre_zona         NVARCHAR(120)   NOT NULL,
        descripcion         NVARCHAR(500)   NULL,
        costo_envio         DECIMAL(10, 2)  NOT NULL CONSTRAINT DF_ZonasEntrega_costo DEFAULT (0),
        activo              BIT             NOT NULL CONSTRAINT DF_ZonasEntrega_activo DEFAULT (1),
        orden               INT             NULL,
        fecha_creacion      DATETIME2(0)    NOT NULL CONSTRAINT DF_ZonasEntrega_fecha_creacion DEFAULT (SYSUTCDATETIME()),
        fecha_modificacion  DATETIME2(0)    NULL,

        CONSTRAINT PK_ZonasEntrega PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_ZonasEntrega_orden CHECK (orden IS NULL OR orden >= 0),
        CONSTRAINT CK_ZonasEntrega_costo CHECK (costo_envio >= 0)
    );

    PRINT 'Tabla ZonasEntrega creada.';
END
GO

/* ── Formas de pago ── */
IF OBJECT_ID(N'dbo.FormasPago', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.FormasPago (
        id                  INT             NOT NULL IDENTITY(1, 1),
        nombre              NVARCHAR(80)    NOT NULL,
        descripcion         NVARCHAR(500)   NULL,
        activo              BIT             NOT NULL CONSTRAINT DF_FormasPago_activo DEFAULT (1),
        orden               INT             NULL,
        fecha_creacion      DATETIME2(0)    NOT NULL CONSTRAINT DF_FormasPago_fecha_creacion DEFAULT (SYSUTCDATETIME()),
        fecha_modificacion  DATETIME2(0)    NULL,

        CONSTRAINT PK_FormasPago PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_FormasPago_orden CHECK (orden IS NULL OR orden >= 0)
    );

    PRINT 'Tabla FormasPago creada.';
END
GO

/* ── Preguntas frecuentes ── */
IF OBJECT_ID(N'dbo.PreguntasFrecuentes', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PreguntasFrecuentes (
        id                  INT             NOT NULL IDENTITY(1, 1),
        pregunta            NVARCHAR(300)   NOT NULL,
        respuesta           NVARCHAR(2000)  NOT NULL,
        activo              BIT             NOT NULL CONSTRAINT DF_PreguntasFrecuentes_activo DEFAULT (1),
        orden               INT             NULL,
        fecha_creacion      DATETIME2(0)    NOT NULL CONSTRAINT DF_PreguntasFrecuentes_fecha_creacion DEFAULT (SYSUTCDATETIME()),
        fecha_modificacion  DATETIME2(0)    NULL,

        CONSTRAINT PK_PreguntasFrecuentes PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_PreguntasFrecuentes_orden CHECK (orden IS NULL OR orden >= 0)
    );

    PRINT 'Tabla PreguntasFrecuentes creada.';
END
GO

CREATE OR ALTER TRIGGER TR_ZonasEntrega_actualizar_modificacion
ON dbo.ZonasEntrega
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(fecha_modificacion)
    BEGIN
        UPDATE z SET fecha_modificacion = SYSUTCDATETIME()
        FROM dbo.ZonasEntrega z INNER JOIN inserted i ON z.id = i.id;
    END
END;
GO

CREATE OR ALTER TRIGGER TR_FormasPago_actualizar_modificacion
ON dbo.FormasPago
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(fecha_modificacion)
    BEGIN
        UPDATE f SET fecha_modificacion = SYSUTCDATETIME()
        FROM dbo.FormasPago f INNER JOIN inserted i ON f.id = i.id;
    END
END;
GO

CREATE OR ALTER TRIGGER TR_PreguntasFrecuentes_actualizar_modificacion
ON dbo.PreguntasFrecuentes
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(fecha_modificacion)
    BEGIN
        UPDATE p SET fecha_modificacion = SYSUTCDATETIME()
        FROM dbo.PreguntasFrecuentes p INNER JOIN inserted i ON p.id = i.id;
    END
END;
GO

CREATE NONCLUSTERED INDEX IX_ZonasEntrega_activas
    ON dbo.ZonasEntrega (activo, orden, fecha_creacion DESC)
    WHERE activo = 1;
GO

CREATE NONCLUSTERED INDEX IX_FormasPago_activas
    ON dbo.FormasPago (activo, orden, fecha_creacion DESC)
    WHERE activo = 1;
GO

CREATE NONCLUSTERED INDEX IX_PreguntasFrecuentes_activas
    ON dbo.PreguntasFrecuentes (activo, orden, fecha_creacion DESC)
    WHERE activo = 1;
GO

PRINT 'Esquema de información útil listo.';
GO
