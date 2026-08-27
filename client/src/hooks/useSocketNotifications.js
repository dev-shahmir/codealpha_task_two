import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../lib/socket';

/**
 * Listens for `notification:new` from the user's private room
 * and immediately prepends it to the notifications cache,
 * so the bell badge and notification list update with 0ms delay.
 *
 * Handles the race where socket is still connecting when this hook mounts.
 */
export function useSocketNotifications() {
  const qc = useQueryClient();

  useEffect(() => {
    const onNew = (notification) => {
      // Optimistic insert into existing cache
      qc.setQueryData(['notifications'], (old) => {
        if (!old) return old;
        const list = old.notifications || [];
        // Deduplicate by _id
        if (list.some((n) => n._id === notification._id)) return old;
        const notifications = [notification, ...list];
        const unreadCount = (old.unreadCount || 0) + (notification.read ? 0 : 1);
        return { ...old, notifications, unreadCount };
      });
      // Also refetch to ensure server truth (covers stale cases)
      qc.invalidateQueries({ queryKey: ['notifications'] });
    };

    const attach = () => {
      const socket = getSocket();
      if (!socket) return false;
      // Detach first to avoid double-listeners on reconnect
      socket.off('notification:new', onNew);
      socket.on('notification:new', onNew);
      return true;
    };

    // Try immediately — socket may already be connected
    attach();

    // Also reattach when socket (re)connects in case it wasn't ready yet
    const onConnect = () => attach();
    const scheduleAttach = () => {
      const socket = getSocket();
      if (socket) {
        socket.off('connect', onConnect);
        socket.on('connect', onConnect);
      }
    };
    scheduleAttach();

    // Poll briefly to wait for getSocket() to be truthy on first mount
    const timer = setInterval(() => {
      const socket = getSocket();
      if (socket) {
        clearInterval(timer);
        socket.off('notification:new', onNew);
        socket.on('notification:new', onNew);
        socket.off('connect', onConnect);
        socket.on('connect', onConnect);
      }
    }, 300);

    return () => {
      clearInterval(timer);
      const socket = getSocket();
      socket?.off('notification:new', onNew);
      socket?.off('connect', onConnect);
    };
  }, [qc]);
}
