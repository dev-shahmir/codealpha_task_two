import { Link } from 'react-router-dom';
import { Search, Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useSocketNotifications } from '../../hooks/useSocketNotifications';

export default function Topbar({ title, onOpenSearch }) {
  const { isDark, toggleTheme } = useTheme();

  // Live notification badge
  useSocketNotifications();
  const { data } = useNotifications();
  const unread = data?.unreadCount || 0;

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border-c bg-canvas/90 px-4 py-3 backdrop-blur sm:px-6">
      <h1 className="font-heading text-lg font-semibold sm:text-xl">{title}</h1>
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          onClick={onOpenSearch}
          className="neon-focus flex items-center gap-2 rounded-xl border border-border-c bg-surface px-3 py-1.5 text-sm text-ink-secondary hover:text-ink"
          aria-label="Open search (Ctrl+K)"
        >
          <Search size={16} />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden rounded border border-border-c bg-canvas px-1.5 py-0.5 text-[10px] sm:inline">Ctrl K</kbd>
        </button>

        {/* Live notification bell */}
        <Link
          to="/notifications"
          aria-label={`Notifications${unread > 0 ? ` — ${unread} unread` : ''}`}
          className="neon-focus relative rounded-xl border border-border-c bg-surface p-2 text-ink-secondary transition-colors hover:text-ink"
        >
          <Bell size={16} />
          {unread > 0 && (
            <span
              aria-hidden="true"
              className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-white"
            >
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </Link>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          className="neon-focus rounded-xl border border-border-c bg-surface p-2 text-ink-secondary transition-colors hover:text-ink"
        >
          {isDark ? <Sun size={16} className="text-warning" /> : <Moon size={16} />}
        </button>
      </div>
    </div>
  );
}
