require('dotenv').config();

const app = require('./app');
const config = require('./config');

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT} [${config.env}]`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\nPuerto ${PORT} en uso. Opciones:\n` +
        `  1) Cerrar el proceso anterior (otra terminal con npm run dev)\n` +
        `  2) Cambiar PORT en el archivo .env\n`
    );
    process.exit(1);
  }
  throw err;
});
