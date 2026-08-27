import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../lib/socket';

/**
 * Subscribes to real-time task events for a project room.
 * Updates the React Query cache synchronously & instantly (0ms lag)
 * without waiting for full HTTP network round-trips.
 */
export function useSocketBoard(projectId) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!projectId) return;

    const socket = getSocket();
    if (!socket) return;

    // Join the project room immediately
    socket.emit('project:join', projectId);

    const onCreated = (task) => {
      if (!task?._id) return;
      // Instant cache insertion for zero latency
      qc.setQueriesData({ queryKey: ['tasks', projectId] }, (old = []) => {
        if (!Array.isArray(old)) return [task];
        if (old.some((t) => t._id === task._id)) {
          return old.map((t) => (t._id === task._id ? { ...t, ...task } : t));
        }
        return [...old, task];
      });
      qc.invalidateQueries({ queryKey: ['my-tasks'] });
    };

    const onUpdated = (task) => {
      if (!task?._id) return;
      // Instant cache replacement for zero latency
      qc.setQueriesData({ queryKey: ['tasks', projectId] }, (old = []) => {
        if (!Array.isArray(old)) return old;
        return old.map((t) => (t._id === task._id ? { ...t, ...task } : t));
      });
      qc.setQueryData(['task', task._id], (old) => (old ? { ...old, ...task } : task));
      qc.invalidateQueries({ queryKey: ['my-tasks'] });
    };

    const onMoved = (task) => {
      if (!task?._id) return;
      // Instant cache column & position update
      qc.setQueriesData({ queryKey: ['tasks', projectId] }, (old = []) => {
        if (!Array.isArray(old)) return old;
        return old.map((t) =>
          t._id === task._id
            ? { ...t, column: task.column, position: task.position, status: task.status || t.status }
            : t
        );
      });
      qc.invalidateQueries({ queryKey: ['my-tasks'] });
    };

    const onDeleted = ({ id }) => {
      if (!id) return;
      // Instant cache removal
      qc.setQueriesData({ queryKey: ['tasks', projectId] }, (old = []) => {
        if (!Array.isArray(old)) return old;
        return old.filter((t) => t._id !== id);
      });
      qc.removeQueries({ queryKey: ['task', id] });
      qc.invalidateQueries({ queryKey: ['my-tasks'] });
    };

    const onComment = ({ taskId, comment }) => {
      if (taskId && comment) {
        qc.setQueryData(['comments', taskId], (old = []) => {
          if (!Array.isArray(old)) return [comment];
          if (old.some((c) => c._id === comment._id)) return old;
          return [...old, comment];
        });
      }
      if (taskId) {
        qc.invalidateQueries({ queryKey: ['comments', taskId] });
      }
    };

    socket.on('task:created', onCreated);
    socket.on('task:updated', onUpdated);
    socket.on('task:moved', onMoved);
    socket.on('task:deleted', onDeleted);
    socket.on('comment:new', onComment);

    return () => {
      socket.emit('project:leave', projectId);
      socket.off('task:created', onCreated);
      socket.off('task:updated', onUpdated);
      socket.off('task:moved', onMoved);
      socket.off('task:deleted', onDeleted);
      socket.off('comment:new', onComment);
    };
  }, [projectId, qc]);
}
