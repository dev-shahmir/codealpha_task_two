import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';
import { ok, fail } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getIO } from '../sockets/index.js';

export const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ 'members.user': req.user._id })
    .populate('owner', 'name username avatar')
    .populate('members.user', 'name username avatar')
    .sort({ updatedAt: -1 });

  const withCounts = await Promise.all(
    projects.map(async (p) => {
      const [total, completed] = await Promise.all([
        Task.countDocuments({ project: p._id }),
        Task.countDocuments({ project: p._id, status: 'completed' }),
      ]);
      return {
        ...p.toObject(),
        taskCount: total,
        progress: total ? Math.round((completed / total) * 100) : 0,
      };
    })
  );

  return ok(res, { projects: withCounts });
});

export const createProject = asyncHandler(async (req, res) => {
  let ownerId = req.user._id;
  let adminId = null;

  const { owner: rawOwnerInput, admin: rawAdminInput, ...restBody } = req.body;

  // Case B: If owner is specified and different from creator
  if (rawOwnerInput && rawOwnerInput.toString().trim()) {
    const rawOwner = rawOwnerInput.toString().trim().toLowerCase().replace(/^@/, '');
    
    // Check if the input is not the creator themselves
    const isCreator =
      rawOwner === req.user._id.toString() ||
      rawOwner === req.user.username?.toLowerCase() ||
      rawOwner === req.user.email?.toLowerCase();

    if (!isCreator) {
      const foundOwner = await User.findOne({
        $or: [
          { email: rawOwner },
          { username: rawOwner },
          ...(rawOwner.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: rawOwner }] : []),
        ],
      });
      if (!foundOwner) {
        return fail(res, `No VYBEBOARD user found with email or username "${rawOwnerInput.trim()}"`, 'USER_NOT_FOUND', 404);
      }
      ownerId = foundOwner._id;
    }
  }

  // Case A: If admin is specified
  if (rawAdminInput && rawAdminInput.toString().trim()) {
    const rawAdmin = rawAdminInput.toString().trim().toLowerCase().replace(/^@/, '');
    const foundAdmin = await User.findOne({
      $or: [
        { email: rawAdmin },
        { username: rawAdmin },
        ...(rawAdmin.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: rawAdmin }] : []),
      ],
    });
    if (!foundAdmin) {
      return fail(res, `No VYBEBOARD user found with email or username "${rawAdminInput.trim()}" for admin`, 'USER_NOT_FOUND', 404);
    }
    adminId = foundAdmin._id;
  }

  const members = [{ user: ownerId, role: 'owner' }];

  if (ownerId.toString() !== req.user._id.toString()) {
    // When owner is another user, the creator automatically becomes the Admin!
    members.push({ user: req.user._id, role: 'admin' });
  } else if (adminId && adminId.toString() !== ownerId.toString()) {
    // When creator is owner and specified an admin, add that user as Admin!
    members.push({ user: adminId, role: 'admin' });
  }

  const project = await Project.create({
    ...restBody,
    owner: ownerId,
    members,
  });

  await Activity.create({ project: project._id, actor: req.user._id, type: 'project_created' });

  return ok(res, { project }, 'Project created', 201);
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('owner', 'name username avatar')
    .populate('members.user', 'name username avatar email');

  if (!project) return fail(res, 'Project not found', 'PROJECT_NOT_FOUND', 404);

  const isMember = project.members.some((m) => m.user._id.toString() === req.user._id.toString());
  if (!isMember) return fail(res, 'You do not have access to this project', 'FORBIDDEN', 403);

  return ok(res, { project });
});

export const updateProject = asyncHandler(async (req, res) => {
  Object.assign(req.project, req.body);
  await req.project.save();
  await Activity.create({ project: req.project._id, actor: req.user._id, type: 'project_updated' });
  return ok(res, { project: req.project }, 'Project updated');
});

export const deleteProject = asyncHandler(async (req, res) => {
  if (req.projectRole !== 'owner' && req.projectRole !== 'admin') {
    return fail(res, 'Only the project owner or admin can delete this project', 'FORBIDDEN', 403);
  }
  await Task.deleteMany({ project: req.project._id });
  await req.project.deleteOne();
  return ok(res, null, 'Project deleted');
});

