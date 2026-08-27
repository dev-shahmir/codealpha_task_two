export default function Card({ className = '', children, as: Component = 'div', ...props }) {
  return (
    <Component
      className={`rounded-card border border-border-c bg-surface shadow-soft ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
