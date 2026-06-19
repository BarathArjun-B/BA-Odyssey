import { useMemo } from 'react';

export default function DriftingStarLayer() {
  const isMobile = window.innerWidth < 768;
  const starCount = isMobile ? 20 : 40;

  const stars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < starCount; i++) {
      // Half drift Y, half drift X
      const isX = Math.random() > 0.5;
      arr.push({
        id: i,
        top: Math.random() * 100 + '%',
        left: Math.random() * 100 + '%',
        size: Math.random() * 2 + 1 + 'px',
        animationClass: isX ? 'animate-[driftX_40s_ease-in-out_infinite]' : 'animate-[driftY_40s_ease-in-out_infinite]',
        delay: Math.random() * -40 + 's',
        duration: Math.random() * 40 + 40 + 's',
        opacity: Math.random() * 0.4 + 0.2,
      });
    }
    return arr;
  }, [starCount]);

  return (
    <div className="absolute inset-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            willChange: 'transform',
          }}
        >
          <div 
            className={`w-full h-full rounded-full bg-white ${star.animationClass}`}
            style={{
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        </div>
      ))}
    </div>
  );
}
