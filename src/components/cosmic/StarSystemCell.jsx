import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function StarSystemCell({ item, style, onClick }) {
  const score = item.demand || item.pain || 5; // Fallback score
  const isIdea = item.type === 'idea';
  
  // Calculate brightness/glow based on score (1-10)
  const glowSize = Math.max(10, score * 3);
  const color = isIdea ? '139, 92, 246' : '34, 211, 238'; // Purple for ideas, Cyan for problems
  
  return (
    <motion.div
      style={style}
      whileHover={{ scale: 1.3, zIndex: 50 }}
      onClick={onClick}
      className={cn(
        "absolute -translate-x-1/2 -translate-y-1/2 rounded-full cursor-help",
        "flex items-center justify-center text-[10px] font-label font-bold text-white transition-colors"
      )}
    >
      <div 
        className="w-full h-full rounded-full absolute inset-0 z-0"
        style={{
          background: `radial-gradient(circle, rgba(${color}, 0.8) 0%, rgba(${color}, 0) 70%)`,
          boxShadow: `0 0 ${glowSize}px rgba(${color}, 0.6), inset 0 0 ${glowSize/2}px rgba(${color}, 0.4)`,
          animation: 'twinkle 4s ease-in-out infinite alternate',
          animationDelay: `${Math.random() * -4}s`
        }}
      />
      
      {/* Small bright core */}
      <div className="w-1.5 h-1.5 bg-white rounded-full z-10" style={{ boxShadow: `0 0 5px #fff` }} />
      
      {/* Label - hidden until hover via group-hover in parent if needed, or always visible */}
      <div className="absolute top-full mt-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded border border-white/10 opacity-0 transition-opacity hover:opacity-100 pointer-events-none whitespace-nowrap z-20">
        {item.title}
      </div>
    </motion.div>
  );
}
