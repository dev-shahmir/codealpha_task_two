import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';
import { ok, fail } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getIO } from '../sockets/index.js';

async function loadTaskWithAccess(taskId, userId) {
  const task = await Task.findById(taskId);
  if (!task) return { task: null, project: null };
  const project = await Project.findById(task.project);
  const isMember = project?.members.some((m) => m.user.toString() === userId.toString());
  return { task, project: isMember ? project : null };
}

export const getComments = asyncHandler(async (req, res) => {
  const { task, project } = await loadTaskWithAccess(req.params.taskId, req.user._id);
  if (!task) return fail(res, 'Task not found', 'TASK_NOT_FOUND', 404);
  if (!project) return fail(res, 'You do not have access to this task', 'FORBIDDEN', 403);

  const comments = await Comment.find({ task: task._id }).populate('author', 'name username avatar').sort({ createdAt: 1 });
  return ok(res, { comments });
});

export const createComment = asyncHandler(async (req, res) => {
  const { task, project } = await loadTaskWithAccess(req.params.taskId, req.user._id);
  if (!task) return fail(res, 'Task not found', 'TASK_NOT_FOUND', 404);
  if (!project) return fail(res, 'You do not have access to this task', 'FORBIDDEN', 403);

  const comment = await Comment.create({
    task: task._id,
    author: req.user._id,
    content: req.body.content,
    mentions: req.body.mentions || [],
  });
  await comment.populate('author', 'name username avatar');

  await Activity.create({ project: project._id, task: task._id, actor: req.user._id, type: 'comment_added' });

  const notifyTargets = new Set((req.body.mentions || []).map(String));

  // 1. Notify task assignee
  if (task.assignee && task.assignee.toString() !== req.user._id.toString()) {
    notifyTargets.add(task.assignee.toString());
  }

  // 2. Notify project owner
  if (project.owner && project.owner.toString() !== req.user._id.toString()) {
    notifyTargets.add(project.owner.toString());
  }

  // 3. Notify task creator
  if (task.creator && task.creator.toString() !== req.user._id.toString()) {
    notifyTargets.add(task.creator.toString());
  }

  // Exclude comment author
  notifyTargets.delete(req.user._id.toString());

  for (const recipientId of notifyTargets) {
    const isMention = (req.body.mentions || []).map(String).includes(recipientId);
    const notification = await Notification.create({
      recipient: recipientId,
      sender: req.user._id,
      type: isMention ? 'mention' : 'comment',
      message: isMention
        ? `${req.user.name} mentioned you on "${task.title}"`
        : `${req.user.name} commented on "${task.title}"`,
      project: project._id,
      task: task._id,
    });
    await notification.populate('sender', 'name username avatar');
    getIO()?.to(`user:${recipientId}`).emit('notification:new', notification);
  }

  getIO()?.to(`project:${project._id}`).emit('comment:new', { taskId: task._id, comment });

  return ok(res, { comment }, 'Comment added', 201);
});

export const updateComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return fail(res, 'Comment not found', 'COMMENT_NOT_FOUND', 404);
  if (comment.author.toString() !== req.user._id.toString()) {
    return fail(res, 'You can only edit your own comments', 'FORBIDDEN', 403);
  }

  comment.content = req.body.content;
  await comment.save();
  await comment.populate('author', 'name username avatar');

  return ok(res, { comment }, 'Comment updated');
});

export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return fail(res, 'Comment not found', 'COMMENT_NOT_FOUND', 404);
  if (comment.author.toString() !== req.user._id.toString()) {
    return fail(res, 'You can only delete your own comments', 'FORBIDDEN', 403);
  }

  await comment.deleteOne();
  return ok(res, null, 'Comment deleted');
});
