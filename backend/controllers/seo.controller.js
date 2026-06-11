const config = require('../config');
const seoHelpers = require('../utils/seo.helpers');
const logger = require('../utils/logger');

/** Rutas públicas indexables (sin /promociones: no existe página dedicada). */
const SITEMAP_PATHS = ['/', '/menu', '/informacion-util'];

exports.getRobots = (_req, res) => {
  const siteUrl = config.siteUrl.replace(/\/+$/, '');

  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /auth/

Sitemap: ${siteUrl}/sitemap.xml
`);
};

exports.getSitemap = (_req, res) => {
  try {
    const siteUrl = config.siteUrl.replace(/\/+$/, '');
    const lastmod = new Date().toISOString().slice(0, 10);

    const urls = SITEMAP_PATHS.map((path) => {
      const loc = seoHelpers.buildAbsoluteUrl(siteUrl, path);
      const priority = path === '/' ? '1.0' : '0.8';
      const changefreq = path === '/' ? 'weekly' : 'daily';

      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    res.type('application/xml');
    res.send(xml);
  } catch (err) {
    logger.error('Error al generar sitemap.xml', err);
    res.status(500).type('text/plain').send('Error al generar el sitemap.');
  }
};
