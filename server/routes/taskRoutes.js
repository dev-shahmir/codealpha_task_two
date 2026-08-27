import { Router } from 'express';
import * as taskController from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTaskSchema, updateTaskSchema, moveTaskSchema } from '../validators/taskValidators.js';

const router = Router();

router.use(protect);

router.get('/projects/:projectId/tasks', taskController.getTasks);
router.post('/projects/:projectId/tasks', validate(createTaskSchema), taskController.createTask);
router.get('/tasks/:id', taskController.getTask);
router.put('/tasks/:id', validate(updateTaskSchema), taskController.updateTask);
router.delete('/tasks/:id', taskController.deleteTask);
router.patch('/tasks/:id/move', validate(moveTaskSchema), taskController.moveTask);

export default router;
