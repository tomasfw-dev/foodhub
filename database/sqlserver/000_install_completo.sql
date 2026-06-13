/*
  =============================================================================
  FoodHub — Instalación completa (esquema + seeds demo)
  Plataforma gastronómica white-label · una instalación = un negocio

  Requisitos: SQL Server 2016+ (DATETIME2, CREATE OR ALTER TRIGGER)

  USO:
    1. Descomentar y ajustar CREATE DATABASE / USE si corresponde.
    2. Ejecutar este script completo en SSMS o Azure Data Studio.
    3. Configurar .env (DB_NAME, SITE_URL, SESSION_SECRET, etc.).
    4. node backend/scripts/hash-password.js "tu_contraseña"  →  UPDATE admin.

  Seeds demo incluidos:
    - Negocio demo: Mi negocio (sin logo de plataforma)
    - Admin:   admin@demo.local (solo hash bcrypt, sin contraseña en texto plano)
    - Menú, hero, zonas, pagos, FAQ de ejemplo

  Los scripts 001–019 siguen disponibles para migraciones incrementales.
  =============================================================================
*/

-- CREATE DATABASE FoodHub;
-- GO
-- USE FoodHub;
-- GO

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
GO

/* =============================================================================
   LIMPIEZA (instalación desde cero)
   ============================================================================= */
IF OBJECT_ID(N'dbo.Productos', N'U') IS NOT NULL DROP TABLE dbo.Productos;
IF OBJECT_ID(N'dbo.Categorias', N'U') IS NOT NULL DROP TABLE dbo.Categorias;
IF OBJECT_ID(N'dbo.Promociones', N'U') IS NOT NULL DROP TABLE dbo.Promociones;
IF OBJECT_ID(N'dbo.Testimonios', N'U') IS NOT NULL DROP TABLE dbo.Testimonios;
IF OBJECT_ID(N'dbo.ZonasEntrega', N'U') IS NOT NULL DROP TABLE dbo.ZonasEntrega;
IF OBJECT_ID(N'dbo.FormasPago', N'U') IS NOT NULL DROP TABLE dbo.FormasPago;
IF OBJECT_ID(N'dbo.PreguntasFrecuentes', N'U') IS NOT NULL DROP TABLE dbo.PreguntasFrecuentes;
IF OBJECT_ID(N'dbo.HeroHome', N'U') IS NOT NULL DROP TABLE dbo.HeroHome;
IF OBJECT_ID(N'dbo.ConfiguracionNegocio', N'U') IS NOT NULL DROP TABLE dbo.ConfiguracionNegocio;
IF OBJECT_ID(N'dbo.Administradores', N'U') IS NOT NULL DROP TABLE dbo.Administradores;
GO

/* =============================================================================
   TABLA: Administradores
   ============================================================================= */
CREATE TABLE dbo.Administradores (
    id              INT             NOT NULL IDENTITY(1, 1),
    nombre          NVARCHAR(120)   NOT NULL,
    email           NVARCHAR(255)   NOT NULL,
    password_hash   NVARCHAR(255)   NOT NULL,
    activo          BIT             NOT NULL CONSTRAINT DF_Administradores_activo DEFAULT (1),
    sesion_version  INT             NOT NULL CONSTRAINT DF_Administradores_sesion_version DEFAULT (1),
    fecha_creacion  DATETIME2(0)    NOT NULL CONSTRAINT DF_Administradores_fecha_creacion DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT PK_Administradores PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_Administradores_email UNIQUE (email),
    CONSTRAINT CK_Administradores_email_formato
        CHECK (email LIKE '%_@_%._%' AND LEN(email) >= 5)
);
GO

CREATE NONCLUSTERED INDEX IX_Administradores_activo
    ON dbo.Administradores (activo)
    INCLUDE (email, nombre, sesion_version)
    WHERE activo = 1;
GO

/* =============================================================================
   TABLA: Categorias
   ============================================================================= */
CREATE TABLE dbo.Categorias (
    id                  INT             NOT NULL IDENTITY(1, 1),
    nombre              NVARCHAR(120)   NOT NULL,
    descripcion         NVARCHAR(500)   NULL,
    activo              BIT             NOT NULL CONSTRAINT DF_Categorias_activo DEFAULT (1),
    orden               INT             NULL,
    fecha_creacion      DATETIME2(0)    NOT NULL CONSTRAINT DF_Categorias_fecha_creacion DEFAULT (SYSUTCDATETIME()),
    fecha_modificacion  DATETIME2(0)    NULL,
    fecha_baja          DATETIME2(0)    NULL,

    CONSTRAINT PK_Categorias PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_Categorias_orden CHECK (orden IS NULL OR orden >= 0),
    CONSTRAINT CK_Categorias_fecha_baja
        CHECK (fecha_baja IS NULL OR fecha_baja >= fecha_creacion)
);
GO

