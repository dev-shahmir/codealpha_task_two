import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Orbit, Sparkles, Layers, HelpCircle, Info, ArrowRight, Sun, Moon, Monitor, LogIn, UserPlus,
} from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const NAV = [
  { label: 'Features', to: '/features', icon: Sparkles, desc: 'Visual Kanban, real-time sync & analytics' },
  { label: 'Solutions', to: '/solutions/startups', icon: Layers, desc: 'For startups, devs, agencies & teams' },
  { label: 'Help Center', to: '/help', icon: HelpCircle, desc: 'Guides, FAQs, and keyboard shortcuts' },
  { label: 'About', to: '/about', icon: Info, desc: 'The VYBEBOARD story & vision' },
];

const SOLUTION_CHIPS = [
  { label: 'Startups', to: '/solutions/startups' },
  { label: 'Developers', to: '/solutions/developers' },
  { label: 'Freelancers', to: '/solutions/freelancers' },
  { label: 'Agencies', to: '/solutions/agencies' },
  { label: 'Remote Teams', to: '/solutions/remote-teams' },
];

export default function PublicHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border-c bg-canvas/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6" aria-label="Primary">
        <Link to="/" className="flex items-center gap-2.5 font-heading text-lg font-bold text-ink">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-soft-violet shadow-soft">
            <Orbit size={18} className="text-brand" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent animate-orbit-pulse" />
          </span>
          VYBEBOARD
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-brand font-semibold' : 'text-ink-secondary hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className="neon-focus rounded-xl border border-border-c bg-surface p-2 text-ink-secondary hover:text-ink transition-colors"
          >
            {isDark ? <Sun size={16} className="text-warning" /> : <Moon size={16} />}
          </button>

          {user ? (
            <Button as={Link} to="/dashboard" size="sm">
              Dashboard <ArrowRight size={14} />
            </Button>
          ) : (
            <>
              <Button as={Link} to="/login" variant="ghost" size="sm">
                Log in
              </Button>
              <Button as={Link} to="/signup" size="sm">
                Start Building Free
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className="neon-focus rounded-xl border border-border-c bg-surface p-2 text-ink-secondary hover:text-ink transition-colors"
          >
            {isDark ? <Sun size={16} className="text-warning" /> : <Moon size={16} />}
          </button>

          <button
            className="neon-focus relative flex h-10 w-10 items-center justify-center rounded-xl border border-border-c bg-surface text-ink transition-all hover:bg-soft-violet"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X size={20} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* Modern Fullscreen Mobile Navigation Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-b border-border-c bg-surface/98 backdrop-blur-2xl md:hidden shadow-2xl"
          >
            <div className="flex max-h-[calc(100vh-60px)] flex-col justify-between overflow-y-auto px-5 py-6">
              <div className="space-y-4">
                {/* Navigation Links with Modern Cards */}
                <div className="grid grid-cols-1 gap-2.5">
                  {NAV.map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="neon-focus group flex items-center justify-between rounded-2xl border border-border-c/70 bg-canvas/60 p-3.5 transition-all active:scale-[0.98] hover:border-brand/40 hover:bg-soft-violet/50"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-brand shadow-soft group-hover:scale-105 transition-transform">
                          <item.icon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink group-hover:text-brand transition-colors">
                            {item.label}
                          </p>
                          <p className="text-xs text-ink-secondary">{item.desc}</p>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-ink-secondary group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))}
                </div>

                {/* Solution Chips */}
                <div className="pt-2">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                    Browse Solutions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SOLUTION_CHIPS.map((chip) => (
                      <Link
                        key={chip.label}
                        to={chip.to}
                        onClick={() => setOpen(false)}
                        className="neon-focus rounded-full border border-border-c bg-surface px-3 py-1.5 text-xs font-medium text-ink-secondary hover:border-brand/40 hover:bg-soft-violet hover:text-brand transition-colors"
                      >
                        {chip.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 border-t border-border-c pt-5">
                {user ? (
                  <Button as={Link} to="/dashboard" onClick={() => setOpen(false)} className="w-full" size="lg">
                    Go to Workspace <ArrowRight size={18} />
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <Button as={Link} to="/signup" onClick={() => setOpen(false)} size="lg" className="w-full">
                      <UserPlus size={18} /> Start Building Free
                    </Button>
                    <Button as={Link} to="/login" onClick={() => setOpen(false)} variant="secondary" size="lg" className="w-full">
                      <LogIn size={18} /> Log in to Account
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
