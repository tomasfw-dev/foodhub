/**
 * Servicio de menú — datos estáticos (reemplazar por BD en el futuro).
 */
const FEATURED_ITEMS = [
  {
    id: 1,
    name: 'Milanesas caseras',
    description: 'Crocantes por fuera, jugosas por dentro. Con guarnición a elección.',
    price: 4500,
    image:
      'https://images.unsplash.com/photo-1604908176997-431637744861?w=800&q=80',
    badge: 'Popular',
  },
  {
    id: 2,
    name: 'Lasagna de la casa',
    description: 'Capas de pasta fresca, ragú lentamente cocinado y bechamel sedosa.',
    price: 5200,
    image:
      'https://images.unsplash.com/photo-1574894709920-11b28e736d90?w=800&q=80',
    badge: null,
  },
  {
    id: 3,
    name: 'Tarta de verduras',
    description: 'Masa casera, vegetales de estación y queso gratinado al horno.',
    price: 3800,
    image:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
    badge: 'Vegetariano',
  },
  {
    id: 4,
    name: 'Pollo al horno',
    description: 'Marinado con hierbas aromáticas, papas doradas y ensalada fresca.',
    price: 4900,
    image:
      'https://images.unsplash.com/photo-1598103442097-9b5a6156b5f5?w=800&q=80',
    badge: null,
  },
];

const PROMOTIONS = [
  {
    id: 1,
    title: 'Combo familiar',
    description: 'Elegí 3 platos + postre casero. Ideal para compartir en casa.',
    tag: '15% OFF',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80',
  },
  {
    id: 2,
    title: 'Menú del día',
    description: 'Plato principal + bebida. Consultá las opciones del día por WhatsApp.',
    tag: 'Desde $3.800',
    image:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80',
  },
];

const PLACEHOLDER_ITEMS = FEATURED_ITEMS;

exports.getItems = () => PLACEHOLDER_ITEMS;

exports.getFeaturedItems = () => FEATURED_ITEMS;

exports.getPromotions = () => PROMOTIONS;
