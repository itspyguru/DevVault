interface TagBadgeProps {
  tag: string;
  active?: boolean;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

export function TagBadge({ tag, active, onClick, removable, onRemove }: TagBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium cursor-pointer transition-colors"
      style={{
        backgroundColor: active ? 'var(--accent)' : 'var(--tag-bg)',
        color: active ? '#fff' : 'var(--text-secondary)',
      }}
      onClick={onClick}
    >
      {tag}
      {removable && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
          className="ml-0.5 hover:opacity-80"
          style={{ color: active ? '#fff' : 'var(--text-secondary)' }}
        >
          x
        </button>
      )}
    </span>
  );
}
