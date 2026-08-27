import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, FolderKanban, Bell, Settings, Sun, LogOut, Plus, CheckSquare, User, MessageSquare, Loader2 } from 'lucide-react';
import Modal from './ui/Modal';
import Avatar from './ui/Avatar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiClient } from '../lib/apiClient';

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);

  const actions = [
    { label: 'Go to Dashboard', icon: LayoutDashboard, run: () => navigate('/dashboard') },
    { label: 'Go to Projects', icon: FolderKanban, run: () => navigate('/projects') },
    { label: 'Open My Tasks', icon: CheckSquare, run: () => navigate('/tasks') },
    { label: 'Open Notifications', icon: Bell, run: () => navigate('/notifications') },
    { label: 'Open Settings', icon: Settings, run: () => navigate('/settings') },
    { label: 'Toggle Dark Mode', icon: Sun, run: () => setTheme(theme === 'dark' ? 'light' : 'dark') },
    { label: 'Create Project', icon: Plus, run: () => navigate('/projects?new=1') },
    { label: 'Logout', icon: LogOut, run: async () => { await logout(); navigate('/'); } },
  ];

  const filteredActions = actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  // Global search debounce
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults(null);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await apiClient.get(`/search?q=${encodeURIComponent(query.trim())}`);
        setSearchResults(data.results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        open ? onClose() : onClose(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else {
      setQuery('');
      setSearchResults(null);
    }
  }, [open]);

  const hasSearchResults =
    searchResults &&
    (searchResults.projects?.length ||
      searchResults.tasks?.length ||
      searchResults.members?.length ||
      searchResults.comments?.length);

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="flex items-center gap-2 border-b border-border-c pb-3">
        <Search size={18} className="text-ink-secondary" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search actions, projects, tasks, members..."
          className="neon-focus w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-secondary"
          aria-label="Command palette input"
        />
        {searching && <Loader2 size={16} className="animate-spin text-brand" />}
      </div>

      <div className="mt-2 max-h-96 space-y-4 overflow-y-auto pr-1">
        {/* Projects Search Results */}
        {searchResults?.projects?.length > 0 && (
          <div>
            <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink-secondary">Projects</p>
            <ul className="space-y-1">
              {searchResults.projects.map((p) => (
                <li key={p._id}>
                  <button
                    onClick={() => { navigate(`/projects/${p._id}`); onClose(); }}
                    className="neon-focus flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-soft-violet"
                  >
                    <FolderKanban size={16} className="text-brand" />
                    <div>
                      <p className="font-medium text-ink">{p.name}</p>
                      {p.description && <p className="line-clamp-1 text-xs text-ink-secondary">{p.description}</p>}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tasks Search Results */}
        {searchResults?.tasks?.length > 0 && (
          <div>
            <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink-secondary">Tasks</p>
            <ul className="space-y-1">
              {searchResults.tasks.map((t) => (
                <li key={t._id}>
                  <button
                    onClick={() => {
                      const projId = t.project?._id || t.project;
                      navigate(`/projects/${projId}`);
                      onClose();
                    }}
                    className="neon-focus flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-soft-violet"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckSquare size={16} className="shrink-0 text-brand-secondary" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{t.title}</p>
                        <p className="text-xs text-ink-secondary">{t.project?.name || 'Project'}</p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full border border-border-c px-2 py-0.5 text-[10px] capitalize text-ink-secondary">
                      {t.priority}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Team Members Search Results */}
        {searchResults?.members?.length > 0 && (
          <div>
            <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink-secondary">Members</p>
            <ul className="space-y-1">
              {searchResults.members.map((m) => (
                <li key={m._id}>
                  <button
                    onClick={() => { navigate('/team'); onClose(); }}
                    className="neon-focus flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-soft-violet"
                  >
                    <Avatar name={m.name} src={m.avatar} size={24} />
                    <div>
                      <p className="font-medium text-ink">{m.name}</p>
                      <p className="text-xs text-ink-secondary">@{m.username}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quick Actions */}
        {filteredActions.length > 0 && (
          <div>
            <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink-secondary">Actions</p>
            <ul className="space-y-1" role="listbox">
              {filteredActions.map((action) => (
                <li key={action.label}>
                  <button
                    onClick={() => { action.run(); onClose(); }}
                    className="neon-focus flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-soft-violet"
                  >
                    <action.icon size={16} className="text-brand" />
                    <span className="text-ink">{action.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Empty state */}
        {!filteredActions.length && !hasSearchResults && !searching && query && (
          <div className="py-8 text-center text-sm text-ink-secondary">
            No matching actions, projects, tasks, or team members found for "{query}".
          </div>
        )}
      </div>
    </Modal>
  );
}
