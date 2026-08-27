import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  UserPlus,
  Plus,
  FolderKanban,
  Shield,
  Trash2,
  Search,
  Building2,
  UserCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../../components/seo/SEO';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { apiClient } from '../../lib/apiClient';
import {
  useProjects,
  useCreateProject,
  useAddMember,
  useRemoveMember,
  useUpdateMemberRole,
} from '../../hooks/useProjects';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ROLE_STYLES = {
  owner: 'bg-soft-violet text-brand border-brand/30',
  admin: 'bg-soft-cyan text-brand-secondary border-brand-secondary/30',
  member: 'bg-elevated text-ink-secondary border-border-c',
  viewer: 'bg-elevated text-ink-secondary border-border-c',
};

const PROJECT_COLORS = ['#6D5DFB', '#22D3EE', '#B8F34A', '#F59E0B', '#F43F5E'];

export default function Team() {
  const { user } = useAuth();
  const toast = useToast();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteIdentifier, setInviteIdentifier] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [newTeamForm, setNewTeamForm] = useState({
    name: '',
    description: '',
    color: PROJECT_COLORS[0],
    visibility: 'team',
  });

  const activeProjectId = selectedProjectId || projects[0]?._id;
  const currentProject = projects.find((p) => p._id === activeProjectId) || projects[0];

  const createProject = useCreateProject();
  const addMember = useAddMember(activeProjectId);
  const removeMember = useRemoveMember(activeProjectId);
  const updateMemberRole = useUpdateMemberRole(activeProjectId);

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['members', activeProjectId],
    queryFn: () =>
      apiClient
        .get(`/projects/${activeProjectId}/members`)
        .then((r) => r.data?.members || r.members || []),
    enabled: !!activeProjectId,
  });

  // Check if current user is owner or admin in this project
  const currentUserId = user?._id || user?.id;
  const currentUserRole = useMemo(() => {
    const mem = members.find(
      (m) => (m.user?._id || m.user?.id || m.user)?.toString() === currentUserId?.toString()
    );
    const projectOwnerId = (currentProject?.owner?._id || currentProject?.owner)?.toString();
    return mem?.role || (projectOwnerId === currentUserId?.toString() ? 'owner' : 'member');
  }, [members, currentUserId, currentProject]);

  const canManageMembers = currentUserRole === 'admin';
  const canChangeRole = currentUserRole === 'admin';
  const canRemoveMember = currentUserRole === 'admin';

  // Filter members by search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.user?.name?.toLowerCase().includes(q) ||
        m.user?.username?.toLowerCase().includes(q) ||
        m.user?.email?.toLowerCase().includes(q) ||
        m.role?.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  // Handle Add Member
  const onInvite = async (e) => {
    e.preventDefault();
    if (!inviteIdentifier.trim() || !activeProjectId) return;
    try {
      await addMember.mutateAsync({
        email: inviteIdentifier.includes('@') ? inviteIdentifier.trim() : undefined,
        username: !inviteIdentifier.includes('@') ? inviteIdentifier.trim() : undefined,
        role: inviteRole,
      });
      toast?.success('Member added to team project');
      setInviteIdentifier('');
      setInviteOpen(false);
    } catch (err) {
      toast?.error(err.message || 'Failed to add member');
    }
  };

  // Handle Create New Team / Project Workspace
  const onCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamForm.name.trim()) return;
    try {
      const created = await createProject.mutateAsync(newTeamForm);
      toast?.success(`Team project "${newTeamForm.name}" created!`);
      setNewTeamForm({ name: '', description: '', color: PROJECT_COLORS[0], visibility: 'team' });
      setCreateTeamOpen(false);
      if (created?._id) {
        setSelectedProjectId(created._id);
      }
    } catch (err) {
      toast?.error(err.message || 'Failed to create team project');
    }
  };

  // Handle Remove Member
  const onRemoveMember = (userId, memberName) => {
    setMemberToRemove({ id: userId, name: memberName });
  };

  const handleConfirmRemoveMember = async () => {
    if (!memberToRemove?.id) return;
    try {
      await removeMember.mutateAsync(memberToRemove.id);
      toast?.success(`${memberToRemove.name} removed from team`);
      setMemberToRemove(null);
    } catch (err) {
      toast?.error(err.message || 'Failed to remove member');
    }
  };

  // Handle Role Change
  const onChangeRole = async (userId, newRole) => {
    try {
      await updateMemberRole.mutateAsync({ userId, role: newRole });
      toast?.success('Member role updated');
    } catch (err) {
      toast?.error(err.message || 'Failed to update role');
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <SEO title="Team" description="Manage team workspaces and members across your VYBEBOARD projects." path="/team" noindex />

      {/* Top Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-ink">Team & Workspace</h2>
          <p className="text-xs text-ink-secondary mt-0.5">
            Manage your teams, collaborators, and project access permissions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            onClick={() => setCreateTeamOpen(true)}
            className="neon-focus shadow-sm"
          >
            <Plus size={15} /> Add New Team
          </Button>

          {activeProjectId && (
            <Button onClick={() => setInviteOpen(true)} className="neon-focus shadow-sm">
              <UserPlus size={15} /> Add Member
            </Button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="mb-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-brand">
            <Building2 size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Total Projects
            </span>
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-ink">{projects.length}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-brand-secondary">
            <Users size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Team Members
            </span>
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-ink">{members.length}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-warning">
            <Shield size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Admins / Owners
            </span>
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-ink">
            {members.filter((m) => m.role === 'owner' || m.role === 'admin').length}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-success">
            <UserCheck size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Your Role
            </span>
          </div>
          <p className="mt-2 font-heading text-lg font-bold capitalize text-ink">
            {currentUserRole}
          </p>
        </Card>
      </div>

      {/* Team Selection Bar & Search */}
      <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 min-w-0">
        {/* Workspace / Project Selector Tabs */}
        {projects.length > 0 && (
          <div className="flex min-w-0 flex-1 items-center rounded-xl border border-border-c bg-surface p-1 shadow-sm">
            {/* Fixed Project Label with full-height centered divider */}
            <div className="flex shrink-0 items-center gap-1.5 self-stretch border-r border-border-c px-3 text-xs font-semibold text-ink">
              <FolderKanban size={14} className="text-brand shrink-0" />
              <span>Project:</span>
            </div>

            {/* Scrollable Project Buttons area */}
            <div className="custom-scrollbar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto px-1.5 py-1">
              {projects.map((p) => {
                const isSelected = p._id === activeProjectId;
                return (
                  <button
                    key={p._id}
                    onClick={() => setSelectedProjectId(p._id)}
                    className={`neon-focus flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold leading-none transition-all ${
                      isSelected
                        ? 'bg-brand text-white shadow-sm'
                        : 'text-ink-secondary hover:bg-elevated hover:text-ink'
                    }`}
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: p.color || '#6D5DFB' }}
                    />
                    <span className="leading-tight">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Search Filter */}
        <div className="relative shrink-0 sm:w-60">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary" />
          <input
            type="text"
            placeholder="Search member or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="neon-focus w-full rounded-xl border border-border-c bg-surface py-2 pl-8 pr-3 text-xs text-ink placeholder:text-ink-secondary/60"
          />
        </div>
      </div>

      {/* Members Directory */}
      <div className="flex-1 overflow-y-auto pb-6">
        {!activeProjectId ? (
          <EmptyState
            icon={Building2}
            title="No teams found"
            description="Create your first team project to invite colleagues and collaborate."
            action={
              <Button onClick={() => setCreateTeamOpen(true)}>
                <Plus size={15} /> Create Team Project
              </Button>
            }
          />
        ) : membersLoading || projectsLoading ? (
          <div className="space-y-2.5">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredMembers.length === 0 ? (
          <EmptyState
            icon={Users}
            title={searchQuery ? 'No matching members' : 'No team members yet'}
            description={
              searchQuery
                ? 'Try searching with a different name, username, or role.'
                : 'Invite team members to start working together on this workspace.'
            }
            action={
              !searchQuery && (
                <Button onClick={() => setInviteOpen(true)}>
                  <UserPlus size={15} /> Add Member
                </Button>
              )
            }
          />
        ) : (
          <Card className="divide-y divide-border-c overflow-hidden shadow-soft">
            {filteredMembers.map((m) => {
              const memberId = m.user?._id || m.user?.id || m.user;
              const isSelf = memberId?.toString() === currentUserId?.toString();
              const isOwner = m.role === 'owner';

              return (
                <div
                  key={memberId}
                  className="flex flex-col gap-3 p-4 transition-colors hover:bg-canvas/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Member Profile */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Avatar name={m.user?.name || 'Member'} src={m.user?.avatar} size={42} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-ink">
                          {m.user?.name || 'Team Member'}
                        </p>
                        {isSelf && (
                          <span className="rounded-md bg-soft-violet px-1.5 py-0.5 text-[10px] font-bold text-brand">
                            You
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-ink-secondary">
                        {m.user?.email || (m.user?.username ? `@${m.user.username}` : '')}
                      </p>
                    </div>
                  </div>

                  {/* Role Controls & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5">
                    {/* Role Selector or Badge */}
                    {canChangeRole && !isOwner && !isSelf ? (
                      <select
                        value={m.role}
                        onChange={(e) => onChangeRole(memberId, e.target.value)}
                        className={`neon-focus rounded-xl border px-3 py-1.5 text-xs font-semibold capitalize bg-surface cursor-pointer ${
                          ROLE_STYLES[m.role] || ROLE_STYLES.member
                        }`}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                          ROLE_STYLES[m.role] || ROLE_STYLES.member
                        }`}
                      >
                        {m.role}
                      </span>
                    )}

                    {/* Remove Member Button */}
                    {canRemoveMember && !isOwner && !isSelf && (
                      <button
                        onClick={() => onRemoveMember(memberId, m.user?.name || 'this member')}
                        title="Remove member"
                        className="neon-focus rounded-xl border border-transparent p-2 text-ink-secondary transition-colors hover:border-danger/30 hover:bg-danger/10 hover:text-danger"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </div>

      {/* Modal 1: Add New Team / Project Workspace */}
      <Modal
        open={createTeamOpen}
        onClose={() => setCreateTeamOpen(false)}
        title="Add New Team Workspace"
      >
        <form onSubmit={onCreateTeam} className="space-y-4">
          <Input
            label="Team / Project Name"
            placeholder="e.g. Design System, Marketing Squad, Core Backend"
            autoFocus
            required
            value={newTeamForm.name}
            onChange={(e) => setNewTeamForm({ ...newTeamForm, name: e.target.value })}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Description</label>
            <textarea
              placeholder="What will this team work on?"
              value={newTeamForm.description}
              onChange={(e) => setNewTeamForm({ ...newTeamForm, description: e.target.value })}
              rows={3}
              className="neon-focus w-full rounded-xl border border-border-c bg-canvas px-3.5 py-2.5 text-sm text-ink"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Team Accent Color</label>
            <div className="flex gap-2">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewTeamForm({ ...newTeamForm, color: c })}
                  aria-label={`Choose color ${c}`}
                  className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: newTeamForm.color === c ? '#111827' : 'transparent',
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Visibility</label>
            <select
              value={newTeamForm.visibility}
              onChange={(e) => setNewTeamForm({ ...newTeamForm, visibility: e.target.value })}
              className="neon-focus w-full rounded-xl border border-border-c bg-surface px-3.5 py-2.5 text-sm text-ink"
            >
              <option value="team">Team (Visible to all team members)</option>
              <option value="private">Private (Invite only)</option>
            </select>
          </div>

          <div>
            <Input
              label="Project Owner (Optional)"
              placeholder="Leave blank for yourself, or enter email / @username"
              value={newTeamForm.owner || ''}
              onChange={(e) => setNewTeamForm({ ...newTeamForm, owner: e.target.value })}
            />
            <p className="mt-1 text-[11px] text-ink-secondary">
              {newTeamForm.owner?.trim()
                ? 'The specified user will be Owner, and you will automatically become the Admin.'
                : 'You will be the Owner of this project.'}
            </p>
          </div>

          {!newTeamForm.owner?.trim() && (
            <div>
              <Input
                label="Assign Project Admin (Optional)"
                placeholder="Enter email / @username to add as Admin"
                value={newTeamForm.admin || ''}
                onChange={(e) => setNewTeamForm({ ...newTeamForm, admin: e.target.value })}
              />
              <p className="mt-1 text-[11px] text-ink-secondary">
                Assign an Admin who can create tasks, assign members, and manage the board.
              </p>
            </div>
          )}

          <div className="flex gap-2.5 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setCreateTeamOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={createProject.isPending} className="flex-1">
              Create Team
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Add Member to Project Team */}
      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Member to Team">
        <form onSubmit={onInvite} className="space-y-4">
          <Input
            label="Email or Username"
            placeholder="e.g. alex@vybeboard.dev or alexrivera"
            autoFocus
            required
            value={inviteIdentifier}
            onChange={(e) => setInviteIdentifier(e.target.value)}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Role & Permissions</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="neon-focus w-full rounded-xl border border-border-c bg-surface px-3.5 py-2.5 text-sm text-ink"
            >
              <option value="viewer">Viewer (View boards & tasks only)</option>
              <option value="member">Member (Can create, edit & complete tasks)</option>
              <option value="admin">Admin (Can manage project, settings & members)</option>
            </select>
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setInviteOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={addMember.isPending} className="flex-1">
              Add to Team
            </Button>
          </div>
        </form>
      </Modal>

      {/* Remove Member Confirmation Modal */}
      <ConfirmModal
        open={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        title="Remove Team Member?"
        description={`Are you sure you want to remove ${memberToRemove?.name || 'this member'} from this project team? They will lose access to all tasks.`}
        confirmText="Remove Member"
        danger={true}
        loading={removeMember.isPending}
        onConfirm={handleConfirmRemoveMember}
      />
    </div>
  );
}
