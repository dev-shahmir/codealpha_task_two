import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-brand text-white hover:brightness-110 shadow-soft',
  secondary: 'bg-surface text-ink border border-border-c hover:bg-soft-violet',
  ghost: 'text-ink hover:bg-soft-violet/60',
  danger: 'bg-danger text-white hover:brightness-110',
  accent: 'bg-accent text-ink hover:brightness-95',
};

const SIZES = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2.5',
  lg: 'text-base px-6 py-3',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  as: Component = 'button',
  ...props
}) {
  return (
    <Component
      disabled={disabled || loading}
      className={`neon-focus inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </Component>
  );
}
