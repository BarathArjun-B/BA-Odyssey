import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function PlanetCard({ problem, children, className, index = 0 }) {
  const painLevel = problem?.painLevel || 0;
  let color = 'var(--status-success-emerald)';
  if (painLevel > 7) color = 'var(--status-alert-ember)';
  else if (painLevel > 4) color = 'var(--status-achievement-gold)';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      className={cn("relative h-full", className)}
    >
      {/* Orbit ring overlay */}
      <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none z-10 opacity-40 overflow-hidden rounded-tr-[16px]">
        <svg viewBox="0 0 100 100" className="absolute -top-4 -right-4 w-full h-full">
          <ellipse cx="60" cy="40" rx="40" ry="15" fill="none" stroke={color} strokeWidth="1.5" transform="rotate(-25 60 40)" />
          <circle cx="28" cy="22" r="3" fill={color} />
        </svg>
      </div>
      {children}
    </motion.div>
  );
}
