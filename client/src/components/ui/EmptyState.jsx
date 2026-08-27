export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border-c bg-surface/50 px-6 py-14 text-center">
      {Icon && (
        <div className="orbit-ring mb-4 flex h-14 w-14 items-center justify-center">
          <Icon size={24} className="text-brand" />
        </div>
      )}
      <h3 className="font-heading text-base font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-secondary">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
