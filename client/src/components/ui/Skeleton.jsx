export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-soft-violet/70 dark:bg-elevated ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-card border border-border-c bg-surface p-4 shadow-soft">
      <Skeleton className="mb-3 h-4 w-2/3" />
      <Skeleton className="mb-2 h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  );
}

export function BoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="w-72 shrink-0 space-y-3">
          <Skeleton className="h-5 w-24" />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ))}
    </div>
  );
}
