import { useMemo, useState, useCallback } from 'react';
import { useParams, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCorners, DragOverlay,
} from '@dnd-kit/core';
import { Filter, X, UserPlus, BarChart3, CheckCircle2, ListTodo, AlertTriangle, Clock, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import SEO from '../../components/seo/SEO';
import { BoardSkeleton } from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Column from '../../features/board/Column';
import TaskCard from '../../features/board/TaskCard';
import TaskModal from '../../features/board/TaskModal';
import CreateTaskModal from '../../features/board/CreateTaskModal';
import { useProject, useAddMember, useDeleteProject } from '../../hooks/useProjects';
import { useTasks, useCreateTask, useMoveTask } from '../../hooks/useTasks';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useSocketBoard } from '../../hooks/useSocketBoard';

const TABS = [
  { label: 'Board', to: '' },
  { label: 'Analytics', to: 'analytics' },
  { label: 'Members', to: 'members' },
];

const PRIORITY_COLORS = { low: '#22D3EE', medium: '#6D5DFB', high: '#F59E0B', urgent: '#F43F5E' };

const ROLE_STYLES = {
  owner: 'bg-soft-violet text-brand',
  admin: 'bg-soft-cyan text-brand-secondary',
  member: 'bg-elevated text-ink-secondary',
  viewer: 'bg-elevated text-ink-secondary',
};

