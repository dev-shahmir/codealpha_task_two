import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, ListTodo, CheckCircle2, Clock, AlertTriangle, Users } from 'lucide-react';
import SEO from '../../components/seo/SEO';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Avatar from '../../components/ui/Avatar';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { useSocketBoard } from '../../hooks/useSocketBoard';

const PRIORITY_COLORS = { low: '#22D3EE', medium: '#6D5DFB', high: '#F59E0B', urgent: '#F43F5E' };

export default function Analytics() {
  const { data: projects = [] } = useProjects();
  const [projectId, setProjectId] = useState('');
  const activeProjectId = projectId || projects[0]?._id;

  // 🔴 Connect to live real-time project socket room for instant analytics sync
  useSocketBoard(activeProjectId);

  // Live real-time reactive tasks from cache
  const { data: tasks = [] } = useTasks(activeProjectId);
  const activeProject = projects.find((p) => p._id === activeProjectId) || projects[0];

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed' || t.column === 'done').length;
  const inProgress = tasks.filter((t) => t.column === 'in_progress').length;
  const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed' && t.column !== 'done').length;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;

  const byPriority = useMemo(() => {
    return ['low', 'medium', 'high', 'urgent'].map((p) => ({
      name: p,
      value: tasks.filter((t) => t.priority === p).length,
    }));
  }, [tasks]);

  const byStatus = useMemo(() => {
    const columns = activeProject?.columns || [
      { id: 'backlog', name: 'Backlog' },
      { id: 'todo', name: 'To Do' },
      { id: 'in_progress', name: 'In Progress' },
      { id: 'review', name: 'Review' },
      { id: 'done', name: 'Done' },
    ];
    return columns.map((col) => ({
      column: col.name || col.id.replace('_', ' '),
      count: tasks.filter((t) => t.column === col.id).length,
    }));
  }, [tasks, activeProject]);

  const workload = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      const name = t.assignee?.name || 'Unassigned';
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [tasks]);

  if (!activeProjectId) {
    return (
      <>
        <SEO title="Analytics" description="Project analytics on VYBEBOARD." path="/analytics" noindex />
        <EmptyState icon={BarChart3} title="No project data yet" description="Create a project to see analytics here." />
      </>
    );
  }

  const stats = [
    { label: 'Total Tasks', value: total, icon: ListTodo, color: 'text-brand' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-success' },
    { label: 'In Progress', value: inProgress, icon: Clock, color: 'text-brand-secondary' },
    { label: 'Overdue', value: overdue, icon: AlertTriangle, color: 'text-danger' },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: BarChart3, color: 'text-warning' },
  ];

  return (
    <>
      <SEO title="Analytics" description="Project analytics on VYBEBOARD." path="/analytics" noindex />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-bold text-ink">Project Analytics</h2>
          <p className="text-xs text-ink-secondary mt-0.5">Real-time live progress & workload insights.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" title="Live real-time sync active" />
          <select
            value={activeProjectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="neon-focus rounded-xl border border-border-c bg-surface px-3 py-2 text-sm font-medium text-ink shadow-sm"
          >
            {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label} className="p-4 transition-all hover:shadow-elevated">
            <s.icon size={18} className={s.color} />
            <p className="mt-2 font-heading text-2xl font-bold text-ink">{s.value}</p>
            <p className="text-xs text-ink-secondary">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-1 font-heading text-sm font-semibold text-ink">Tasks by Column</h3>
          <p className="mb-4 text-xs text-ink-secondary">Live breakdown of work across stages.</p>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={byStatus}>
                <XAxis dataKey="column" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6D5DFB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-1 font-heading text-sm font-semibold text-ink">Tasks by Priority</h3>
          <p className="mb-4 text-xs text-ink-secondary">Urgency distribution of active tasks.</p>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byPriority} dataKey="value" nameKey="name" outerRadius={80} label>
                  {byPriority.map((entry) => <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 flex flex-wrap gap-3 text-xs text-ink-secondary">
            {byPriority.map((p) => (
              <li key={p.name} className="flex items-center gap-1.5 capitalize">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[p.name] }} /> {p.name}: {p.value}
              </li>
            ))}
          </ul>
        </Card>

        {/* Team Workload */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-brand" />
            <h3 className="font-heading text-sm font-semibold text-ink">Team Workload Distribution</h3>
          </div>
          <p className="mb-4 text-xs text-ink-secondary">Task count per assigned team member.</p>
          {workload.length === 0 ? (
            <p className="text-xs text-ink-secondary italic py-4">No task assignments found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {workload.map((w) => (
                <div key={w.name} className="flex items-center justify-between p-3 rounded-xl border border-border-c bg-canvas">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={w.name} size={28} />
                    <span className="text-xs font-medium text-ink truncate">{w.name}</span>
                  </div>
                  <span className="rounded-full bg-soft-violet px-2.5 py-0.5 text-xs font-bold text-brand">
                    {w.count} {w.count === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
