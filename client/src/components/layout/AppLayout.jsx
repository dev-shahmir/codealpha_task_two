import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Topbar from './Topbar';
import CommandPalette from '../CommandPalette';

import { motion } from 'framer-motion';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/tasks': 'My Tasks',
  '/projects': 'Projects',
  '/analytics': 'Analytics',
  '/notifications': 'Notifications',
  '/team': 'Team',
  '/settings': 'Settings',
};

export default function AppLayout() {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const title = TITLES[location.pathname] || 'VYBEBOARD';

  return (
    <div className="flex min-h-screen md:h-screen md:overflow-hidden bg-canvas">
      <Sidebar />

      {/* Right column: topbar + scrollable content area */}
      <div className="flex min-h-screen md:min-h-0 md:h-full min-w-0 flex-1 flex-col pb-20 md:pb-0">
        <Topbar title={title} onOpenSearch={() => setSearchOpen(true)} />

        {/* Content area — scrolls vertically for normal pages, board manages its own scroll */}
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-6"
        >
          <Outlet />
        </motion.main>
      </div>

      <MobileNav />
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
