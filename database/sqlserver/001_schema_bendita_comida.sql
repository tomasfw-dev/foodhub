/*
  FoodHub — Esquema base SQL Server
  Tablas: Administradores, Categorias, Productos

  Instalación nueva: preferir 000_install_completo.sql
  Este script: migración incremental o desarrollo por módulos.
*/

-- Opcional: base de datos dedicada
-- CREATE DATABASE FoodHub;
-- GO
-- USE FoodHub;
-- GO

SET NOCOUNT ON;
GO

/* ============================================================
   TABLA: Administradores
   ============================================================ */
IF OBJECT_ID(N'dbo.Administradores', N'U') IS NOT NULL
    DROP TABLE dbo.Administradores;
GO

CREATE TABLE dbo.Administradores (
    id              INT             NOT NULL IDENTITY(1, 1),
    nombre          NVARCHAR(120)   NOT NULL,
    email           NVARCHAR(255)   NOT NULL,
    password_hash   NVARCHAR(255)   NOT NULL,
    activo          BIT             NOT NULL CONSTRAINT DF_Administradores_activo DEFAULT (1),
    fecha_creacion  DATETIME2(0)    NOT NULL CONSTRAINT DF_Administradores_fecha_creacion DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT PK_Administradores PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_Administradores_email UNIQUE (email),
    CONSTRAINT CK_Administradores_email_formato
        CHECK (email LIKE '%_@_%._%' AND LEN(email) >= 5)
);
GO

/* ============================================================
   TABLA: Categorias
   ============================================================ */
IF OBJECT_ID(N'dbo.Categorias', N'U') IS NOT NULL
    DROP TABLE dbo.Categorias;
GO

CREATE TABLE dbo.Categorias (
    id                  INT             NOT NULL IDENTITY(1, 1),
    nombre              NVARCHAR(120)   NOT NULL,
    descripcion         NVARCHAR(500)   NULL,
    activo              BIT             NOT NULL CONSTRAINT DF_Categorias_activo DEFAULT (1),
    fecha_creacion      DATETIME2(0)    NOT NULL CONSTRAINT DF_Categorias_fecha_creacion DEFAULT (SYSUTCDATETIME()),
    fecha_modificacion  DATETIME2(0)    NULL,
    fecha_baja          DATETIME2(0)    NULL,

    CONSTRAINT PK_Categorias PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_Categorias_fecha_baja
        CHECK (fecha_baja IS NULL OR fecha_baja >= fecha_creacion)
);
GO

/* ============================================================
   TABLA: Productos
   ============================================================ */
IF OBJECT_ID(N'dbo.Productos', N'U') IS NOT NULL
    DROP TABLE dbo.Productos;
GO

CREATE TABLE dbo.Productos (
    id                  INT             NOT NULL IDENTITY(1, 1),
    categoria_id        INT             NOT NULL,
    nombre              NVARCHAR(160)   NOT NULL,
    descripcion         NVARCHAR(1000)  NULL,
    precio              DECIMAL(10, 2)  NOT NULL,
    imagen              NVARCHAR(500)   NULL,
    activo              BIT             NOT NULL CONSTRAINT DF_Productos_activo DEFAULT (1),
    fecha_creacion      DATETIME2(0)    NOT NULL CONSTRAINT DF_Productos_fecha_creacion DEFAULT (SYSUTCDATETIME()),
    fecha_modificacion  DATETIME2(0)    NULL,
    fecha_baja          DATETIME2(0)    NULL,

    CONSTRAINT PK_Productos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_Productos_Categorias
        FOREIGN KEY (categoria_id)
        REFERENCES dbo.Categorias (id)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT CK_Productos_precio
        CHECK (precio >= 0),
    CONSTRAINT CK_Productos_fecha_baja
        CHECK (fecha_baja IS NULL OR fecha_baja >= fecha_creacion)
);
GO

/* ============================================================
   ÍNDICES RECOMENDADOS
   ============================================================ */

-- Administradores: login por email (único ya cubierto por UQ; índice filtrado para activos)
CREATE NONCLUSTERED INDEX IX_Administradores_activo
    ON dbo.Administradores (activo)
    INCLUDE (email, nombre)
    WHERE activo = 1;
GO

-- Categorias: listados del menú / admin (activas y no dadas de baja)
CREATE NONCLUSTERED INDEX IX_Categorias_activo_fecha_baja
    ON dbo.Categorias (activo, fecha_baja)
    INCLUDE (nombre, descripcion);
GO

CREATE NONCLUSTERED INDEX IX_Categorias_nombre
    ON dbo.Categorias (nombre);
GO

-- Productos: FK (categoria_id) — soporte a JOIN y filtros por categoría
CREATE NONCLUSTERED INDEX IX_Productos_categoria_id
    ON dbo.Productos (categoria_id)
    INCLUDE (nombre, precio, activo, imagen, fecha_baja);
GO

-- Productos: catálogo público (activos, sin baja)
CREATE NONCLUSTERED INDEX IX_Productos_catalogo
    ON dbo.Productos (categoria_id, activo, fecha_baja)
    INCLUDE (nombre, descripcion, precio, imagen)
    WHERE activo = 1 AND fecha_baja IS NULL;
GO

CREATE NONCLUSTERED INDEX IX_Productos_nombre
    ON dbo.Productos (nombre);
GO

/* ============================================================
   TRIGGERS: actualizar fecha_modificacion automáticamente
   (opcional, recomendado para auditoría)
   ============================================================ */
GO

CREATE OR ALTER TRIGGER TR_Categorias_actualizar_modificacion
ON dbo.Categorias
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT UPDATE(fecha_modificacion)
    BEGIN
        UPDATE c
        SET fecha_modificacion = SYSUTCDATETIME()
        FROM dbo.Categorias AS c
        INNER JOIN inserted AS i ON i.id = c.id;
    END
END;
GO

CREATE OR ALTER TRIGGER TR_Productos_actualizar_modificacion
ON dbo.Productos
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT UPDATE(fecha_modificacion)
    BEGIN
        UPDATE p
        SET fecha_modificacion = SYSUTCDATETIME()
        FROM dbo.Productos AS p
        INNER JOIN inserted AS i ON i.id = p.id;
    END
END;
GO

PRINT 'Esquema base FoodHub creado correctamente.';
GO
