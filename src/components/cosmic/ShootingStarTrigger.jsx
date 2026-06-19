import { useState, useEffect } from 'react';

export default function ShootingStarTrigger() {
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (window.innerWidth < 768) return; // Desktop only

    const interval = setInterval(() => {
      // 5% probability every 30 seconds
      if (Math.random() < 0.05) {
        setTrigger(t => t + 1);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (trigger === 0) return null;

  return (
    <div key={trigger} className="absolute inset-0 overflow-hidden pointer-events-none">
      <div 
        className="absolute top-[10%] left-[10%] w-[100px] h-[2px] bg-white rounded-full opacity-0"
        style={{
          boxShadow: '0 0 10px #fff, 0 0 20px #fff',
          animation: 'shooting-star 1.5s ease-out forwards',
          willChange: 'transform, opacity'
        }}
      />
    </div>
  );
}
