/**
 * PlanetGlyph — CSS-only sphere with orbit ring.
 * Color shifts based on painLevel (1–10).
 */
export default function PlanetGlyph({ painLevel = 5, size = 28 }) {
  // Map pain 1–10 to a color interpolation from emerald (low) → ember (high)
  const t = (painLevel - 1) / 9; // 0 to 1
  const color = t > 0.6
    ? `rgba(248, 113, 113, ${0.6 + t * 0.4})`   // alert-ember range
    : t > 0.3
      ? `rgba(232, 179, 57, ${0.5 + t * 0.3})`    // gold range
      : `rgba(52, 211, 153, ${0.5 + t * 0.3})`;    // emerald range

  const orbitColor = t > 0.6
    ? 'rgba(248, 113, 113, 0.3)'
    : t > 0.3
      ? 'rgba(232, 179, 57, 0.25)'
      : 'rgba(52, 211, 153, 0.25)';

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size + 8, height: size + 8 }}
      aria-hidden="true"
    >
      {/* Orbit ring */}
      <div
        className="absolute rounded-full border"
        style={{
          width: size + 8,
          height: size * 0.45,
          borderColor: orbitColor,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotateX(65deg)',
        }}
      />
      {/* Planet sphere */}
      <div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 35% 35%, ${color}, rgba(14,19,48,0.8))`,
          boxShadow: `0 0 ${size / 3}px ${color}`,
        }}
      />
    </div>
  );
}
