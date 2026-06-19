export default function MoonElement() {
  return (
    <div
      className="fixed pointer-events-none select-none"
      style={{
        zIndex: 0,
        top: '-8%',
        right: '-6%',
      }}
      aria-hidden="true"
    >
      <div
        className="moon-sphere"
        style={{
          width: 'clamp(150px, 20vw, 340px)',
          height: 'clamp(150px, 20vw, 340px)',
          borderRadius: '50%',
          position: 'relative',
          background: `
            radial-gradient(circle at 35% 35%, #e8e4d4, #b8b4a0 40%, #8a8674 70%, #5a584c 100%)
          `,
          boxShadow: '0 0 80px 20px rgba(244,246,255,0.08)',
          animation: 'moon-drift 100s ease-in-out infinite alternate',
          willChange: 'transform',
          overflow: 'hidden',
        }}
      >
        {/* Crater overlays — radial gradients at fixed positions */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: `
              radial-gradient(circle at 25% 30%, rgba(90,88,76,0.6) 0%, transparent 18%),
              radial-gradient(circle at 60% 20%, rgba(90,88,76,0.5) 0%, transparent 12%),
              radial-gradient(circle at 70% 55%, rgba(90,88,76,0.7) 0%, transparent 20%),
              radial-gradient(circle at 40% 65%, rgba(90,88,76,0.4) 0%, transparent 14%),
              radial-gradient(circle at 50% 45%, rgba(90,88,76,0.3) 0%, transparent 10%),
              radial-gradient(circle at 80% 75%, rgba(90,88,76,0.5) 0%, transparent 15%)
            `,
          }}
        />
        {/* Subtle terminator shadow for 3D depth */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, transparent 40%, rgba(5,6,11,0.4) 100%)',
          }}
        />
      </div>
    </div>
  );
}