export const archiveProject = asyncHandler(async (req, res) => {
  req.project.status = req.project.status === 'archived' ? 'active' : 'archived';
  await req.project.save();
  return ok(res, { project: req.project }, req.project.status === 'archived' ? 'Project archived' : 'Project restored');
});

export const addMember = asyncHandler(async (req, res) => {
  const { email, username, role = 'member' } = req.body;
  const identifier = (email || username || '').trim().toLowerCase().replace(/^@/, '');
  if (!identifier) return fail(res, 'Please provide an email or username', 'MISSING_IDENTIFIER', 400);

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });
  if (!user) return fail(res, 'No VYBEBOARD account found with that email or username', 'USER_NOT_FOUND', 404);

  const alreadyMember = req.project.members.some((m) => m.user.toString() === user._id.toString());
  if (alreadyMember) return fail(res, 'That person is already on this project', 'ALREADY_MEMBER', 409);

  req.project.members.push({ user: user._id, role });
  await req.project.save();

  await Activity.create({
    project: req.project._id,
    actor: req.user._id,
    type: 'member_added',
    metadata: { addedUser: user._id },
  });

  const notification = await Notification.create({
    recipient: user._id,
    sender: req.user._id,
    type: 'member_added',
    message: `${req.user.name} added you to ${req.project.name}`,
    project: req.project._id,
  });
  await notification.populate('sender', 'name username avatar');
  getIO()?.to(`user:${user._id}`).emit('notification:new', notification);

  return ok(res, { member: { user: user.toPublicJSON(), role, joinedAt: new Date() } }, 'Member added', 201);
});

export const getMembers = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId).populate('members.user', 'name username avatar email');
  if (!project) return fail(res, 'Project not found', 'PROJECT_NOT_FOUND', 404);
  return ok(res, { members: project.members });
});

export const removeMember = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (req.projectRole !== 'admin') {
    return fail(res, 'Only project admins can remove members', 'FORBIDDEN', 403);
  }

  if (userId === req.project.owner.toString()) {
    return fail(res, 'The project owner cannot be removed', 'CANNOT_REMOVE_OWNER', 400);
  }
  req.project.members = req.project.members.filter((m) => m.user.toString() !== userId);
  await req.project.save();
  await Activity.create({ project: req.project._id, actor: req.user._id, type: 'member_removed', metadata: { userId } });
  return ok(res, null, 'Member removed');
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (req.projectRole !== 'admin') {
    return fail(res, 'Only project admins can change member roles', 'FORBIDDEN', 403);
  }

  const membership = req.project.members.find((m) => m.user.toString() === userId);
  if (!membership) return fail(res, 'That person is not on this project', 'NOT_MEMBER', 404);
  if (membership.role === 'owner') return fail(res, 'Owner role cannot be changed', 'FORBIDDEN', 403);

  membership.role = role;
  await req.project.save();
  await Activity.create({
    project: req.project._id,
    actor: req.user._id,
    type: 'member_role_changed',
    metadata: { userId, role },
  });
  return ok(res, { member: membership }, 'Role updated');
});

export const getActivities = asyncHandler(async (req, res) => {
  const activities = await Activity.find({ project: req.params.id })
    .populate('actor', 'name username avatar')
    .populate('task', 'title')
    .sort({ createdAt: -1 })
    .limit(50);

  return ok(res, { activities });
});

export const updateColumns = asyncHandler(async (req, res) => {
  const { columns } = req.body;
  if (!Array.isArray(columns) || !columns.length) {
    return fail(res, 'Columns array cannot be empty', 'INVALID_COLUMNS', 400);
  }

  req.project.columns = columns;
  await req.project.save();

  await Activity.create({
    project: req.project._id,
    actor: req.user._id,
    type: 'project_updated',
    metadata: { columnsUpdated: true },
  });

  return ok(res, { project: req.project }, 'Columns updated');
});

