import { Router } from 'express';
import * as projectController from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loadProjectAndAuthorize } from '../middleware/authorizeProjectRole.js';
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  updateMemberRoleSchema,
} from '../validators/projectValidators.js';

const router = Router();

router.use(protect);

router.get('/', projectController.getProjects);
router.post('/', validate(createProjectSchema), projectController.createProject);
router.get('/:id', projectController.getProject);
router.put('/:id', loadProjectAndAuthorize('admin'), validate(updateProjectSchema), projectController.updateProject);
router.delete('/:id', loadProjectAndAuthorize('admin'), projectController.deleteProject);
router.patch('/:id/archive', loadProjectAndAuthorize('admin'), projectController.archiveProject);

router.get('/:id/activities', loadProjectAndAuthorize('viewer'), projectController.getActivities);
router.patch('/:id/columns', loadProjectAndAuthorize('admin'), projectController.updateColumns);

router.get('/:projectId/members', projectController.getMembers);
router.post('/:projectId/members', loadProjectAndAuthorize('admin'), validate(addMemberSchema), projectController.addMember);
router.delete('/:projectId/members/:userId', loadProjectAndAuthorize('admin'), projectController.removeMember);
router.patch('/:projectId/members/:userId/role', loadProjectAndAuthorize('admin'), validate(updateMemberRoleSchema), projectController.updateMemberRole);

export default router;
