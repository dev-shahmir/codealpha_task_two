import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, FolderKanban, Archive } from 'lucide-react';
import SEO from '../../components/seo/SEO';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { useProjects, useCreateProject } from '../../hooks/useProjects';
import { useToast } from '../../context/ToastContext';

const COLORS = ['#6D5DFB', '#22D3EE', '#B8F34A', '#F59E0B', '#F43F5E'];

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: projects = [], isLoading } = useProjects();
  const createProject = useCreateProject();
  const toast = useToast();
  const [open, setOpen] = useState(searchParams.get('new') === '1');
  const [form, setForm] = useState({ name: '', description: '', color: COLORS[0], visibility: 'team' });
  const [submitting, setSubmitting] = useState(false);

  const closeModal = () => { setOpen(false); searchParams.delete('new'); setSearchParams(searchParams); };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      await createProject.mutateAsync(form);
      toast?.success('Project created');
      setForm({ name: '', description: '', color: COLORS[0], visibility: 'team' });
      closeModal();
    } catch (err) {
      toast?.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="Projects" description="Your VYBEBOARD projects." path="/projects" noindex />

      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold">Projects</h2>
        <Button onClick={() => setOpen(true)}><Plus size={16} /> New Project</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Your workspace is waiting for its first big idea."
          description="Projects hold your boards, tasks, and team members in one place."
          action={<Button onClick={() => setOpen(true)}><Plus size={16} /> Create your first project</Button>}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.05 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {projects.map((p) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Link to={`/projects/${p._id}`}>
                <Card className="h-full p-4 transition-all duration-200 hover:-translate-y-1 hover:border-brand/40 hover:shadow-elevated">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.status === 'archived' && <Archive size={14} className="text-ink-secondary" />}
                  </div>
                  <h3 className="font-heading text-sm font-semibold text-ink">{p.name}</h3>
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

      <Modal open={open} onClose={closeModal} title="Create a project">
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Project name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} name="name" />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="neon-focus w-full rounded-xl border border-border-c bg-surface px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  aria-label={`Choose color ${c}`}
                  className="h-7 w-7 rounded-full border-2"
                  style={{ backgroundColor: c, borderColor: form.color === c ? '#111827' : 'transparent' }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Visibility</label>
            <select
              value={form.visibility}
              onChange={(e) => setForm({ ...form, visibility: e.target.value })}
              className="neon-focus w-full rounded-xl border border-border-c bg-surface px-3.5 py-2.5 text-sm"
            >
              <option value="team">Team</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div>
            <Input
              label="Project Owner (Optional)"
              placeholder="Leave blank for yourself, or enter email / @username"
              value={form.owner || ''}
              onChange={(e) => setForm({ ...form, owner: e.target.value })}
              name="owner"
            />
            <p className="mt-1 text-[11px] text-ink-secondary">
              {form.owner?.trim()
                ? 'The specified user will be Owner, and you will automatically become the Admin.'
                : 'You will be the Owner of this project.'}
            </p>
          </div>

          {!form.owner?.trim() && (
            <div>
              <Input
                label="Assign Project Admin (Optional)"
                placeholder="Enter email / @username to add as Admin"
                value={form.admin || ''}
                onChange={(e) => setForm({ ...form, admin: e.target.value })}
                name="admin"
              />
              <p className="mt-1 text-[11px] text-ink-secondary">
                Assign an Admin who can create tasks, assign members, and manage the board.
              </p>
            </div>
          )}
          <Button type="submit" loading={submitting} className="w-full">Create project</Button>
        </form>
      </Modal>
    </>
  );
}
