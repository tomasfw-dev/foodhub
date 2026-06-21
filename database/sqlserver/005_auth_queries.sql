/*
  FoodHub — Consultas de autenticación
  Tabla: dbo.Administradores
*/

-- Buscar administrador por email (login)
SELECT
    id,
    nombre,
    email,
    password_hash,
    activo
FROM dbo.Administradores
WHERE email = @email;

-- Verificar sesión activa por id
SELECT
    id,
    nombre,
    email,
    activo
FROM dbo.Administradores
WHERE id = @id
  AND activo = 1;
