import { Bell, CheckCheck } from 'lucide-react';
import SEO from '../../components/seo/SEO';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { useNotifications, useMarkAllRead, useMarkRead } from '../../hooks/useNotifications';

function timeAgo(date) {
  const diff = Math.round((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

export default function Notifications() {
  const { data, isLoading } = useNotifications();
  const markAllRead = useMarkAllRead();
  const markRead = useMarkRead();
  const notifications = data?.notifications || [];

  return (
    <>
      <SEO title="Notifications" description="Your VYBEBOARD notifications." path="/notifications" noindex />

      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold">Notifications</h2>
        {notifications.some((n) => !n.read) && (
          <Button variant="secondary" size="sm" onClick={() => markAllRead.mutate()}>
            <CheckCheck size={15} /> Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2"><CardSkeleton /><CardSkeleton /></div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up." description="New assignments, mentions, and updates will show up here." />
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n._id}
              onClick={() => !n.read && markRead.mutate(n._id)}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${
                n.read ? 'border-border-c bg-surface' : 'border-brand/30 bg-soft-violet/50'
              }`}
            >
              <Avatar name={n.sender?.name || 'VYBEBOARD'} src={n.sender?.avatar} size={32} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink">{n.message}</p>
                <p className="mt-0.5 text-xs text-ink-secondary">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" aria-label="Unread" />}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
