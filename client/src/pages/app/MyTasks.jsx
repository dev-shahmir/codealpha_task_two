import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  CalendarDays,
  ArrowUpRight,
  Check,
  ListChecks,
  Loader2,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import SEO from '../../components/seo/SEO';
import EmptyState from '../../components/ui/EmptyState';
import { PriorityBadge, LabelBadge } from '../../components/ui/Badge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { useProjects } from '../../hooks/useProjects';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const VIEWS = ['All', 'Today', 'Upcoming', 'Overdue', 'Completed'];

function formatDue(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.round((d - now) / 86400000);
  if (diffDays < 0) return { text: 'Overdue', danger: true };
  if (diffDays === 0) return { text: 'Today', soon: true };
  if (diffDays === 1) return { text: 'Tomorrow' };
  return { text: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) };
}

export default function MyTasks() {
  const { user } = useAuth();
  const { data: projects = [] } = useProjects();
  const [view, setView] = useState('All');
  const [loadingTaskId, setLoadingTaskId] = useState(null);
  const qc = useQueryClient();
  const toast = useToast();

  const userId = user?._id || user?.id;

  const { data: allTasks = [], isLoading } = useQuery({
    queryKey: ['my-tasks', projects.map((p) => p._id), userId],
    queryFn: async () => {
      if (!userId || projects.length === 0) return [];
      const results = await Promise.all(
        projects.map((p) =>
          apiClient
            .get(`/projects/${p._id}/tasks?assignee=${userId}`)
            .then((r) => (r.data?.tasks || r.tasks || []).map((t) => ({ ...t, projectName: p.name, projectId: p._id })))
        )
      );
      return results.flat();
    },
    enabled: projects.length > 0 && !!userId,
  });

  const toggleTaskStatus = useMutation({
    mutationFn: async ({ id, isCompleted, title }) => {
      setLoadingTaskId(id);
      return apiClient.put(`/tasks/${id}`, {
        status: isCompleted ? 'open' : 'completed',
        column: isCompleted ? 'todo' : 'done',
      });
    },
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: ['my-tasks'] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
      toast?.success(vars.isCompleted ? 'Task marked as open' : 'Task marked as completed!');
    },
    onError: (err) => {
      toast?.error(err.message || 'Failed to update task');
    },
    onSettled: () => {
      setLoadingTaskId(null);
    },
  });

  const filtered = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 86400000);

    return allTasks.filter((t) => {
      const isCompleted = t.status === 'completed' || t.column === 'done';
      if (view === 'Completed') return isCompleted;
      if (isCompleted) return false;
      if (view === 'All') return true;
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      if (view === 'Today') return due >= startOfDay && due < endOfDay;
      if (view === 'Upcoming') return due >= endOfDay;
      if (view === 'Overdue') return due < startOfDay;
      return true;
    });
  }, [allTasks, view]);

  // Count badges for each tab
  const counts = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 86400000);
    const active = allTasks.filter((t) => t.status !== 'completed' && t.column !== 'done');
    return {
      All: active.length,
      Today: active.filter((t) => {
        if (!t.dueDate) return false;
        const d = new Date(t.dueDate);
        return d >= startOfDay && d < endOfDay;
      }).length,
      Upcoming: active.filter((t) => t.dueDate && new Date(t.dueDate) >= endOfDay).length,
      Overdue: active.filter((t) => t.dueDate && new Date(t.dueDate) < startOfDay).length,
      Completed: allTasks.filter((t) => t.status === 'completed' || t.column === 'done').length,
    };
  }, [allTasks]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <SEO title="My Tasks" description="Tasks assigned to you across all VYBEBOARD projects." path="/tasks" noindex />

      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-bold text-ink">My Tasks</h2>
          <p className="text-xs text-ink-secondary mt-0.5">Manage and track your assigned work across all projects.</p>
        </div>
      </div>

      {/* Prominent High-Contrast Filter Tabs */}
      <div className="custom-scrollbar mb-5 flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-border-c bg-surface p-1.5 shadow-sm">
        {VIEWS.map((v) => {
          const isActive = view === v;
          return (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`neon-focus flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-ink-secondary hover:bg-elevated hover:text-ink'
              }`}
            >
              <span>{v}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold leading-none ${
                  isActive ? 'bg-white/25 text-white' : 'bg-elevated text-ink-secondary border border-border-c'
                }`}
              >
                {counts[v] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Task List / State */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title={view === 'All' ? "Nothing on your plate yet. That's a good start." : `No ${view.toLowerCase()} tasks.`}
            description="Tasks assigned to you across all projects will show up here."
          />
        ) : (
          <motion.ul
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.04 }}
            className="space-y-3 pb-6"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((t) => {
                const due = formatDue(t.dueDate);
                const isCompleted = t.status === 'completed' || t.column === 'done';
                const isThisLoading = loadingTaskId === t._id;

                return (
                  <motion.li
                    key={t._id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`group flex flex-col gap-3 rounded-2xl border bg-surface p-4 transition-all duration-150 hover:border-brand/40 hover:shadow-soft sm:flex-row sm:items-center sm:justify-between ${
                      isCompleted ? 'border-border-c/60 bg-surface/70 opacity-80' : 'border-border-c'
                    }`}
                  >
                    {/* Left: Task details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold leading-snug ${isCompleted ? 'text-ink-secondary line-through' : 'text-ink'}`}>
                          {t.title}
                        </p>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-md bg-elevated px-2 py-0.5 font-medium text-ink-secondary border border-border-c">
                          {t.projectName}
                        </span>
                        {due && (
                          <span
                            className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-medium ${
                              due.danger
                                ? 'bg-red-500/10 text-danger'
                                : due.soon
                                ? 'bg-yellow-500/10 text-warning'
                                : 'bg-elevated text-ink-secondary border border-border-c'
                            }`}
                          >
                            <CalendarDays size={11} />
                            {due.text}
                          </span>
                        )}
                        {t.checklist?.length > 0 && (
                          <span className="flex items-center gap-1 text-ink-secondary">
                            <ListChecks size={12} />
                            {t.checklist.filter((i) => i.done).length}/{t.checklist.length}
                          </span>
                        )}
                        <PriorityBadge priority={t.priority} />
                        {t.labels?.[0] && <LabelBadge label={t.labels[0]} />}
                      </div>
                    </div>

                    {/* Right: Explicit Mark as Complete button with in-button loader */}
                    <div className="flex shrink-0 items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-c/50">
                      <button
                        onClick={() => toggleTaskStatus.mutate({ id: t._id, isCompleted, title: t.title })}
                        disabled={isThisLoading}
                        className={`neon-focus flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                          isCompleted
                            ? 'border border-border-c bg-elevated text-ink-secondary hover:border-brand hover:text-brand'
                            : 'bg-brand text-white shadow-sm hover:bg-brand/90'
                        } ${isThisLoading ? 'cursor-not-allowed opacity-75' : ''}`}
                      >
                        {isThisLoading ? (
                          <>
                            <Loader2 size={13} className="animate-spin text-current" />
                            <span>Updating...</span>
                          </>
                        ) : isCompleted ? (
                          <>
                            <RotateCcw size={13} />
                            <span>Reopen Task</span>
                          </>
                        ) : (
                          <>
                            <Check size={13} strokeWidth={2.5} />
                            <span>Mark as Complete</span>
                          </>
                        )}
                      </button>

                      {/* Go to board icon link */}
                      <Link
                        to={`/projects/${t.projectId}`}
                        title="Open project board"
                        className="neon-focus flex h-8 w-8 items-center justify-center rounded-xl border border-border-c bg-surface text-ink-secondary transition-all hover:border-brand hover:bg-soft-violet hover:text-brand"
                      >
                        <ArrowUpRight size={15} />
                      </Link>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>
    </div>
  );
}
