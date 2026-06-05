/**
 * Genera un hash bcrypt para insertar en dbo.Administradores.password_hash
 * Uso: node backend/scripts/hash-password.js "mi_contraseña"
 */
const bcrypt = require('bcrypt');

const password = process.argv[2];
const rounds = 12;

if (!password) {
  console.error('Uso: node backend/scripts/hash-password.js "contraseña"');
  process.exit(1);
}

bcrypt
  .hash(password, rounds)
  .then((hash) => {
    console.log(hash);
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
