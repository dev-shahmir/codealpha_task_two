import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FolderKanban, CheckCircle2, ListTodo, AlertTriangle, ArrowRight, Plus } from 'lucide-react';
import SEO from '../../components/seo/SEO';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../hooks/useProjects';
import { apiClient } from '../../lib/apiClient';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data: projects = [], isLoading } = useProjects();

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiClient.get('/notifications').then((r) => r.data),
  });

  const totalTasks = projects.reduce((sum, p) => sum + (p.taskCount || 0), 0);
  const overallProgress = projects.length
    ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
    : 0;

  const overview = [
    { label: 'Active Projects', value: projects.filter((p) => p.status === 'active').length, icon: FolderKanban, color: 'text-brand' },
    { label: 'Total Tasks', value: totalTasks, icon: ListTodo, color: 'text-brand-secondary' },
    { label: 'Avg. Progress', value: `${overallProgress}%`, icon: CheckCircle2, color: 'text-success' },
    { label: 'Unread Alerts', value: notifData?.unreadCount || 0, icon: AlertTriangle, color: 'text-warning' },
  ];

  return (
    <>
      <SEO title="Dashboard" description="Your VYBEBOARD dashboard." path="/dashboard" noindex />

      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-ink">{greeting()}, {user?.name?.split(' ')[0]}. Let's get things shipped.</h2>
        <p className="mt-1 text-sm text-ink-secondary">Here's what's moving across your workspace.</p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {overview.map((o) => (
          <motion.div key={o.label} variants={itemVariants}>
            <Card className="p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated">
              <o.icon size={18} className={o.color} />
              <p className="mt-2 font-heading text-2xl font-bold text-ink">{o.value}</p>
              <p className="text-xs text-ink-secondary">{o.label}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold text-ink">Recent Projects</h3>
        <Link to="/projects" className="flex items-center gap-1 text-sm font-medium text-brand hover:underline">
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Your workspace is waiting for its first big idea."
          description="Create a project to start organizing tasks and inviting your team."
          action={<Button as={Link} to="/projects?new=1"><Plus size={16} /> Create your first project</Button>}
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {projects.slice(0, 6).map((p) => (
            <motion.div key={p._id} variants={itemVariants}>
              <Link to={`/projects/${p._id}`}>
                <Card className="h-full p-4 transition-all duration-200 hover:-translate-y-1 hover:border-brand/40 hover:shadow-elevated">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-xs text-ink-secondary capitalize">{p.status}</span>
                  </div>
                  <h4 className="font-heading text-sm font-semibold text-ink">{p.name}</h4>
                  <p className="mt-1 line-clamp-2 text-xs text-ink-secondary">{p.description}</p>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-elevated">
                    <div className="h-full bg-brand transition-all duration-500" style={{ width: `${p.progress}%` }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex -space-x-1.5">
                      {p.members?.slice(0, 3).map((m) => (
                        <Avatar key={m.user._id || m.user} name={m.user.name} src={m.user.avatar} size={22} ring />
                      ))}
                    </div>
                    <span className="text-xs text-ink-secondary">{p.taskCount} tasks</span>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </>
  );
}
