import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';

const COLUMN_ACCENT = {
  todo:        '#6D5DFB',
  in_progress: '#22D3EE',
  review:      '#F59E0B',
  done:        '#B8F34A',
};

export default function Column({ column, tasks, onOpenTask, onAddTask }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const accent = COLUMN_ACCENT[column.id] ?? '#6D5DFB';

  return (
    <div
      className="flex shrink-0 flex-col rounded-2xl border border-border-c bg-surface/60 backdrop-blur-sm transition-all duration-200"
      style={{
        width: 'clamp(260px, 22vw, 310px)',
        boxShadow: isOver ? `0 0 0 2px ${accent}55` : undefined,
      }}
    >
      {/* Column header */}
      <div
        className="rounded-t-2xl px-3.5 pt-3 pb-2.5"
        style={{ borderTop: `3px solid ${accent}` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: accent }}
            />
            <h3 className="text-sm font-semibold text-ink">{column.name}</h3>
          </div>
          <div className="flex items-center gap-1">
            <span className="rounded-full bg-elevated px-2 py-0.5 text-xs font-medium text-ink-secondary">
              {tasks.length}
            </span>
            {onAddTask && (
              <button
                onClick={() => onAddTask(column.id)}
                aria-label={`Add task to ${column.name}`}
                className="neon-focus ml-1 rounded-lg p-1 text-ink-secondary transition-colors hover:bg-soft-violet hover:text-brand"
              >
                <Plus size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable task list */}
      <div
        ref={setNodeRef}
        className="flex-1 space-y-2 overflow-y-auto px-2.5 pb-3 pr-2"
        style={{ minHeight: 80 }}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onOpen={onOpenTask} accentColor={accent} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          onAddTask ? (
            <button
              onClick={() => onAddTask(column.id)}
              className="neon-focus mt-1 flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-c py-8 text-xs text-ink-secondary transition-all hover:border-brand/60 hover:bg-soft-violet/20 hover:text-brand"
            >
              <Plus size={16} />
              Add a task
            </button>
          ) : (
            <div className="mt-1 flex w-full flex-col items-center justify-center py-8 text-xs text-ink-secondary/70 italic border border-dashed border-border-c/40 rounded-xl">
              No tasks
            </div>
          )
        )}
      </div>
    </div>
  );
}
