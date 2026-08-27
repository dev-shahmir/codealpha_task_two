import { useState, useCallback } from 'react';
import { CalendarDays, Tag, User, ListChecks, AlignLeft } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const PRIORITY_COLORS = { low: '#22D3EE', medium: '#6D5DFB', high: '#F59E0B', urgent: '#F43F5E' };
const LABELS = ['bug', 'feature', 'design', 'backend', 'frontend', 'research', 'documentation', 'marketing', 'launch'];

const EMPTY = {
  title: '',
  description: '',
  priority: 'medium',
  assignee: '',
  dueDate: '',
  labels: [],
};

export default function CreateTaskModal({ open, onClose, onSubmit, members = [], loading = false }) {
  const [form, setForm] = useState(EMPTY);
  const [checklist, setChecklist] = useState([]);
  const [newCheckItem, setNewCheckItem] = useState('');

  const set = useCallback((key, val) => setForm((f) => ({ ...f, [key]: val })), []);

  const toggleLabel = useCallback((l) => {
    setForm((f) => ({
      ...f,
      labels: f.labels.includes(l) ? f.labels.filter((x) => x !== l) : [...f.labels, l],
    }));
  }, []);

  const handleClose = () => {
    setForm(EMPTY);
    setChecklist([]);
    setNewCheckItem('');
    onClose();
  };

  const addCheckItem = (e) => {
    e?.preventDefault();
    if (!newCheckItem.trim()) return;
    setChecklist((prev) => [...prev, { text: newCheckItem.trim(), done: false }]);
    setNewCheckItem('');
  };

  const removeCheckItem = (idx) => {
    setChecklist((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      priority: form.priority,
      dueDate: form.dueDate || undefined,
      labels: form.labels.length ? form.labels : undefined,
      checklist: checklist.length ? checklist : undefined,
    };
    onSubmit(payload, () => {
      setForm(EMPTY);
      setChecklist([]);
      setNewCheckItem('');
    });
  };

  return (
    <Modal open={open} onClose={handleClose} title="Create a task" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <Input
          label="Task title"
          name="task-title"
          autoFocus
          required
          placeholder="What needs to be done?"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
        />

        {/* Description */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink">
            <AlignLeft size={14} /> Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            placeholder="Add a description..."
            className="neon-focus w-full rounded-xl border border-border-c bg-canvas px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-secondary/60"
          />
        </div>

        {/* Priority + Due Date row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Priority</label>
            <div className="flex gap-1.5 flex-wrap">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => set('priority', p)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize transition-all ${
                    form.priority === p
                      ? 'border-transparent text-white'
                      : 'border-border-c text-ink-secondary hover:border-brand/50'
                  }`}
                  style={form.priority === p ? { backgroundColor: PRIORITY_COLORS[p] } : {}}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink">
              <CalendarDays size={14} /> Due Date
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => set('dueDate', e.target.value)}
              className="neon-focus w-full rounded-xl border border-border-c bg-surface px-3.5 py-2 text-sm text-ink"
            />
          </div>
        </div>

        {/* Checklist */}
        <div>
          <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-ink">
            <span className="flex items-center gap-1.5">
              <ListChecks size={14} /> Checklist
            </span>
            {checklist.length > 0 && (
              <span className="text-xs font-normal text-ink-secondary">{checklist.length} items</span>
            )}
          </label>

          {checklist.length > 0 && (
            <ul className="mb-2 max-h-32 overflow-y-auto rounded-xl border border-border-c bg-canvas divide-y divide-border-c/50 px-2 py-1">
              {checklist.map((item, idx) => (
                <li key={idx} className="group flex items-center justify-between gap-2 py-1.5 text-xs text-ink">
                  <span className="truncate flex-1">☑ {item.text}</span>
                  <button
                    type="button"
                    onClick={() => removeCheckItem(idx)}
                    className="text-ink-secondary hover:text-danger p-0.5 rounded transition-colors"
                    title="Remove item"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2">
            <input
              value={newCheckItem}
              onChange={(e) => setNewCheckItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCheckItem();
                }
              }}
              placeholder="Add checklist item… (Press Enter)"
              className="neon-focus flex-1 rounded-xl border border-border-c bg-canvas px-3 py-1.5 text-xs text-ink placeholder:text-ink-secondary/60"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addCheckItem}
              disabled={!newCheckItem.trim()}
            >
              + Add
            </Button>
          </div>
        </div>

        {/* Labels */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink">
            <Tag size={14} /> Labels
          </label>
          <div className="flex flex-wrap gap-1.5">
            {LABELS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => toggleLabel(l)}
                className={`rounded-full border px-2.5 py-0.5 text-xs capitalize transition-all ${
                  form.labels.includes(l)
                    ? 'border-brand bg-soft-violet text-brand'
                    : 'border-border-c text-ink-secondary hover:border-brand/50 hover:text-ink'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
