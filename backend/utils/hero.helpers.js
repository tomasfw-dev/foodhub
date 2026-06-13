/**
 * Helpers — HeroHome → vistas públicas y admin
 */
const constants = require('../config/constants');
const { resolveHeroImageUrl } = require('./image.helpers');

const { DEFAULT_APP_NAME, DEFAULT_SITE_CONFIG, PLATFORM_LOGO_URL } = constants;

const FALLBACK = {
  eyebrow: DEFAULT_SITE_CONFIG.tagline,
  tituloAntes: 'Bienvenidos a',
  tituloDestacado: 'nuestro local',
  tituloDespues: null,
  subtitulo: 'Descubrí la carta, elegí tus favoritos y consultanos por WhatsApp.',
  btnPrimarioTexto: 'Ver menú',
  btnPrimarioUrl: constants.ROUTES.MENU,
  btnSecundarioTexto: 'Pedir por WhatsApp',
  btnSecundarioUrl: null,
  imagen: null,
};

/**
 * @param {object|null} siteLocals — res.locals.site
 * @param {object|null} whatsappLocals — res.locals.whatsapp
 * @param {string|null} whatsappUrl
 */
exports.buildFallback = (siteLocals, whatsappLocals, whatsappUrl, appName) => {
  const logoUrl = siteLocals?.hasLogo ? siteLocals.logoUrl : null;
  const eyebrow = siteLocals?.tagline || FALLBACK.eyebrow;
  const hasWhatsapp = Boolean(whatsappLocals?.phone);

  return {
    isDynamic: false,
    activo: false,
    eyebrow,
    tituloAntes: FALLBACK.tituloAntes,
    tituloDestacado: FALLBACK.tituloDestacado,
    tituloDespues: FALLBACK.tituloDespues,
    subtitulo: FALLBACK.subtitulo,
    btnPrimarioTexto: FALLBACK.btnPrimarioTexto,
    btnPrimarioUrl: FALLBACK.btnPrimarioUrl,
    btnSecundarioTexto: hasWhatsapp ? FALLBACK.btnSecundarioTexto : null,
    btnSecundarioUrl: hasWhatsapp ? whatsappUrl || null : null,
    btnSecundarioEsWhatsapp: hasWhatsapp,
    imagenUrl: logoUrl,
    imagenMonocroma: exports.esImagenMonocroma(logoUrl),
    imagenAlt: appName || DEFAULT_APP_NAME,
  };
};

/**
 * @param {object} row — fila HeroHome
 * @param {object} [context]
 */
exports.mapRowToView = (row, context = {}) => {
  const secTexto = row.btn_secundario_texto?.trim() || null;
  const secUrl = row.btn_secundario_url?.trim() || null;
  const whatsappUrl = context.whatsappUrl || null;
  const hasWhatsapp = Boolean(context.whatsappPhone);

  let btnSecundarioUrl = secUrl;
  let btnSecundarioEsWhatsapp = false;

  if (secTexto && !secUrl && hasWhatsapp) {
    btnSecundarioUrl = whatsappUrl;
    btnSecundarioEsWhatsapp = true;
  } else if (secUrl && /wa\.me|whatsapp\.com/i.test(secUrl)) {
    btnSecundarioEsWhatsapp = true;
  }

  return {
    isDynamic: true,
    activo: Boolean(row.activo),
    eyebrow: row.eyebrow,
    tituloAntes: row.titulo_antes,
    tituloDestacado: row.titulo_destacado || null,
    tituloDespues: row.titulo_despues || null,
    subtitulo: row.subtitulo,
    btnPrimarioTexto: row.btn_primario_texto,
    btnPrimarioUrl: row.btn_primario_url,
    btnSecundarioTexto: secTexto,
    btnSecundarioUrl: btnSecundarioUrl,
    btnSecundarioEsWhatsapp,
    imagenUrl: resolveHeroImageUrl(row.imagen),
    imagenMonocroma: exports.esImagenMonocroma(row.imagen),
    imagenAlt: context.appName || DEFAULT_APP_NAME,
  };
};

/** Logo de plataforma en /images/logo-default → filtro monocromático (solo admin/legacy). */
exports.esImagenMonocroma = (storedUrl) => {
  if (!storedUrl?.trim()) return true;
  const url = String(storedUrl).trim();
  return (
    url === PLATFORM_LOGO_URL ||
    url.endsWith('logo-default.png')
  );
};

exports.mapRowToAdmin = (row) => {
  return {
    id: row.id,
    eyebrow: row.eyebrow,
    titulo_antes: row.titulo_antes,
    titulo_destacado: row.titulo_destacado || '',
    titulo_despues: row.titulo_despues || '',
    subtitulo: row.subtitulo,
    btn_primario_texto: row.btn_primario_texto,
    btn_primario_url: row.btn_primario_url,
    btn_secundario_texto: row.btn_secundario_texto || '',
    btn_secundario_url: row.btn_secundario_url || '',
    imagen: row.imagen || '',
    imagenUrl: resolveHeroImageUrl(row.imagen),
    activo: Boolean(row.activo),
    fecha_modificacion: row.fecha_modificacion,
  };
};
