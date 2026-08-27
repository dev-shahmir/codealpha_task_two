import { useEffect, useRef, useState } from 'react';
import { X, CalendarDays, Tag, User, ListChecks, MessageSquare, Trash2, Link2, Lock, Check } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Avatar from '../../components/ui/Avatar';
import { PriorityBadge, LabelBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useComments, useCreateComment } from '../../hooks/useComments';
import { useTask, useUpdateTask, useDeleteTask } from '../../hooks/useTasks';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../lib/socket';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const LABELS = ['bug', 'feature', 'design', 'backend', 'frontend', 'research', 'documentation', 'marketing', 'launch'];

/** Tick icon component — WhatsApp-style read receipts */
function Ticks({ commentId, createdAt, isPending }) {
  if (isPending) {
    // Single gray tick — sending
    return (
      <span className="flex items-center text-ink-secondary/60" title="Sending…">
        <Check size={11} />
      </span>
    );
  }
  
  // Delivered double tick (brand colored read receipt)
  return (
    <span className="flex items-center -space-x-1 text-brand" title="Delivered & Read">
      <Check size={11} />
      <Check size={11} />
    </span>
  );
}

/**
 * TaskModal — Complete redesign with role-based access control (RBAC):
 *  Action                | Viewer | Admin | Member
 *  ----------------------|--------|-------|-------
 *  Edit title / desc     |  ❌   |  ✅   |  ❌
 *  Change priority       |  ❌   |  ✅   |  ❌
 *  Change due date       |  ❌   |  ✅   |  ❌
 *  Add / remove checklist|  ❌   |  ✅   |  ❌
 *  Check checklist items |  ❌   |  ✅   |  ✅
 *  View checklist        |  ❌   |  ✅   |  ✅
 *  Comment               |  ✅   |  ✅   |  ✅
 *  View progress bar     |  ✅   |  ✅   |  ✅
 *  Delete task           |  ❌   |  ✅   |  ❌
 */
