/*
  Bendita-Comida — Administradora inicial (única)
  Ejecutar después de 001_schema_bendita_comida.sql

  Credenciales iniciales:
    Email:    admin@bendita-comida.com
    Password: Bendita2026!

  IMPORTANTE: Cambiar la contraseña después del primer acceso.
  Para generar un nuevo hash: node backend/scripts/hash-password.js "tu_password"
*/

SET NOCOUNT ON;
GO

IF NOT EXISTS (
    SELECT 1 FROM dbo.Administradores WHERE email = N'admin@bendita-comida.com'
)
BEGIN
    INSERT INTO dbo.Administradores (nombre, email, password_hash, activo)
    VALUES (
        N'Administradora',
        N'admin@bendita-comida.com',
        N'$2b$12$EdlLxeBDaJVTZA3qqiu6Hu5JilImiWR3isjl/hMVj4OBuAsPDKt4e',
        1
    );

    PRINT 'Administradora creada: admin@bendita-comida.com';
END
ELSE
BEGIN
    PRINT 'La administradora ya existe — sin cambios.';
END
GO
