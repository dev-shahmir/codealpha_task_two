import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  BarChart3,
  Bell,
  Users,
  Settings,
  HelpCircle,
  Orbit,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

const PRIMARY = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'My Tasks', to: '/tasks', icon: CheckSquare },
  { label: 'Projects', to: '/projects', icon: FolderKanban },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
];

const SECONDARY = [
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Team', to: '/team', icon: Users },
];

const TERTIARY = [
  { label: 'Settings', to: '/settings', icon: Settings },
  { label: 'Help', to: '/help', icon: HelpCircle },
];

function NavItem({ item, collapsed }) {
  return (
    <NavLink
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `neon-focus flex items-center rounded-xl py-2 text-sm font-medium transition-colors ${
          collapsed ? 'justify-center px-2' : 'gap-3 px-3'
        } ${
          isActive
            ? 'bg-soft-violet text-brand'
            : 'text-ink-secondary hover:bg-soft-violet/60 hover:text-ink'
        }`
      }
    >
      <item.icon size={18} className="shrink-0" />
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            key="label"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const CollapseIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="hidden h-full shrink-0 flex-col border-r border-border-c bg-surface md:flex"
      style={{ minWidth: collapsed ? 64 : 256 }}
    >
      <div className={`flex h-full flex-col gap-1 ${collapsed ? 'p-2' : 'p-3'}`}>
        {/* Logo */}
        <div
          className={`mb-4 flex items-center font-heading text-lg font-bold ${
            collapsed ? 'justify-center px-1' : 'gap-2 px-1'
          }`}
        >
          <Orbit size={20} className="shrink-0 text-brand" />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key="wordmark"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden whitespace-nowrap"
              >
                VYBEBOARD
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Primary nav */}
        <nav className="flex flex-col gap-0.5">
          {PRIMARY.map((item) => (
            <NavItem key={item.to} item={item} collapsed={collapsed} />
          ))}
        </nav>

        <div className="my-1 border-t border-border-c" />

        <nav className="flex flex-col gap-0.5">
          {SECONDARY.map((item) => (
            <NavItem key={item.to} item={item} collapsed={collapsed} />
          ))}
        </nav>

        <div className="my-1 border-t border-border-c" />

        <nav className="flex flex-col gap-0.5">
          {TERTIARY.map((item) => (
            <NavItem key={item.to} item={item} collapsed={collapsed} />
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : undefined}
          className={`neon-focus flex w-full items-center rounded-xl py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-soft-violet/60 hover:text-ink ${
            collapsed ? 'justify-center px-2' : 'gap-3 px-3'
          }`}
        >
          <CollapseIcon size={18} className="shrink-0" />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key="collapse-label"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden whitespace-nowrap"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* User Card & Logout (visible in both expanded & collapsed modes) */}
        {collapsed ? (
          <div className="mt-1 flex flex-col items-center gap-1 rounded-xl border border-border-c p-1.5">
            <div title={`${user?.name} (@${user?.username})`} className="p-0.5">
              <Avatar name={user?.name} src={user?.avatar} size={28} />
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              aria-label="Log out"
              className="neon-focus flex w-full items-center justify-center rounded-lg p-1.5 text-ink-secondary transition-colors hover:bg-danger/10 hover:text-danger"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="mt-1 flex items-center gap-2 rounded-xl border border-border-c p-2">
            <Avatar name={user?.name} src={user?.avatar} size={32} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
              <p className="truncate text-xs text-ink-secondary">@{user?.username}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              aria-label="Log out"
              className="neon-focus shrink-0 rounded-lg p-1.5 text-ink-secondary transition-colors hover:bg-danger/10 hover:text-danger"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
