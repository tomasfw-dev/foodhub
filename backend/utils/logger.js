/**
 * Logger simple para consola (reemplazable por winston/pino).
 */
const config = require('../config');

function formatMeta(meta) {
  if (!meta) return '';
  if (meta instanceof Error) return ` | ${meta.message}`;
  if (typeof meta === 'object') return ` | ${JSON.stringify(meta)}`;
  return ` | ${meta}`;
}

exports.info = (message, meta) => {
  console.log(`[INFO] ${new Date().toISOString()} ${message}${formatMeta(meta)}`);
};

exports.warn = (message, meta) => {
  console.warn(`[WARN] ${new Date().toISOString()} ${message}${formatMeta(meta)}`);
};

exports.error = (message, meta) => {
  console.error(`[ERROR] ${new Date().toISOString()} ${message}${formatMeta(meta)}`);
  if (meta instanceof Error && config.env === 'development') {
    console.error(meta.stack);
  }
};
