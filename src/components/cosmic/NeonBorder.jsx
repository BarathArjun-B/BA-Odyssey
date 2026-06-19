import { cn } from '../../lib/utils';

export default function NeonBorder({ children, className }) {
  return (
    <div className={cn("rounded-[16px] border neon-border-animate", className)}>
      {children}
    </div>
  );
}
