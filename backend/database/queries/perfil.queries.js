/**
 * Consultas — perfil de administradora
 */
module.exports = {
  OBTENER_POR_ID: `
    SELECT
      id,
      nombre,
      email,
      password_hash,
      activo,
      fecha_creacion,
      sesion_version
    FROM dbo.Administradores
    WHERE id = @id
      AND activo = 1
  `,

  EMAIL_EN_USO: `
    SELECT id
    FROM dbo.Administradores
    WHERE email = @email
      AND id <> @id
  `,

  ACTUALIZAR_DATOS: `
    DECLARE @updated TABLE (
      id INT,
      nombre NVARCHAR(120),
      email NVARCHAR(255),
      fecha_creacion DATETIME2(0),
      sesion_version INT
    );

    UPDATE dbo.Administradores
    SET
      nombre = @nombre,
      email = @email
    OUTPUT
      INSERTED.id,
      INSERTED.nombre,
      INSERTED.email,
      INSERTED.fecha_creacion,
      INSERTED.sesion_version
    INTO @updated
    WHERE id = @id
      AND activo = 1;

    SELECT * FROM @updated;
  `,

  ACTUALIZAR_PASSWORD: `
    DECLARE @updated TABLE (
      id INT,
      nombre NVARCHAR(120),
      email NVARCHAR(255),
      sesion_version INT
    );

    UPDATE dbo.Administradores
    SET
      password_hash = @password_hash,
      sesion_version = sesion_version + 1
    OUTPUT
      INSERTED.id,
      INSERTED.nombre,
      INSERTED.email,
      INSERTED.sesion_version
    INTO @updated
    WHERE id = @id
      AND activo = 1;

    SELECT * FROM @updated;
  `,
};
