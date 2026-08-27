import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export function useComments(taskId) {
  return useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => apiClient.get(`/tasks/${taskId}/comments`).then((r) => r.data.comments),
    enabled: !!taskId,
  });
}

export function useCreateComment(taskId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => apiClient.post(`/tasks/${taskId}/comments`, payload).then((r) => r.data.comment),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', taskId] }),
  });
}

export function useDeleteComment(taskId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.delete(`/comments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', taskId] }),
  });
}
