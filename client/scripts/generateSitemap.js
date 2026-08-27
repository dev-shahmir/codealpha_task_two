// Regenerates public/sitemap.xml from the canonical route list.
// Run with: npm run generate-sitemap
import fs from 'fs';
import path from 'path';

const SITE_URL = process.env.VITE_SITE_URL || 'https://vybeboard.app';

const routes = [
  { path: '/', priority: '1.0', freq: 'weekly' },
  { path: '/features', priority: '0.9', freq: 'monthly' },
  { path: '/solutions/startups', priority: '0.8', freq: 'monthly' },
  { path: '/solutions/developers', priority: '0.8', freq: 'monthly' },
  { path: '/solutions/freelancers', priority: '0.8', freq: 'monthly' },
  { path: '/solutions/agencies', priority: '0.8', freq: 'monthly' },
  { path: '/solutions/remote-teams', priority: '0.8', freq: 'monthly' },
  { path: '/about', priority: '0.6', freq: 'monthly' },
  { path: '/contact', priority: '0.5', freq: 'yearly' },
  { path: '/help', priority: '0.6', freq: 'monthly' },
  { path: '/privacy', priority: '0.3', freq: 'yearly' },
  { path: '/terms', priority: '0.3', freq: 'yearly' },
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
  .map((r) => `  <url><loc>${SITE_URL}${r.path}</loc><changefreq>${r.freq}</changefreq><priority>${r.priority}</priority></url>`)
  .join('\n')}\n</urlset>\n`;

fs.writeFileSync(path.resolve('public/sitemap.xml'), xml);
console.log('[VYBEBOARD] sitemap.xml generated with', routes.length, 'routes');
