import { Link } from 'react-router-dom';
import { Orbit } from 'lucide-react';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2 font-heading text-lg font-bold">
          <Orbit size={22} className="text-brand" /> VYBEBOARD
        </Link>
        <div className="rounded-card border border-border-c bg-surface p-6 shadow-soft sm:p-8">
          <h1 className="font-heading text-2xl font-bold text-ink">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-ink-secondary">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
