import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export function useTasks(projectId, filters = {}) {
  const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();
  return useQuery({
    queryKey: ['tasks', projectId, filters],
    queryFn: () =>
      apiClient
        .get(`/projects/${projectId}/tasks${params ? `?${params}` : ''}`)
        .then((r) => r.data?.tasks || r.tasks || r.data || []),
    enabled: !!projectId,
  });
}

export function useTask(taskId) {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: () =>
      apiClient.get(`/tasks/${taskId}`).then((r) => r.data?.task || r.task || r.data),
    enabled: !!taskId,
  });
}

export function useCreateTask(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => apiClient.post(`/projects/${projectId}/tasks`, payload).then((r) => r.data.task),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });
}

export function useUpdateTask(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => apiClient.put(`/tasks/${id}`, payload).then((r) => r.data.task),
    onMutate: async ({ id, ...payload }) => {
      await qc.cancelQueries({ queryKey: ['tasks', projectId] });
      await qc.cancelQueries({ queryKey: ['task', id] });

      const prevTasks = qc.getQueryData(['tasks', projectId]);

      qc.setQueriesData({ queryKey: ['tasks', projectId] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((t) => (t._id === id ? { ...t, ...payload } : t));
      });

      qc.setQueryData(['task', id], (old) => (old ? { ...old, ...payload } : old));

      return { prevTasks };
    },
    onError: (err, vars, context) => {
      if (context?.prevTasks) {
        qc.setQueriesData({ queryKey: ['tasks', projectId] }, context.prevTasks);
      }
    },
    onSettled: (task) => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] });
      if (task?._id) qc.invalidateQueries({ queryKey: ['task', task._id] });
    },
  });
}

export function useMoveTask(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, column, position }) => apiClient.patch(`/tasks/${id}/move`, { column, position }).then((r) => r.data.task),
    // Optimistic update so drag-and-drop feels instant
    onMutate: async ({ id, column, position }) => {
      await qc.cancelQueries({ queryKey: ['tasks', projectId] });
      const previous = qc.getQueriesData({ queryKey: ['tasks', projectId] });
      qc.setQueriesData({ queryKey: ['tasks', projectId] }, (old) =>
        Array.isArray(old) ? old.map((t) => (t._id === id ? { ...t, column, position } : t)) : old
      );
      return { previous };
    },
    onError: (err, vars, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => qc.setQueryData(key, data));
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });
}

export function useDeleteTask(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.delete(`/tasks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });
}
