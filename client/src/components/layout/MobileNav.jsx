import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Bell,
  Menu,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  X,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../ui/Avatar';

const PRIMARY_ITEMS = [
  { label: 'Home', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Tasks', to: '/tasks', icon: CheckSquare },
  { label: 'Projects', to: '/projects', icon: FolderKanban },
  { label: 'Alerts', to: '/notifications', icon: Bell },
];

const MORE_LINKS = [
  { label: 'Analytics', to: '/analytics', icon: BarChart3, desc: 'Project completion & workload insights' },
  { label: 'Team', to: '/team', icon: Users, desc: 'Manage workspaces and project members' },
  { label: 'Settings', to: '/settings', icon: Settings, desc: 'Profile, security, and notification prefs' },
  { label: 'Help & Shortcuts', to: '/help', icon: HelpCircle, desc: 'Documentation, guides, and FAQs' },
];

export default function MobileNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Close drawer on navigation
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <>
      {/* Bottom Floating Navigation Bar */}
      <nav
        className="fixed bottom-3 left-3 right-3 z-40 flex items-center justify-around rounded-2xl border border-border-c/80 bg-surface/90 px-2 py-1.5 shadow-xl backdrop-blur-xl md:hidden"
        aria-label="Mobile navigation"
      >
        {PRIMARY_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 rounded-xl px-3.5 py-1.5 text-[11px] font-medium transition-all ${
                isActive ? 'text-brand' : 'text-ink-secondary hover:text-ink'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? 'scale-110 transition-transform' : ''} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="mobileNavPill"
                    className="absolute -bottom-1 h-1 w-5 rounded-full bg-brand"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* More Menu Drawer Trigger */}
        <button
          onClick={() => setDrawerOpen(true)}
          className={`flex flex-col items-center gap-0.5 rounded-xl px-3.5 py-1.5 text-[11px] font-medium transition-colors ${
            drawerOpen ? 'text-brand' : 'text-ink-secondary hover:text-ink'
          }`}
          aria-label="Open more menu"
        >
          <Menu size={20} />
          <span>More</span>
        </button>
      </nav>

      {/* Slide-Up Bottom Sheet Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-ink/50 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Bottom Sheet Card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-border-c bg-surface p-5 shadow-2xl"
            >
              {/* Drag Handle */}
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border-c" />

              {/* Drawer Header with User Profile */}
              <div className="mb-5 flex items-center justify-between border-b border-border-c pb-4">
                <div className="flex items-center gap-3">
                  <Avatar name={user?.name} src={user?.avatar} size={42} />
                  <div>
                    <p className="font-heading text-sm font-bold text-ink">{user?.name}</p>
                    <p className="text-xs text-ink-secondary">@{user?.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleTheme}
                    className="neon-focus flex items-center gap-1.5 rounded-xl border border-border-c bg-canvas px-3 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink transition-colors"
                    aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                  >
                    {isDark ? <Sun size={14} className="text-warning" /> : <Moon size={14} />}
                    <span className="capitalize">{isDark ? 'Dark' : 'Light'}</span>
                  </button>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="neon-focus rounded-xl p-1.5 text-ink-secondary hover:bg-soft-violet"
                    aria-label="Close menu"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-2">
                <p className="px-1 text-xs font-semibold uppercase tracking-wider text-ink-secondary">Workspace</p>
                {MORE_LINKS.map((link) => (
                  <button
                    key={link.to}
                    onClick={() => {
                      navigate(link.to);
                      setDrawerOpen(false);
                    }}
                    className="neon-focus flex w-full items-center justify-between rounded-2xl border border-border-c/70 bg-canvas/50 p-3 text-left transition-all active:scale-[0.98] hover:border-brand/40 hover:bg-soft-violet"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-brand shadow-soft">
                        <link.icon size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink">{link.label}</p>
                        <p className="text-xs text-ink-secondary">{link.desc}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-ink-secondary" />
                  </button>
                ))}
              </div>

              {/* Logout Action */}
              <div className="mt-5 border-t border-border-c pt-4">
                <button
                  onClick={async () => {
                    await logout();
                    setDrawerOpen(false);
                    navigate('/');
                  }}
                  className="neon-focus flex w-full items-center justify-center gap-2 rounded-xl border border-danger/20 bg-danger/10 py-3 text-sm font-semibold text-danger transition-colors hover:bg-danger hover:text-white"
                >
                  <LogOut size={16} /> Sign out of VYBEBOARD
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
