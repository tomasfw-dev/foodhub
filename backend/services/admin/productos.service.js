/**
 * Lógica de negocio para productos del menú.
 * Persistencia en memoria (reemplazar por base de datos).
 */
const categoriasService = require('./categorias.service');

let productos = [
  {
    id: 1,
    categoriaId: 1,
    nombre: 'Milanesas caseras',
    descripcion: 'Crocantes por fuera, jugosas por dentro.',
    precio: 4500,
    imagen: null,
    badge: 'Popular',
    activo: true,
  },
];

let nextId = 2;

function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

exports.listar = (filtros = {}) => {
  let resultado = [...productos];

  if (filtros.categoriaId) {
    resultado = resultado.filter(
      (p) => p.categoriaId === Number(filtros.categoriaId)
    );
  }

  if (filtros.soloActivos) {
    resultado = resultado.filter((p) => p.activo);
  }

  return resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
};

exports.obtenerPorId = (id) => {
  const producto = productos.find((p) => p.id === Number(id));
  if (!producto) throw createError(404, 'Producto no encontrado');
  return producto;
};

exports.crear = (datos) => {
  const nombre = datos.nombre?.trim();
  if (!nombre) throw createError(400, 'El nombre es obligatorio');
  if (datos.categoriaId == null) throw createError(400, 'La categoría es obligatoria');

  categoriasService.obtenerPorId(datos.categoriaId);

  const producto = {
    id: nextId++,
    categoriaId: Number(datos.categoriaId),
    nombre,
    descripcion: datos.descripcion?.trim() || '',
    precio: datos.precio != null ? Number(datos.precio) : null,
    imagen: datos.imagen?.trim() || null,
    badge: datos.badge?.trim() || null,
    activo: datos.activo !== false,
  };

  productos.push(producto);
  return producto;
};

exports.editar = (id, datos) => {
  const index = productos.findIndex((p) => p.id === Number(id));
  if (index === -1) throw createError(404, 'Producto no encontrado');

  const actual = productos[index];

  if (datos.categoriaId != null) {
    categoriasService.obtenerPorId(datos.categoriaId);
  }

  const nombre = datos.nombre !== undefined ? datos.nombre.trim() : actual.nombre;
  if (!nombre) throw createError(400, 'El nombre es obligatorio');

  productos[index] = {
    ...actual,
    nombre,
    categoriaId:
      datos.categoriaId != null ? Number(datos.categoriaId) : actual.categoriaId,
    descripcion:
      datos.descripcion !== undefined ? datos.descripcion.trim() : actual.descripcion,
    precio: datos.precio !== undefined ? Number(datos.precio) : actual.precio,
    imagen: datos.imagen !== undefined ? datos.imagen?.trim() || null : actual.imagen,
    badge: datos.badge !== undefined ? datos.badge?.trim() || null : actual.badge,
    activo: datos.activo !== undefined ? Boolean(datos.activo) : actual.activo,
  };

  return productos[index];
};

exports.eliminar = (id) => {
  const index = productos.findIndex((p) => p.id === Number(id));
  if (index === -1) throw createError(404, 'Producto no encontrado');

  const [eliminado] = productos.splice(index, 1);
  return eliminado;
};

exports.activar = (id) => {
  return exports.editar(id, { activo: true });
};

exports.desactivar = (id) => {
  return exports.editar(id, { activo: false });
};
