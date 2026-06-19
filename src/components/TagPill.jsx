import { cn } from '../lib/utils';

export default function TagPill({ tag, className, onRemove }) {
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full font-label text-[10px] uppercase tracking-wide", className)} style={{ background: 'rgba(139, 92, 246, 0.12)', color: 'var(--accent-secondary)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
      {/* Constellation connector dots */}
      <span className="flex gap-0.5" aria-hidden="true">
        <span className="w-1 h-1 rounded-full" style={{ background: 'var(--accent-secondary)', opacity: 0.6 }} />
        <span className="w-1 h-1 rounded-full" style={{ background: 'var(--accent-secondary)', opacity: 0.4 }} />
      </span>
      {tag}
      {onRemove && (
        <button type="button" onClick={() => onRemove(tag)} className="ml-1 hover:text-primary transition-colors">
          &times;
        </button>
      )}
    </span>
  );
}
