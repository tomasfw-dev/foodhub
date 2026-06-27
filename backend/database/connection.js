const sql = require('mssql');
const config = require('../config');
const logger = require('../utils/logger');

let pool = null;

const DECIMAL_10_2 = sql.Decimal(10, 2);
const DECIMAL_KEYS = new Set(['precio', 'precio_promocional', 'costo_envio']);
const INT_KEYS = new Set(['orden', 'puntuacion', 'sesion_version', 'limite', 'limiteDestacados']);

function bindInput(request, key, value) {
  if (DECIMAL_KEYS.has(key)) {
    request.input(key, DECIMAL_10_2, value ?? null);
    return;
  }

  if (INT_KEYS.has(key) || key === 'id' || key.endsWith('Id')) {
    request.input(key, sql.Int, value ?? null);
    return;
  }

  if (typeof value === 'boolean') {
    request.input(key, sql.Bit, value);
    return;
  }

  request.input(key, value);
}

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
    bindInput(request, key, value);
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
