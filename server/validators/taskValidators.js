import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Task title is required').max(150),
  description: z.string().max(5000).optional(),
  column: z.string().optional(),
  assignee: z.string().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  labels: z.array(z.string()).optional(),
  dueDate: z.string().nullable().optional(),
  checklist: z
    .array(z.object({ text: z.string().min(1).max(200), done: z.boolean().optional() }))
    .optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.enum(['open', 'completed']).optional(),
  checklist: z
    .array(z.object({ text: z.string().min(1).max(200), done: z.boolean().optional() }))
    .optional(),
});

export const moveTaskSchema = z.object({
  column: z.string().min(1, 'Target column is required'),
  position: z.number().min(0),
});
