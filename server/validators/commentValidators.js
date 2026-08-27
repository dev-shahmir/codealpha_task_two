import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, 'Comment cannot be empty').max(2000),
  mentions: z.array(z.string()).optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().trim().min(1, 'Comment cannot be empty').max(2000),
});
