import { cn } from '../../lib/utils';

export default function CosmicGlow({ children, color = 'purple', className, pulse = false }) {
  const colorClass = {
    purple: 'cosmic-glow-purple',
    cyan: 'cosmic-glow-cyan',
    gold: 'cosmic-glow-gold',
    emerald: 'cosmic-glow-emerald',
  }[color] || 'cosmic-glow-purple';

  return (
    <div className={cn(colorClass, pulse ? 'animate-[glow-pulse_4s_infinite_alternate_ease-in-out]' : '', className)}>
      {children}
    </div>
  );
}
