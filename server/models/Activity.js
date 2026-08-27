import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'task_created',
        'task_updated',
        'task_assigned',
        'task_moved',
        'task_deleted',
        'priority_changed',
        'comment_added',
        'checklist_updated',
        'member_added',
        'member_removed',
        'member_role_changed',
        'project_created',
        'project_updated',
      ],
      required: true,
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

activitySchema.index({ project: 1, createdAt: -1 });

export default mongoose.model('Activity', activitySchema);
