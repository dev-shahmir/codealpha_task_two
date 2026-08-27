import { forwardRef } from 'react';

const Input = forwardRef(function Input({ label, error, hint, className = '', id, ...props }, ref) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={`neon-focus w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-secondary/70 ${
          error ? 'border-danger' : 'border-border-c'
        } ${className}`}
        {...props}
      />
      {hint && !error && <p id={`${inputId}-hint`} className="mt-1 text-xs text-ink-secondary">{hint}</p>}
      {error && <p id={`${inputId}-error`} role="alert" className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
});

export default Input;
