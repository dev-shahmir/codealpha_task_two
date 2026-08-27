import { Helmet } from 'react-helmet-async';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://vybeboard.app';

function ldJson(obj) {
  return <script type="application/ld+json">{JSON.stringify(obj)}</script>;
}

export function OrganizationSchema() {
  return (
    <Helmet>
      {ldJson({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'VYBEBOARD',
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.svg`,
        description:
          'VYBEBOARD is a modern project management and team collaboration platform that helps startups, developers, freelancers, agencies, and remote teams plan projects, organize tasks, collaborate in real time, and ship work faster.',
      })}
    </Helmet>
  );
}

export function SoftwareApplicationSchema() {
  return (
    <Helmet>
      {ldJson({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'VYBEBOARD',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        brand: { '@type': 'Brand', name: 'VYBEBOARD' },
        description:
          'A collaborative project management platform combining Kanban boards, task assignments, checklists, comments, notifications, project analytics, and real-time collaboration in one focused workspace.',
      })}
    </Helmet>
  );
}

export function WebSiteSchema() {
  return (
    <Helmet>
      {ldJson({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'VYBEBOARD',
        url: SITE_URL,
      })}
    </Helmet>
  );
}

export function FAQSchema({ faqs }) {
  if (!faqs?.length) return null;
  return (
    <Helmet>
      {ldJson({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      })}
    </Helmet>
  );
}

export function BreadcrumbSchema({ items }) {
  if (!items?.length) return null;
  return (
    <Helmet>
      {ldJson({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: item.name,
          item: `${SITE_URL}${item.path}`,
        })),
      })}
    </Helmet>
  );
}
