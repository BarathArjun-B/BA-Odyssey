import { cn } from '../lib/utils';
import StatusStamp from './StatusStamp';
import TagPill from './TagPill';
import { PlanetGlyph } from './cosmic';

export default function SpecimenCard({ 
  id, 
  numericId, // e.g. 247 for No. 0247
  title, 
  status, 
  tags = [], 
  score, 
  painLevel,
  isIdea = false,
  className, 
  onClick,
  children
}) {
  const formattedId = numericId !== undefined 
    ? `No. ${String(numericId).padStart(4, '0')}`
    : id;

  const cardClass = isIdea 
    ? "idea-card" 
    : cn("problem-card", painLevel >= 8 ? "pain-high" : painLevel >= 5 ? "pain-medium" : "pain-low");

  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative p-5 cursor-pointer group",
        cardClass,
        className
      )}
    >
      {/* Corner stars (replacing brass pins) */}
      <div className="absolute top-2 left-2 w-1 h-1 rounded-full" style={{ background: 'var(--accent-primary)', opacity: 0.6 }} />
      <div className="absolute top-2 right-2 w-1 h-1 rounded-full" style={{ background: 'var(--accent-secondary)', opacity: 0.6 }} />
      <div className="absolute bottom-2 left-2 w-1 h-1 rounded-full" style={{ background: 'var(--accent-secondary)', opacity: 0.6 }} />
      <div className="absolute bottom-2 right-2 w-1 h-1 rounded-full" style={{ background: 'var(--accent-primary)', opacity: 0.6 }} />

      {/* Galaxy star cluster glyph for idea cards */}
      {isIdea && (
        <div className="absolute top-3 right-3 opacity-30" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="1.5" fill="var(--accent-secondary)" />
            <circle cx="6" cy="7" r="1" fill="var(--accent-primary)" />
            <circle cx="14" cy="6" r="1.2" fill="var(--accent-secondary)" />
            <circle cx="8" cy="14" r="0.8" fill="var(--text-primary)" />
            <circle cx="15" cy="13" r="1" fill="var(--accent-primary)" />
          </svg>
        </div>
      )}

      {/* Stamp */}
      <StatusStamp status={status} />

      <div className="flex flex-col h-full z-0 relative">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            {painLevel !== undefined && <PlanetGlyph painLevel={painLevel} size={20} />}
            <span className="text-mono-id text-muted">{formattedId}</span>
          </div>
          {score !== undefined && (
            <span className="text-mono-id font-bold" style={{ color: 'var(--status-opportunity-violet)' }}>{score}</span>
          )}
        </div>
        
        <h3 className="text-display-md mb-4 leading-tight line-clamp-3 transition-colors" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h3>
        
        {children && (
          <div className="mb-4 flex-grow">
            {children}
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-4" style={{ borderTop: '1px solid var(--border-glass)' }}>
          {tags.map(tag => (
            <TagPill key={tag} tag={tag} />
          ))}
          {tags.length === 0 && (
            <span className="text-[10px] uppercase font-label text-muted tracking-wide" style={{ opacity: 0.5 }}>Untagged</span>
          )}
        </div>
      </div>
    </div>
  );
}
