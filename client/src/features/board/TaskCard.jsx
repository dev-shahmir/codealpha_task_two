import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarDays, ListChecks } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import { PriorityBadge, LabelBadge } from '../../components/ui/Badge';

function formatDueDate(date) {
  if (!date) return null;
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.round((d - now) / 86400000);
  if (diffDays < 0) return { text: 'Overdue', danger: true };
  if (diffDays === 0) return { text: 'Today', danger: false, soon: true };
  if (diffDays === 1) return { text: 'Tomorrow', danger: false };
  return { text: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), danger: false };
}

export default function TaskCard({ task, onOpen, accentColor }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const due = formatDueDate(task.dueDate);
  const checklistTotal = task.checklist?.length || 0;
  const checklistDone = task.checklist?.filter((i) => i.done).length || 0;
  const checklistProgress = checklistTotal > 0 ? (checklistDone / checklistTotal) * 100 : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task)}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(task)}
      role="button"
      tabIndex={0}
      aria-label={`Open task ${task.title}`}
      className={`neon-focus group cursor-grab select-none rounded-xl border bg-surface p-3.5 text-left shadow-soft transition-all duration-150 active:cursor-grabbing ${
        isDragging
          ? 'scale-[1.02] rotate-1 border-brand/60 opacity-90 shadow-elevated'
          : 'border-border-c hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-elevated'
      }`}
    >
      {/* Priority + Labels */}
      {(task.priority || task.labels?.length > 0) && (
        <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
          {task.labels?.slice(0, 2).map((l) => (
            <LabelBadge key={l} label={l} />
          ))}
        </div>
      )}

      {/* Title */}
      <p className="text-sm font-medium leading-snug text-ink">{task.title}</p>

      {/* Checklist progress bar */}
      {checklistTotal > 0 && (
        <div className="mt-2.5">
          <div className="mb-1 flex items-center justify-between text-xs text-ink-secondary">
            <span className="flex items-center gap-1">
              <ListChecks size={11} />
              {checklistDone}/{checklistTotal}
            </span>
            <span>{Math.round(checklistProgress)}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-elevated">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${checklistProgress}%`, backgroundColor: accentColor }}
            />
          </div>
        </div>
      )}

      {/* Footer: due date + assignee */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {due && (
            <span
              className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium ${
                due.danger
                  ? 'bg-red-500/10 text-danger'
                  : due.soon
                  ? 'bg-yellow-500/10 text-warning'
                  : 'bg-elevated text-ink-secondary'
              }`}
            >
              <CalendarDays size={11} />
              {due.text}
            </span>
          )}
        </div>
        {task.assignee && (
          <Avatar name={task.assignee.name} src={task.assignee.avatar} size={22} />
        )}
      </div>
    </div>
  );
}
