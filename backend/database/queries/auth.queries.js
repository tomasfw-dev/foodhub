/**
 * Consultas de autenticación — Administradores
 */
module.exports = {
  ADMIN_POR_EMAIL: `
    SELECT
      id,
      nombre,
      email,
      password_hash,
      activo
    FROM dbo.Administradores
    WHERE email = @email
  `,

  ADMIN_POR_ID: `
    SELECT
      id,
      nombre,
      email,
      activo
    FROM dbo.Administradores
    WHERE id = @id
      AND activo = 1
  `,
};
