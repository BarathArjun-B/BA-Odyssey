import { useMemo } from 'react';

export default function StarFieldLayer() {
  const isMobile = window.innerWidth < 768;
  const starCount = isMobile ? 200 : 300;

  // Generate a static box-shadow string representing all stars
  // Using a seeded random approach for consistency could be done, 
  // but Math.random() once on mount is fine for decorative stars.
  const starShadows = useMemo(() => {
    let shadows = [];
    for (let i = 0; i < starCount; i++) {
      const x = Math.floor(Math.random() * 100);
      const y = Math.floor(Math.random() * 100);
      const alpha = (Math.random() * 0.5 + 0.1).toFixed(2);
      shadows.push(`${x}vw ${y}vh rgba(255, 255, 255, ${alpha})`);
    }
    return shadows.join(', ');
  }, [starCount]);

  return (
    <div 
      className="absolute top-0 left-0 w-[1px] h-[1px] rounded-full"
      style={{ boxShadow: starShadows }}
    />
  );
}
