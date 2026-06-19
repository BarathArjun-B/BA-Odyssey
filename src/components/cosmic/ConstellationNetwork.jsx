import { motion } from 'framer-motion';
import { useMemo } from 'react';

export default function ConstellationNetwork({ problems = [], ideas = [] }) {
  const isMobile = window.innerWidth < 768;
  const maxNodes = isMobile ? 4 : 8;
  
  const nodes = useMemo(() => {
    const combined = [
      ...problems.slice(0, maxNodes).map(p => ({ ...p, type: 'problem' })),
      ...ideas.slice(0, maxNodes).map(i => ({ ...i, type: 'idea' }))
    ];
    
    // Distribute in a circle-ish layout
    return combined.map((item, idx) => {
      const angle = (idx / combined.length) * Math.PI * 2;
      const radius = 35 + Math.random() * 15; // 35-50%
      const x = 50 + Math.cos(angle) * radius;
      const y = 50 + Math.sin(angle) * radius;
      return { ...item, x, y };
    });
  }, [problems, ideas, maxNodes]);

  if (nodes.length < 2) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <svg className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        {nodes.map((node, i) => {
          const nextNode = nodes[(i + 1) % nodes.length];
          // Add cross-connections for richer constellation
          const jumpNode = nodes[(i + 3) % nodes.length];
          
          return (
            <g key={`lines-${i}`}>
              <motion.line
                x1={`${node.x}%`} y1={`${node.y}%`}
                x2={`${nextNode.x}%`} y2={`${nextNode.y}%`}
                stroke="#7C6BA8"
                animate={{ 
                  opacity: [0.2, 0.3, 0.2],
                  strokeWidth: [0.5, 0.8, 0.5],
                  filter: [
                    'drop-shadow(0 0 6px rgba(124, 107, 168, 0.2))',
                    'drop-shadow(0 0 8px rgba(124, 107, 168, 0.25))',
                    'drop-shadow(0 0 6px rgba(124, 107, 168, 0.2))'
                  ]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              {jumpNode && (
                <motion.line
                  x1={`${node.x}%`} y1={`${node.y}%`}
                  x2={`${jumpNode.x}%`} y2={`${jumpNode.y}%`}
                  stroke="#7C6BA8"
                  strokeWidth="0.3"
                  strokeDasharray="4 4"
                  opacity={0.15}
                />
              )}
            </g>
          );
        })}
        
        {nodes.map((node, i) => (
          <circle
            key={`node-${i}`}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r={node.type === 'problem' ? 3 : 4}
            fill="#9370A8"
            opacity={0.8}
            style={{ filter: 'drop-shadow(0 0 4px rgba(147, 112, 168, 0.3))' }}
          />
        ))}
      </svg>
    </div>
  );
}