CREATE NONCLUSTERED INDEX IX_Categorias_activo_fecha_baja
    ON dbo.Categorias (activo, fecha_baja)
    INCLUDE (nombre, descripcion, orden);
GO

CREATE NONCLUSTERED INDEX IX_Categorias_nombre
    ON dbo.Categorias (nombre);
GO

/* =============================================================================
   TABLA: Productos
   ============================================================================= */
CREATE TABLE dbo.Productos (
    id                  INT             NOT NULL IDENTITY(1, 1),
    categoria_id        INT             NOT NULL,
    nombre              NVARCHAR(160)   NOT NULL,
    descripcion         NVARCHAR(1000)  NULL,
    precio              DECIMAL(10, 2)  NOT NULL,
    imagen              NVARCHAR(500)   NULL,
    activo              BIT             NOT NULL CONSTRAINT DF_Productos_activo DEFAULT (1),
    destacado           BIT             NOT NULL CONSTRAINT DF_Productos_destacado DEFAULT (0),
    orden               INT             NULL,
    fecha_creacion      DATETIME2(0)    NOT NULL CONSTRAINT DF_Productos_fecha_creacion DEFAULT (SYSUTCDATETIME()),
    fecha_modificacion  DATETIME2(0)    NULL,
    fecha_baja          DATETIME2(0)    NULL,

    CONSTRAINT PK_Productos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_Productos_Categorias
        FOREIGN KEY (categoria_id) REFERENCES dbo.Categorias (id),
    CONSTRAINT CK_Productos_precio CHECK (precio >= 0),
    CONSTRAINT CK_Productos_orden CHECK (orden IS NULL OR orden >= 0),
    CONSTRAINT CK_Productos_fecha_baja
        CHECK (fecha_baja IS NULL OR fecha_baja >= fecha_creacion)
);
GO

CREATE NONCLUSTERED INDEX IX_Productos_categoria_id
    ON dbo.Productos (categoria_id)
    INCLUDE (nombre, precio, activo, imagen, fecha_baja, destacado, orden);
GO

CREATE NONCLUSTERED INDEX IX_Productos_catalogo
    ON dbo.Productos (categoria_id, activo, fecha_baja)
    INCLUDE (nombre, descripcion, precio, imagen, orden)
    WHERE activo = 1 AND fecha_baja IS NULL;
GO

CREATE NONCLUSTERED INDEX IX_Productos_destacados_home
    ON dbo.Productos (destacado, activo, fecha_creacion DESC)
    INCLUDE (nombre, descripcion, precio, imagen, categoria_id, orden)
    WHERE destacado = 1 AND activo = 1 AND fecha_baja IS NULL;
GO

CREATE NONCLUSTERED INDEX IX_Productos_nombre
    ON dbo.Productos (nombre);
GO

/* =============================================================================
   TABLA: ConfiguracionNegocio (singleton + SEO)
   ============================================================================= */
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
    seo_title           NVARCHAR(120)   NULL,
    seo_description     NVARCHAR(320)   NULL,
    seo_keywords        NVARCHAR(500)   NULL,
    og_image            NVARCHAR(500)   NULL,
    fecha_modificacion  DATETIME2(0)    NULL,

    CONSTRAINT PK_ConfiguracionNegocio PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_ConfiguracionNegocio_singleton CHECK (id = 1),
    CONSTRAINT CK_ConfiguracionNegocio_email_formato
        CHECK (email IS NULL OR (email LIKE '%_@_%._%' AND LEN(email) >= 5))
);
GO

/* =============================================================================
   TABLA: Promociones
   ============================================================================= */
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
        CHECK (fecha_inicio IS NULL OR fecha_fin IS NULL OR fecha_fin >= fecha_inicio),
    CONSTRAINT CK_Promociones_fecha_baja
        CHECK (fecha_baja IS NULL OR fecha_baja >= fecha_creacion)
);
GO

CREATE NONCLUSTERED INDEX IX_Promociones_vigentes
    ON dbo.Promociones (activo, fecha_baja, fecha_inicio, fecha_fin)
    INCLUDE (nombre, descripcion, imagen, precio_promocional, destacado)
    WHERE activo = 1 AND fecha_baja IS NULL;
GO

/* =============================================================================
   TABLA: HeroHome (singleton)
   ============================================================================= */
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
GO

/* =============================================================================
   TABLA: Testimonios (+ moderación)
   ============================================================================= */
