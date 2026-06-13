/**
 * Helpers SEO / Open Graph — ConfiguracionNegocio + páginas públicas
 */
const path = require('path');
const fs = require('fs');
const siteHelpers = require('./site.helpers');
const uploadConfig = require('../config/upload.config');

const DEFAULT_DESCRIPTION_SUFFIX = 'Consultá la carta y pedí por WhatsApp.';

/**
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {string} siteUrl
 * @param {string} path
 * @returns {string}
 */
function buildAbsoluteUrl(siteUrl, path = '/') {
  const base = String(siteUrl || '').replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

/**
 * @param {string|null|undefined} storedUrl
 * @returns {string}
 */
exports.resolveOgImageUrl = (storedUrl) => {
  if (!storedUrl?.trim()) return '';

  const url = storedUrl.trim();

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith(`${uploadConfig.OG_PUBLIC_PREFIX}/`)) {
    const filePath = path.join(uploadConfig.OG_DIR, path.basename(url));
    return fs.existsSync(filePath) ? url : '';
  }

  return siteHelpers.resolveBusinessLogoUrl(url) || '';
};

/**
 * Metadatos base desde fila de ConfiguracionNegocio.
 * @param {object|null} row
 * @param {string} siteUrl
 */
exports.buildSeoBase = (row, siteUrl) => {
  const constants = require('../config/constants');
  const nombre = row?.nombre_negocio || constants.DEFAULT_APP_NAME;
  const slogan = row?.slogan || constants.DEFAULT_SITE_CONFIG.tagline;
  const businessLogo = siteHelpers.resolveBusinessLogoUrl(row?.logo);
  const ogStored = row?.og_image?.trim() || '';
  const ogImagePath =
    (ogStored ? exports.resolveOgImageUrl(ogStored) : '') || businessLogo || '';

  const defaultDescription =
    row?.seo_description?.trim() ||
    `${nombre}. ${slogan}. ${DEFAULT_DESCRIPTION_SUFFIX}`;

  const siteUrlBase = buildAbsoluteUrl(siteUrl, '/');

  return {
    siteName: nombre,
    siteUrl: siteUrlBase,
    defaultTitle: row?.seo_title?.trim() || `${nombre} — ${slogan}`,
    defaultDescription: defaultDescription.slice(0, 320),
    defaultKeywords:
      row?.seo_keywords?.trim() ||
      `${nombre}, menú, gastronomía, pedidos, delivery`,
    defaultImage: ogImagePath ? buildAbsoluteUrl(siteUrl, ogImagePath) : '',
    logoImage: businessLogo ? buildAbsoluteUrl(siteUrl, businessLogo) : '',
  };
};

/**
 * Metadatos por página (merge con base).
 * @param {object} base
 * @param {object} [page]
 */
exports.buildPageSeo = (base, page = {}) => {
  const path = page.path || '/';
  const pageTitle = page.title?.trim();
  let title = base.defaultTitle;

  if (page.useDefaultTitle) {
    title = base.defaultTitle;
  } else if (pageTitle) {
    title = `${pageTitle} | ${base.siteName}`;
  }

  const description = (page.description?.trim() || base.defaultDescription).slice(0, 320);
  const keywords = (page.keywords?.trim() || base.defaultKeywords).slice(0, 500);
  const image = page.image
    ? buildAbsoluteUrl(base.siteUrl.replace(/\/+$/, ''), page.image)
    : base.defaultImage;
  const canonical = buildAbsoluteUrl(base.siteUrl.replace(/\/+$/, ''), path);

  return {
    title: title.slice(0, 120),
    description,
    keywords,
    canonical,
    ogTitle: title.slice(0, 120),
    ogDescription: description,
    ogImage: image || '',
    ogUrl: canonical,
    twitterTitle: title.slice(0, 120),
    twitterDescription: description,
    twitterImage: image || '',
    siteName: base.siteName,
    hasImage: Boolean(image),
  };
};

exports.escapeHtml = escapeHtml;
exports.buildAbsoluteUrl = buildAbsoluteUrl;
