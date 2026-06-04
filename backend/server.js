require('dotenv').config();

const app = require('./app');
const config = require('./config');
const { closePool } = require('./database/connection');
const logger = require('./utils/logger');

const PORT = config.port;

const server = app.listen(PORT, () => {
  logger.info(`Servidor en http://localhost:${PORT}`, { env: config.env });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(
      `Puerto ${PORT} en uso. Cerrá otra instancia o cambiá PORT en .env`
    );
    process.exit(1);
  }
  throw err;
});

async function shutdown(signal) {
  logger.info(`Cerrando servidor (${signal})`);
  server.close(async () => {
    await closePool();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
