import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, 'Project name is required').max(100),
  description: z.string().max(500).optional(),
  visibility: z.enum(['private', 'team']).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  workspace: z.string().optional(),
  owner: z.string().optional(),
  admin: z.string().optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  status: z.enum(['active', 'archived', 'completed']).optional(),
});

export const addMemberSchema = z.object({
  email: z.string().trim().toLowerCase().optional(),
  username: z.string().trim().toLowerCase().optional(),
  role: z.enum(['admin', 'member', 'viewer']).optional(),
}).refine((data) => data.email || data.username, {
  message: 'Please provide either an email or username',
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['owner', 'admin', 'member', 'viewer']),
});
