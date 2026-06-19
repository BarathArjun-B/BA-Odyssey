import { useState, useEffect } from 'react';

export default function AsteroidLayer() {
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (window.innerWidth < 768) return; // Desktop only

    const interval = setInterval(() => {
      // 2% probability every 45 seconds
      if (Math.random() < 0.02) {
        setTrigger(t => t + 1);
      }
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  if (trigger === 0) return null;

  return (
    <div key={trigger} className="absolute inset-0 overflow-hidden pointer-events-none">
      <div 
        className="absolute top-[-10%] right-[10%] w-[120px] h-[120px] rounded-full bg-black"
        style={{
          boxShadow: 'inset -10px -10px 20px rgba(255,255,255,0.05)',
          opacity: 0.1,
          animation: 'shooting-star 4s linear forwards',
          willChange: 'transform, opacity'
        }}
      />
    </div>
  );
}
