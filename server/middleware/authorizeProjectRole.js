import Project from '../models/Project.js';
import { fail } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const ROLE_RANK = { viewer: 0, member: 1, admin: 2, owner: 3 };

export const loadProjectAndAuthorize = (minRole = 'viewer') =>
  asyncHandler(async (req, res, next) => {
    const projectId = req.params.projectId || req.params.id;
    const project = await Project.findById(projectId);
    if (!project) return fail(res, 'Project not found', 'PROJECT_NOT_FOUND', 404);

    const membership = project.members.find((m) => m.user.toString() === req.user.id.toString());
    if (!membership) return fail(res, 'You do not have access to this project', 'FORBIDDEN', 403);

    if (ROLE_RANK[membership.role] < ROLE_RANK[minRole]) {
      return fail(res, 'Your role does not allow this action', 'FORBIDDEN', 403);
    }

    req.project = project;
    req.projectRole = membership.role;
    next();
  });
