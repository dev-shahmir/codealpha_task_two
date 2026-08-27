import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import Activity from '../models/Activity.js';
import { demoUsers, demoProjects, taskTitlesByColumn, labelPool, priorityPool } from './seedData.js';

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function run() {
  await connectDB();
  console.log('[VYBEBOARD] Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    Comment.deleteMany({}),
    Notification.deleteMany({}),
    Activity.deleteMany({}),
  ]);

  console.log('[VYBEBOARD] Creating demo users...');
  const users = [];
  for (const u of demoUsers) {
    users.push(await User.create(u));
  }

  console.log('[VYBEBOARD] Creating demo projects, tasks, comments, activity...');
  for (let i = 0; i < demoProjects.length; i++) {
    const owner = users[i % users.length];
    const otherMembers = users.filter((u) => u._id.toString() !== owner._id.toString()).slice(0, 3);

    const project = await Project.create({
      ...demoProjects[i],
      owner: owner._id,
      members: [
        { user: owner._id, role: 'owner' },
        ...otherMembers.map((m, idx) => ({ user: m._id, role: idx === 0 ? 'admin' : 'member' })),
      ],
    });

    let position = { backlog: 0, todo: 0, in_progress: 0, review: 0, done: 0 };

    for (const [column, titles] of Object.entries(taskTitlesByColumn)) {
      for (const title of titles) {
        const assignee = pick([owner, ...otherMembers]);
        const task = await Task.create({
          title,
          description: `Details for "${title}" in ${project.name}.`,
          project: project._id,
          column,
          position: position[column]++,
          assignee: assignee._id,
          creator: owner._id,
          priority: pick(priorityPool),
          labels: [pick(labelPool), pick(labelPool)].filter((v, idx, arr) => arr.indexOf(v) === idx),
          dueDate: Math.random() > 0.4 ? new Date(Date.now() + (Math.random() * 14 - 4) * 86400000) : null,
          status: column === 'done' ? 'completed' : 'open',
          checklist: [
            { text: 'Define scope', done: true },
            { text: 'Implement', done: column === 'done' || column === 'review' },
            { text: 'Test', done: column === 'done' },
          ],
        });

        await Activity.create({ project: project._id, task: task._id, actor: owner._id, type: 'task_created' });

        if (Math.random() > 0.5) {
          const commenter = pick([owner, ...otherMembers]);
          await Comment.create({
            task: task._id,
            author: commenter._id,
            content: `@${assignee.username} can you take a look at this when you get a chance?`,
            mentions: [assignee._id],
          });
        }
      }
    }

    await Notification.create({
      recipient: owner._id,
      sender: pick(otherMembers)._id,
      type: 'project_activity',
      message: `Activity is picking up in ${project.name}`,
      project: project._id,
      read: false,
    });
  }

  console.log('[VYBEBOARD] Seed complete!');
  console.log('Demo login: alex@vybeboard.dev / vybeboard123');
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
