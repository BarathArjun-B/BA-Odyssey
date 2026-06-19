import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

export default function ProgressRing({ percentage, label, size = 120, strokeWidth = 8, className }) {
  const [offset, setOffset] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    // Animate once on mount/update (400ms ease-out per PRD)
    const progressOffset = ((100 - Math.min(percentage, 100)) / 100) * circumference;
    const t = setTimeout(() => setOffset(progressOffset), 50);
    return () => clearTimeout(t);
  }, [percentage, circumference]);

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Ring */}
        <circle
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          stroke="rgba(255,255,255,0.06)"
        />
        {/* Progress Ring */}
        <circle
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          stroke="var(--accent-primary)"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset === 0 ? circumference : offset,
            transition: 'stroke-dashoffset 400ms ease-out',
            filter: 'drop-shadow(0 0 6px rgba(139,92,246,0.4))',
          }}
        />
      </svg>
      {label && (
        <div className="absolute inset-0 flex items-center justify-center text-center p-2">
          {label}
        </div>
      )}
    </div>
  );
}
