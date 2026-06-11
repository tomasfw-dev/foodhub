/**
 * Helpers para campo orden (menú público).
 */

/**
 * @param {unknown} value
 * @returns {number|null}
 */
exports.parseOrden = (value) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return null;
  }

  const numero = Number(value);

  if (!Number.isInteger(numero) || numero < 0) {
    const err = new Error('El orden debe ser un número entero mayor o igual a 0.');
    err.status = 400;
    throw err;
  }

  return numero;
};

/**
 * @param {unknown} rowOrden
 * @returns {number|null}
 */
exports.mapOrden = (rowOrden) => {
  if (rowOrden === undefined || rowOrden === null) return null;
  return Number(rowOrden);
};
