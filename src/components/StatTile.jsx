import { cn } from '../lib/utils';

export default function StatTile({ number, label, delta, deltaType = 'positive', className, onClick, glowColor }) {
  const deltaColor = deltaType === 'positive' ? 'text-demand-high' : deltaType === 'negative' ? 'text-pain-high' : 'text-muted';

  const glowClass = glowColor === 'gold' ? 'progress' 
    : glowColor === 'emerald' ? 'streak'
    : glowColor === 'violet' ? 'problems'
    : glowColor === 'cyan' ? 'ideas'
    : '';

  // Filter out the old glow-* classes from className since we use the new CSS
  const cleanClassName = className ? className.replace(/glow-\w+/g, '') : '';

  return (
    <div 
      onClick={onClick}
      className={cn(
        "stat-tile",
        glowClass,
        onClick ? "cursor-pointer" : "",
        cleanClassName
      )}
    >
      <div className="flex justify-between items-start">
        <span className="stat-number">{number}</span>
        {delta && (
          <span className={cn("text-mono-id", deltaColor, "mt-2")}>
            {delta}
          </span>
        )}
      </div>
      <span className="stat-label">{label}</span>
    </div>
  );
}