export default function TaskModal({ task: initialTask, projectId, members = [], open, onClose }) {
  const { user } = useAuth();
  const toast = useToast();
  const { data: liveTask } = useTask(initialTask?._id);
  const task = liveTask || initialTask;

  const updateTask = useUpdateTask(projectId);
  const deleteTask = useDeleteTask(projectId);
  const { data: comments = [] } = useComments(task?._id);
  const createComment = useCreateComment(task?._id);

  const [description, setDescription] = useState(task?.description || '');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [pendingCommentId, setPendingCommentId] = useState(null);

  const commentsEndRef = useRef(null);

  // Derive current user's role.
  // NOTE: AuthContext user comes from toPublicJSON() which returns `id` (not `_id`).
  // project.members[].user comes from Mongoose populate which uses `_id`.
  // We normalise both sides to strings so the comparison always works.
  const myId = String(user?.id || user?._id || '');
  const myMembership = members.find(
    (m) => String(m.user?._id || m.user || '') === myId
  );
  const myRole = myMembership?.role || 'viewer';
  const isAdmin  = myRole === 'admin';
  const isMember = myRole === 'member';
  const isOwner  = myRole === 'owner';

  const canEdit         = isAdmin;
  const canAssign       = isAdmin;
  const canAddChecklist = isAdmin;
  const canCheckItems   = isAdmin || isMember;
  const canViewChecklist = isAdmin || isMember;
  const canDelete       = isAdmin;

  useEffect(() => setDescription(task?.description || ''), [task?._id]);

  // Auto-scroll comments to bottom when new ones arrive
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  // Broadcast presence
  useEffect(() => {
    if (!open || !task?._id || !projectId) return;
    const socket = getSocket();
    socket?.emit('task:viewing', { projectId, taskId: task._id });
  }, [open, task?._id, projectId]);

  if (!task) return null;

  const checklistProgress = task.checklist?.length
    ? Math.round((task.checklist.filter((i) => i.done).length / task.checklist.length) * 100)
    : 0;

  const saveField = (payload) =>
    updateTask.mutate({ id: task._id, ...payload }, { onError: (err) => toast?.error(err.message) });

  const toggleChecklistItem = (idx) => {
    if (!canCheckItems) return;
    const next = task.checklist.map((item, i) => (i === idx ? { ...item, done: !item.done } : item));
    saveField({ checklist: next });
  };

  const removeChecklistItem = (idx) => {
    if (!canAddChecklist) return;
    const next = task.checklist.filter((_, i) => i !== idx);
    saveField({ checklist: next });
  };

  const addChecklistItem = (e) => {
    e.preventDefault();
    if (!canAddChecklist || !newChecklistItem.trim()) return;
    saveField({ checklist: [...(task.checklist || []), { text: newChecklistItem.trim(), done: false }] });
    setNewChecklistItem('');
  };

  const submitComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const tempId = Date.now().toString();
    setPendingCommentId(tempId);
    createComment.mutate(
      { content: commentText.trim() },
      {
        onSuccess: () => { setCommentText(''); setPendingCommentId(null); },
        onError: (err) => { toast?.error(err.message); setPendingCommentId(null); },
      }
    );
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/projects/${projectId}?task=${task._id}`);
    toast?.success('Task link copied');
  };

  return (
    <Modal open={open} onClose={onClose} size="xl" noScroll>
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 border-b border-border-c pb-4 flex-shrink-0">
        <div className="min-w-0 flex-1">
          {canEdit ? (
            <input
              defaultValue={task.title}
              onBlur={(e) => e.target.value.trim() && e.target.value !== task.title && saveField({ title: e.target.value.trim() })}
              aria-label="Task title"
              className="neon-focus w-full rounded-lg bg-transparent font-heading text-xl font-semibold text-ink outline-none"
            />
          ) : (
            <h2 className="font-heading text-xl font-semibold text-ink">{task.title}</h2>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {canEdit ? (
              <select
                value={task.priority}
                onChange={(e) => saveField({ priority: e.target.value })}
                aria-label="Priority"
                className="neon-focus rounded-lg border border-border-c bg-surface px-2 py-1 text-xs capitalize"
              >
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            ) : null}
            <PriorityBadge priority={task.priority} />
            {task.labels?.map((l) => <LabelBadge key={l} label={l} />)}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!isAdmin && (
            <span className="flex items-center gap-1 rounded-lg border border-border-c px-2 py-1 text-xs text-ink-secondary">
              <Lock size={11} /> {myRole}
            </span>
          )}
          <button onClick={copyLink} aria-label="Copy task link" className="neon-focus rounded-lg p-2 text-ink-secondary hover:bg-soft-violet">
            <Link2 size={16} />
          </button>
          {canDelete && (
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              aria-label="Delete task"
              title="Delete task"
              className="neon-focus rounded-lg p-2 text-ink-secondary hover:bg-danger/10 hover:text-danger"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 gap-6 pt-4 sm:grid-cols-3">
          <div className="space-y-5 sm:col-span-2">

            {/* Description */}
            {!isOwner && (
              <div>
                <h3 className="mb-1.5 text-sm font-semibold text-ink">Description</h3>
                {canEdit ? (
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={() => description !== task.description && saveField({ description })}
                    rows={3}
                    placeholder="Add a description..."
                    className="w-full rounded-xl border border-border-c bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-secondary/60 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all"
                  />
                ) : (
                  <p className="rounded-xl border border-border-c bg-canvas px-3 py-2 text-sm text-ink min-h-[60px]">
                    {task.description || <span className="text-ink-secondary italic">No description.</span>}
                  </p>
                )}
              </div>
            )}

            {/* ── Comments — WhatsApp style ── */}
            <div className="flex flex-col">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink flex-shrink-0">
                <MessageSquare size={15} /> Comments
                <span className="text-xs font-normal text-ink-secondary">{comments.length}</span>
              </h3>

              {/* Scrollable comment list — fixed max height */}
              <div className="max-h-[260px] overflow-y-auto space-y-2.5 pr-1 custom-scrollbar rounded-xl bg-canvas border border-border-c p-3">
                {comments.length === 0 && (
                  <p className="text-center text-xs text-ink-secondary py-6">No comments yet. Be the first to comment!</p>
                )}
                {comments.map((c) => {
                  const currentUserId = String(user?._id || user?.id || '');
                  const authorId = String(c.author?._id || c.author?.id || (typeof c.author === 'string' ? c.author : '') || '');
                  const isMe = Boolean(currentUserId && authorId && currentUserId === authorId);
                  const isPending = pendingCommentId && isMe && c._id === comments[comments.length - 1]?._id;

                  return (
                    <div
                      key={c._id}
                      className={`flex items-end gap-2 ${isMe ? 'flex-row justify-start' : 'flex-row-reverse justify-start'}`}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <Avatar name={c.author?.name || (isMe ? user?.name : 'Member')} src={c.author?.avatar || (isMe ? user?.avatar : undefined)} size={26} />
                      </div>

                      {/* Bubble */}
                      <div className={`group relative max-w-[78%] flex flex-col ${isMe ? 'items-start' : 'items-end'}`}>
                        {/* Author name for other users */}
                        {!isMe && (
                          <span className="mb-0.5 text-[10px] font-semibold text-ink-secondary px-1">
                            {c.author?.name || 'Member'}
                          </span>
                        )}

                        <div
                          className={`rounded-2xl px-3 py-2 text-sm shadow-sm ${
                            isMe
                              ? 'rounded-bl-sm bg-brand/20 border border-brand/30 text-ink'
                              : 'rounded-br-sm bg-surface border border-border-c text-ink'
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap break-words">{c.content}</p>

                          {/* Timestamp + ticks */}
                          <div className={`mt-1 flex items-center gap-1 ${isMe ? 'justify-start' : 'justify-end'}`}>
                            <span className="text-[10px] text-ink-secondary/70">
                              {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && (
                              <Ticks
                                commentId={c._id}
                                createdAt={c.createdAt}
                                isPending={!!isPending}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={commentsEndRef} />
              </div>

              {/* Comment compose */}
              <form onSubmit={submitComment} className="mt-3 flex items-center gap-2 p-1">
                <Avatar name={user?.name} src={user?.avatar} size={30} />
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(e); }}}
                  placeholder="Type a comment… (Enter to send)"
                  aria-label="New comment"
                  className="flex-1 rounded-xl border border-border-c bg-canvas px-3.5 py-2 text-sm text-ink placeholder:text-ink-secondary/60 focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-brand transition-all"
                />
                <Button type="submit" size="sm" loading={createComment.isPending}>Send</Button>
              </form>
            </div>
          </div>

          {/* ── Right sidebar: metadata & checklist ── */}
          <div className="space-y-4">

            {/* Assignee */}
            <div>
              <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase text-ink-secondary">
                <User size={13} /> Assignee
              </h3>
              <div className="flex items-center gap-2 rounded-lg border border-border-c bg-canvas px-3 py-2 text-sm text-ink">
                {task.assignee ? (
                  <>
                    <Avatar name={task.assignee?.name || 'A'} src={task.assignee?.avatar} size={20} />
                    <span className="font-medium text-ink">{task.assignee?.name || 'Assigned'}</span>
                  </>
                ) : (
                  <span className="text-ink-secondary italic">Unassigned</span>
                )}
              </div>
            </div>

            {/* Due Date */}
            {!isOwner && (
              <div>
                <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase text-ink-secondary">
                  <CalendarDays size={13} /> Due Date
                </h3>
                {canEdit ? (
                  <input
                    type="date"
                    value={task.dueDate ? task.dueDate.slice(0, 10) : ''}
                    onChange={(e) => saveField({ dueDate: e.target.value || null })}
                    className="w-full rounded-lg border border-border-c bg-canvas px-2.5 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all"
                    aria-label="Due date"
                  />
                ) : (
                  <div className="rounded-lg border border-border-c bg-canvas px-2.5 py-1.5 text-sm text-ink">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : <span className="text-ink-secondary italic">No due date</span>}
                  </div>
                )}
              </div>
            )}

            {/* Labels */}
            {!isOwner && (
              <div>
                <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase text-ink-secondary">
                  <Tag size={13} /> Labels
                </h3>
                {canEdit ? (
                  <div className="flex flex-wrap gap-1.5">
                    {LABELS.map((l) => {
                      const active = task.labels?.includes(l);
                      return (
                        <button
                          key={l}
                          onClick={() => {
                            const next = active
                              ? task.labels.filter((x) => x !== l)
                              : [...(task.labels || []), l];
                            saveField({ labels: next });
                          }}
                          className={`neon-focus rounded-full border px-2 py-0.5 text-xs capitalize transition-colors ${
                            active
                              ? 'border-brand bg-soft-violet text-brand'
                              : 'border-border-c text-ink-secondary hover:text-ink'
                          }`}
                        >
                          {l}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {task.labels?.length
                      ? task.labels.map((l) => <LabelBadge key={l} label={l} />)
                      : <span className="text-xs text-ink-secondary italic">No labels</span>}
                  </div>
                )}
              </div>
            )}

            {/* ── Checklist card — Placed under Labels in the sidebar ── */}
            {task.checklist?.length > 0 || canAddChecklist ? (
              <div className="rounded-xl border border-border-c bg-canvas overflow-hidden">
                {/* Header: title + progress bar inline */}
                <div className="flex items-center gap-2.5 px-3 pt-2.5 pb-2">
                  <ListChecks size={13} className="flex-shrink-0 text-ink-secondary" />
                  <span className="text-xs font-semibold uppercase text-ink-secondary flex-shrink-0">Checklist</span>
                  {/* Progress bar */}
                  <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-elevated">
                    <div
                      className="h-full bg-brand transition-all duration-500"
                      style={{ width: `${checklistProgress}%` }}
                    />
                  </div>
                  <span className="text-[11px] tabular-nums font-medium text-ink-secondary flex-shrink-0">
                    {checklistProgress}%
                  </span>
                </div>

                {/* Items — scrollable, max height fixed */}
                {canViewChecklist && task.checklist?.length > 0 && (
                  <ul className="max-h-[140px] overflow-y-auto divide-y divide-border-c/50 px-1 pb-1 custom-scrollbar">
                    {task.checklist.map((item, idx) => (
                      <li
                        key={idx}
                        className="group flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-elevated/60 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => toggleChecklistItem(idx)}
                          disabled={!canCheckItems}
                          className="neon-focus h-3.5 w-3.5 flex-shrink-0 rounded border-border-c accent-brand disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={item.text}
                        />
                        <span
                          className={`flex-1 text-xs leading-snug break-words ${
                            item.done ? 'text-ink-secondary line-through' : 'text-ink'
                          }`}
                        >
                          {item.text}
                        </span>
                        {canAddChecklist && (
                          <button
                            onClick={() => removeChecklistItem(idx)}
                            title="Remove"
                            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 rounded p-0.5 text-ink-secondary hover:text-danger hover:bg-danger/10"
                            aria-label="Remove checklist item"
                          >
                            <X size={11} />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Add item — admin only, pinned at bottom */}
                {canAddChecklist && (
                  <form
                    onSubmit={addChecklistItem}
                    className="flex items-center gap-1.5 border-t border-border-c/50 px-2.5 py-1.5 bg-surface/40"
                  >
                    <input
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      placeholder="Add an item…"
                      aria-label="New checklist item"
                      className="neon-focus flex-1 bg-transparent text-xs text-ink placeholder:text-ink-secondary/60 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!newChecklistItem.trim()}
                      className="flex-shrink-0 rounded-md bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand hover:bg-brand/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      + Add
                    </button>
                  </form>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation ── */}
      {canDelete && (
        <ConfirmModal
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          title="Delete Task?"
          description={`Are you sure you want to delete "${task?.title}"? This action cannot be undone.`}
          confirmText="Delete Task"
          danger={true}
          loading={deleteTask.isPending}
          onConfirm={async () => {
            await deleteTask.mutateAsync(task._id);
            setDeleteConfirmOpen(false);
            onClose();
          }}
        />
      )}
    </Modal>
  );
}
