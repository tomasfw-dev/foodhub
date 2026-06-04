const sql = require('mssql');
const config = require('../config');
const logger = require('../utils/logger');

let pool = null;

/**
 * Pool de conexión singleton hacia SQL Server.
 */
async function getPool() {
  if (pool) return pool;

  try {
    pool = await sql.connect(config.database);
    pool.on('error', (err) => {
      logger.error('Error en pool de SQL Server', err);
      pool = null;
    });
    logger.info('Conexión a SQL Server establecida', { database: config.database.database });
    return pool;
  } catch (err) {
    logger.error('No se pudo conectar a SQL Server', err);
    throw err;
  }
}

/**
 * Ejecuta una consulta parametrizada.
 */
async function query(text, params = {}) {
  const dbPool = await getPool();
  const request = dbPool.request();

  Object.entries(params).forEach(([key, value]) => {
    request.input(key, value);
  });

  const result = await request.query(text);
  return result.recordset;
}

async function closePool() {
  if (pool) {
    await pool.close();
    pool = null;
    logger.info('Pool de SQL Server cerrado');
  }
}

module.exports = {
  getPool,
  query,
  closePool,
  sql,
};
