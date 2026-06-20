import { useMemo } from 'react';

export default function TwinkleStarLayer() {
  const isMobile = window.innerWidth < 768;
  const starCount = isMobile ? 30 : 60;

  const stars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < starCount; i++) {
      arr.push({
        id: i,
        top: ((i * 47) % 100) + '%',
        left: ((i * 73) % 100) + '%',
        size: (((i * 13) % 15) / 10 + 0.5) + 'px',
        delay: ((i * 19) % 50) / 10 + 's',
        duration: ((i * 23) % 30) / 10 + 3 + 's',
      });
    }
    return arr;
  }, [starCount]);

  return (
    <div className="absolute inset-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
            willChange: 'opacity',
          }}
        />
      ))}
    </div>
  );
}
