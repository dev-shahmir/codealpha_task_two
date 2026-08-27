import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.get('/projects').then((r) => r.data?.projects || r.projects || []),
  });
}

export function useProject(id) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => apiClient.get(`/projects/${id}`).then((r) => r.data?.project || r.project),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => apiClient.post('/projects', payload).then((r) => r.data?.project || r.project),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useUpdateProject(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => apiClient.put(`/projects/${id}`, payload).then((r) => r.data?.project || r.project),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['project', id] });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.delete(`/projects/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useAddMember(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => apiClient.post(`/projects/${projectId}/members`, payload).then((r) => r.data?.member || r.member),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', projectId] });
      qc.invalidateQueries({ queryKey: ['members', projectId] });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useRemoveMember(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId) => apiClient.delete(`/projects/${projectId}/members/${userId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', projectId] });
      qc.invalidateQueries({ queryKey: ['members', projectId] });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateMemberRole(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }) =>
      apiClient.patch(`/projects/${projectId}/members/${userId}/role`, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', projectId] });
      qc.invalidateQueries({ queryKey: ['members', projectId] });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
