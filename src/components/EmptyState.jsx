import { cn } from '../lib/utils';
import { AstronautCharacter } from './cosmic';

export default function EmptyState({ title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-16 px-4 glass-panel", className)}>
      <AstronautCharacter size={160} floating={true} />
      <h3 className="font-catalogue text-display-md mb-2 mt-6" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p className="text-body-md text-muted mb-8 max-w-md">{description}</p>
      {action}
    </div>
  );
}
