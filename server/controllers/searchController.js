import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import { ok, fail } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const globalSearch = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return fail(res, 'Enter a search term', 'MISSING_QUERY', 400);

  const myProjects = await Project.find({ 'members.user': req.user._id }).select('_id name');
  const projectIds = myProjects.map((p) => p._id);

  const safeRegex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  const [projects, tasks, comments, members] = await Promise.all([
    Project.find({
      _id: { $in: projectIds },
      $or: [{ $text: { $search: q } }, { name: safeRegex }, { description: safeRegex }],
    }).limit(6),
    Task.find({
      project: { $in: projectIds },
      $or: [{ $text: { $search: q } }, { title: safeRegex }, { description: safeRegex }],
    }).populate('project', 'name').limit(10),
    Comment.find({
      task: { $in: await Task.find({ project: { $in: projectIds } }).distinct('_id') },
      $or: [{ $text: { $search: q } }, { content: safeRegex }],
    })
      .populate('author', 'name username avatar')
      .populate('task', 'title')
      .limit(6),
    User.find({
      _id: { $in: myProjects.length ? await Project.find({ _id: { $in: projectIds } }).distinct('members.user') : [] },
      $or: [{ name: safeRegex }, { username: safeRegex }, { email: safeRegex }],
    }).limit(6),
  ]);

  return ok(res, { results: { projects, tasks, comments, members }, query: q });
});
