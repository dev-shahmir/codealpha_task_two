import { Link } from 'react-router-dom';
import { Orbit } from 'lucide-react';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', to: '/features' },
      { label: 'Solutions', to: '/solutions/startups' },
      { label: 'Sign up', to: '/signup' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Startups', to: '/solutions/startups' },
      { label: 'Developers', to: '/solutions/developers' },
      { label: 'Freelancers', to: '/solutions/freelancers' },
      { label: 'Agencies', to: '/solutions/agencies' },
      { label: 'Remote Teams', to: '/solutions/remote-teams' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Help Center', to: '/help' },
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', to: '/privacy' },
      { label: 'Terms', to: '/terms' },
    ],
  },
];

export default function PublicFooter() {
  return (
    <footer className="border-t border-border-c bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 font-heading text-lg font-bold text-ink">
              <Orbit size={20} className="text-brand" /> VYBEBOARD
            </Link>
            <p className="mt-3 max-w-xs text-sm text-ink-secondary">
              VYBEBOARD is a modern project management and team collaboration platform that helps startups, developers,
              freelancers, agencies, and remote teams plan projects and ship work faster.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 text-sm font-semibold text-ink">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-ink-secondary hover:text-brand">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border-c pt-6 text-xs text-ink-secondary sm:flex-row">
          <p>&copy; {new Date().getFullYear()} VYBEBOARD. All rights reserved.</p>
          <p>Plan less. Ship more. Stay in the VYBE.</p>
        </div>
      </div>
    </footer>
  );
}
