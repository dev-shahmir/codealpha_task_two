import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';
import { ok, fail } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getIO } from '../sockets/index.js';

async function assertMember(projectId, userId) {
  const project = await Project.findById(projectId);
  if (!project) return null;
  const membership = project.members.find((m) => m.user.toString() === userId.toString());
  return membership ? { project, membership } : null;
}

export const getTasks = asyncHandler(async (req, res) => {
  const result = await assertMember(req.params.projectId, req.user._id);
  if (!result) return fail(res, 'You do not have access to this project', 'FORBIDDEN', 403);
  const { project } = result;

  const { assignee, priority, label, status, search } = req.query;
  const filter = { project: project._id };
  if (assignee) filter.assignee = assignee;
  if (priority) filter.priority = priority;
  if (label) filter.labels = label;
  if (status) filter.status = status;
  if (search) filter.$text = { $search: search };

  const tasks = await Task.find(filter)
    .populate('assignee', 'name username avatar')
    .populate('creator', 'name username avatar')
    .sort({ column: 1, position: 1 });

  return ok(res, { tasks });
});

export const createTask = asyncHandler(async (req, res) => {
  const result = await assertMember(req.params.projectId, req.user._id);
  if (!result) return fail(res, 'You do not have access to this project', 'FORBIDDEN', 403);
  const { project, membership } = result;

  if (membership.role !== 'admin') {
    return fail(res, 'Only project admins can create tasks in this project', 'FORBIDDEN', 403);
  }

  const column = req.body.column || project.columns[0]?.id || 'backlog';
  const lastTask = await Task.findOne({ project: project._id, column }).sort({ position: -1 });
  const position = lastTask ? lastTask.position + 1 : 0;

  const task = await Task.create({
    ...req.body,
    assignee: req.body.assignee || req.user._id,
    column,
    position,
    project: project._id,
    creator: req.user._id,
  });

  await task.populate('assignee', 'name username avatar');
  await Activity.create({ project: project._id, task: task._id, actor: req.user._id, type: 'task_created' });

  if (task.assignee && task.assignee._id.toString() !== req.user._id.toString()) {
    const notification = await Notification.create({
      recipient: task.assignee._id,
      sender: req.user._id,
      type: 'task_assigned',
      message: `${req.user.name} assigned you "${task.title}"`,
      project: project._id,
      task: task._id,
    });
    await notification.populate('sender', 'name username avatar');
    getIO()?.to(`user:${task.assignee._id}`).emit('notification:new', notification);
  }

  // Also notify project owner if different from creator
  if (project.owner && project.owner.toString() !== req.user._id.toString() && (!task.assignee || project.owner.toString() !== task.assignee._id.toString())) {
    const ownerNotif = await Notification.create({
      recipient: project.owner,
      sender: req.user._id,
      type: 'task_created',
      message: `${req.user.name} added task "${task.title}" in ${project.name}`,
      project: project._id,
      task: task._id,
    });
    await ownerNotif.populate('sender', 'name username avatar');
    getIO()?.to(`user:${project.owner}`).emit('notification:new', ownerNotif);
  }

  getIO()?.to(`project:${project._id}`).emit('task:created', task);

  return ok(res, { task }, 'Task created', 201);
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignee', 'name username avatar')
    .populate('creator', 'name username avatar');
  if (!task) return fail(res, 'Task not found', 'TASK_NOT_FOUND', 404);

  const result = await assertMember(task.project, req.user._id);
  if (!result) return fail(res, 'You do not have access to this task', 'FORBIDDEN', 403);

  return ok(res, { task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return fail(res, 'Task not found', 'TASK_NOT_FOUND', 404);

  const result = await assertMember(task.project, req.user._id);
  if (!result) return fail(res, 'You do not have access to this task', 'FORBIDDEN', 403);
  const { project } = result;

  const previousAssignee = task.assignee?.toString();
  const previousPriority = task.priority;

  Object.assign(task, req.body);

  if (req.body.checklist) {
    const allDone = req.body.checklist.length > 0 && req.body.checklist.every((i) => i.done);
    if (allDone) {
      await Activity.create({ project: project._id, task: task._id, actor: req.user._id, type: 'checklist_updated', metadata: { completed: true } });
    }
  }

  await task.save();
  await task.populate('assignee', 'name username avatar');

  if (req.body.assignee && req.body.assignee !== previousAssignee && req.body.assignee.toString() !== req.user._id.toString()) {
    const notification = await Notification.create({
      recipient: req.body.assignee,
      sender: req.user._id,
      type: 'task_assigned',
      message: `${req.user.name} assigned you "${task.title}"`,
      project: project._id,
      task: task._id,
    });
    await notification.populate('sender', 'name username avatar');
    getIO()?.to(`user:${req.body.assignee}`).emit('notification:new', notification);
  }

  if (req.body.priority && req.body.priority !== previousPriority) {
    await Activity.create({ project: project._id, task: task._id, actor: req.user._id, type: 'priority_changed', metadata: { from: previousPriority, to: req.body.priority } });
  }

  await Activity.create({ project: project._id, task: task._id, actor: req.user._id, type: 'task_updated' });
  getIO()?.to(`project:${project._id}`).emit('task:updated', task);

  return ok(res, { task }, 'Task updated');
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return fail(res, 'Task not found', 'TASK_NOT_FOUND', 404);

  const result = await assertMember(task.project, req.user._id);
  if (!result) return fail(res, 'You do not have access to this task', 'FORBIDDEN', 403);
  const { project, membership } = result;

  if (membership.role !== 'admin') {
    return fail(res, 'Only project admins can delete tasks', 'FORBIDDEN', 403);
  }

  await task.deleteOne();
  await Activity.create({ project: project._id, actor: req.user._id, type: 'task_deleted', metadata: { taskId: task._id, title: task.title } });
  getIO()?.to(`project:${project._id}`).emit('task:deleted', { id: task._id });

  return ok(res, null, 'Task deleted');
});

export const moveTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return fail(res, 'Task not found', 'TASK_NOT_FOUND', 404);

  const result = await assertMember(task.project, req.user._id);
  if (!result) return fail(res, 'You do not have access to this task', 'FORBIDDEN', 403);
  const { project } = result;

  const { column, position } = req.body;
  const fromColumn = task.column;

  // Shift positions of tasks in destination column to make room (simple + correct for MVP scale)
  await Task.updateMany(
    { project: project._id, column, position: { $gte: position }, _id: { $ne: task._id } },
    { $inc: { position: 1 } }
  );

  task.column = column;
  task.position = position;
  if (column === 'done') task.status = 'completed';
  else if (task.status === 'completed') task.status = 'open';
  await task.save();

  if (fromColumn !== column) {
    await Activity.create({
      project: project._id,
      task: task._id,
      actor: req.user._id,
      type: 'task_moved',
      metadata: { from: fromColumn, to: column },
    });
  }

  await task.populate('assignee', 'name username avatar');
  getIO()?.to(`project:${project._id}`).emit('task:moved', task);

  return ok(res, { task }, 'Task moved');
});
