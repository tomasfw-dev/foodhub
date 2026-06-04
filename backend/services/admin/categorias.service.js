/**
 * Lógica de negocio para categorías del menú.
 * Persistencia en memoria (reemplazar por base de datos).
 */

let categorias = [
  {
    id: 1,
    nombre: 'Platos principales',
    descripcion: 'Platos caseros del día',
    activo: true,
    slug: 'platos-principales',
    orden: 1,
  },
  {
    id: 2,
    nombre: 'Tartas y horno',
    descripcion: 'Tartas y preparaciones al horno',
    activo: true,
    slug: 'tartas-y-horno',
    orden: 2,
  },
];

let nextId = 3;

function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

exports.listar = () => {
  return [...categorias].sort((a, b) => a.orden - b.orden);
};

exports.obtenerPorId = (id) => {
  const categoria = categorias.find((c) => c.id === Number(id));
  if (!categoria) throw createError(404, 'Categoría no encontrada');
  return categoria;
};

exports.crear = (datos) => {
  const nombre = datos.nombre?.trim();
  if (!nombre) throw createError(400, 'El nombre es obligatorio');

  const categoria = {
    id: nextId++,
    nombre,
    descripcion: datos.descripcion?.trim() || '',
    activo: datos.activo !== false && datos.activo !== 'false',
    slug: datos.slug?.trim() || slugify(nombre),
    orden: Number(datos.orden) || categorias.length + 1,
  };

  categorias.push(categoria);
  return categoria;
};

exports.editar = (id, datos) => {
  const index = categorias.findIndex((c) => c.id === Number(id));
  if (index === -1) throw createError(404, 'Categoría no encontrada');

  const actual = categorias[index];
  const nombre = datos.nombre !== undefined ? datos.nombre.trim() : actual.nombre;

  if (!nombre) throw createError(400, 'El nombre es obligatorio');

  categorias[index] = {
    ...actual,
    nombre,
    descripcion:
      datos.descripcion !== undefined ? datos.descripcion.trim() : actual.descripcion,
    activo:
      datos.activo !== undefined
        ? datos.activo !== false && datos.activo !== 'false'
        : actual.activo,
    slug:
      datos.slug !== undefined
        ? datos.slug.trim() || slugify(nombre)
        : actual.slug,
    orden: datos.orden !== undefined ? Number(datos.orden) : actual.orden,
  };

  return categorias[index];
};

exports.eliminar = (id) => {
  const index = categorias.findIndex((c) => c.id === Number(id));
  if (index === -1) throw createError(404, 'Categoría no encontrada');

  const [eliminada] = categorias.splice(index, 1);
  return eliminada;
};