export default function ProjectBoard() {
  const { user } = useAuth();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: project, isLoading: projectLoading } = useProject(id);
  const [filters, setFilters] = useState({});
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(id, filters);
  const createTask = useCreateTask(id);
  const moveTask = useMoveTask(id);
  const addMember = useAddMember(id);
  const deleteProject = useDeleteProject();

  const currentUserId = String(user?.id || user?._id || '');
  const myMembership = project?.members?.find(
    (m) => String(m.user?._id || m.user?.id || m.user || '') === currentUserId
  );
  const myRole = myMembership?.role || 'viewer';
  const isAdmin = myRole === 'admin';
  const canDeleteProject = myRole === 'owner' || myRole === 'admin';

  // 🔴 Live real-time board updates via Socket.IO
  useSocketBoard(id);

  const [activeTask, setActiveTask] = useState(null);
  const [openTaskId, setOpenTaskId] = useState(null);
  const openTask = useMemo(
    () => (openTaskId ? tasks.find((t) => t._id === openTaskId) || null : null),
    [tasks, openTaskId]
  );
  const [addColumnId, setAddColumnId] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteProjectConfirmOpen, setDeleteProjectConfirmOpen] = useState(false);
  const [inviteIdentifier, setInviteIdentifier] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  // Determine current active subview
  const activeTab = location.pathname.endsWith('/analytics')
    ? 'analytics'
    : location.pathname.endsWith('/members')
    ? 'members'
    : 'board';

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const tasksByColumn = useMemo(() => {
    const map = {};
    (project?.columns || []).forEach((c) => (map[c.id] = []));
    tasks.forEach((t) => {
      if (map[t.column]) map[t.column].push(t);
      else map[t.column] = [t];
    });
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.position - b.position));
    return map;
  }, [tasks, project]);

  const onDragStart = (event) => {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task);
  };

  const onDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeTaskData = tasks.find((t) => t._id === active.id);
    if (!activeTaskData) return;

    const overColumn = project.columns?.find((c) => c.id === over.id);
    const targetColumnId = overColumn ? over.id : tasks.find((t) => t._id === over.id)?.column;
    if (!targetColumnId) return;

    const columnTasks = tasksByColumn[targetColumnId] || [];
    const overIndex = columnTasks.findIndex((t) => t._id === over.id);
    const position = overIndex >= 0 ? overIndex : columnTasks.length;

    if (targetColumnId === activeTaskData.column && position === activeTaskData.position) return;

    moveTask.mutate({ id: active.id, column: targetColumnId, position });
  };

  const handleCreateTask = useCallback(async (payload, onDone) => {
    try {
      await createTask.mutateAsync({ ...payload, column: addColumnId });
      toast?.success('Task created');
      onDone?.();
      setAddColumnId(null);
    } catch (err) {
      toast?.error(err.message);
    }
  }, [addColumnId, createTask, toast]);

  const submitInvite = async (e) => {
    e.preventDefault();
    if (!inviteIdentifier.trim()) return;
    try {
      await addMember.mutateAsync({
        email: inviteIdentifier.includes('@') ? inviteIdentifier.trim() : undefined,
        username: !inviteIdentifier.includes('@') ? inviteIdentifier.trim() : undefined,
        role: inviteRole,
      });
      toast?.success('Member added to project');
      setInviteIdentifier('');
      setInviteOpen(false);
    } catch (err) {
      toast?.error(err.message || 'Failed to add member');
    }
  };

  if (projectLoading) return <BoardSkeleton />;
  if (!project) return null;

  // Calculate project-specific analytics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed' || t.column === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.column === 'in_progress').length;
  const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const byPriorityData = ['low', 'medium', 'high', 'urgent'].map((p) => ({
    name: p,
    value: tasks.filter((t) => t.priority === p).length,
  }));

  const byStatusData = (project.columns || []).map((col) => ({
    column: col.name || col.title || col.id.replace('_', ' '),
    count: tasks.filter((t) => t.column === col.id).length,
  }));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <SEO title={project.name} description={`Kanban board for ${project.name} on VYBEBOARD.`} path={`/projects/${id}`} noindex />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-ink-secondary">
            <Link to="/projects" className="hover:text-brand">Projects</Link> / {project.name}
          </p>
          <h2 className="font-heading text-xl font-bold text-ink">{project.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'board' && (
            <button
              onClick={() => setFiltersOpen(true)}
              className="neon-focus flex items-center gap-1.5 rounded-xl border border-border-c bg-surface px-3 py-2 text-sm text-ink-secondary hover:text-ink"
            >
              <Filter size={15} /> Filter {Object.values(filters).some(Boolean) && <span className="h-1.5 w-1.5 rounded-full bg-brand" />}
            </button>
          )}
          {activeTab === 'members' && (
            <Button onClick={() => setInviteOpen(true)} size="sm">
              <UserPlus size={15} /> Add Member
            </Button>
          )}
          {canDeleteProject && (
            <button
              onClick={() => setDeleteProjectConfirmOpen(true)}
              title="Delete project"
              aria-label="Delete project"
              className="neon-focus flex items-center gap-1.5 rounded-xl border border-border-c bg-surface px-3 py-2 text-sm text-ink-secondary hover:border-danger/30 hover:bg-danger/10 hover:text-danger transition-colors"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="mb-5 flex gap-1 border-b border-border-c">
        {TABS.map((tab) => (
          <NavLink
            key={tab.label}
            to={`/projects/${id}${tab.to ? `/${tab.to}` : ''}`}
            end={!tab.to}
            className={({ isActive }) =>
              `border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? 'border-brand text-brand' : 'border-transparent text-ink-secondary hover:text-ink'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      {/* 1. BOARD VIEW */}
      {activeTab === 'board' && (
        tasksLoading ? (
          <BoardSkeleton />
        ) : (
          /* flex-1 fills remaining height; overflow-x-auto scrolls only columns */
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <div className="relative -mx-4 min-h-0 flex-1 sm:-mx-6">
              {/* Right fade affordance */}
              <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-14 bg-gradient-to-l from-canvas to-transparent" />
              <div
                className="custom-scrollbar flex h-full gap-3.5 overflow-x-auto overflow-y-hidden px-4 pb-4 pt-1 sm:px-6"
              >
                {(project.columns || []).map((col) => (
                  <Column
                    key={col.id}
                    column={col}
                    tasks={tasksByColumn[col.id] || []}
                    onOpenTask={(t) => setOpenTaskId(t?._id || null)}
                    onAddTask={isAdmin ? setAddColumnId : null}
                  />
                ))}
                {/* trailing spacer */}
                <div className="w-4 shrink-0" />
              </div>
            </div>
            <DragOverlay>{activeTask && <TaskCard task={activeTask} onOpen={() => {}} />}</DragOverlay>
          </DndContext>
        )
      )}

      {/* 2. ANALYTICS VIEW */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <Card className="p-4">
              <ListTodo size={18} className="text-brand" />
              <p className="mt-2 font-heading text-2xl font-bold text-ink">{totalTasks}</p>
              <p className="text-xs text-ink-secondary">Total Tasks</p>
            </Card>
            <Card className="p-4">
              <CheckCircle2 size={18} className="text-success" />
              <p className="mt-2 font-heading text-2xl font-bold text-ink">{completedTasks}</p>
              <p className="text-xs text-ink-secondary">Completed</p>
            </Card>
            <Card className="p-4">
              <Clock size={18} className="text-brand-secondary" />
              <p className="mt-2 font-heading text-2xl font-bold text-ink">{inProgressTasks}</p>
              <p className="text-xs text-ink-secondary">In Progress</p>
            </Card>
            <Card className="p-4">
              <AlertTriangle size={18} className="text-danger" />
              <p className="mt-2 font-heading text-2xl font-bold text-ink">{overdueTasks}</p>
              <p className="text-xs text-ink-secondary">Overdue</p>
            </Card>
            <Card className="p-4">
              <BarChart3 size={18} className="text-warning" />
              <p className="mt-2 font-heading text-2xl font-bold text-ink">{completionRate}%</p>
              <p className="text-xs text-ink-secondary">Completion Rate</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card className="p-5">
              <h3 className="mb-1 font-heading text-sm font-semibold">Tasks by Column</h3>
              <p className="mb-4 text-xs text-ink-secondary">Real-time status breakdown for this project.</p>
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <BarChart data={byStatusData}>
                    <XAxis dataKey="column" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6D5DFB" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="mb-1 font-heading text-sm font-semibold">Tasks by Priority</h3>
              <p className="mb-4 text-xs text-ink-secondary">Urgency distribution of all tasks.</p>
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={byPriorityData} dataKey="value" nameKey="name" outerRadius={80} label>
                      {byPriorityData.map((entry) => <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 flex flex-wrap gap-3 text-xs text-ink-secondary">
                {byPriorityData.map((p) => (
                  <li key={p.name} className="flex items-center gap-1.5 capitalize">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[p.name] }} /> {p.name}: {p.value}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}

      {/* 3. MEMBERS VIEW */}
      {activeTab === 'members' && (
        <Card className="divide-y divide-border-c overflow-hidden">
          {project.members?.map((m) => (
            <div key={m.user._id || m.user} className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <Avatar name={m.user.name || 'Member'} src={m.user.avatar} size={40} />
                <div>
                  <p className="text-sm font-medium text-ink">{m.user.name || 'Member'}</p>
                  <p className="text-xs text-ink-secondary">{m.user.email || `@${m.user.username}`}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${ROLE_STYLES[m.role] || ROLE_STYLES.member}`}>
                  {m.role}
                </span>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Modals */}
      <TaskModal
        task={openTask}
        projectId={id}
        members={project.members}
        open={!!openTask}
        onClose={() => setOpenTaskId(null)}
      />

      <CreateTaskModal
        open={isAdmin && !!addColumnId}
        onClose={() => setAddColumnId(null)}
        onSubmit={handleCreateTask}
        members={project.members}
        loading={createTask.isPending}
      />

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filter tasks">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Priority</label>
            <select
              value={filters.priority || ''}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="neon-focus w-full rounded-xl border border-border-c bg-surface px-3.5 py-2.5 text-sm"
            >
              <option value="">Any priority</option>
              {['low', 'medium', 'high', 'urgent'].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Assignee</label>
            <select
              value={filters.assignee || ''}
              onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
              className="neon-focus w-full rounded-xl border border-border-c bg-surface px-3.5 py-2.5 text-sm"
            >
              <option value="">Anyone</option>
              {project.members?.map((m) => (
                <option key={m.user._id || m.user} value={m.user._id || m.user}>{m.user.name || 'Member'}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setFilters({})} className="flex-1"><X size={14} /> Reset filters</Button>
            <Button onClick={() => setFiltersOpen(false)} className="flex-1">Apply</Button>
          </div>
        </div>
      </Modal>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Add Member to Project">
        <form onSubmit={submitInvite} className="space-y-4">
          <Input
            label="Email or Username"
            placeholder="e.g. sarah@vybeboard.dev or sarahchen"
            autoFocus
            required
            value={inviteIdentifier}
            onChange={(e) => setInviteIdentifier(e.target.value)}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Project Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="neon-focus w-full rounded-xl border border-border-c bg-surface px-3.5 py-2.5 text-sm"
            >
              <option value="viewer">Viewer (Read only)</option>
              <option value="member">Member (Can create and edit tasks)</option>
              <option value="admin">Admin (Can manage project & members)</option>
            </select>
          </div>
          <Button type="submit" loading={addMember.isPending} className="w-full">
            Add to Project
          </Button>
        </form>
      </Modal>

      {/* Delete Project Confirmation Modal */}
      <ConfirmModal
        open={deleteProjectConfirmOpen}
        onClose={() => setDeleteProjectConfirmOpen(false)}
        title="Delete Project?"
        description={`Are you sure you want to delete "${project.name}"? All tasks, columns, and discussions will be permanently deleted. This action cannot be undone.`}
        confirmText="Delete Project"
        danger={true}
        loading={deleteProject.isPending}
        onConfirm={async () => {
          try {
            await deleteProject.mutateAsync(id);
            toast?.success('Project deleted');
            setDeleteProjectConfirmOpen(false);
            navigate('/projects');
          } catch (err) {
            toast?.error(err.message || 'Failed to delete project');
          }
        }}
      />
    </div>
  );
}
