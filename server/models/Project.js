import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'admin', 'member', 'viewer'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const columnSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    order: { type: Number, required: true },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: '', maxlength: 500 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: { type: [memberSchema], default: [] },
    visibility: { type: String, enum: ['private', 'team'], default: 'team' },
    columns: {
      type: [columnSchema],
      default: [
        { id: 'backlog', name: 'Backlog', order: 0 },
        { id: 'todo', name: 'To Do', order: 1 },
        { id: 'in_progress', name: 'In Progress', order: 2 },
        { id: 'review', name: 'Review', order: 3 },
        { id: 'done', name: 'Done', order: 4 },
      ],
    },
    startDate: { type: Date },
    dueDate: { type: Date },
    color: { type: String, default: '#6D5DFB' },
    icon: { type: String, default: 'rocket' },
    status: { type: String, enum: ['active', 'archived', 'completed'], default: 'active' },
    workspace: { type: String, default: 'default' },
  },
  { timestamps: true }
);

projectSchema.index({ 'members.user': 1 });
projectSchema.index({ owner: 1 });
projectSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Project', projectSchema);
