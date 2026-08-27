import { Router } from 'express';
import authRoutes from './authRoutes.js';
import projectRoutes from './projectRoutes.js';
import taskRoutes from './taskRoutes.js';
import commentRoutes from './commentRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import searchRoutes from './searchRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/', taskRoutes); // exposes /tasks/* and /projects/:id/tasks
router.use('/', commentRoutes); // exposes /comments/* and /tasks/:id/comments
router.use('/notifications', notificationRoutes);
router.use('/search', searchRoutes);

export default router;
