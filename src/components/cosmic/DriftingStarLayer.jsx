import { useMemo } from 'react';

export default function DriftingStarLayer() {
  const isMobile = window.innerWidth < 768;
  const starCount = isMobile ? 20 : 40;

  const stars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < starCount; i++) {
      // Half drift Y, half drift X
      const isX = (i % 2) === 0;
      arr.push({
        id: i,
        top: ((i * 13) % 100) + '%',
        left: ((i * 29) % 100) + '%',
        size: (((i * 7) % 20) / 10 + 1) + 'px',
        animationClass: isX ? 'animate-[driftX_40s_ease-in-out_infinite]' : 'animate-[driftY_40s_ease-in-out_infinite]',
        delay: -1 * ((i * 31) % 40) + 's',
        duration: ((i * 17) % 40) + 40 + 's',
        opacity: (((i * 11) % 40) / 100) + 0.2,
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