CREATE TABLE dbo.Testimonios (
    id                  INT             NOT NULL IDENTITY(1, 1),
    nombre_cliente      NVARCHAR(120)   NOT NULL,
    comentario          NVARCHAR(1000)  NOT NULL,
    puntuacion          TINYINT         NOT NULL,
    activo              BIT             NOT NULL CONSTRAINT DF_Testimonios_activo DEFAULT (1),
    estado              NVARCHAR(20)    NOT NULL CONSTRAINT DF_Testimonios_estado DEFAULT (N'aprobado'),
    orden               INT             NULL,
    fecha_creacion      DATETIME2(0)    NOT NULL CONSTRAINT DF_Testimonios_fecha_creacion DEFAULT (SYSUTCDATETIME()),
    fecha_modificacion  DATETIME2(0)    NULL,

    CONSTRAINT PK_Testimonios PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_Testimonios_puntuacion CHECK (puntuacion BETWEEN 1 AND 5),
    CONSTRAINT CK_Testimonios_orden CHECK (orden IS NULL OR orden >= 0),
    CONSTRAINT CK_Testimonios_estado
        CHECK (estado IN (N'pendiente', N'aprobado', N'rechazado'))
);
GO

CREATE NONCLUSTERED INDEX IX_Testimonios_activos_home
    ON dbo.Testimonios (activo, estado, orden, fecha_creacion DESC)
    INCLUDE (nombre_cliente, comentario, puntuacion)
    WHERE activo = 1 AND estado = N'aprobado';
GO

/* =============================================================================
   TABLAS: Información útil
   ============================================================================= */
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
GO

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
GO

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

/* =============================================================================
   TRIGGERS: fecha_modificacion
   ============================================================================= */
CREATE OR ALTER TRIGGER TR_Categorias_actualizar_modificacion
ON dbo.Categorias AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(fecha_modificacion)
        UPDATE c SET fecha_modificacion = SYSUTCDATETIME()
        FROM dbo.Categorias c INNER JOIN inserted i ON i.id = c.id;
END;
GO

CREATE OR ALTER TRIGGER TR_Productos_actualizar_modificacion
ON dbo.Productos AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(fecha_modificacion)
        UPDATE p SET fecha_modificacion = SYSUTCDATETIME()
        FROM dbo.Productos p INNER JOIN inserted i ON i.id = p.id;
END;
GO

CREATE OR ALTER TRIGGER TR_ConfiguracionNegocio_fecha_modificacion
ON dbo.ConfiguracionNegocio AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(fecha_modificacion)
        UPDATE c SET fecha_modificacion = SYSUTCDATETIME()
        FROM dbo.ConfiguracionNegocio c INNER JOIN inserted i ON i.id = c.id;
END;
GO

CREATE OR ALTER TRIGGER TR_Promociones_actualizar_modificacion
ON dbo.Promociones AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(fecha_modificacion)
        UPDATE p SET fecha_modificacion = SYSUTCDATETIME()
        FROM dbo.Promociones p INNER JOIN inserted i ON i.id = p.id;
END;
GO

CREATE OR ALTER TRIGGER TR_HeroHome_actualizar_modificacion
ON dbo.HeroHome AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(fecha_modificacion)
        UPDATE h SET fecha_modificacion = SYSUTCDATETIME()
        FROM dbo.HeroHome h INNER JOIN inserted i ON i.id = h.id;
END;
GO

CREATE OR ALTER TRIGGER TR_Testimonios_actualizar_modificacion
ON dbo.Testimonios AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(fecha_modificacion)
        UPDATE t SET fecha_modificacion = SYSUTCDATETIME()
        FROM dbo.Testimonios t INNER JOIN inserted i ON i.id = t.id;
END;
GO

CREATE OR ALTER TRIGGER TR_ZonasEntrega_actualizar_modificacion
ON dbo.ZonasEntrega AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(fecha_modificacion)
        UPDATE z SET fecha_modificacion = SYSUTCDATETIME()
        FROM dbo.ZonasEntrega z INNER JOIN inserted i ON i.id = z.id;
END;
GO

CREATE OR ALTER TRIGGER TR_FormasPago_actualizar_modificacion
ON dbo.FormasPago AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(fecha_modificacion)
        UPDATE f SET fecha_modificacion = SYSUTCDATETIME()
        FROM dbo.FormasPago f INNER JOIN inserted i ON i.id = f.id;
END;
GO

CREATE OR ALTER TRIGGER TR_PreguntasFrecuentes_actualizar_modificacion
ON dbo.PreguntasFrecuentes AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(fecha_modificacion)
        UPDATE p SET fecha_modificacion = SYSUTCDATETIME()
        FROM dbo.PreguntasFrecuentes p INNER JOIN inserted i ON i.id = p.id;
END;
GO

PRINT 'Esquema FoodHub creado correctamente.';
GO

