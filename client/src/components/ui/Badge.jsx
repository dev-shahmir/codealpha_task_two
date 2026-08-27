const PRIORITY_STYLES = {
  low: 'bg-soft-cyan text-brand-secondary',
  medium: 'bg-soft-violet text-brand',
  high: 'bg-warning/15 text-warning',
  urgent: 'bg-danger/15 text-danger',
};

const LABEL_STYLES = 'bg-elevated text-ink-secondary border border-border-c';

export function PriorityBadge({ priority }) {
  const labels = { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[priority]}`}>
      {labels[priority] || priority}
    </span>
  );
}

export function LabelBadge({ label }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${LABEL_STYLES}`}>
      {label}
    </span>
  );
}
