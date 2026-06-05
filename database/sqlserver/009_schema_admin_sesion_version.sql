/*
  Bendita-Comida — Versión de sesión para invalidar sesiones tras cambio de contraseña
  Ejecutar en bases existentes después de 001_schema_bendita_comida.sql
*/

SET NOCOUNT ON;
GO

IF COL_LENGTH('dbo.Administradores', 'sesion_version') IS NULL
BEGIN
    ALTER TABLE dbo.Administradores
    ADD sesion_version INT NOT NULL
        CONSTRAINT DF_Administradores_sesion_version DEFAULT (1);

    PRINT 'Columna sesion_version agregada a Administradores.';
END
ELSE
BEGIN
    PRINT 'La columna sesion_version ya existe — sin cambios.';
END
GO