/* =============================================================================
   SEEDS — Administrador demo
   =============================================================================
   Email: admin@demo.local
   NO incluye contraseña en texto plano.

   Generar hash:
     node backend/scripts/hash-password.js "tu_contraseña_segura"

   Actualizar antes de producción:
     UPDATE dbo.Administradores
     SET password_hash = N'...hash...'
     WHERE email = N'admin@demo.local';
   ============================================================================= */
INSERT INTO dbo.Administradores (nombre, email, password_hash, activo, sesion_version)
VALUES (
    N'Administrador',
    N'admin@demo.local',
    N'$2b$12$xvb3bNrrWxbw3LzikPjfk.OhH7sp6OaWcl.jS42F5SrEorI0dd1uu',
    1,
    1
);
GO

/* =============================================================================
   SEEDS — Configuración del negocio demo
   ============================================================================= */
INSERT INTO dbo.ConfiguracionNegocio (
    id, nombre_negocio, slogan,
    telefono, whatsapp, instagram, facebook,
    direccion, horarios, email, logo, mensaje_whatsapp,
    seo_title, seo_description, seo_keywords, og_image,
    fecha_modificacion
)
VALUES (
    1,
    N'Mi negocio',
    N'Carta online y pedidos por WhatsApp',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL,
    NULL,
    N'Hola! Quiero hacer un pedido.',
    NULL, NULL, NULL, NULL,
    SYSUTCDATETIME()
);
GO

/* =============================================================================
   SEEDS — Hero home demo
   ============================================================================= */
INSERT INTO dbo.HeroHome (
    id, eyebrow, titulo_antes, titulo_destacado, titulo_despues, subtitulo,
    btn_primario_texto, btn_primario_url,
    btn_secundario_texto, btn_secundario_url,
    imagen, activo, fecha_modificacion
)
VALUES (
    1,
    N'Carta online y pedidos por WhatsApp',
    N'Bienvenidos a',
    N'nuestro local',
    NULL,
    N'Descubrí la carta, elegí tus favoritos y consultanos por WhatsApp.',
    N'Ver menú', N'/menu',
    N'Pedir por WhatsApp', NULL,
    NULL,
    1,
    SYSUTCDATETIME()
);
GO

/* =============================================================================
   SEEDS — Menú demo
   ============================================================================= */
INSERT INTO dbo.Categorias (nombre, descripcion, activo, orden)
VALUES
    (N'Entradas', N'Para comenzar', 1, 1),
    (N'Platos principales', N'Opciones de la carta', 1, 2);
GO

INSERT INTO dbo.Productos (categoria_id, nombre, descripcion, precio, imagen, activo, destacado, orden)
VALUES
    (1, N'Ensalada de la casa', N'Verduras frescas de estación.', 3200.00, NULL, 1, 0, 1),
    (1, N'Empanadas (docena)', N'Rellenos clásicos, masa casera.', 4500.00, NULL, 1, 1, 2),
    (2, N'Plato del día', N'Consultá la propuesta de hoy.', 5200.00, NULL, 1, 1, 1),
    (2, N'Opción vegetariana', N'Preparación sin carne, consultar ingredientes.', 4800.00, NULL, 1, 0, 2);
GO

/* =============================================================================
   SEEDS — Información útil demo
   ============================================================================= */
INSERT INTO dbo.ZonasEntrega (nombre_zona, descripcion, costo_envio, activo, orden)
VALUES
    (N'Zona 1', N'Consultá cobertura con el local.', 1500.00, 1, 1),
    (N'Zona 2', N'Consultá cobertura con el local.', 2500.00, 1, 2);
GO

INSERT INTO dbo.FormasPago (nombre, descripcion, activo, orden)
VALUES
    (N'Efectivo', N'Pagás al recibir tu pedido.', 1, 1),
    (N'Transferencia', N'Te enviamos los datos al confirmar el pedido.', 1, 2),
    (N'Mercado Pago', N'Link de pago seguro.', 1, 3);
GO

INSERT INTO dbo.PreguntasFrecuentes (pregunta, respuesta, activo, orden)
VALUES
    (N'¿Cómo hago un pedido?', N'Elegí productos del menú y envianos tu pedido por WhatsApp.', 1, 1),
    (N'¿Puedo retirar en el local?', N'Sí, coordiná el horario de retiro por WhatsApp.', 1, 2),
    (N'¿Cuáles son los medios de pago?', N'Consultá la sección Formas de pago o escribinos por WhatsApp.', 1, 3);
GO

PRINT 'Instalación FoodHub completada — esquema + seeds demo.';
PRINT 'Administrador: admin@demo.local — definí password_hash antes de producción.';
GO
