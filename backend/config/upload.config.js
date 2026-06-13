const paths = require('./paths');

const MB = 1024 * 1024;
const KB = 1024;

/** Perfiles de optimización por tipo de imagen (upload temporal → Sharp → archivo final). */
const IMAGE_PROFILES = {
  productos: {
    label: 'producto',
    maxUploadSize: 50 * MB,
    maxOutputSize: 2 * MB,
    width: 1200,
    height: 1200,
    fit: 'inside',
    format: 'webp',
    quality: 80,
    jpegQuality: 82,
    uploadLimitMessage: '50 MB',
    outputLimitMessage: '2 MB',
  },
  promociones: {
    label: 'promoción',
    maxUploadSize: 50 * MB,
    maxOutputSize: 2 * MB,
    width: 1200,
    height: 1200,
    fit: 'inside',
    format: 'webp',
    quality: 80,
    jpegQuality: 82,
    uploadLimitMessage: '50 MB',
    outputLimitMessage: '2 MB',
  },
  hero: {
    label: 'hero',
    maxUploadSize: 50 * MB,
    maxOutputSize: 2 * MB,
    width: 1920,
    height: 1080,
    fit: 'inside',
    format: 'webp',
    quality: 80,
    jpegQuality: 82,
    uploadLimitMessage: '50 MB',
    outputLimitMessage: '2 MB',
  },
  logos: {
    label: 'logo',
    maxUploadSize: 20 * MB,
    maxOutputSize: 500 * KB,
    width: 800,
    height: 800,
    fit: 'inside',
    format: 'webp',
    formatFallback: 'png',
    quality: 80,
    uploadLimitMessage: '20 MB',
    outputLimitMessage: '500 KB',
  },
  og: {
    label: 'imagen OG',
    maxUploadSize: 20 * MB,
    maxOutputSize: 1 * MB,
    width: 1200,
    height: 630,
    fit: 'inside',
    format: 'webp',
    quality: 80,
    jpegQuality: 82,
    uploadLimitMessage: '20 MB',
    outputLimitMessage: '1 MB',
  },
};

/** Ruta admin → perfil por defecto (errores de tamaño de subida). */
const ROUTE_IMAGE_PROFILE = {
  '/admin/productos': 'productos',
  '/admin/promociones': 'promociones',
  '/admin/hero': 'hero',
};

function getImageProfile(profileKey) {
  const profile = IMAGE_PROFILES[profileKey];
  if (!profile) {
    throw new Error(`Perfil de imagen desconocido: ${profileKey}`);
  }
  return profile;
}

function resolveRouteProfileKey(urlPath) {
  for (const [route, profileKey] of Object.entries(ROUTE_IMAGE_PROFILE)) {
    if (urlPath.startsWith(route)) {
      return profileKey;
    }
  }
  return null;
}

function resolveFieldProfileKey(fieldName) {
  if (fieldName === 'logo') return 'logos';
  if (fieldName === 'og_image') return 'og';
  return null;
}

function resolveUploadSizeErrorMessage(req, multerErr) {
  if (req.originalUrl.startsWith('/admin/configuracion')) {
    const fieldProfile = resolveFieldProfileKey(multerErr?.field);
    if (fieldProfile === 'og') {
      return 'La imagen OG supera el tamaño máximo de 20 MB.';
    }
    return 'El logo supera el tamaño máximo de 20 MB.';
  }

  const profileKey = resolveRouteProfileKey(req.originalUrl);
  if (profileKey) {
    const profile = getImageProfile(profileKey);
    return `La imagen supera el tamaño máximo de ${profile.uploadLimitMessage}.`;
  }

  return 'La imagen supera el tamaño máximo permitido.';
}

module.exports = {
  PRODUCTOS_DIR: paths.uploadsProductosDir,
  PUBLIC_PREFIX: '/uploads/productos',
  LOGOS_DIR: paths.uploadsLogosDir,
  LOGO_PUBLIC_PREFIX: '/uploads/logos',
  OG_DIR: paths.uploadsOgDir,
  OG_PUBLIC_PREFIX: '/uploads/og',
  HERO_DIR: paths.uploadsHeroDir,
  HERO_PUBLIC_PREFIX: '/uploads/hero',
  PROMOCIONES_DIR: paths.uploadsPromocionesDir,
  PROMOCIONES_PUBLIC_PREFIX: '/uploads/promociones',
  ALLOWED_PUBLIC_PREFIXES: [
    '/uploads/productos/',
    '/uploads/promociones/',
    '/uploads/hero/',
    '/uploads/logos/',
    '/uploads/og/',
  ],
  FIELD_NAME: 'imagen',
  LOGO_FIELD_NAME: 'logo',
  OG_FIELD_NAME: 'og_image',
  HERO_FIELD_NAME: 'imagen',
  IMAGE_PROFILES,
  ALLOWED_EXTENSIONS: new Set(['.jpg', '.jpeg', '.png', '.webp']),
  ALLOWED_MIMES: new Set(['image/jpeg', 'image/png', 'image/webp']),
  getImageProfile,
  resolveRouteProfileKey,
  resolveFieldProfileKey,
  resolveUploadSizeErrorMessage,
};
