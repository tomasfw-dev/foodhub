/*
  Plataforma gastronómica — Administrador inicial (instalación demo)
  Ejecutar después de 001_schema_bendita_comida.sql

  Credenciales de demo (cambiar en el primer acceso):
    Email: admin@demo.local

  Este script NO incluye contraseñas en texto plano.
  El hash bcrypt corresponde a una contraseña temporal de instalación.

  Generar un nuevo hash:
    node backend/scripts/hash-password.js "tu_contraseña_segura"

  Reemplazar el valor de password_hash antes de usar en producción.
*/

SET NOCOUNT ON;
GO

IF NOT EXISTS (
    SELECT 1 FROM dbo.Administradores WHERE email = N'admin@demo.local'
)
BEGIN
    INSERT INTO dbo.Administradores (nombre, email, password_hash, activo)
    VALUES (
        N'Administrador',
        N'admin@demo.local',
        N'$2b$12$xvb3bNrrWxbw3LzikPjfk.OhH7sp6OaWcl.jS42F5SrEorI0dd1uu',
        1
    );

    PRINT 'Administrador demo creado: admin@demo.local';
    PRINT 'Generá una contraseña propia con: node backend/scripts/hash-password.js "tu_contraseña"';
END
ELSE
BEGIN
    PRINT 'El administrador demo ya existe — sin cambios.';
END
GO
