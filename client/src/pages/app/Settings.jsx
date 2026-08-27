import { useState } from 'react';
import { Camera } from 'lucide-react';
import SEO from '../../components/seo/SEO';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Avatar from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { apiClient } from '../../lib/apiClient';

const TABS = ['Account', 'Appearance', 'Notifications'];

const NOTIF_KEYS = [
  { key: 'taskAssignments', label: 'Task assignments' },
  { key: 'mentions', label: 'Mentions' },
  { key: 'comments', label: 'Comments' },
  { key: 'dueDateReminders', label: 'Due-date reminders' },
  { key: 'projectActivity', label: 'Project activity' },
];

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const [tab, setTab] = useState('Account');
  const [profile, setProfile] = useState({ name: user?.name || '', username: user?.username || '', bio: user?.bio || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [notifPrefs, setNotifPrefs] = useState(user?.preferences?.notifications || {});
  const [saving, setSaving] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await apiClient.put('/auth/profile', profile);
      updateUser(data.user);
      toast?.success('Profile updated');
    } catch (err) {
      toast?.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put('/auth/password', passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      toast?.success('Password updated');
    } catch (err) {
      toast?.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveNotifPrefs = async (nextPrefs) => {
    setNotifPrefs(nextPrefs);
    try {
      const { data } = await apiClient.put('/auth/profile', { preferences: { ...user.preferences, notifications: nextPrefs } });
      updateUser(data.user);
    } catch (err) {
      toast?.error(err.message);
    }
  };

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const deleteAccount = () => {
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await apiClient.delete('/auth/account');
      toast?.success('Account deleted');
      setDeleteConfirmOpen(false);
      await logout();
    } catch (err) {
      toast?.error(err.message || 'Failed to delete account');
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <>
      <SEO title="Settings" description="Manage your VYBEBOARD account settings." path="/settings" noindex />
      <h2 className="mb-5 font-heading text-2xl font-bold">Settings</h2>

      <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl bg-elevated p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`neon-focus shrink-0 rounded-lg px-4 py-1.5 text-sm font-medium ${
              tab === t ? 'bg-surface text-brand shadow-soft' : 'text-ink-secondary hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Account' && (
        <div className="space-y-5">
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="relative">
                <Avatar name={user?.name} src={user?.avatar} size={56} />
                <button aria-label="Change avatar" className="neon-focus absolute -bottom-1 -right-1 rounded-full bg-brand p-1.5 text-white">
                  <Camera size={12} />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-ink-secondary">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <form onSubmit={saveProfile} className="space-y-4">
              <Input label="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} name="name" />
              <Input label="Username" value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} name="username" />
              <div>
                <label className="mb-1.5 block text-sm font-medium">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={3}
                  maxLength={280}
                  className="neon-focus w-full rounded-xl border border-border-c bg-surface px-3.5 py-2.5 text-sm"
                />
              </div>
              <Button type="submit" loading={saving}>Save changes</Button>
            </form>
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 font-heading text-base font-semibold">Change password</h3>
            <form onSubmit={changePassword} className="space-y-4">
              <Input label="Current password" type="password" value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} name="currentPassword" />
              <Input label="New password" type="password" value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} name="newPassword" />
              <Button type="submit" variant="secondary" loading={saving}>Update password</Button>
            </form>
          </Card>

          <Card className="border-danger/30 p-5">
            <h3 className="mb-1 font-heading text-base font-semibold text-danger">Delete account</h3>
            <p className="mb-3 text-sm text-ink-secondary">This permanently deletes your account and cannot be undone.</p>
            <Button variant="danger" onClick={deleteAccount}>Delete my account</Button>
          </Card>
        </div>
      )}

      {tab === 'Appearance' && (
        <Card className="p-5">
          <h3 className="mb-3 font-heading text-base font-semibold">Theme</h3>
          <div className="flex gap-2">
            {['light', 'dark', 'system'].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`neon-focus rounded-xl border px-4 py-2 text-sm capitalize ${
                  theme === t ? 'border-brand bg-soft-violet text-brand' : 'border-border-c text-ink-secondary'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Card>
      )}

      {tab === 'Notifications' && (
        <Card className="divide-y divide-border-c p-0">
          {NOTIF_KEYS.map((n) => (
            <div key={n.key} className="flex items-center justify-between p-4">
              <span className="text-sm">{n.label}</span>
              <button
                onClick={() => saveNotifPrefs({ ...notifPrefs, [n.key]: !notifPrefs[n.key] })}
                aria-pressed={!!notifPrefs[n.key]}
                aria-label={`Toggle ${n.label}`}
                className={`neon-focus h-6 w-11 rounded-full transition-colors ${notifPrefs[n.key] ? 'bg-brand' : 'bg-elevated'}`}
              >
                <span className={`block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform ${notifPrefs[n.key] ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          ))}
        </Card>
      )}

      {/* Delete Account Confirmation Modal */}
      <ConfirmModal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Account Permanently?"
        description="This will permanently delete your account, your projects, and all your personal data. This action cannot be reversed."
        confirmText="Delete Account"
        danger={true}
        loading={deletingAccount}
        onConfirm={handleConfirmDeleteAccount}
      />
    </>
  );
}
