import { Helmet } from 'react-helmet-async';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://vybeboard.app';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og/vybeboard-social-preview.png`;

/**
 * Central SEO metadata component. Every public page renders this once with
 * unique title/description/canonical values. Private (authenticated) pages
 * pass noindex to keep them out of search results.
 */
export default function SEO({
  title,
  description,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  noindex = false,
  type = 'website',
}) {
  const fullTitle = title ? `${title} | VYBEBOARD` : 'VYBEBOARD — Plan less. Ship more. Stay in the VYBE.';
  const canonical = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="VYBEBOARD" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
