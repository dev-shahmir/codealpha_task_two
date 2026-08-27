import mongoose from 'mongoose';

const checklistItemSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 200 },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    size: { type: Number, default: 0 },
    type: { type: String, default: 'file' },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, default: '', maxlength: 5000 },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    column: { type: String, required: true, index: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    labels: {
      type: [String],
      enum: ['bug', 'feature', 'design', 'backend', 'frontend', 'research', 'documentation', 'marketing', 'launch'],
      default: [],
    },
    dueDate: { type: Date, default: null },
    checklist: { type: [checklistItemSchema], default: [] },
    attachments: { type: [attachmentSchema], default: [] },
    position: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['open', 'completed'], default: 'open' },
  },
  { timestamps: true }
);

taskSchema.index({ project: 1, column: 1, position: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ title: 'text', description: 'text' });

taskSchema.virtual('checklistProgress').get(function checklistProgress() {
  if (!this.checklist?.length) return 0;
  const done = this.checklist.filter((i) => i.done).length;
  return Math.round((done / this.checklist.length) * 100);
});

taskSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Task', taskSchema);
