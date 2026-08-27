const COLORS = ['#6D5DFB', '#22D3EE', '#B8F34A', '#F59E0B', '#F43F5E'];

function colorFor(name = '') {
  const idx = name.charCodeAt(0) % COLORS.length;
  return COLORS[Math.max(idx, 0)];
}

export default function Avatar({ name = '', src, size = 32, ring = false }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const style = { width: size, height: size, fontSize: size * 0.4 };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={style}
        className={`rounded-full object-cover ${ring ? 'ring-2 ring-surface' : ''}`}
      />
    );
  }

  return (
    <div
      style={{ ...style, backgroundColor: colorFor(name) }}
      className={`flex items-center justify-center rounded-full font-medium text-white ${ring ? 'ring-2 ring-surface' : ''}`}
      title={name}
      role="img"
      aria-label={name}
    >
      {initials || '?'}
    </div>
  );
}
