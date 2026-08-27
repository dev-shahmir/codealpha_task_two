import { Router } from 'express';
import * as commentController from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createCommentSchema, updateCommentSchema } from '../validators/commentValidators.js';

const router = Router();

router.use(protect);

router.get('/tasks/:taskId/comments', commentController.getComments);
router.post('/tasks/:taskId/comments', validate(createCommentSchema), commentController.createComment);
router.put('/comments/:id', validate(updateCommentSchema), commentController.updateComment);
router.delete('/comments/:id', commentController.deleteComment);

export default router;
