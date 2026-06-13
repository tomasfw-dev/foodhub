/**
 * Validación de precios para DECIMAL(10, 2) en SQL Server.
 */
const MAX_PRECIO = 99_999_999.99;

/**
 * @param {unknown} value
 * @param {{ allowEmpty?: boolean }} [options]
 * @returns {number}
 */
function parsePrecio(value, { allowEmpty = true } = {}) {
  if (value === undefined || value === null || String(value).trim() === '') {
    if (allowEmpty) return 0;
    const err = new Error('El precio es obligatorio.');
    err.status = 400;
    throw err;
  }

  const raw = String(value).trim().replace(',', '.');
  const numero = Number(raw);

  if (!Number.isFinite(numero) || numero < 0) {
    const err = new Error('El precio debe ser un número mayor o igual a 0.');
    err.status = 400;
    throw err;
  }

  if (numero > MAX_PRECIO) {
    const err = new Error(`El precio no puede superar ${MAX_PRECIO.toLocaleString('es-AR')}.`);
    err.status = 400;
    throw err;
  }

  return Math.round(numero * 100) / 100;
}

module.exports = {
  MAX_PRECIO,
  parsePrecio,
};
