/**
 * Utilidades compartidas del backend.
 */
exports.formatPrice = (amount) => {
  if (amount == null) return '';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(amount);
};
